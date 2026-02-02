const { prisma } = require('../config/db');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                profileImage: true,
                level: true,
                department: true,
                faculty: true,
                phone: true,
                dateOfBirth: true,
                gender: true,
                address: true,
                country: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const {
            name,
            bio,
            level,
            department,
            faculty,
            phone,
            dateOfBirth,
            gender,
            address,
            country
        } = req.body;

        // Validate level if provided
        if (level !== undefined && level !== '') {
            const validLevels = ['100', '200', '300', '400', '500'];
            if (!validLevels.includes(level)) {
                return res.status(400).json({ 
                    message: `Invalid level. Valid levels are: ${validLevels.join(', ')}` 
                });
            }
        }

        // Validate department if provided
        if (department !== undefined && department !== '') {
            const departmentExists = await prisma.department.findFirst({
                where: { 
                    name: department,
                    isActive: true
                }
            });

            if (!departmentExists) {
                return res.status(400).json({ 
                    message: 'Invalid department. Please select an existing active department.' 
                });
            }
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (level !== undefined) updateData.level = level;
        if (department !== undefined) updateData.department = department;
        if (faculty !== undefined) updateData.faculty = faculty;
        if (phone !== undefined) updateData.phone = phone;
        if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
        if (gender !== undefined) updateData.gender = gender;
        if (address !== undefined) updateData.address = address;
        if (country !== undefined) updateData.country = country;

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                profileImage: true,
                level: true,
                department: true,
                faculty: true,
                phone: true,
                dateOfBirth: true,
                gender: true,
                address: true,
                country: true,
                role: true,
                updatedAt: true
            }
        });

        // Update session with new name if changed
        if (name) {
            req.session.user.name = name;
        }

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ message: 'Image data is required' });
        }

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(imageBase64, 'profile-images');
        
        // Update user profile with new image URL
        const user = await prisma.user.update({
            where: { id: userId },
            data: { profileImage: uploadResult.secure_url },
            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true
            }
        });

        res.json({ 
            message: 'Profile image uploaded successfully', 
            profileImage: user.profileImage,
            user 
        });
    } catch (error) {
        console.error('Upload profile image error:', error);
        res.status(500).json({ message: 'Error uploading profile image', error: error.message });
    }
};
