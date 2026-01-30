const { prisma } = require('../config/db');
const { uploadToCloudinary } = require('../utils/cloudinary');

// List active events (not expired)
exports.listEvents = async (req, res) => {
    try {
        const now = new Date();
        
        const events = await prisma.event.findMany({
            where: {
                expiresAt: { gte: now } // Only show non-expired events
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { startsAt: 'asc' }
        });

        res.json({ events });
    } catch (error) {
        console.error('List events error:', error);
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
};

// Create event (admin only)
exports.createEvent = async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || !['power', 'admin', 'd-admin'].includes(user.role)) {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }

        const { title, details, location, startsAt, imageBase64 } = req.body;

        if (!title || !startsAt) {
            return res.status(400).json({ message: 'Title and start time are required' });
        }

        let imageUrl = '';
        if (imageBase64 && imageBase64.startsWith('data:image')) {
            const uploadResult = await uploadToCloudinary(imageBase64, 'events');
            imageUrl = uploadResult.secure_url;
        }

        const startDate = new Date(startsAt);
        const expiresAt = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 minutes after start

        const event = await prisma.event.create({
            data: {
                title,
                details: details || '',
                location: location || '',
                startsAt: startDate,
                expiresAt,
                imageUrl,
                imageBase64: imageBase64 || '',
                createdById: user.id,
                createdByName: user.name
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
};

// Get single event
exports.getEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if expired
        if (event.expiresAt < new Date()) {
            return res.status(404).json({ message: 'Event has expired' });
        }

        res.json({ event });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ message: 'Error fetching event', error: error.message });
    }
};

// Clean up expired events (can be run periodically)
exports.cleanupExpiredEvents = async () => {
    try {
        const now = new Date();
        const result = await prisma.event.deleteMany({
            where: {
                expiresAt: { lt: now }
            }
        });
        console.log(`🧹 Cleaned up ${result.count} expired events`);
        return result;
    } catch (error) {
        console.error('Cleanup expired events error:', error);
    }
};
