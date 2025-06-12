const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import models
const Teacher = require('../models/Teacher');
const Faculty = require('../models/Faculty');
const Degree = require('../models/Degree');
const Semester = require('../models/Semester');
const Assignment = require('../models/Assignment');
const ClassSection = require('../models/ClassSection');
const Course = require('../models/Course');
const SalaryRate = require('../models/SalaryRate');
const TeacherCoefficient = require('../models/TeacherCoefficient');
const ClassCoefficient = require('../models/ClassCoefficient');

// UC4.1 - Báo cáo tiền dạy của giáo viên trong một năm
router.get('/teacher-salary-by-year/:teacherId/:year', async (req, res) => {
  try {
    const { teacherId, year } = req.params;

    // Lấy thông tin giáo viên
    const teacher = await Teacher.findById(teacherId)
      .populate('facultyId')
      .populate('degreeId');

    if (!teacher) {
      return res.status(404).json({ message: 'Không tìm thấy giáo viên' });
    }

    // Lấy các kì học trong năm
    const semesters = await Semester.find({ year });

    let totalSalary = 0;
    let reportData = [];

    for (const semester of semesters) {
      // Lấy phân công của giáo viên trong kì - cần filter qua ClassSection
      const assignments = await Assignment.find({
        teacherId: teacherId
      }).populate({
        path: 'classSectionId',
        match: { semesterId: semester._id },
        populate: {
          path: 'courseId'
        }
      });

      // Filter out assignments where classSectionId is null (due to match filter)
      const validAssignments = assignments.filter(a => a.classSectionId !== null);

      let semesterSalary = 0;
      let semesterClasses = [];

      for (const assignment of validAssignments) {
        const classSection = assignment.classSectionId;
        const course = classSection.courseId;

        // Tính tiền cho lớp này
        const classSalary = await calculateClassSalary(
          teacherId, 
          semester._id, 
          classSection._id
        );

        const salary = classSalary.totalSalary || 0;
        semesterSalary += salary;
        semesterClasses.push({
          classCode: classSection.classCode,
          course: course.name,
          periods: course.periods,
          studentCount: classSection.studentCount,
          salary: salary
        });
      }

      totalSalary += semesterSalary;
      reportData.push({
        semester: semester.name,
        semesterCode: `${semester.name} - ${semester.year}`,
        classes: semesterClasses,
        semesterSalary
      });
    }

    res.json({
      teacher: {
        _id: teacher._id,
        code: teacher.code,
        name: teacher.name,
        faculty: teacher.facultyId?.fullName || 'N/A',
        degree: teacher.degreeId?.fullName || 'N/A'
      },
      year,
      totalSalary,
      reportData
    });

  } catch (error) {
    console.error('Error generating teacher salary report:', error);
    res.status(500).json({ message: 'Lỗi khi tạo báo cáo', error: error.message });
  }
});

// UC4.2 - Báo cáo tiền dạy của giáo viên một khoa
router.get('/faculty-salary-report/:facultyId/:year', async (req, res) => {
  try {
    const { facultyId, year } = req.params;

    // Lấy thông tin khoa
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Không tìm thấy khoa' });
    }

    // Lấy tất cả giáo viên trong khoa
    const teachers = await Teacher.find({ facultyId })
      .populate('degreeId');

    let facultyTotalSalary = 0;
    let teacherReports = [];

    for (const teacher of teachers) {
      // Lấy các kì học trong năm
      const semesters = await Semester.find({ year });
      
      let teacherTotalSalary = 0;
      let teacherSemesters = [];

      for (const semester of semesters) {
        const assignments = await Assignment.find({
          teacherId: teacher._id
        }).populate({
          path: 'classSectionId',
          match: { semesterId: semester._id },
          populate: {
            path: 'courseId'
          }
        });

        const validAssignments = assignments.filter(a => a.classSectionId !== null);
        let semesterSalary = 0;
        let classCount = 0;

        for (const assignment of validAssignments) {
          const classSalary = await calculateClassSalary(
            teacher._id, 
            semester._id, 
            assignment.classSectionId._id
          );
          semesterSalary += (classSalary.totalSalary || 0);
          classCount++;
        }

        if (classCount > 0) {
          teacherSemesters.push({
            semester: semester.name,
            classCount,
            semesterSalary
          });
        }
        teacherTotalSalary += semesterSalary;
      }

      if (teacherTotalSalary > 0) {
        teacherReports.push({
          teacher: {
            _id: teacher._id,
            code: teacher.code,
            name: teacher.name,
            degree: teacher.degreeId?.fullName || 'N/A'
          },
          semesters: teacherSemesters,
          totalSalary: teacherTotalSalary
        });
        facultyTotalSalary += teacherTotalSalary;
      }
    }

    res.json({
      faculty: {
        _id: faculty._id,
        fullName: faculty.fullName,
        shortName: faculty.shortName
      },
      year,
      totalTeachers: teacherReports.length,
      facultyTotalSalary,
      teacherReports
    });

  } catch (error) {
    console.error('Error generating faculty salary report:', error);
    res.status(500).json({ message: 'Lỗi khi tạo báo cáo khoa', error: error.message });
  }
});

// UC4.3 - Báo cáo tiền dạy của giáo viên toàn trường
router.get('/school-salary-report/:year', async (req, res) => {
  try {
    const { year } = req.params;

    // Lấy tất cả khoa
    const faculties = await Faculty.find({});
    
    let schoolTotalSalary = 0;
    let facultyReports = [];

    for (const faculty of faculties) {
      // Lấy giáo viên trong khoa
      const teachers = await Teacher.find({ facultyId: faculty._id })
        .populate('degreeId');

      let facultyTotalSalary = 0;
      let teacherCount = 0;

      for (const teacher of teachers) {
        const semesters = await Semester.find({ year });
        let teacherTotalSalary = 0;

        for (const semester of semesters) {
          const assignments = await Assignment.find({
            teacherId: teacher._id
          }).populate({
            path: 'classSectionId',
            match: { semesterId: semester._id }
          });

          const validAssignments = assignments.filter(a => a.classSectionId !== null);

          for (const assignment of validAssignments) {
            const classSalary = await calculateClassSalary(
              teacher._id, 
              semester._id, 
              assignment.classSectionId._id
            );
            teacherTotalSalary += (classSalary.totalSalary || 0);
          }
        }

        if (teacherTotalSalary > 0) {
          teacherCount++;
        }
        facultyTotalSalary += teacherTotalSalary;
      }

      if (facultyTotalSalary > 0) {
        facultyReports.push({
          faculty: {
            _id: faculty._id,
            fullName: faculty.fullName,
            shortName: faculty.shortName
          },
          teacherCount,
          totalSalary: facultyTotalSalary
        });
        schoolTotalSalary += facultyTotalSalary;
      }
    }

    res.json({
      year,
      totalFaculties: facultyReports.length,
      schoolTotalSalary,
      facultyReports
    });

  } catch (error) {
    console.error('Error generating school salary report:', error);
    res.status(500).json({ message: 'Lỗi khi tạo báo cáo toàn trường', error: error.message });
  }
});

// API để lấy danh sách năm học có dữ liệu
router.get('/available-years', async (req, res) => {
  try {
    const years = await Semester.distinct('year');
    res.json(years.sort());
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách năm học', error: error.message });
  }
});

// API để lấy thống kê báo cáo cho biểu đồ
router.get('/statistics/:year', async (req, res) => {
  try {
    const { year } = req.params;

    // Thống kê theo khoa
    const faculties = await Faculty.find({});
    let facultyStats = [];

    for (const faculty of faculties) {
      const teachers = await Teacher.find({ facultyId: faculty._id });
      let facultySalary = 0;

      for (const teacher of teachers) {
        const semesters = await Semester.find({ year });
        
        for (const semester of semesters) {
          const assignments = await Assignment.find({
            teacherId: teacher._id
          }).populate({
            path: 'classSectionId',
            match: { semesterId: semester._id }
          });

          const validAssignments = assignments.filter(a => a.classSectionId !== null);

          for (const assignment of validAssignments) {
            const classSalary = await calculateClassSalary(
              teacher._id, 
              semester._id, 
              assignment.classSectionId._id
            );
            facultySalary += classSalary.totalSalary;
          }
        }
      }

      if (facultySalary > 0) {
        facultyStats.push({
          faculty: faculty.shortName,
          salary: facultySalary,
          teacherCount: teachers.length
        });
      }
    }

    // Thống kê theo kì học
    const semesters = await Semester.find({ year });
    let semesterStats = [];

    for (const semester of semesters) {
      const assignments = await Assignment.find({}).populate({
        path: 'classSectionId',
        match: { semesterId: semester._id }
      });
      
      const validAssignments = assignments.filter(a => a.classSectionId !== null);
      let semesterSalary = 0;

      for (const assignment of validAssignments) {
        const classSalary = await calculateClassSalary(
          assignment.teacherId, 
          semester._id, 
          assignment.classSectionId._id
        );
        semesterSalary += classSalary.totalSalary;
      }

      semesterStats.push({
        semester: semester.name,
        salary: semesterSalary
      });
    }

    res.json({
      year,
      facultyStats,
      semesterStats
    });

  } catch (error) {
    console.error('Error generating statistics:', error);
    res.status(500).json({ message: 'Lỗi khi tạo thống kê', error: error.message });
  }
});

// Helper function để tính tiền lương cho một lớp
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
    return { totalSalary: 0, details: 'Lỗi tính toán' };
  }
}

module.exports = router; 