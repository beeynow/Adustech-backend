/**
 * ============================================================================
 * ACADEMIC POSTS CONTROLLER
 * Production-ready controller for Academic Notice Board System
 * ============================================================================
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { uploadToCloudinary } = require('../utils/cloudinary');

/**
 * CREATE POST
 * Creates a post in global, faculty, or department level scope
 * 
 * Business Rules:
 * - users: Cannot create posts
 * - d_admin: Can only post in their managed department levels
 * - admin: Can post anywhere
 * - power_admin: Can post anywhere
 * 
 * Post Scopes:
 * - Global: faculty_id = null, level_id = null
 * - Faculty: faculty_id = <id>, level_id = null
 * - Level: level_id = <id> (faculty_id derived from level)
 */
exports.createPost = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const userRole = req.session.user?.role;
        const { title, content, faculty_id, level_id, image_url, category, priority } = req.body;

        console.log('📝 Creating academic post:', {
            userId,
            userRole,
            title: title?.substring(0, 50),
            faculty_id,
            level_id,
            category,
            priority
        });

        // Validation: Title and content are required
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required.'
            });
        }

        // Validation: Check post scope validity
        const isGlobal = !faculty_id && !level_id;
        const isFaculty = faculty_id && !level_id;
        const isLevel = level_id;

        if (!isGlobal && !isFaculty && !isLevel) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post scope. Must be global, faculty, or level-specific.'
            });
        }

        // Build post data
        const postData = {
            authorId: userId,
            title: title.trim(),
            content: content.trim(),
            category: category || 'General',
            priority: priority || 'normal',
            isPublished: true
        };

        // Set scope
        if (isLevel) {
            postData.levelId = level_id;
        } else if (isFaculty) {
            postData.facultyId = faculty_id;
        }

        // Handle image upload if present
        if (image_url) {
            postData.imageUrl = image_url;
        }

        // Validate level belongs to user's managed department (for d_admin)
        if (userRole === 'd_admin' && level_id) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { managedDepartmentId: true }
            });

            const level = await prisma.level.findUnique({
                where: { id: level_id },
                select: { departmentId: true }
            });

            if (!level || level.departmentId !== user.managedDepartmentId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only post in your managed department levels'
                });
            }
        }

        // Create the post
        const post = await prisma.post.create({
            data: postData,
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true
                    }
                },
                faculty: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                },
                level: {
                    select: {
                        id: true,
                        levelNumber: true,
                        displayName: true,
                        department: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                                faculty: {
                                    select: {
                                        id: true,
                                        name: true,
                                        code: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ Post created successfully:', post.id);

        return res.status(201).json({
            success: true,
            message: 'Post created successfully.',
            post: {
                id: post.id,
                title: post.title,
                content: post.content,
                category: post.category,
                priority: post.priority,
                imageUrl: post.imageUrl,
                scope: isLevel ? 'level' : isFaculty ? 'faculty' : 'global',
                author: post.author,
                faculty: post.faculty,
                level: post.level,
                createdAt: post.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Error creating post:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create post.',
            error: error.message
        });
    }
};

/**
 * GET GLOBAL POSTS (Home Page)
 * Fetches posts where faculty_id IS NULL AND level_id IS NULL
 * 
 * Access: Everyone can view global posts
 */
exports.getGlobalPosts = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const { page = 1, limit = 20, category, priority } = req.query;

        console.log('🌍 Fetching global posts:', { page, limit, category, priority });

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {
            facultyId: null,
            levelId: null,
            isPublished: true
        };

        if (category && category !== 'All') {
            where.category = category;
        }

        if (priority) {
            where.priority = priority;
        }

        // Fetch posts with pagination
        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: [
                    { isPinned: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    author: {
                        select: {
                            id: true,
                            fullName: true,
                            role: true
                        }
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true
                        }
                    },
                    likes: userId ? {
                        where: { userId },
                        select: { id: true }
                    } : false
                }
            }),
            prisma.post.count({ where })
        ]);

        // Format response
        const formattedPosts = posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            priority: post.priority,
            imageUrl: post.imageUrl,
            isPinned: post.isPinned,
            scope: 'global',
            author: post.author,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            viewsCount: post.viewsCount,
            isLiked: userId ? post.likes.length > 0 : false,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        }));

        console.log(`✅ Retrieved ${formattedPosts.length} global posts`);

        return res.status(200).json({
            success: true,
            posts: formattedPosts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalPosts: total,
                hasMore: skip + formattedPosts.length < total
            }
        });

    } catch (error) {
        console.error('❌ Error fetching global posts:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch global posts.',
            error: error.message
        });
    }
};

/**
 * GET FACULTY POSTS
 * Fetches posts where faculty_id = :facultyId AND level_id IS NULL
 * 
 * Access: Users must belong to the faculty (validated by middleware)
 */
exports.getFacultyPosts = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const { facultyId } = req.params;
        const { page = 1, limit = 20, category, priority } = req.query;

        console.log('🏫 Fetching faculty posts:', { facultyId, page, limit });

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {
            facultyId,
            levelId: null,
            isPublished: true
        };

        if (category && category !== 'All') {
            where.category = category;
        }

        if (priority) {
            where.priority = priority;
        }

        // Fetch posts with pagination
        const [posts, total, faculty] = await Promise.all([
            prisma.post.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: [
                    { isPinned: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    author: {
                        select: {
                            id: true,
                            fullName: true,
                            role: true
                        }
                    },
                    faculty: {
                        select: {
                            id: true,
                            name: true,
                            code: true
                        }
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true
                        }
                    },
                    likes: userId ? {
                        where: { userId },
                        select: { id: true }
                    } : false
                }
            }),
            prisma.post.count({ where }),
            prisma.faculty.findUnique({
                where: { id: facultyId },
                select: { id: true, name: true, code: true, description: true }
            })
        ]);

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'Faculty not found.'
            });
        }

        // Format response
        const formattedPosts = posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            priority: post.priority,
            imageUrl: post.imageUrl,
            isPinned: post.isPinned,
            scope: 'faculty',
            author: post.author,
            faculty: post.faculty,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            viewsCount: post.viewsCount,
            isLiked: userId ? post.likes.length > 0 : false,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        }));

        console.log(`✅ Retrieved ${formattedPosts.length} faculty posts`);

        return res.status(200).json({
            success: true,
            faculty,
            posts: formattedPosts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalPosts: total,
                hasMore: skip + formattedPosts.length < total
            }
        });

    } catch (error) {
        console.error('❌ Error fetching faculty posts:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch faculty posts.',
            error: error.message
        });
    }
};

/**
 * GET DEPARTMENT LEVEL POSTS
 * Fetches posts where level_id = :levelId
 * 
 * Access: Users must belong to the level or be admin (validated by middleware)
 */
exports.getLevelPosts = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const { levelId } = req.params;
        const { page = 1, limit = 20, category, priority } = req.query;

        console.log('📚 Fetching level posts:', { levelId, page, limit });

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {
            levelId,
            isPublished: true
        };

        if (category && category !== 'All') {
            where.category = category;
        }

        if (priority) {
            where.priority = priority;
        }

        // Fetch posts with pagination
        const [posts, total, level] = await Promise.all([
            prisma.post.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: [
                    { isPinned: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    author: {
                        select: {
                            id: true,
                            fullName: true,
                            role: true
                        }
                    },
                    level: {
                        select: {
                            id: true,
                            levelNumber: true,
                            displayName: true,
                            department: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    faculty: {
                                        select: {
                                            id: true,
                                            name: true,
                                            code: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true
                        }
                    },
                    likes: userId ? {
                        where: { userId },
                        select: { id: true }
                    } : false
                }
            }),
            prisma.post.count({ where }),
            prisma.level.findUnique({
                where: { id: levelId },
                include: {
                    department: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            faculty: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true
                                }
                            }
                        }
                    }
                }
            })
        ]);

        if (!level) {
            return res.status(404).json({
                success: false,
                message: 'Level not found.'
            });
        }

        // Format response
        const formattedPosts = posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            priority: post.priority,
            imageUrl: post.imageUrl,
            isPinned: post.isPinned,
            scope: 'level',
            author: post.author,
            level: post.level,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            viewsCount: post.viewsCount,
            isLiked: userId ? post.likes.length > 0 : false,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        }));

        console.log(`✅ Retrieved ${formattedPosts.length} level posts`);

        return res.status(200).json({
            success: true,
            level: {
                id: level.id,
                levelNumber: level.levelNumber,
                displayName: level.displayName,
                department: level.department
            },
            posts: formattedPosts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalPosts: total,
                hasMore: skip + formattedPosts.length < total
            }
        });

    } catch (error) {
        console.error('❌ Error fetching level posts:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch level posts.',
            error: error.message
        });
    }
};

/**
 * GET SINGLE POST
 * Fetches a single post with full details
 */
exports.getPost = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const { postId } = req.params;

        console.log('📄 Fetching single post:', postId);

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true
                    }
                },
                faculty: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                },
                level: {
                    select: {
                        id: true,
                        levelNumber: true,
                        displayName: true,
                        department: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                                faculty: {
                                    select: {
                                        id: true,
                                        name: true,
                                        code: true
                                    }
                                }
                            }
                        }
                    }
                },
                comments: {
                    where: { parentId: null },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                role: true
                            }
                        },
                        replies: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        role: true
                                    }
                                }
                            }
                        },
                        _count: {
                            select: { likes: true }
                        }
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true
                    }
                },
                likes: userId ? {
                    where: { userId },
                    select: { id: true }
                } : false
            }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }

        // Increment view count
        await prisma.post.update({
            where: { id: postId },
            data: { viewsCount: { increment: 1 } }
        });

        // Track view
        if (userId) {
            await prisma.postView.upsert({
                where: {
                    postId_userId_viewedAt: {
                        postId,
                        userId,
                        viewedAt: new Date()
                    }
                },
                create: {
                    postId,
                    userId
                },
                update: {}
            });
        }

        // Determine scope
        const scope = post.levelId ? 'level' : post.facultyId ? 'faculty' : 'global';

        const response = {
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            priority: post.priority,
            imageUrl: post.imageUrl,
            isPinned: post.isPinned,
            scope,
            author: post.author,
            faculty: post.faculty,
            level: post.level,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            viewsCount: post.viewsCount + 1,
            isLiked: userId ? post.likes.length > 0 : false,
            comments: post.comments,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        };

        console.log('✅ Post retrieved successfully');

        return res.status(200).json({
            success: true,
            post: response
        });

    } catch (error) {
        console.error('❌ Error fetching post:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch post.',
            error: error.message
        });
    }
};

/**
 * UPDATE POST
 * Updates post title, content, or other fields
 * Access: Author or admins only
 */
exports.updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, content, category, priority, isPinned } = req.body;

        console.log('✏️ Updating post:', postId);

        const updateData = {};

        if (title) updateData.title = title.trim();
        if (content) updateData.content = content.trim();
        if (category) updateData.category = category;
        if (priority) updateData.priority = priority;
        if (typeof isPinned === 'boolean') updateData.isPinned = isPinned;

        const post = await prisma.post.update({
            where: { id: postId },
            data: updateData,
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true
                    }
                },
                faculty: true,
                level: {
                    include: {
                        department: true
                    }
                }
            }
        });

        console.log('✅ Post updated successfully');

        return res.status(200).json({
            success: true,
            message: 'Post updated successfully.',
            post
        });

    } catch (error) {
        console.error('❌ Error updating post:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update post.',
            error: error.message
        });
    }
};

/**
 * DELETE POST
 * Soft delete or hard delete a post
 * Access: Author or admins only
 */
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        console.log('🗑️ Deleting post:', postId);

        await prisma.post.delete({
            where: { id: postId }
        });

        console.log('✅ Post deleted successfully');

        return res.status(200).json({
            success: true,
            message: 'Post deleted successfully.'
        });

    } catch (error) {
        console.error('❌ Error deleting post:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete post.',
            error: error.message
        });
    }
};

/**
 * TOGGLE LIKE POST
 */
exports.toggleLikePost = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const { postId } = req.params;

        console.log('❤️ Toggling like on post:', postId);

        // Check if already liked
        const existingLike = await prisma.postLike.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId
                }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.postLike.delete({
                where: { id: existingLike.id }
            });

            const likesCount = await prisma.postLike.count({
                where: { postId }
            });

            return res.status(200).json({
                success: true,
                message: 'Post unliked.',
                isLiked: false,
                likesCount
            });
        } else {
            // Like
            await prisma.postLike.create({
                data: {
                    postId,
                    userId
                }
            });

            const likesCount = await prisma.postLike.count({
                where: { postId }
            });

            return res.status(200).json({
                success: true,
                message: 'Post liked.',
                isLiked: true,
                likesCount
            });
        }

    } catch (error) {
        console.error('❌ Error toggling like:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to toggle like.',
            error: error.message
        });
    }
};

/**
 * ADD COMMENT
 */
exports.addComment = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const { postId } = req.params;
        const { content, parentId } = req.body;

        console.log('💬 Adding comment to post:', postId);

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required.'
            });
        }

        const comment = await prisma.comment.create({
            data: {
                postId,
                userId,
                content: content.trim(),
                parentId: parentId || null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true
                    }
                }
            }
        });

        console.log('✅ Comment added successfully');

        return res.status(201).json({
            success: true,
            message: 'Comment added successfully.',
            comment
        });

    } catch (error) {
        console.error('❌ Error adding comment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add comment.',
            error: error.message
        });
    }
};
