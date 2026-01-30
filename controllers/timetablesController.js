const { prisma } = require('../config/db');
const { uploadToCloudinary } = require('../utils/cloudinary');

// List active timetables (not expired)
exports.listTimetables = async (req, res) => {
    try {
        const now = new Date();
        
        const timetables = await prisma.timetable.findMany({
            where: {
                expiresAt: { gte: now } // Only show non-expired timetables
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { effectiveDate: 'desc' }
        });

        res.json({ timetables });
    } catch (error) {
        console.error('List timetables error:', error);
        res.status(500).json({ message: 'Error fetching timetables', error: error.message });
    }
};

// Create timetable (admin only)
exports.createTimetable = async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || !['power', 'admin', 'd-admin'].includes(user.role)) {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }

        const { title, details, effectiveDate, imageUrl, pdfUrl } = req.body;

        if (!title || !effectiveDate) {
            return res.status(400).json({ message: 'Title and effective date are required' });
        }

        const effDate = new Date(effectiveDate);
        // Expires at end of effective day (11:59:59 PM)
        const expiresAt = new Date(effDate);
        expiresAt.setHours(23, 59, 59, 999);

        const timetable = await prisma.timetable.create({
            data: {
                title,
                details: details || '',
                effectiveDate: effDate,
                expiresAt,
                imageUrl: imageUrl || '',
                pdfUrl: pdfUrl || '',
                createdById: user.id,
                createdByName: user.name
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        res.status(201).json({ message: 'Timetable created successfully', timetable });
    } catch (error) {
        console.error('Create timetable error:', error);
        res.status(500).json({ message: 'Error creating timetable', error: error.message });
    }
};

// Get single timetable
exports.getTimetable = async (req, res) => {
    try {
        const { id } = req.params;

        const timetable = await prisma.timetable.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }

        // Check if expired
        if (timetable.expiresAt < new Date()) {
            return res.status(404).json({ message: 'Timetable has expired' });
        }

        res.json({ timetable });
    } catch (error) {
        console.error('Get timetable error:', error);
        res.status(500).json({ message: 'Error fetching timetable', error: error.message });
    }
};

// Clean up expired timetables (can be run periodically)
exports.cleanupExpiredTimetables = async () => {
    try {
        const now = new Date();
        const result = await prisma.timetable.deleteMany({
            where: {
                expiresAt: { lt: now }
            }
        });
        console.log(`🧹 Cleaned up ${result.count} expired timetables`);
        return result;
    } catch (error) {
        console.error('Cleanup expired timetables error:', error);
    }
};
