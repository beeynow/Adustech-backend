/**
 * ============================================================================
 * RBAC MIDDLEWARE - Role-Based Access Control
 * Production-ready middleware for Academic Notice Board System
 * ============================================================================
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Check if user is authenticated
 */
const isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.user || !req.session.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please log in.'
        });
    }
    next();
};

/**
 * Check if user has specific role(s)
 * @param {Array|String} allowedRoles - Single role or array of allowed roles
 */
const hasRole = (allowedRoles) => {
    return (req, res, next) => {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        const userRole = req.session.user?.role;

        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
                required_roles: roles,
                your_role: userRole
            });
        }
        next();
    };
};

/**
 * Check if user can create posts based on role and scope
 * Validates post creation permissions according to business rules
 */
const canCreatePost = async (req, res, next) => {
    try {
        const userId = req.session.user?.id;
        const userRole = req.session.user?.role;
        const { faculty_id, level_id } = req.body;

        console.log('🔐 Checking post creation permission:', {
            userId,
            userRole,
            faculty_id,
            level_id
        });

        // Rule 1: Regular users cannot create posts
        if (userRole === 'user') {
            return res.status(403).json({
                success: false,
                message: 'Regular users cannot create posts. Only admins can post notices.'
            });
        }

        // Rule 2: Power admins can post anywhere
        if (userRole === 'power_admin') {
            console.log('✅ Power admin approved to post anywhere');
            return next();
        }

        // Rule 3: Admins can post anywhere
        if (userRole === 'admin') {
            console.log('✅ Admin approved to post anywhere');
            return next();
        }

        // Rule 4: Department admins have restricted posting
        if (userRole === 'd_admin') {
            // d_admins can ONLY post in department level rooms
            if (!level_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Department admins can only post in department level rooms, not global or faculty pages.',
                    hint: 'Please specify a level_id for your department'
                });
            }

            // Fetch user with managed department
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    managedDepartment: true
                }
            });

            if (!user || !user.managedDepartmentId) {
                return res.status(403).json({
                    success: false,
                    message: 'No department assigned to your admin account.'
                });
            }

            // Verify the level belongs to their managed department
            const level = await prisma.level.findUnique({
                where: { id: level_id },
                include: { department: true }
            });

            if (!level) {
                return res.status(404).json({
                    success: false,
                    message: 'Level not found.'
                });
            }

            if (level.departmentId !== user.managedDepartmentId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only post in levels under your managed department.',
                    your_department: user.managedDepartment.name,
                    target_department: level.department.name
                });
            }

            console.log('✅ Department admin approved to post in their department level');
            return next();
        }

        // Fallback: Deny access
        return res.status(403).json({
            success: false,
            message: 'Invalid role or insufficient permissions.'
        });

    } catch (error) {
        console.error('❌ Error in canCreatePost middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Error validating post permissions',
            error: error.message
        });
    }
};

/**
 * Check if user can view posts in a specific scope
 * Validates read access based on user's academic associations
 */
const canViewPosts = (scope) => {
    return async (req, res, next) => {
        try {
            const userId = req.session.user?.id;
            const userRole = req.session.user?.role;

            console.log('🔐 Checking view permission:', {
                userId,
                userRole,
                scope,
                params: req.params
            });

            // Power admins and admins can view everything
            if (userRole === 'power_admin' || userRole === 'admin') {
                console.log('✅ Admin approved to view all posts');
                return next();
            }

            // Fetch user with academic associations
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    faculty: true,
                    department: true,
                    level: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            // Scope-based validation
            switch (scope) {
                case 'global':
                    // Everyone can view global posts
                    console.log('✅ Global posts accessible to all');
                    return next();

                case 'faculty':
                    const { facultyId } = req.params;
                    
                    // Check if user belongs to this faculty
                    if (user.facultyId !== facultyId) {
                        return res.status(403).json({
                            success: false,
                            message: 'You can only view posts from your own faculty.',
                            your_faculty: user.faculty?.name,
                            requested_faculty: facultyId
                        });
                    }
                    console.log('✅ User approved to view faculty posts');
                    return next();

                case 'level':
                    const { levelId } = req.params;
                    
                    // Regular users and d_admins must be in the level
                    if (userRole === 'user' && user.levelId !== levelId) {
                        return res.status(403).json({
                            success: false,
                            message: 'You can only view posts from your own department level.',
                            your_level: user.level?.displayName,
                            requested_level: levelId
                        });
                    }

                    // d_admins can view levels in their managed department
                    if (userRole === 'd_admin') {
                        const level = await prisma.level.findUnique({
                            where: { id: levelId }
                        });

                        if (level?.departmentId !== user.managedDepartmentId) {
                            return res.status(403).json({
                                success: false,
                                message: 'You can only view posts from your managed department levels.'
                            });
                        }
                    }

                    console.log('✅ User approved to view level posts');
                    return next();

                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid scope specified.'
                    });
            }

        } catch (error) {
            console.error('❌ Error in canViewPosts middleware:', error);
            return res.status(500).json({
                success: false,
                message: 'Error validating view permissions',
                error: error.message
            });
        }
    };
};

/**
 * Check if user can modify a post (edit/delete)
 */
const canModifyPost = async (req, res, next) => {
    try {
        const userId = req.session.user?.id;
        const userRole = req.session.user?.role;
        const { postId } = req.params;

        // Fetch the post
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { author: true }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }

        // Power admins can modify any post
        if (userRole === 'power_admin') {
            console.log('✅ Power admin can modify any post');
            return next();
        }

        // Admins can modify any post
        if (userRole === 'admin') {
            console.log('✅ Admin can modify any post');
            return next();
        }

        // d_admins can only modify their own posts
        if (userRole === 'd_admin') {
            if (post.authorId === userId) {
                console.log('✅ d_admin can modify their own post');
                return next();
            }
            return res.status(403).json({
                success: false,
                message: 'You can only modify your own posts.'
            });
        }

        // Regular users cannot modify posts
        return res.status(403).json({
            success: false,
            message: 'You do not have permission to modify posts.'
        });

    } catch (error) {
        console.error('❌ Error in canModifyPost middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Error validating modification permissions',
            error: error.message
        });
    }
};

/**
 * Check if user can comment on posts
 * Based on system requirements, this is optional
 */
const canComment = (req, res, next) => {
    const userRole = req.session.user?.role;

    // For now, all authenticated users can comment
    // You can add more granular rules here
    console.log('✅ User can comment');
    next();
};

/**
 * Verify user belongs to a specific department (for d_admin operations)
 */
const belongsToDepartment = (departmentIdField = 'departmentId') => {
    return async (req, res, next) => {
        try {
            const userId = req.session.user?.id;
            const userRole = req.session.user?.role;
            const targetDepartmentId = req.params[departmentIdField] || req.body[departmentIdField];

            // Admins and power admins bypass this check
            if (userRole === 'power_admin' || userRole === 'admin') {
                return next();
            }

            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (userRole === 'd_admin') {
                if (user.managedDepartmentId !== targetDepartmentId) {
                    return res.status(403).json({
                        success: false,
                        message: 'You can only manage your assigned department.'
                    });
                }
            } else {
                if (user.departmentId !== targetDepartmentId) {
                    return res.status(403).json({
                        success: false,
                        message: 'You do not belong to this department.'
                    });
                }
            }

            next();
        } catch (error) {
            console.error('❌ Error in belongsToDepartment middleware:', error);
            return res.status(500).json({
                success: false,
                message: 'Error validating department membership',
                error: error.message
            });
        }
    };
};

/**
 * Rate limiting per role
 */
const roleBasedRateLimit = {
    user: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 minutes
    d_admin: { windowMs: 15 * 60 * 1000, max: 200 },
    admin: { windowMs: 15 * 60 * 1000, max: 500 },
    power_admin: { windowMs: 15 * 60 * 1000, max: 1000 }
};

module.exports = {
    isAuthenticated,
    hasRole,
    canCreatePost,
    canViewPosts,
    canModifyPost,
    canComment,
    belongsToDepartment,
    roleBasedRateLimit
};
