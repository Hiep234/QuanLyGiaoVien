const mongoose = require('mongoose');
const SalaryRate = require('./models/SalaryRate');
const TeacherCoefficient = require('./models/TeacherCoefficient');
const ClassCoefficient = require('./models/ClassCoefficient');

async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/quan_ly_giao_vien');
    
    const rates = await SalaryRate.find({});
    const teacherCoeffs = await TeacherCoefficient.find({});
    const classCoeffs = await ClassCoefficient.find({});
    
    console.log('=== DATABASE CHECK ===');
    console.log(`Salary Rates: ${rates.length}`);
    console.log(`Teacher Coefficients: ${teacherCoeffs.length}`);
    console.log(`Class Coefficients: ${classCoeffs.length}`);
    
    if (rates.length > 0) {
      console.log('Sample Salary Rate:', rates[0]);
    }
    
    if (teacherCoeffs.length > 0) {
      console.log('Sample Teacher Coefficient:', teacherCoeffs[0]);
    }
    
    if (classCoeffs.length > 0) {
      console.log('Sample Class Coefficient:', classCoeffs[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData(); 