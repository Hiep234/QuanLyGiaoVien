const mongoose = require('mongoose');

// Import models
const Teacher = require('./models/Teacher');
const Faculty = require('./models/Faculty');
const Degree = require('./models/Degree');
const Semester = require('./models/Semester');
const Assignment = require('./models/Assignment');
const ClassSection = require('./models/ClassSection');
const Course = require('./models/Course');
const SalaryRate = require('./models/SalaryRate');
const TeacherCoefficient = require('./models/TeacherCoefficient');
const ClassCoefficient = require('./models/ClassCoefficient');

async function debugReport() {
  try {
    await mongoose.connect('mongodb+srv://hiep445:admin123@qlgv.q8asegt.mongodb.net/?retryWrites=true&w=majority&appName=QLGV');
    console.log('Connected to MongoDB');

    // 1. Kiểm tra teachers
    const teachers = await Teacher.find({}).populate('facultyId').populate('degreeId');
    console.log('\n=== TEACHERS ===');
    teachers.forEach(teacher => {
      console.log(`${teacher._id}: ${teacher.code} - ${teacher.name} (${teacher.degreeId?.fullName})`);
    });

    // 2. Kiểm tra semesters
    const semesters = await Semester.find({});
    console.log('\n=== SEMESTERS ===');
    semesters.forEach(semester => {
      console.log(`${semester._id}: ${semester.name} - ${semester.year}`);
    });

    // 3. Kiểm tra assignments
    const assignments = await Assignment.find({}).populate('teacherId').populate('classSectionId');
    console.log('\n=== ASSIGNMENTS ===');
    assignments.forEach(assignment => {
      console.log(`Teacher: ${assignment.teacherId?.name} -> Class: ${assignment.classSectionId?.classCode}`);
    });

    // 4. Kiểm tra class sections
    const classSections = await ClassSection.find({}).populate('semesterId').populate('courseId');
    console.log('\n=== CLASS SECTIONS ===');
    classSections.forEach(cls => {
      console.log(`${cls.classCode}: ${cls.courseId?.name} - ${cls.semesterId?.name} ${cls.semesterId?.year} (${cls.studentCount} students)`);
    });

    // 5. Test hàm calculateClassSalary với dữ liệu thực tế
    if (teachers.length > 0 && semesters.length > 0 && assignments.length > 0) {
      console.log('\n=== TESTING CALCULATE SALARY ===');
      
      const testTeacher = teachers[0];
      const testYear = '2024-2025';
      const testSemesters = semesters.filter(s => s.year === testYear);
      
      console.log(`Testing teacher: ${testTeacher.name}`);
      console.log(`Testing year: ${testYear}`);
      console.log(`Found semesters for year: ${testSemesters.length}`);
      
      for (const semester of testSemesters) {
        console.log(`\n--- Testing semester: ${semester.name} ---`);
        
        // Tìm assignments của teacher trong semester này
        const teacherAssignments = await Assignment.find({
          teacherId: testTeacher._id
        }).populate({
          path: 'classSectionId',
          match: { semesterId: semester._id },
          populate: { path: 'courseId' }
        });
        
        const validAssignments = teacherAssignments.filter(a => a.classSectionId !== null);
        console.log(`Valid assignments found: ${validAssignments.length}`);
        
        for (const assignment of validAssignments) {
          const classSection = assignment.classSectionId;
          const course = classSection.courseId;
          
          console.log(`\nTesting class: ${classSection.classCode}`);
          console.log(`Course: ${course.name} (${course.periods} periods)`);
          console.log(`Students: ${classSection.studentCount}`);
          
          // Test calculate salary
          const result = await calculateClassSalary(testTeacher._id, semester._id, classSection._id);
          console.log(`Salary result:`, result);
        }
      }
    }

    // 6. Kiểm tra dữ liệu salary rates và coefficients
    console.log('\n=== SALARY SYSTEM DATA ===');
    
    const salaryRates = await SalaryRate.find({});
    console.log('Salary Rates:');
    salaryRates.forEach(rate => {
      console.log(`  ${rate.name}: ${rate.ratePerPeriod || rate.amount} VNĐ/period`);
    });
    
    const teacherCoefs = await TeacherCoefficient.find({}).populate('degreeId');
    console.log('Teacher Coefficients:');
    teacherCoefs.forEach(coef => {
      console.log(`  ${coef.degreeId?.fullName} (${coef.year}): ${coef.coefficient}`);
    });
    
    const classCoefs = await ClassCoefficient.find({});
    console.log('Class Coefficients:');
    classCoefs.forEach(coef => {
      console.log(`  ${coef.minStudents}-${coef.maxStudents} students (${coef.year}): ${coef.coefficient}`);
    });

  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Helper function để tính tiền lương cho một lớp (copy từ reportRoutes.js)
async function calculateClassSalary(teacherId, semesterId, classSectionId) {
  try {
    // Lấy thông tin semester
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return { totalSalary: 0, details: 'Không tìm thấy kì học' };
    }

    // Lấy định mức tiền theo năm học
    const salaryRate = await SalaryRate.findOne({ name: semester.year });
    if (!salaryRate) {
      return { totalSalary: 0, details: `Không tìm thấy định mức tiền cho năm ${semester.year}` };
    }

    // Lấy thông tin giáo viên
    const teacher = await Teacher.findById(teacherId).populate('degreeId');
    if (!teacher) {
      return { totalSalary: 0, details: 'Không tìm thấy giáo viên' };
    }

    // Lấy hệ số giáo viên
    const teacherCoef = await TeacherCoefficient.findOne({ 
      degreeId: teacher.degreeId._id, 
      year: semester.year 
    });
    if (!teacherCoef) {
      return { totalSalary: 0, details: `Không tìm thấy hệ số giáo viên cho năm ${semester.year}` };
    }

    // Lấy thông tin lớp
    const classSection = await ClassSection.findById(classSectionId).populate('courseId');
    if (!classSection) {
      return { totalSalary: 0, details: 'Không tìm thấy lớp học phần' };
    }

    // Lấy hệ số lớp
    const classCoef = await ClassCoefficient.findOne({
      minStudents: { $lte: classSection.studentCount },
      maxStudents: { $gte: classSection.studentCount },
      year: semester.year
    });
    if (!classCoef) {
      return { totalSalary: 0, details: `Không tìm thấy hệ số lớp cho ${classSection.studentCount} sinh viên năm ${semester.year}` };
    }

    // Tính toán
    const salaryAmount = salaryRate.ratePerPeriod || salaryRate.amount;
    const baseSalary = classSection.courseId.periods * salaryAmount;
    const teacherCoefficientValue = teacherCoef.coefficient;
    const classCoefficientValue = classCoef.coefficient;
    const totalSalary = baseSalary * teacherCoefficientValue * (1 + classCoefficientValue);

    return { 
      totalSalary: Math.round(totalSalary),
      details: {
        periods: classSection.courseId.periods,
        salaryRate: salaryAmount,
        teacherCoefficient: teacherCoefficientValue,
        classCoefficient: classCoefficientValue,
        baseSalary,
        totalSalary: Math.round(totalSalary)
      }
    };

  } catch (error) {
    console.error('Error calculating class salary:', error);
    return { totalSalary: 0, details: 'Lỗi tính toán: ' + error.message };
  }
}

debugReport(); 