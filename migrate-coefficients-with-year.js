const mongoose = require('mongoose');
const TeacherCoefficient = require('./models/TeacherCoefficient');
const ClassCoefficient = require('./models/ClassCoefficient');

async function migrateCoefficients() {
  try {
    console.log('=== MIGRATING COEFFICIENTS TO INCLUDE ACADEMIC YEAR ===');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://hiep445:admin123@qlgv.q8asegt.mongodb.net/quan_ly_giao_vien?retryWrites=true&w=majority');
    console.log('✓ Connected to database');

    const DEFAULT_YEAR = '2024-2025';

    // 1. Migrate Teacher Coefficients
    console.log('\n=== MIGRATING TEACHER COEFFICIENTS ===');
    const teacherCoeffs = await TeacherCoefficient.find({ year: { $exists: false } });
    console.log(`Found ${teacherCoeffs.length} teacher coefficients without year`);

    if (teacherCoeffs.length > 0) {
      await TeacherCoefficient.updateMany(
        { year: { $exists: false } },
        { $set: { year: DEFAULT_YEAR } }
      );
      console.log(`✓ Updated ${teacherCoeffs.length} teacher coefficients with year: ${DEFAULT_YEAR}`);
    }

    // 2. Migrate Class Coefficients
    console.log('\n=== MIGRATING CLASS COEFFICIENTS ===');
    const classCoeffs = await ClassCoefficient.find({ year: { $exists: false } });
    console.log(`Found ${classCoeffs.length} class coefficients without year`);

    if (classCoeffs.length > 0) {
      await ClassCoefficient.updateMany(
        { year: { $exists: false } },
        { $set: { year: DEFAULT_YEAR } }
      );
      console.log(`✓ Updated ${classCoeffs.length} class coefficients with year: ${DEFAULT_YEAR}`);
    }

    // 3. Create unique indexes
    console.log('\n=== CREATING UNIQUE INDEXES ===');
    
    try {
      await TeacherCoefficient.collection.createIndex({ degreeId: 1, year: 1 }, { unique: true });
      console.log('✓ Created unique index for TeacherCoefficient (degreeId + year)');
    } catch (error) {
      if (error.code === 11000) {
        console.log('ℹ Unique index for TeacherCoefficient already exists');
      } else {
        console.log('✗ Error creating TeacherCoefficient index:', error.message);
      }
    }

    try {
      await ClassCoefficient.collection.createIndex({ minStudents: 1, maxStudents: 1, year: 1 }, { unique: true });
      console.log('✓ Created unique index for ClassCoefficient (minStudents + maxStudents + year)');
    } catch (error) {
      if (error.code === 11000) {
        console.log('ℹ Unique index for ClassCoefficient already exists');
      } else {
        console.log('✗ Error creating ClassCoefficient index:', error.message);
      }
    }

    // 4. Verification
    console.log('\n=== VERIFICATION ===');
    const teacherCoeffsAfter = await TeacherCoefficient.find().populate('degreeId');
    const classCoeffsAfter = await ClassCoefficient.find();

    console.log(`Teacher Coefficients: ${teacherCoeffsAfter.length}`);
    teacherCoeffsAfter.forEach((coeff, index) => {
      console.log(`  ${index + 1}. ${coeff.degreeId?.fullName || 'Unknown'} - Year: ${coeff.year} - Coefficient: ${coeff.coefficient}`);
    });

    console.log(`\nClass Coefficients: ${classCoeffsAfter.length}`);
    classCoeffsAfter.forEach((coeff, index) => {
      console.log(`  ${index + 1}. ${coeff.minStudents}-${coeff.maxStudents} students - Year: ${coeff.year} - Coefficient: ${coeff.coefficient}`);
    });

    console.log('\n🎉 MIGRATION COMPLETE!');
    console.log('Now both Teacher and Class Coefficients are managed by academic year.');
    console.log('You can use the copy API to duplicate coefficients to other years.');

  } catch (error) {
    console.error('✗ Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Database connection closed');
  }
}

// Run migration
migrateCoefficients(); 