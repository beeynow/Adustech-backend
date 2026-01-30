const { prisma } = require('../config/db');

// List user's channels
exports.listChannels = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const channels = await prisma.channel.findMany({
            where: {
                OR: [
                    { createdById: userId },
                    { members: { some: { userId } } }
                ]
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, profileImage: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ channels });
    } catch (error) {
        console.error('List channels error:', error);
        res.status(500).json({ message: 'Error fetching channels', error: error.message });
    }
};

// Create channel
exports.createChannel = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { name, description, visibility = 'public' } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Channel name is required' });
        }

        const channel = await prisma.channel.create({
            data: {
                name,
                description: description || '',
                visibility,
                createdById: userId,
                members: {
                    create: { userId } // Creator auto-joins
                }
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });

        res.status(201).json({ message: 'Channel created successfully', channel });
    } catch (error) {
        console.error('Create channel error:', error);
        res.status(500).json({ message: 'Error creating channel', error: error.message });
    }
};

// Get single channel
exports.getChannel = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { id } = req.params;

        const channel = await prisma.channel.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, profileImage: true }
                        }
                    }
                }
            }
        });

        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        // Check if user is a member
        const isMember = channel.members.some(member => member.userId === userId);
        if (!isMember && channel.visibility === 'private') {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({ channel });
    } catch (error) {
        console.error('Get channel error:', error);
        res.status(500).json({ message: 'Error fetching channel', error: error.message });
    }
};
