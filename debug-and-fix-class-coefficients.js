const mongoose = require('mongoose');
const ClassCoefficient = require('./models/ClassCoefficient');

async function debugAndFixClassCoefficients() {
  try {
    console.log('=== DEBUGGING CLASS COEFFICIENTS ===');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://hiep445:admin123@qlgv.q8asegt.mongodb.net/quan_ly_giao_vien?retryWrites=true&w=majority');
    console.log('✓ Connected to database');

    // 1. Check all class coefficients
    console.log('\n=== ALL CLASS COEFFICIENTS ===');
    const allCoeffs = await ClassCoefficient.find({});
    console.log(`Total class coefficients: ${allCoeffs.length}`);
    
    allCoeffs.forEach((coeff, index) => {
      console.log(`${index + 1}. ID: ${coeff._id}`);
      console.log(`   Range: ${coeff.minStudents}-${coeff.maxStudents} students`);
      console.log(`   Coefficient: ${coeff.coefficient}`);
      console.log(`   Year: ${coeff.year || 'MISSING'}`);
      console.log(`   Active: ${coeff.isActive}`);
      console.log(`   Created: ${coeff.createdDate}`);
      console.log('');
    });

    // 2. Check coefficients without year
    const coeffsWithoutYear = await ClassCoefficient.find({ year: { $exists: false } });
    console.log(`\nCoefficients without year: ${coeffsWithoutYear.length}`);

    // 3. Update coefficients without year to 2024-2025
    if (coeffsWithoutYear.length > 0) {
      console.log('\n=== UPDATING COEFFICIENTS WITHOUT YEAR ===');
      await ClassCoefficient.updateMany(
        { year: { $exists: false } },
        { $set: { year: '2024-2025' } }
      );
      console.log(`✓ Updated ${coeffsWithoutYear.length} coefficients to year 2024-2025`);
    }

    // 4. Check for 2024-2025 again
    console.log('\n=== CHECKING 2024-2025 COEFFICIENTS ===');
    const coeffs2024 = await ClassCoefficient.find({ year: '2024-2025' });
    console.log(`Coefficients for 2024-2025: ${coeffs2024.length}`);
    
    coeffs2024.forEach((coeff, index) => {
      console.log(`  ${index + 1}. ${coeff.minStudents}-${coeff.maxStudents} students = ${coeff.coefficient}`);
    });

    // 5. If no 2024-2025 data, create sample data
    if (coeffs2024.length === 0) {
      console.log('\n=== CREATING SAMPLE 2024-2025 DATA ===');
      const sampleData = [
        { minStudents: 1, maxStudents: 15, coefficient: 0.3, description: 'Lớp nhỏ' },
        { minStudents: 16, maxStudents: 30, coefficient: 0.2, description: 'Lớp trung bình' },
        { minStudents: 31, maxStudents: 45, coefficient: 0.1, description: 'Lớp lớn' },
        { minStudents: 46, maxStudents: 100, coefficient: 0.0, description: 'Lớp rất lớn' }
      ];

      for (const data of sampleData) {
        try {
          const coeff = new ClassCoefficient({
            ...data,
            year: '2024-2025',
            isActive: true,
            createdDate: new Date(),
            updatedDate: new Date()
          });
          await coeff.save();
          console.log(`✓ Created: ${data.minStudents}-${data.maxStudents} students = ${data.coefficient}`);
        } catch (error) {
          console.log(`✗ Error creating ${data.minStudents}-${data.maxStudents}:`, error.message);
        }
      }
    }

    // 6. Final verification
    console.log('\n=== FINAL VERIFICATION ===');
    const finalCoeffs = await ClassCoefficient.find({ year: '2024-2025' });
    console.log(`Final count for 2024-2025: ${finalCoeffs.length}`);
    
    if (finalCoeffs.length > 0) {
      console.log('✓ Ready to copy to other years!');
    } else {
      console.log('✗ Still no data for 2024-2025');
    }

  } catch (error) {
    console.error('✗ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Database connection closed');
  }
}

// Run debug
debugAndFixClassCoefficients(); 