const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==========================================
// DEPARTMENT CHANNEL MANAGEMENT
// ==========================================

// Create Department Channel (Power Admin Only)
exports.createDepartment = async (req, res) => {
    try {
        const { name, code, description, faculty, levels } = req.body;
        const userId = req.session.userId;

        // Validate user is power admin
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'power') {
            return res.status(403).json({ message: 'Only power admins can create departments' });
        }

        // Validate input
        if (!name || !code) {
            return res.status(400).json({ message: 'Department name and code are required' });
        }

        // Check if department already exists
        const existing = await prisma.department.findFirst({
            where: {
                OR: [
                    { name: name },
                    { code: code.toUpperCase() }
                ]
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'Department with this name or code already exists' });
        }

        // Default levels if not provided
        const departmentLevels = levels && levels.length > 0 
            ? levels 
            : ['100', '200', '300', '400', '500'];

        // Validate levels
        const validLevels = ['100', '200', '300', '400', '500'];
        for (const level of departmentLevels) {
            if (!validLevels.includes(level)) {
                return res.status(400).json({ 
                    message: `Invalid level: ${level}. Valid levels are: 100, 200, 300, 400, 500` 
                });
            }
        }

        // Create department
        const department = await prisma.department.create({
            data: {
                name,
                code: code.toUpperCase(),
                description: description || '',
                faculty: faculty || '',
                levels: departmentLevels,
                createdById: userId
            },
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Department created:', department.name);
        }

        res.status(201).json({
            message: 'Department channel created successfully',
            department
        });
    } catch (error) {
        console.error('❌ Error creating department:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get All Departments
exports.getDepartments = async (req, res) => {
    try {
        const { isActive } = req.query;

        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        const departments = await prisma.department.findMany({
            where,
            include: {
                User: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json({
            departments,
            count: departments.length
        });
    } catch (error) {
        console.error('❌ Error fetching departments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Department by ID
exports.getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await prisma.department.findUnique({
            where: { id },
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.json({ department });
    } catch (error) {
        console.error('❌ Error fetching department:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Department (Power Admin Only)
exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, description, faculty, levels, isActive } = req.body;
        const userId = req.session.userId;

        // Validate user is power admin
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'power') {
            return res.status(403).json({ message: 'Only power admins can update departments' });
        }

        // Check if department exists
        const department = await prisma.department.findUnique({ where: { id } });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Build update data
        const updateData = {};
        if (name) updateData.name = name;
        if (code) updateData.code = code.toUpperCase();
        if (description !== undefined) updateData.description = description;
        if (faculty !== undefined) updateData.faculty = faculty;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        if (levels && levels.length > 0) {
            const validLevels = ['100', '200', '300', '400', '500'];
            for (const level of levels) {
                if (!validLevels.includes(level)) {
                    return res.status(400).json({ 
                        message: `Invalid level: ${level}. Valid levels are: 100, 200, 300, 400, 500` 
                    });
                }
            }
            updateData.levels = levels;
        }

        // Update department
        const updated = await prisma.department.update({
            where: { id },
            data: updateData,
            include: {
                User: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Department updated:', updated.name);
        }

        res.json({
            message: 'Department updated successfully',
            department: updated
        });
    } catch (error) {
        console.error('❌ Error updating department:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete Department (Power Admin Only)
exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        // Validate user is power admin
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'power') {
            return res.status(403).json({ message: 'Only power admins can delete departments' });
        }

        // Check if department exists
        const department = await prisma.department.findUnique({ where: { id } });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Delete department
        await prisma.department.delete({ where: { id } });

        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Department deleted:', department.name);
        }

        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting department:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Department Levels
exports.getDepartmentLevels = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await prisma.department.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                code: true,
                levels: true
            }
        });

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.json({
            department: department.name,
            code: department.code,
            levels: department.levels
        });
    } catch (error) {
        console.error('❌ Error fetching department levels:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Users by Department and Level (for admin)
exports.getDepartmentUsers = async (req, res) => {
    try {
        const { id } = req.params;
        const { level } = req.query;
        const userId = req.session.userId;

        // Check if user is admin or power admin
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !['power', 'admin', 'd-admin'].includes(user.role)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Get department
        const department = await prisma.department.findUnique({ where: { id } });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Build query
        const where = {
            department: department.name
        };

        if (level) {
            where.level = level;
        }

        // Get users
        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                level: true,
                department: true,
                profileImage: true,
                role: true
            },
            orderBy: [
                { level: 'asc' },
                { name: 'asc' }
            ]
        });

        res.json({
            department: department.name,
            level: level || 'All',
            users,
            count: users.length
        });
    } catch (error) {
        console.error('❌ Error fetching department users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
