/**
 * ============================================================================
 * SEED ACADEMIC STRUCTURE
 * Creates faculties, departments, and levels (100-500)
 * ============================================================================
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAcademicStructure() {
    try {
        console.log('🌱 Starting academic structure seeding...\n');

        // 1. Create Faculties
        console.log('📚 Creating Faculties...');
        
        const faculties = [
            { name: 'Faculty of Science', code: 'SCI', description: 'Natural and Applied Sciences' },
            { name: 'Faculty of Engineering', code: 'ENG', description: 'Engineering and Technology' },
            { name: 'Faculty of Arts', code: 'ARTS', description: 'Humanities and Arts' },
            { name: 'Faculty of Social Sciences', code: 'SOCSCI', description: 'Social Sciences' },
            { name: 'Faculty of Management Sciences', code: 'MGMT', description: 'Business and Management' }
        ];

        const createdFaculties = {};
        for (const faculty of faculties) {
            const existing = await prisma.faculty.findUnique({
                where: { code: faculty.code }
            });

            if (existing) {
                console.log(`  ✓ ${faculty.name} already exists`);
                createdFaculties[faculty.code] = existing;
            } else {
                const created = await prisma.faculty.create({ data: faculty });
                console.log(`  ✅ Created: ${faculty.name}`);
                createdFaculties[faculty.code] = created;
            }
        }

        // 2. Create Departments
        console.log('\n🏢 Creating Departments...');
        
        const departments = [
            // Science
            { name: 'Computer Science', code: 'CS', facultyCode: 'SCI', description: 'Computer Science and Information Technology' },
            { name: 'Mathematics', code: 'MATH', facultyCode: 'SCI', description: 'Pure and Applied Mathematics' },
            { name: 'Physics', code: 'PHY', facultyCode: 'SCI', description: 'Physics and Astronomy' },
            { name: 'Chemistry', code: 'CHEM', facultyCode: 'SCI', description: 'Chemistry and Biochemistry' },
            { name: 'Biology', code: 'BIO', facultyCode: 'SCI', description: 'Biological Sciences' },
            
            // Engineering
            { name: 'Electrical Engineering', code: 'EE', facultyCode: 'ENG', description: 'Electrical and Electronics Engineering' },
            { name: 'Mechanical Engineering', code: 'ME', facultyCode: 'ENG', description: 'Mechanical Engineering' },
            { name: 'Civil Engineering', code: 'CE', facultyCode: 'ENG', description: 'Civil and Environmental Engineering' },
            { name: 'Chemical Engineering', code: 'CHE', facultyCode: 'ENG', description: 'Chemical Engineering' },
            
            // Arts
            { name: 'English', code: 'ENG-LANG', facultyCode: 'ARTS', description: 'English Language and Literature' },
            { name: 'History', code: 'HIST', facultyCode: 'ARTS', description: 'History and Archaeology' },
            { name: 'Philosophy', code: 'PHIL', facultyCode: 'ARTS', description: 'Philosophy and Ethics' },
            
            // Social Sciences
            { name: 'Economics', code: 'ECON', facultyCode: 'SOCSCI', description: 'Economics and Development Studies' },
            { name: 'Political Science', code: 'POLI', facultyCode: 'SOCSCI', description: 'Political Science and Public Administration' },
            { name: 'Sociology', code: 'SOC', facultyCode: 'SOCSCI', description: 'Sociology and Anthropology' },
            
            // Management
            { name: 'Business Administration', code: 'BUS', facultyCode: 'MGMT', description: 'Business Administration and Management' },
            { name: 'Accounting', code: 'ACCT', facultyCode: 'MGMT', description: 'Accounting and Finance' }
        ];

        // Get or create a system user for department creation
        let systemUser = await prisma.user.findFirst({
            where: { role: 'power_admin' }
        });

        if (!systemUser) {
            console.log('  Creating system user for seeding...');
            const bcrypt = require('bcrypt');
            systemUser = await prisma.user.create({
                data: {
                    name: 'System Admin',
                    email: 'system@adustech.edu',
                    password: await bcrypt.hash('SystemAdmin123!', 10),
                    role: 'power_admin',
                    isVerified: true
                }
            });
        }

        const createdDepartments = {};
        for (const dept of departments) {
            const faculty = createdFaculties[dept.facultyCode];
            
            const existing = await prisma.department.findFirst({
                where: {
                    code: dept.code,
                    facultyId: faculty.id
                }
            });

            if (existing) {
                console.log(`  ✓ ${dept.name} (${dept.code}) already exists`);
                createdDepartments[dept.code] = existing;
            } else {
                const created = await prisma.department.create({
                    data: {
                        name: dept.name,
                        code: dept.code,
                        description: dept.description,
                        facultyId: faculty.id,
                        createdById: systemUser.id
                    }
                });
                console.log(`  ✅ Created: ${dept.name} (${dept.code})`);
                createdDepartments[dept.code] = created;
            }
        }

        // 3. Create Levels (100, 200, 300, 400, 500 for each department)
        console.log('\n📊 Creating Levels (100-500 for each department)...');
        
        const levelNumbers = [100, 200, 300, 400, 500];
        let levelCount = 0;

        for (const [deptCode, department] of Object.entries(createdDepartments)) {
            console.log(`  Department: ${department.name}`);
            
            for (const levelNum of levelNumbers) {
                const existing = await prisma.level.findUnique({
                    where: {
                        departmentId_levelNumber: {
                            departmentId: department.id,
                            levelNumber: levelNum
                        }
                    }
                });

                if (existing) {
                    console.log(`    ✓ ${levelNum} Level already exists`);
                } else {
                    await prisma.level.create({
                        data: {
                            departmentId: department.id,
                            levelNumber: levelNum,
                            displayName: `${levelNum} Level`
                        }
                    });
                    console.log(`    ✅ Created: ${levelNum} Level`);
                    levelCount++;
                }
            }
        }

        // 4. Summary
        console.log('\n📊 SEEDING SUMMARY');
        console.log('==================');
        
        const facultyCount = await prisma.faculty.count();
        const departmentCount = await prisma.department.count();
        const totalLevels = await prisma.level.count();
        
        console.log(`✅ Faculties: ${facultyCount}`);
        console.log(`✅ Departments: ${departmentCount}`);
        console.log(`✅ Levels: ${totalLevels}`);
        console.log(`   (${levelCount} newly created)`);
        
        console.log('\n🎉 Academic structure seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding academic structure:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedAcademicStructure()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = seedAcademicStructure;
