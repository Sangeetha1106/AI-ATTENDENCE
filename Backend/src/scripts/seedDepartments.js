require('dotenv').config();
const { sequelize } = require('../config/db');
const Department = require('../modules/department/department.model');

const seedDepartments = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const defaultDepartments = [
      { departmentName: 'Administration', departmentCode: 'ADM001', description: 'Administration Department' },
      { departmentName: 'Human Resources (HR)', departmentCode: 'HR001', description: 'HR Department' },
      { departmentName: 'Information Technology (IT)', departmentCode: 'IT001', description: 'IT Department' },
      { departmentName: 'Engineering', departmentCode: 'ENG001', description: 'Engineering Department' },
      { departmentName: 'Finance', departmentCode: 'FIN001', description: 'Finance Department' },
      { departmentName: 'Accounts', departmentCode: 'ACC001', description: 'Accounts Department' },
      { departmentName: 'Sales', departmentCode: 'SAL001', description: 'Sales Department' },
      { departmentName: 'Marketing', departmentCode: 'MKT001', description: 'Marketing Department' },
      { departmentName: 'Customer Support', departmentCode: 'CSP001', description: 'Customer Support Department' },
      { departmentName: 'Operations', departmentCode: 'OPS001', description: 'Operations Department' },
      { departmentName: 'Production', departmentCode: 'PRD001', description: 'Production Department' },
      { departmentName: 'Quality Assurance (QA)', departmentCode: 'QA001', description: 'QA Department' },
      { departmentName: 'Research and Development (R&D)', departmentCode: 'RND001', description: 'R&D Department' },
      { departmentName: 'Procurement', departmentCode: 'PRO001', description: 'Procurement Department' },
      { departmentName: 'Logistics', departmentCode: 'LOG001', description: 'Logistics Department' },
      { departmentName: 'Security', departmentCode: 'SEC001', description: 'Security Department' },
      { departmentName: 'Legal', departmentCode: 'LEG001', description: 'Legal Department' },
      { departmentName: 'Training', departmentCode: 'TRN001', description: 'Training Department' },
      { departmentName: 'Maintenance', departmentCode: 'MNT001', description: 'Maintenance Department' }
    ];

    for (const dept of defaultDepartments) {
      let existing = await Department.findOne({ 
        where: { 
          [sequelize.Sequelize.Op.or]: [
            { departmentName: dept.departmentName }, 
            { departmentCode: dept.departmentCode }
          ] 
        } 
      });

      if (existing) {
        existing.departmentName = dept.departmentName;
        existing.departmentCode = dept.departmentCode;
        existing.description = dept.description;
        await existing.save();
        console.log(`Updated department: ${dept.departmentName} (${dept.departmentCode})`);
      } else {
        await Department.create({
          departmentName: dept.departmentName,
          departmentCode: dept.departmentCode,
          description: dept.description,
          status: 'ACTIVE'
        });
        console.log(`Created department: ${dept.departmentName} (${dept.departmentCode})`);
      }
    }

    console.log('\n--- Department Seeding Complete ---');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding departments:', error);
    process.exit(1);
  }
};

seedDepartments();
