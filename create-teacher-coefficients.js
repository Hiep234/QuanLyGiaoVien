const mongoose = require('mongoose');
const TeacherCoefficient = require('./models/TeacherCoefficient');

async function createTeacherCoefficients() {
  try {
    await mongoose.connect('mongodb://localhost:27017/quan_ly_giao_vien');
    
    console.log('=== CREATING TEACHER COEFFICIENTS ===');
    
    // Based on the teachers API data, we have these degrees:
    const degrees = [
      { 
        _id: "6822c93800fc9d191c78ab92", 
        fullName: "Cử nhân", 
        shortName: "CN" 
      },
      { 
        _id: "681ecc0556289d792f755372", 
        fullName: "Thạc sĩ", 
        shortName: "Ths" 
      }
    ];
    
    for (const degree of degrees) {
      const existingCoeff = await TeacherCoefficient.findOne({ 
        degreeId: degree._id 
      });
      
      if (!existingCoeff) {
        let coefficient;
        // Set coefficient based on degree
        switch (degree.shortName.toLowerCase()) {
          case 'ts':
          case 'ths':
            coefficient = 1.5; // Thạc sĩ/Tiến sĩ
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
          degreeId: new mongoose.Types.ObjectId(degree._id),
          coefficient: coefficient,
          description: `Hệ số cho bằng ${degree.fullName}`,
          isActive: true,
          createdDate: new Date(),
          updatedDate: new Date()
        });
        await teacherCoeff.save();
        console.log(`✓ Created coefficient ${coefficient} for ${degree.fullName} (${degree.shortName})`);
      } else {
        console.log(`✓ Coefficient for ${degree.fullName} already exists`);
      }
    }
    
    // Check final results
    const allCoeffs = await TeacherCoefficient.find({}).populate('degreeId');
    console.log('\n=== FINAL TEACHER COEFFICIENTS ===');
    allCoeffs.forEach(coeff => {
      console.log(`- Degree ID: ${coeff.degreeId}, Coefficient: ${coeff.coefficient}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating teacher coefficients:', error);
    process.exit(1);
  }
}

createTeacherCoefficients(); 