const mongoose = require('mongoose');
const TeacherCoefficient = require('./models/TeacherCoefficient');
const ClassCoefficient = require('./models/ClassCoefficient');
const Degree = require('./models/Degree');

async function createSampleCoefficients() {
  try {
    console.log('=== CREATING SAMPLE COEFFICIENTS FOR 2024-2025 ===');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://hiep445:admin123@qlgv.q8asegt.mongodb.net/quan_ly_giao_vien?retryWrites=true&w=majority');
    console.log('✓ Connected to database');

    const YEAR = '2024-2025';

    // 1. Get all degrees
    console.log('\n=== GETTING DEGREES ===');
    const degrees = await Degree.find();
    console.log(`Found ${degrees.length} degrees:`);
    degrees.forEach((degree, index) => {
      console.log(`  ${index + 1}. ${degree.fullName} (${degree.shortName})`);
    });

    // 2. Create Teacher Coefficients for each degree
    console.log('\n=== CREATING TEACHER COEFFICIENTS ===');
    const teacherCoefficientsData = [
      { coefficient: 1.0, description: 'Hệ số chuẩn cho trình độ cơ bản' },
      { coefficient: 1.2, description: 'Hệ số cho trình độ cao đẳng/đại học' },
      { coefficient: 1.5, description: 'Hệ số cho trình độ thạc sĩ' },
      { coefficient: 1.8, description: 'Hệ số cho trình độ tiến sĩ' }
    ];

    for (let i = 0; i < degrees.length && i < teacherCoefficientsData.length; i++) {
      const degree = degrees[i];
      const coeffData = teacherCoefficientsData[i];
      
      try {
        const teacherCoeff = new TeacherCoefficient({
          degreeId: degree._id,
          coefficient: coeffData.coefficient,
          year: YEAR,
          description: coeffData.description,
          isActive: true
        });
        
        await teacherCoeff.save();
        console.log(`✓ Created teacher coefficient for ${degree.fullName}: ${coeffData.coefficient}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`ℹ Teacher coefficient for ${degree.fullName} already exists`);
        } else {
          console.log(`✗ Error creating teacher coefficient for ${degree.fullName}:`, error.message);
        }
      }
    }

    // 3. Create Class Coefficients
    console.log('\n=== CREATING CLASS COEFFICIENTS ===');
    const classCoefficientsData = [
      { minStudents: 1, maxStudents: 15, coefficient: 0.3, description: 'Lớp nhỏ (1-15 sinh viên)' },
      { minStudents: 16, maxStudents: 30, coefficient: 0.2, description: 'Lớp trung bình (16-30 sinh viên)' },
      { minStudents: 31, maxStudents: 45, coefficient: 0.1, description: 'Lớp lớn (31-45 sinh viên)' },
      { minStudents: 46, maxStudents: 100, coefficient: 0.0, description: 'Lớp rất lớn (46+ sinh viên)' }
    ];

    for (const coeffData of classCoefficientsData) {
      try {
        const classCoeff = new ClassCoefficient({
          minStudents: coeffData.minStudents,
          maxStudents: coeffData.maxStudents,
          coefficient: coeffData.coefficient,
          year: YEAR,
          description: coeffData.description,
          isActive: true
        });
        
        await classCoeff.save();
        console.log(`✓ Created class coefficient: ${coeffData.minStudents}-${coeffData.maxStudents} students = ${coeffData.coefficient}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`ℹ Class coefficient for ${coeffData.minStudents}-${coeffData.maxStudents} students already exists`);
        } else {
          console.log(`✗ Error creating class coefficient:`, error.message);
        }
      }
    }

    // 4. Verification
    console.log('\n=== VERIFICATION ===');
    const teacherCoeffs = await TeacherCoefficient.find({ year: YEAR }).populate('degreeId');
    const classCoeffs = await ClassCoefficient.find({ year: YEAR });

    console.log(`Teacher Coefficients for ${YEAR}: ${teacherCoeffs.length}`);
    teacherCoeffs.forEach((coeff, index) => {
      console.log(`  ${index + 1}. ${coeff.degreeId?.fullName || 'Unknown'} - Coefficient: ${coeff.coefficient}`);
    });

    console.log(`\nClass Coefficients for ${YEAR}: ${classCoeffs.length}`);
    classCoeffs.forEach((coeff, index) => {
      console.log(`  ${index + 1}. ${coeff.minStudents}-${coeff.maxStudents} students - Coefficient: ${coeff.coefficient}`);
    });

    console.log('\n🎉 SAMPLE DATA CREATION COMPLETE!');
    console.log(`Coefficients for academic year ${YEAR} are ready.`);
    console.log('You can now test the salary calculation with year-specific coefficients.');

  } catch (error) {
    console.error('✗ Error creating sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Database connection closed');
  }
}

// Run creation
createSampleCoefficients(); 