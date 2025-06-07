const mongoose = require('mongoose');
const SalaryRate = require('./models/SalaryRate');
const TeacherCoefficient = require('./models/TeacherCoefficient');
const ClassCoefficient = require('./models/ClassCoefficient');

async function initSalarySystem() {
  try {
    await mongoose.connect('mongodb://localhost:27017/quan_ly_giao_vien');
    
    console.log('=== INITIALIZING SALARY SYSTEM ===');
    
    // 1. Create Salary Rate
    const existingSalaryRate = await SalaryRate.findOne({ isActive: true });
    if (!existingSalaryRate) {
      const salaryRate = new SalaryRate({
        name: 'Định mức lương chuẩn 2024',
        ratePerPeriod: 100000, // 100,000 VND per period
        description: 'Mức lương cơ bản cho 1 tiết dạy',
        isActive: true,
        createdDate: new Date(),
        updatedDate: new Date()
      });
      await salaryRate.save();
      console.log('✓ Created default salary rate: 100,000 VND/period');
    } else {
      console.log('✓ Salary rate already exists');
    }
    
    // 2. Create Teacher Coefficients for each degree
    // First, get all degrees from the system
    const Degree = require('./models/Degree');
    const degrees = await Degree.find({});
    
    console.log(`Found ${degrees.length} degrees in system:`);
    for (const degree of degrees) {
      console.log(`- ${degree.fullName} (${degree.shortName})`);
      
      const existingCoeff = await TeacherCoefficient.findOne({ 
        degreeId: degree._id 
      });
      
      if (!existingCoeff) {
        let coefficient;
        // Set coefficient based on degree
        switch (degree.shortName.toLowerCase()) {
          case 'ts':
          case 'ths':
            coefficient = 1.5; // Tiến sĩ/Thạc sĩ
            break;
          case 'cn':
            coefficient = 1.2; // Cử nhân  
            break;
          case 'cd':
            coefficient = 1.0; // Cao đẳng
            break;
          default:
            coefficient = 1.0; // Mặc định
        }
        
        const teacherCoeff = new TeacherCoefficient({
          degreeId: degree._id,
          coefficient: coefficient,
          description: `Hệ số cho bằng ${degree.fullName}`,
          isActive: true,
          createdDate: new Date(),
          updatedDate: new Date()
        });
        await teacherCoeff.save();
        console.log(`  ✓ Created coefficient ${coefficient} for ${degree.fullName}`);
      } else {
        console.log(`  ✓ Coefficient for ${degree.fullName} already exists`);
      }
    }
    
    // 3. Create Class Coefficients based on student count
    const classCoeffData = [
      { minStudents: 1, maxStudents: 15, coefficient: 0.0, description: 'Lớp nhỏ (1-15 sinh viên)' },
      { minStudents: 16, maxStudents: 30, coefficient: 0.1, description: 'Lớp trung bình (16-30 sinh viên)' },
      { minStudents: 31, maxStudents: 45, coefficient: 0.2, description: 'Lớp lớn (31-45 sinh viên)' },
      { minStudents: 46, maxStudents: 100, coefficient: 0.3, description: 'Lớp rất lớn (46+ sinh viên)' }
    ];
    
    for (const coeffData of classCoeffData) {
      const existingClassCoeff = await ClassCoefficient.findOne({
        minStudents: coeffData.minStudents,
        maxStudents: coeffData.maxStudents
      });
      
      if (!existingClassCoeff) {
        const classCoeff = new ClassCoefficient({
          ...coeffData,
          isActive: true,
          createdDate: new Date(),
          updatedDate: new Date()
        });
        await classCoeff.save();
        console.log(`✓ Created class coefficient ${coeffData.coefficient} for ${coeffData.description}`);
      } else {
        console.log(`✓ Class coefficient for ${coeffData.description} already exists`);
      }
    }
    
    console.log('\n=== SALARY SYSTEM INITIALIZATION COMPLETE ===');
    console.log('You can now use the salary calculation feature!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing salary system:', error);
    process.exit(1);
  }
}

initSalarySystem(); 