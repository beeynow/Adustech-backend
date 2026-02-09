const { prisma } = require('../config/db');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Create Post (with optional department and level filtering)
exports.createPost = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            console.log('❌ Unauthorized post creation attempt');
            return res.status(401).json({ message: 'Unauthorized. Please log in to create posts.' });
        }

        const { text, category, imageBase64, departmentId, level } = req.body;

        console.log('📝 Creating post:', { 
            userId, 
            hasText: !!text, 
            hasImage: !!imageBase64,
            category: category || 'All',
            departmentId: departmentId || 'public',
            level: level || 'all'
        });

        // Validate that at least text or image is provided
        if (!text && !imageBase64) {
            return res.status(400).json({ message: 'Post must contain either text or an image' });
        }

        let imageUrl = '';
        if (imageBase64 && imageBase64.startsWith('data:image')) {
            try {
                console.log('📸 Uploading image to Cloudinary...');
                const uploadResult = await uploadToCloudinary(imageBase64, 'posts');
                imageUrl = uploadResult.secure_url;
                console.log('✅ Image uploaded:', imageUrl);
            } catch (uploadError) {
                console.error('❌ Image upload failed:', uploadError.message);
                return res.status(500).json({ message: 'Failed to upload image', error: uploadError.message });
            }
        }

        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            select: { id: true, name: true, department: true, level: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Build post data
        const postData = {
            userId,
            userName: user.name,
            text: text?.trim() || '',
            category: category || 'All',
            imageBase64: imageUrl ? '' : (imageBase64 || ''), // Only store base64 if no imageUrl
            imageUrl: imageUrl || '',
            departmentId: '',
            department: '',
            level: ''
        };

        // If posting to a department channel
        if (departmentId && departmentId.trim()) {
            // Verify department exists
            const department = await prisma.department.findUnique({ 
                where: { id: departmentId } 
            });

            if (!department) {
                console.log('❌ Department not found:', departmentId);
                return res.status(404).json({ message: 'Department not found' });
            }

            // Validate level if provided
            if (level && level.trim()) {
                if (!department.levels.includes(level)) {
                    return res.status(400).json({ 
                        message: `Invalid level for this department. Valid levels: ${department.levels.join(', ')}` 
                    });
                }
                postData.level = level;
            } else {
                // Department post without specific level - requires level selection
                return res.status(400).json({ 
                    message: 'Please select a level when posting to a department' 
                });
            }

            postData.departmentId = departmentId;
            postData.department = department.name;
            console.log('🎓 Posting to department:', department.name, 'Level:', level);
        } else {
            console.log('🌍 Creating public post');
        }
        
        const post = await prisma.post.create({
            data: postData,
            include: {
                user: {
                    select: { id: true, name: true, profileImage: true }
                }
            }
        });

        console.log('✅ Post created successfully:', post.id);
        res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
        console.error('❌ Error creating post:', error);
        res.status(500).json({ 
            message: 'Error creating post', 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// List Posts with pagination and filters (with department/level filtering)
exports.listPosts = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search = '', 
            category = '',
            departmentId = '',
            level = ''
        } = req.query;
        
        const userId = req.session.user?.id;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        
        if (search) {
            where.OR = [
                { text: { contains: search, mode: 'insensitive' } },
                { userName: { contains: search, mode: 'insensitive' } }
            ];
        }
        
        if (category && category !== 'All') {
            where.category = category;
        }

        // Department filtering
        if (departmentId) {
            where.departmentId = departmentId;
            
            // Filter by specific level if provided
            if (level) {
                // Show posts for this level or posts for all levels in this department
                where.OR = [
                    { level: level },
                    { level: '' }
                ];
            }
        } else {
            // If no department specified, show public posts (departmentId is empty string)
            // This allows seeing all posts when no filter is applied
            // Don't add departmentId filter - show all posts
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                select: {
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    userId: true,
                    userName: true,
                    category: true,
                    text: true,
                    imageUrl: true,
                    imageBase64: true,
                    departmentId: true,
                    department: true,
                    level: true,
                    user: {
                        select: { id: true, name: true, profileImage: true, level: true, department: true }
                    },
                    likes: {
                        select: { userId: true },
                        take: 1000 // Limit likes to prevent huge responses
                    },
                    reposts: {
                        select: { userId: true },
                        take: 1000 // Limit reposts
                    },
                    comments: {
                        select: {
                            id: true,
                            createdAt: true,
                            text: true,
                            userName: true,
                            userId: true,
                            user: {
                                select: { id: true, name: true, profileImage: true }
                            },
                            likes: {
                                select: { userId: true }
                            }
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 50 // Limit comments per post to first 50
                    },
                    _count: {
                        select: {
                            likes: true,
                            reposts: true,
                            comments: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.post.count({ where })
        ]);

        // Transform data to match frontend expectations
        const transformedPosts = posts.map(post => ({
            ...post,
            likes: post.likes.map(like => like.userId),
            reposts: post.reposts.map(repost => repost.userId),
            comments: post.comments.map(comment => ({
                ...comment,
                likes: comment.likes.map(like => like.userId)
            })),
            likesCount: post._count.likes,
            repostsCount: post._count.reposts,
            commentsCount: post._count.comments
        }));

        res.json({
            posts: transformedPosts,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error listing posts:', error);
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};

// Get Single Post
exports.getPost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, profileImage: true }
                },
                likes: {
                    select: { userId: true }
                },
                reposts: {
                    select: { userId: true }
                },
                comments: {
                    include: {
                        user: {
                            select: { id: true, name: true, profileImage: true }
                        },
                        likes: {
                            select: { userId: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Transform data
        const transformedPost = {
            ...post,
            likes: post.likes.map(like => like.userId),
            reposts: post.reposts.map(repost => repost.userId),
            comments: post.comments.map(comment => ({
                ...comment,
                likes: comment.likes.map(like => like.userId)
            }))
        };

        res.json({ post: transformedPost });
    } catch (error) {
        console.error('Error getting post:', error);
        res.status(500).json({ message: 'Error fetching post', error: error.message });
    }
};

// Toggle Like on Post
exports.toggleLikePost = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { id: postId } = req.params;

        // Check if post exists
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if already liked
        const existingLike = await prisma.postLike.findUnique({
            where: {
                postId_userId: { postId, userId }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.postLike.delete({
                where: {
                    postId_userId: { postId, userId }
                }
            });
            res.json({ message: 'Post unliked', liked: false });
        } else {
            // Like
            await prisma.postLike.create({
                data: { postId, userId }
            });
            res.json({ message: 'Post liked', liked: true });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Error toggling like', error: error.message });
    }
};

// Toggle Repost
exports.toggleRepostPost = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { id: postId } = req.params;

        // Check if post exists
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if already reposted
        const existingRepost = await prisma.postRepost.findUnique({
            where: {
                postId_userId: { postId, userId }
            }
        });

        if (existingRepost) {
            // Unrepost
            await prisma.postRepost.delete({
                where: {
                    postId_userId: { postId, userId }
                }
            });
            res.json({ message: 'Post unreposted', reposted: false });
        } else {
            // Repost
            await prisma.postRepost.create({
                data: { postId, userId }
            });
            res.json({ message: 'Post reposted', reposted: true });
        }
    } catch (error) {
        console.error('Error toggling repost:', error);
        res.status(500).json({ message: 'Error toggling repost', error: error.message });
    }
};

// Add Comment (supports nested comments/replies)
exports.addComment = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { id: postId } = req.params;
        const { text, parentId } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        // Check if post exists
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // If this is a reply, verify parent comment exists
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({ 
                where: { id: parentId },
                select: { postId: true }
            });
            
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
            
            // Ensure parent comment belongs to the same post
            if (parentComment.postId !== postId) {
                return res.status(400).json({ message: 'Parent comment does not belong to this post' });
            }
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        const comment = await prisma.comment.create({
            data: {
                postId,
                userId,
                userName: user.name,
                text,
                parentId: parentId || null
            },
            include: {
                user: {
                    select: { id: true, name: true, profileImage: true }
                },
                likes: {
                    select: { userId: true }
                },
                parent: parentId ? {
                    select: { id: true, userName: true, text: true }
                } : false
            }
        });

        // Transform comment
        const transformedComment = {
            ...comment,
            likes: comment.likes.map(like => like.userId),
            likesCount: comment.likes.length
        };

        res.status(201).json({ message: 'Comment added', comment: transformedComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

// List Comments for a Post (with nested replies)
exports.listComments = async (req, res) => {
    try {
        const { id: postId } = req.params;

        // Get all comments (including replies)
        const comments = await prisma.comment.findMany({
            where: { postId },
            include: {
                user: {
                    select: { id: true, name: true, profileImage: true }
                },
                likes: {
                    select: { userId: true }
                },
                parent: {
                    select: { id: true, userName: true, text: true }
                },
                replies: {
                    include: {
                        user: {
                            select: { id: true, name: true, profileImage: true }
                        },
                        likes: {
                            select: { userId: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                _count: {
                    select: { replies: true, likes: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform comments
        const transformedComments = comments.map(comment => ({
            ...comment,
            likes: comment.likes.map(like => like.userId),
            likesCount: comment._count.likes,
            repliesCount: comment._count.replies,
            replies: comment.replies.map(reply => ({
                ...reply,
                likes: reply.likes.map(like => like.userId),
                likesCount: reply.likes.length
            }))
        }));

        // Filter out nested replies from top level (only show parent comments at top level)
        const topLevelComments = transformedComments.filter(comment => !comment.parentId);

        res.json({ comments: topLevelComments });
    } catch (error) {
        console.error('Error listing comments:', error);
        res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }
};

// Toggle Like on Comment
exports.toggleLikeComment = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { commentId } = req.params;

        // Check if comment exists
        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if already liked
        const existingLike = await prisma.commentLike.findUnique({
            where: {
                commentId_userId: { commentId, userId }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.commentLike.delete({
                where: {
                    commentId_userId: { commentId, userId }
                }
            });
            res.json({ message: 'Comment unliked', liked: false });
        } else {
            // Like
            await prisma.commentLike.create({
                data: { commentId, userId }
            });
            res.json({ message: 'Comment liked', liked: true });
        }
    } catch (error) {
        console.error('Error toggling comment like:', error);
        res.status(500).json({ message: 'Error toggling comment like', error: error.message });
    }
};

// Health Check
exports.health = (req, res) => {
    res.json({ status: 'ok', message: 'Posts API is running' });
};
