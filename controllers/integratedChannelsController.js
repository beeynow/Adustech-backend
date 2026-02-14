/**
 * ============================================================================
 * INTEGRATED CHANNELS CONTROLLER
 * Bulletproof channel system with automatic profile integration
 * Supports levels 100-500 based on department
 * ============================================================================
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * AUTO-JOIN CHANNELS BASED ON USER PROFILE
 * Automatically subscribes users to channels matching their academic profile
 */
exports.autoJoinChannels = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        
        console.log('🔄 Auto-joining channels for user:', userId);
        
        // Get user with full academic profile
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                facultyRel: true,
                departmentRel: true,
                levelRel: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const channelsToJoin = [];

        // 1. Join global channels
        const globalChannels = await prisma.channel.findMany({
            where: {
                scope: 'global',
                visibility: 'public'
            }
        });
        channelsToJoin.push(...globalChannels);

        // 2. Join faculty channels (if user has faculty)
        if (user.facultyId) {
            const facultyChannels = await prisma.channel.findMany({
                where: {
                    scope: 'faculty',
                    facultyId: user.facultyId,
                    visibility: 'public'
                }
            });
            channelsToJoin.push(...facultyChannels);
        }

        // 3. Join department channels (if user has department)
        if (user.departmentId) {
            const departmentChannels = await prisma.channel.findMany({
                where: {
                    scope: 'department',
                    departmentId: user.departmentId,
                    visibility: 'public'
                }
            });
            channelsToJoin.push(...departmentChannels);
        }

        // 4. Join level channels (if user has level)
        if (user.levelId) {
            const levelChannels = await prisma.channel.findMany({
                where: {
                    scope: 'level',
                    levelId: user.levelId,
                    visibility: 'public'
                }
            });
            channelsToJoin.push(...levelChannels);
        }

        // Auto-join all eligible channels
        const joinResults = [];
        for (const channel of channelsToJoin) {
            try {
                // Check if already a member
                const existingMembership = await prisma.channelMember.findUnique({
                    where: {
                        channelId_userId: {
                            channelId: channel.id,
                            userId: userId
                        }
                    }
                });

                if (!existingMembership) {
                    await prisma.channelMember.create({
                        data: {
                            channelId: channel.id,
                            userId: userId,
                            role: 'member'
                        }
                    });
                    joinResults.push(channel.id);
                }
            } catch (error) {
                console.error(`Error joining channel ${channel.id}:`, error);
            }
        }

        console.log(`✅ Auto-joined ${joinResults.length} channels`);

        return res.status(200).json({
            success: true,
            message: `Joined ${joinResults.length} channels`,
            joinedCount: joinResults.length,
            channelIds: joinResults
        });

    } catch (error) {
        console.error('❌ Error auto-joining channels:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to auto-join channels',
            error: error.message
        });
    }
};

/**
 * GET ALL CHANNELS (with user's membership status)
 */
exports.getAllChannels = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        
        console.log('📋 Fetching all channels for user:', userId);
        
        const channels = await prisma.channel.findMany({
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                },
                level: {
                    include: {
                        department: {
                            include: {
                                faculty: true
                            }
                        }
                    }
                },
                members: {
                    where: { userId },
                    select: { id: true, role: true }
                },
                _count: {
                    select: {
                        members: true,
                        messages: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Format channels with membership info
        const formattedChannels = channels.map(channel => ({
            id: channel.id,
            name: channel.name,
            description: channel.description,
            visibility: channel.visibility,
            scope: channel.scope,
            creator: channel.createdBy,
            level: channel.level,
            memberCount: channel._count.members,
            messageCount: channel._count.messages,
            isMember: channel.members.length > 0,
            memberRole: channel.members[0]?.role || null,
            createdAt: channel.createdAt,
            updatedAt: channel.updatedAt
        }));

        return res.status(200).json({
            success: true,
            channels: formattedChannels,
            total: formattedChannels.length
        });

    } catch (error) {
        console.error('❌ Error fetching channels:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch channels',
            error: error.message
        });
    }
};

/**
 * GET USER'S CHANNELS (channels user is a member of)
 */
exports.getUserChannels = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        
        console.log('📋 Fetching user channels:', userId);
        
        const memberships = await prisma.channelMember.findMany({
            where: {
                userId,
                isActive: true
            },
            include: {
                channel: {
                    include: {
                        level: {
                            include: {
                                department: {
                                    include: {
                                        faculty: true
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                members: true,
                                messages: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                joinedAt: 'desc'
            }
        });

        const channels = memberships.map(m => ({
            id: m.channel.id,
            name: m.channel.name,
            description: m.channel.description,
            visibility: m.channel.visibility,
            scope: m.channel.scope,
            level: m.channel.level,
            memberCount: m.channel._count.members,
            messageCount: m.channel._count.messages,
            userRole: m.role,
            joinedAt: m.joinedAt
        }));

        return res.status(200).json({
            success: true,
            channels,
            total: channels.length
        });

    } catch (error) {
        console.error('❌ Error fetching user channels:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user channels',
            error: error.message
        });
    }
};

/**
 * CREATE CHANNEL
 * Automatically associates channel with user's academic profile
 */
exports.createChannel = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const userRole = req.session.user?.role;
        const { name, description, visibility, scope } = req.body;

        console.log('📝 Creating channel:', { name, scope, visibility });

        // Validation
        if (!name || name.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Channel name must be at least 3 characters'
            });
        }

        // Get user with academic profile
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                facultyRel: true,
                departmentRel: true,
                levelRel: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Determine scope and associations based on user profile
        const channelData = {
            name: name.trim(),
            description: description || '',
            visibility: visibility || 'public',
            scope: scope || 'global',
            createdById: userId
        };

        // Auto-associate with user's academic structure
        if (scope === 'level' && user.levelId) {
            channelData.levelId = user.levelId;
            channelData.departmentId = user.departmentId;
            channelData.facultyId = user.facultyId;
        } else if (scope === 'department' && user.departmentId) {
            channelData.departmentId = user.departmentId;
            channelData.facultyId = user.facultyId;
        } else if (scope === 'faculty' && user.facultyId) {
            channelData.facultyId = user.facultyId;
        }

        // Create channel
        const channel = await prisma.channel.create({
            data: channelData,
            include: {
                level: {
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

        // Auto-join creator as admin
        await prisma.channelMember.create({
            data: {
                channelId: channel.id,
                userId: userId,
                role: 'admin'
            }
        });

        console.log('✅ Channel created:', channel.id);

        return res.status(201).json({
            success: true,
            message: 'Channel created successfully',
            channel: {
                id: channel.id,
                name: channel.name,
                description: channel.description,
                visibility: channel.visibility,
                scope: channel.scope,
                level: channel.level,
                createdAt: channel.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Error creating channel:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create channel',
            error: error.message
        });
    }
};

/**
 * JOIN CHANNEL
 */
exports.joinChannel = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const { channelId } = req.params;

        console.log('➕ User joining channel:', { userId, channelId });

        // Check if channel exists
        const channel = await prisma.channel.findUnique({
            where: { id: channelId },
            include: {
                level: true
            }
        });

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check if already a member
        const existingMembership = await prisma.channelMember.findUnique({
            where: {
                channelId_userId: {
                    channelId,
                    userId
                }
            }
        });

        if (existingMembership) {
            return res.status(400).json({
                success: false,
                message: 'Already a member of this channel'
            });
        }

        // Validate access based on scope
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (channel.scope === 'level' && channel.levelId !== user.levelId) {
            return res.status(403).json({
                success: false,
                message: 'You can only join channels for your level'
            });
        }

        if (channel.scope === 'department' && channel.departmentId !== user.departmentId) {
            return res.status(403).json({
                success: false,
                message: 'You can only join channels for your department'
            });
        }

        if (channel.scope === 'faculty' && channel.facultyId !== user.facultyId) {
            return res.status(403).json({
                success: false,
                message: 'You can only join channels for your faculty'
            });
        }

        // Join channel
        const membership = await prisma.channelMember.create({
            data: {
                channelId,
                userId,
                role: 'member'
            }
        });

        console.log('✅ User joined channel');

        return res.status(200).json({
            success: true,
            message: 'Joined channel successfully',
            membership: {
                id: membership.id,
                role: membership.role,
                joinedAt: membership.joinedAt
            }
        });

    } catch (error) {
        console.error('❌ Error joining channel:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to join channel',
            error: error.message
        });
    }
};

/**
 * LEAVE CHANNEL
 */
exports.leaveChannel = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const { channelId } = req.params;

        console.log('➖ User leaving channel:', { userId, channelId });

        const membership = await prisma.channelMember.findUnique({
            where: {
                channelId_userId: {
                    channelId,
                    userId
                }
            }
        });

        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Not a member of this channel'
            });
        }

        await prisma.channelMember.delete({
            where: { id: membership.id }
        });

        console.log('✅ User left channel');

        return res.status(200).json({
            success: true,
            message: 'Left channel successfully'
        });

    } catch (error) {
        console.error('❌ Error leaving channel:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to leave channel',
            error: error.message
        });
    }
};

/**
 * SEND MESSAGE TO CHANNEL
 */
exports.sendMessage = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const { channelId } = req.params;
        const { content } = req.body;

        console.log('💬 Sending message to channel:', channelId);

        // Validate content
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }

        // Check membership
        const membership = await prisma.channelMember.findUnique({
            where: {
                channelId_userId: {
                    channelId,
                    userId
                }
            }
        });

        if (!membership || !membership.isActive) {
            return res.status(403).json({
                success: false,
                message: 'You must be a member to send messages'
            });
        }

        // Create message
        const message = await prisma.channelMessage.create({
            data: {
                channelId,
                userId,
                content: content.trim()
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                        role: true
                    }
                }
            }
        });

        console.log('✅ Message sent');

        return res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: {
                id: message.id,
                content: message.content,
                user: message.user,
                createdAt: message.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Error sending message:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};

/**
 * GET CHANNEL MESSAGES
 */
exports.getChannelMessages = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const { channelId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        console.log('📨 Fetching channel messages:', channelId);

        // Check membership
        const membership = await prisma.channelMember.findUnique({
            where: {
                channelId_userId: {
                    channelId,
                    userId
                }
            }
        });

        if (!membership) {
            return res.status(403).json({
                success: false,
                message: 'You must be a member to view messages'
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [messages, total] = await Promise.all([
            prisma.channelMessage.findMany({
                where: { channelId },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profileImage: true,
                            role: true,
                            department: true,
                            level: true
                        }
                    }
                }
            }),
            prisma.channelMessage.count({ where: { channelId } })
        ]);

        return res.status(200).json({
            success: true,
            messages: messages.reverse(), // Show oldest first
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalMessages: total,
                hasMore: skip + messages.length < total
            }
        });

    } catch (error) {
        console.error('❌ Error fetching messages:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};

/**
 * GET RECOMMENDED CHANNELS
 * Based on user's academic profile
 */
exports.getRecommendedChannels = async (req, res) => {
    try {
        const userId = req.session.user?.id;

        console.log('🎯 Getting recommended channels for user:', userId);

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find channels user is not a member of but should be
        const recommended = [];

        // Get current memberships
        const currentMemberships = await prisma.channelMember.findMany({
            where: { userId },
            select: { channelId: true }
        });

        const joinedChannelIds = currentMemberships.map(m => m.channelId);

        // Recommend level channels
        if (user.levelId) {
            const levelChannels = await prisma.channel.findMany({
                where: {
                    levelId: user.levelId,
                    id: { notIn: joinedChannelIds },
                    visibility: 'public'
                },
                include: {
                    level: {
                        include: {
                            department: true
                        }
                    },
                    _count: {
                        select: { members: true }
                    }
                }
            });
            recommended.push(...levelChannels);
        }

        // Recommend department channels
        if (user.departmentId) {
            const deptChannels = await prisma.channel.findMany({
                where: {
                    departmentId: user.departmentId,
                    levelId: null,
                    id: { notIn: joinedChannelIds },
                    visibility: 'public'
                },
                include: {
                    _count: {
                        select: { members: true }
                    }
                }
            });
            recommended.push(...deptChannels);
        }

        // Recommend faculty channels
        if (user.facultyId) {
            const facultyChannels = await prisma.channel.findMany({
                where: {
                    facultyId: user.facultyId,
                    departmentId: null,
                    id: { notIn: joinedChannelIds },
                    visibility: 'public'
                },
                include: {
                    _count: {
                        select: { members: true }
                    }
                }
            });
            recommended.push(...facultyChannels);
        }

        return res.status(200).json({
            success: true,
            recommended,
            total: recommended.length
        });

    } catch (error) {
        console.error('❌ Error getting recommended channels:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get recommended channels',
            error: error.message
        });
    }
};
