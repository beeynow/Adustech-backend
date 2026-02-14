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

        // Validate that at least text or image is provided (already checked by validation middleware)
        const trimmedText = text?.trim() || '';
        if (!trimmedText && !imageBase64) {
            return res.status(400).json({ message: 'Post must contain either text or an image' });
        }

        // Additional security: Validate text length
        if (trimmedText && trimmedText.length > 500) {
            return res.status(400).json({ message: 'Post text must not exceed 500 characters' });
        }

        let imageUrl = '';
        if (imageBase64 && imageBase64.startsWith('data:image')) {
            try {
                console.log('📸 Uploading image to Cloudinary...');
                
                // Validate image size (approximate - base64 is ~33% larger than actual file)
                const base64Length = imageBase64.length;
                const estimatedSizeInMB = (base64Length * 0.75) / (1024 * 1024);
                
                if (estimatedSizeInMB > 15) {
                    return res.status(400).json({ 
                        message: 'Image is too large. Maximum size is 15MB',
                        details: `Estimated size: ${estimatedSizeInMB.toFixed(2)}MB`
                    });
                }
                
                const uploadResult = await uploadToCloudinary(imageBase64, 'posts');
                imageUrl = uploadResult.secure_url;
                console.log('✅ Image uploaded:', imageUrl);
            } catch (uploadError) {
                console.error('❌ Image upload failed:', uploadError.message);
                return res.status(500).json({ message: 'Failed to upload image', error: uploadError.message });
            }
        } else if (imageBase64) {
            // Invalid image format
            return res.status(400).json({ message: 'Invalid image format. Must be a valid base64 data URL' });
        }

        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            select: { id: true, name: true, department: true, level: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Build post data with sanitized inputs
        const postData = {
            userId,
            userName: user.name,
            text: trimmedText,
            category: category || 'All',
            imageBase64: imageUrl ? '' : '', // Don't store base64 if we have cloudinary URL
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
                User: {
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
        
        // Validate pagination parameters
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20)); // Max 100 per page
        const skip = (pageNum - 1) * limitNum;

        const where = {};
        
        // Search filtering with sanitization
        if (search && typeof search === 'string' && search.trim()) {
            const sanitizedSearch = search.trim().slice(0, 100); // Limit search length
            where.OR = [
                { text: { contains: sanitizedSearch, mode: 'insensitive' } },
                { userName: { contains: sanitizedSearch, mode: 'insensitive' } }
            ];
        }
        
        // Category filtering with validation
        const validCategories = ['All', 'Level', 'Department', 'Exam', 'Timetable', 'Event'];
        if (category && category !== 'All' && validCategories.includes(category)) {
            where.category = category;
        }

        // Department filtering
        if (departmentId && typeof departmentId === 'string' && departmentId.trim()) {
            where.departmentId = departmentId.trim();
            
            // Filter by specific level if provided
            if (level && typeof level === 'string' && level.trim()) {
                // Show posts for this level or posts for all levels in this department
                where.OR = [
                    { level: level.trim() },
                    { level: '' }
                ];
            }
        }

        // Fetch posts and total count
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
                    User: {
                        select: { id: true, name: true, profileImage: true, level: true, department: true }
                    },
                    likes: userId ? {
                        where: { userId }, // Only fetch current user's like status
                        select: { userId: true },
                        take: 1
                    } : false,
                    reposts: userId ? {
                        where: { userId }, // Only fetch current user's repost status
                        select: { userId: true },
                        take: 1
                    } : false,
                    comments: {
                        select: {
                            id: true,
                            createdAt: true,
                            text: true,
                            userName: true,
                            userId: true,
                            User: {
                                select: { id: true, name: true, profileImage: true }
                            },
                            likes: {
                                select: { userId: true },
                                take: 100
                            }
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 5 // Only show first 5 comments in list view
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
                take: limitNum
            }),
            prisma.post.count({ where })
        ]);

        console.log(`📋 Listed ${posts.length} posts (page ${pageNum}, total: ${total})`);

        // Transform data to match frontend expectations
        const transformedPosts = posts.map(post => {
            const isLikedByUser = userId && post.likes && post.likes.length > 0;
            const isRepostedByUser = userId && post.reposts && post.reposts.length > 0;
            
            return {
                ...post,
                likes: post.likes ? post.likes.map(like => like.userId) : [],
                reposts: post.reposts ? post.reposts.map(repost => repost.userId) : [],
                comments: post.comments.map(comment => ({
                    ...comment,
                    likes: comment.likes.map(like => like.userId),
                    likesCount: comment.likes.length
                })),
                likesCount: post._count.likes,
                repostsCount: post._count.reposts,
                commentsCount: post._count.comments,
                isLiked: isLikedByUser,
                isReposted: isRepostedByUser
            };
        });

        res.json({
            success: true,
            posts: transformedPosts,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum),
                hasMore: skip + posts.length < total
            }
        });
    } catch (error) {
        console.error('❌ Error listing posts:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching posts', 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Get Single Post
exports.getPost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.user?.id;

        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                User: {
                    select: { id: true, name: true, profileImage: true, department: true, level: true }
                },
                likes: {
                    select: { userId: true },
                    take: 1000
                },
                reposts: {
                    select: { userId: true },
                    take: 1000
                },
                comments: {
                    where: { parentId: null }, // Only get top-level comments
                    include: {
                        User: {
                            select: { id: true, name: true, profileImage: true }
                        },
                        likes: {
                            select: { userId: true }
                        },
                        replies: {
                            include: {
                                User: {
                                    select: { id: true, name: true, profileImage: true }
                                },
                                likes: {
                                    select: { userId: true }
                                }
                            },
                            orderBy: { createdAt: 'asc' },
                            take: 50 // Limit replies per comment
                        },
                        _count: {
                            select: { replies: true, likes: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 100 // Limit to first 100 comments
                },
                _count: {
                    select: {
                        likes: true,
                        reposts: true,
                        comments: true
                    }
                }
            }
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        console.log('📖 Fetched post:', { postId: id, userId: post.userId });

        // Transform data with user interaction states
        const isLikedByUser = userId && post.likes.some(like => like.userId === userId);
        const isRepostedByUser = userId && post.reposts.some(repost => repost.userId === userId);

        const transformedPost = {
            ...post,
            likes: post.likes.map(like => like.userId),
            reposts: post.reposts.map(repost => repost.userId),
            comments: post.comments.map(comment => {
                const commentIsLiked = userId && comment.likes.some(like => like.userId === userId);
                return {
                    ...comment,
                    likes: comment.likes.map(like => like.userId),
                    likesCount: comment._count.likes,
                    repliesCount: comment._count.replies,
                    isLiked: commentIsLiked,
                    replies: comment.replies.map(reply => ({
                        ...reply,
                        likes: reply.likes.map(like => like.userId),
                        likesCount: reply.likes.length,
                        isLiked: userId && reply.likes.some(like => like.userId === userId)
                    }))
                };
            }),
            likesCount: post._count.likes,
            repostsCount: post._count.reposts,
            commentsCount: post._count.comments,
            isLiked: isLikedByUser,
            isReposted: isRepostedByUser
        };

        res.json({ success: true, post: transformedPost });
    } catch (error) {
        console.error('❌ Error getting post:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching post', 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Toggle Like on Post
exports.toggleLikePost = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized. Please log in to like posts.' });
        }

        const { id: postId } = req.params;

        // Check if post exists
        const post = await prisma.post.findUnique({ 
            where: { id: postId },
            select: { id: true }
        });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if already liked
        const existingLike = await prisma.postLike.findUnique({
            where: {
                postId_userId: { postId, userId }
            }
        });

        let liked = false;
        let totalLikes = 0;

        if (existingLike) {
            // Unlike
            await prisma.postLike.delete({
                where: {
                    postId_userId: { postId, userId }
                }
            });
            liked = false;
            console.log('👎 Post unliked:', { postId, userId });
        } else {
            // Like
            await prisma.postLike.create({
                data: { postId, userId }
            });
            liked = true;
            console.log('👍 Post liked:', { postId, userId });
        }

        // Get updated like count
        totalLikes = await prisma.postLike.count({ where: { postId } });

        res.json({ 
            message: liked ? 'Post liked successfully' : 'Post unliked successfully', 
            liked,
            totalLikes
        });
    } catch (error) {
        console.error('❌ Error toggling like:', error);
        res.status(500).json({ 
            message: 'Error toggling like', 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Toggle Repost
exports.toggleRepostPost = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized. Please log in to repost.' });
        }

        const { id: postId } = req.params;

        // Check if post exists
        const post = await prisma.post.findUnique({ 
            where: { id: postId },
            select: { id: true, userId: true }
        });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Prevent users from reposting their own posts
        if (post.userId === userId) {
            return res.status(400).json({ message: 'You cannot repost your own post' });
        }

        // Check if already reposted
        const existingRepost = await prisma.postRepost.findUnique({
            where: {
                postId_userId: { postId, userId }
            }
        });

        let reposted = false;
        let totalReposts = 0;

        if (existingRepost) {
            // Unrepost
            await prisma.postRepost.delete({
                where: {
                    postId_userId: { postId, userId }
                }
            });
            reposted = false;
            console.log('🔄 Post unreposted:', { postId, userId });
        } else {
            // Repost
            await prisma.postRepost.create({
                data: { postId, userId }
            });
            reposted = true;
            console.log('🔄 Post reposted:', { postId, userId });
        }

        // Get updated repost count
        totalReposts = await prisma.postRepost.count({ where: { postId } });

        res.json({ 
            message: reposted ? 'Post reposted successfully' : 'Post unreposted successfully', 
            reposted,
            totalReposts
        });
    } catch (error) {
        console.error('❌ Error toggling repost:', error);
        res.status(500).json({ 
            message: 'Error toggling repost', 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Add Comment (supports nested comments/replies)
exports.addComment = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized. Please log in to comment.' });
        }

        const { id: postId } = req.params;
        const { text, parentId } = req.body;

        // Validate and sanitize text
        const trimmedText = text?.trim();
        if (!trimmedText) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        if (trimmedText.length > 500) {
            return res.status(400).json({ message: 'Comment must not exceed 500 characters' });
        }

        // Check if post exists
        const post = await prisma.post.findUnique({ 
            where: { id: postId },
            select: { id: true, userId: true }
        });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // If this is a reply, verify parent comment exists and belongs to this post
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({ 
                where: { id: parentId },
                select: { id: true, postId: true }
            });
            
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
            
            // Ensure parent comment belongs to the same post
            if (parentComment.postId !== postId) {
                return res.status(400).json({ message: 'Parent comment does not belong to this post' });
            }
        }

        // Get user info
        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            select: { id: true, name: true, profileImage: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create comment with updatedAt timestamp
        const comment = await prisma.comment.create({
            data: {
                postId,
                userId,
                userName: user.name,
                text: trimmedText,
                parentId: parentId || null,
                updatedAt: new Date()
            },
            include: {
                User: {
                    select: { id: true, name: true, profileImage: true }
                },
                likes: {
                    select: { userId: true }
                },
                parent: parentId ? {
                    select: { id: true, userName: true, text: true }
                } : false,
                _count: {
                    select: { replies: true, likes: true }
                }
            }
        });

        console.log('✅ Comment added:', { commentId: comment.id, postId, userId, isReply: !!parentId });

        // Transform comment for response
        const transformedComment = {
            ...comment,
            likes: comment.likes.map(like => like.userId),
            likesCount: comment._count.likes,
            repliesCount: comment._count.replies
        };

        res.status(201).json({ message: 'Comment added successfully', comment: transformedComment });
    } catch (error) {
        console.error('❌ Error adding comment:', error);
        res.status(500).json({ 
            message: 'Error adding comment', 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// List Comments for a Post (with nested replies)
exports.listComments = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.session.user?.id;

        // Verify post exists
        const postExists = await prisma.post.findUnique({
            where: { id: postId },
            select: { id: true }
        });

        if (!postExists) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Get all top-level comments with nested replies
        const comments = await prisma.comment.findMany({
            where: { 
                postId,
                parentId: null // Only top-level comments
            },
            include: {
                User: {
                    select: { id: true, name: true, profileImage: true }
                },
                likes: {
                    select: { userId: true },
                    take: 100
                },
                replies: {
                    include: {
                        User: {
                            select: { id: true, name: true, profileImage: true }
                        },
                        likes: {
                            select: { userId: true },
                            take: 100
                        },
                        _count: {
                            select: { likes: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' },
                    take: 50 // Limit replies per comment
                },
                _count: {
                    select: { replies: true, likes: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit to first 100 top-level comments
        });

        console.log(`💬 Listed ${comments.length} comments for post ${postId}`);

        // Transform comments with user interaction states
        const transformedComments = comments.map(comment => {
            const commentIsLiked = userId && comment.likes.some(like => like.userId === userId);
            
            return {
                ...comment,
                likes: comment.likes.map(like => like.userId),
                likesCount: comment._count.likes,
                repliesCount: comment._count.replies,
                isLiked: commentIsLiked,
                replies: comment.replies.map(reply => {
                    const replyIsLiked = userId && reply.likes.some(like => like.userId === userId);
                    return {
                        ...reply,
                        likes: reply.likes.map(like => like.userId),
                        likesCount: reply._count.likes,
                        isLiked: replyIsLiked
                    };
                })
            };
        });

        res.json({ 
            success: true,
            comments: transformedComments,
            total: comments.length
        });
    } catch (error) {
        console.error('❌ Error listing comments:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching comments', 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Toggle Like on Comment
exports.toggleLikeComment = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized. Please log in to like comments.' });
        }

        const { commentId } = req.params;

        // Check if comment exists
        const comment = await prisma.comment.findUnique({ 
            where: { id: commentId },
            select: { id: true, postId: true }
        });
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if already liked
        const existingLike = await prisma.commentLike.findUnique({
            where: {
                commentId_userId: { commentId, userId }
            }
        });

        let liked = false;
        let totalLikes = 0;

        if (existingLike) {
            // Unlike
            await prisma.commentLike.delete({
                where: {
                    commentId_userId: { commentId, userId }
                }
            });
            liked = false;
            console.log('👎 Comment unliked:', { commentId, userId });
        } else {
            // Like
            await prisma.commentLike.create({
                data: { commentId, userId }
            });
            liked = true;
            console.log('👍 Comment liked:', { commentId, userId });
        }

        // Get updated like count
        totalLikes = await prisma.commentLike.count({ where: { commentId } });

        res.json({ 
            message: liked ? 'Comment liked successfully' : 'Comment unliked successfully', 
            liked,
            totalLikes
        });
    } catch (error) {
        console.error('❌ Error toggling comment like:', error);
        res.status(500).json({ 
            message: 'Error toggling comment like', 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Health Check
exports.health = (req, res) => {
    res.json({ status: 'ok', message: 'Posts API is running' });
};
