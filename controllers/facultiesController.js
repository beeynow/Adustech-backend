/**
 * ============================================================================
 * FACULTIES CONTROLLER
 * Manages faculties and their departments
 * ============================================================================
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET ALL FACULTIES
 */
exports.getAllFaculties = async (req, res) => {
    try {
        console.log('📚 Fetching all faculties...');

        const faculties = await prisma.faculty.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        departments: true,
                        users: true,
                        posts: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        console.log(`✅ Retrieved ${faculties.length} faculties`);

        return res.status(200).json({
            success: true,
            faculties,
            total: faculties.length
        });

    } catch (error) {
        console.error('❌ Error fetching faculties:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch faculties',
            error: error.message
        });
    }
};

/**
 * GET SINGLE FACULTY
 */
exports.getFaculty = async (req, res) => {
    try {
        const { facultyId } = req.params;

        console.log('📚 Fetching faculty:', facultyId);

        const faculty = await prisma.faculty.findUnique({
            where: { id: facultyId },
            include: {
                departments: {
                    where: { isActive: true },
                    include: {
                        _count: {
                            select: { levels: true, users: true }
                        }
                    }
                },
                _count: {
                    select: {
                        departments: true,
                        users: true,
                        posts: true
                    }
                }
            }
        });

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'Faculty not found'
            });
        }

        console.log('✅ Faculty retrieved');

        return res.status(200).json({
            success: true,
            faculty
        });

    } catch (error) {
        console.error('❌ Error fetching faculty:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch faculty',
            error: error.message
        });
    }
};

/**
 * GET FACULTY DEPARTMENTS
 */
exports.getFacultyDepartments = async (req, res) => {
    try {
        const { facultyId } = req.params;

        console.log('🏢 Fetching departments for faculty:', facultyId);

        const departments = await prisma.department.findMany({
            where: {
                facultyId,
                isActive: true
            },
            include: {
                _count: {
                    select: {
                        levels: true,
                        users: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        console.log(`✅ Retrieved ${departments.length} departments`);

        return res.status(200).json({
            success: true,
            departments,
            total: departments.length
        });

    } catch (error) {
        console.error('❌ Error fetching departments:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch departments',
            error: error.message
        });
    }
};

/**
 * GET SINGLE DEPARTMENT
 */
exports.getDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;

        console.log('🏢 Fetching department:', departmentId);

        const department = await prisma.department.findUnique({
            where: { id: departmentId },
            include: {
                faculty: true,
                levels: {
                    where: { isActive: true },
                    orderBy: { levelNumber: 'asc' }
                },
                _count: {
                    select: {
                        levels: true,
                        users: true
                    }
                }
            }
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        console.log('✅ Department retrieved');

        return res.status(200).json({
            success: true,
            department
        });

    } catch (error) {
        console.error('❌ Error fetching department:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch department',
            error: error.message
        });
    }
};

/**
 * GET DEPARTMENT LEVELS (100-500)
 */
exports.getDepartmentLevels = async (req, res) => {
    try {
        const { departmentId } = req.params;

        console.log('📊 Fetching levels for department:', departmentId);

        const levels = await prisma.level.findMany({
            where: {
                departmentId,
                isActive: true
            },
            include: {
                department: {
                    include: {
                        faculty: true
                    }
                },
                _count: {
                    select: {
                        users: true,
                        posts: true
                    }
                }
            },
            orderBy: { levelNumber: 'asc' }
        });

        console.log(`✅ Retrieved ${levels.length} levels`);

        return res.status(200).json({
            success: true,
            levels,
            total: levels.length
        });

    } catch (error) {
        console.error('❌ Error fetching levels:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch levels',
            error: error.message
        });
    }
};

/**
 * GET SINGLE LEVEL
 */
exports.getLevel = async (req, res) => {
    try {
        const { levelId } = req.params;

        console.log('📊 Fetching level:', levelId);

        const level = await prisma.level.findUnique({
            where: { id: levelId },
            include: {
                department: {
                    include: {
                        faculty: true
                    }
                },
                _count: {
                    select: {
                        users: true,
                        posts: true
                    }
                }
            }
        });

        if (!level) {
            return res.status(404).json({
                success: false,
                message: 'Level not found'
            });
        }

        console.log('✅ Level retrieved');

        return res.status(200).json({
            success: true,
            level
        });

    } catch (error) {
        console.error('❌ Error fetching level:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch level',
            error: error.message
        });
    }
};

/**
 * GET USER'S ACADEMIC CONTEXT
 */
exports.getUserAcademicContext = async (req, res) => {
    try {
        const userId = req.session.user?.id;

        console.log('🎓 Fetching academic context for user:', userId);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                facultyRel: true,
                departmentRel: {
                    include: {
                        faculty: true
                    }
                },
                levelRel: {
                    include: {
                        department: {
                            include: {
                                faculty: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const context = {
            faculty: user.facultyRel,
            department: user.departmentRel,
            level: user.levelRel,
            hasAcademicProfile: !!(user.facultyId && user.departmentId && user.levelId)
        };

        console.log('✅ Academic context retrieved');

        return res.status(200).json({
            success: true,
            context
        });

    } catch (error) {
        console.error('❌ Error fetching academic context:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch academic context',
            error: error.message
        });
    }
};
