const express = require('express');
const router = express.Router();
const SalaryRate = require('../models/SalaryRate');
const TeacherCoefficient = require('../models/TeacherCoefficient');
const ClassCoefficient = require('../models/ClassCoefficient');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const ClassSection = require('../models/ClassSection');
const Assignment = require('../models/Assignment');
const Degree = require('../models/Degree');

// ============= SALARY RATES =============

// Get all salary rates
router.get('/rates', async (req, res) => {
  try {
    const rates = await SalaryRate.find().sort({ createdDate: -1 });
    res.json(rates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active salary rate
router.get('/rates/active', async (req, res) => {
  try {
    const rate = await SalaryRate.findOne({ isActive: true });
    res.json(rate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create salary rate
router.post('/rates', async (req, res) => {
  try {
    const rate = new SalaryRate(req.body);
    const savedRate = await rate.save();
    res.status(201).json(savedRate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update salary rate
router.put('/rates/:id', async (req, res) => {
  try {
    req.body.updatedDate = new Date();
    const rate = await SalaryRate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(rate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete salary rate
router.delete('/rates/:id', async (req, res) => {
  try {
    await SalaryRate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Set active rate
router.put('/rates/:id/activate', async (req, res) => {
  try {
    // Deactivate all rates first
    await SalaryRate.updateMany({}, { isActive: false });
    // Activate the selected rate
    const rate = await SalaryRate.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    res.json(rate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ============= TEACHER COEFFICIENTS =============

// Get all teacher coefficients with degree info
router.get('/teacher-coefficients', async (req, res) => {
  try {
    const coefficients = await TeacherCoefficient.find().populate('degreeId').sort({ coefficient: 1 });
    res.json(coefficients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all degrees for dropdown
router.get('/degrees', async (req, res) => {
  try {
    const degrees = await Degree.find().sort({ fullName: 1 });
    res.json(degrees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create teacher coefficient
router.post('/teacher-coefficients', async (req, res) => {
  try {
    const coefficient = new TeacherCoefficient(req.body);
    const savedCoefficient = await coefficient.save();
    const populatedCoefficient = await TeacherCoefficient.findById(savedCoefficient._id).populate('degreeId');
    res.status(201).json(populatedCoefficient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update teacher coefficient
router.put('/teacher-coefficients/:id', async (req, res) => {
  try {
    req.body.updatedDate = new Date();
    const coefficient = await TeacherCoefficient.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('degreeId');
    res.json(coefficient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete teacher coefficient
router.delete('/teacher-coefficients/:id', async (req, res) => {
  try {
    await TeacherCoefficient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Teacher coefficient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============= CLASS COEFFICIENTS =============

// Get all class coefficients
router.get('/class-coefficients', async (req, res) => {
  try {
    const coefficients = await ClassCoefficient.find().sort({ minStudents: 1 });
    res.json(coefficients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create class coefficient
router.post('/class-coefficients', async (req, res) => {
  try {
    const coefficient = new ClassCoefficient(req.body);
    const savedCoefficient = await coefficient.save();
    res.status(201).json(savedCoefficient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update class coefficient
router.put('/class-coefficients/:id', async (req, res) => {
  try {
    req.body.updatedDate = new Date();
    const coefficient = await ClassCoefficient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(coefficient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete class coefficient
router.delete('/class-coefficients/:id', async (req, res) => {
  try {
    await ClassCoefficient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class coefficient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============= SALARY CALCULATION =============

// Calculate salary for a teacher in a semester
router.post('/calculate', async (req, res) => {
  try {
    const { teacherId, semesterId } = req.body;

    console.log(`=== SALARY CALCULATION START ===`);
    console.log(`Teacher ID: ${teacherId}`);
    console.log(`Semester ID: ${semesterId}`);

    // Get active salary rate
    const salaryRate = await SalaryRate.findOne({ isActive: true });
    if (!salaryRate) {
      return res.status(400).json({ message: 'No active salary rate found' });
    }
    console.log(`Salary rate: ${salaryRate.ratePerPeriod} VND/period`);

    // Get teacher info
    const teacher = await Teacher.findById(teacherId).populate('degreeId');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    console.log(`Teacher found: ${teacher.name} (${teacher.code})`);

    // Get teacher coefficient based on degree
    const teacherCoeff = await TeacherCoefficient.findOne({ 
      degreeId: teacher.degreeId._id,
      isActive: true 
    });
    if (!teacherCoeff) {
      return res.status(400).json({ message: `No coefficient found for degree: ${teacher.degreeId.fullName}` });
    }
    console.log(`Teacher coefficient: ${teacherCoeff.coefficient}`);

    // Get teacher's assignments in the semester - use populate + filter approach
    const allAssignments = await Assignment.find({ teacherId: teacherId })
      .populate({
        path: 'classSectionId',
        populate: {
          path: 'courseId semesterId'
        }
      })
      .populate('teacherId');

    console.log(`Total assignments for teacher: ${allAssignments.length}`);

    // Filter for this semester
    const assignments = allAssignments.filter(a => 
      a.classSectionId?.semesterId?._id?.toString() === semesterId
    );

    console.log(`Found ${assignments.length} assignments for teacher ${teacherId} in semester ${semesterId}`);

    if (assignments.length === 0) {
      return res.json({
        teacher: {
          _id: teacher._id,
          teacherCode: teacher.code,
          name: teacher.name,
          degree: teacher.degreeId?.fullName || 'N/A'
        },
        semester: semesterId,
        assignments: [],
        totalSalary: 0,
        summary: {
          totalClasses: 0,
          totalPeriods: 0,
          totalAdjustedPeriods: 0
        }
      });
    }

    let totalSalary = 0;
    const calculationDetails = [];

    for (const assignment of assignments) {
      const classSection = assignment.classSectionId;
      const course = classSection.courseId;

      console.log(`Processing class: ${classSection.classCode} - ${classSection.className}`);

      // Get class coefficient based on student count
      const classCoeff = await ClassCoefficient.findOne({
        minStudents: { $lte: classSection.studentCount },
        maxStudents: { $gte: classSection.studentCount },
        isActive: true
      });

      const classCoefficientValue = classCoeff ? classCoeff.coefficient : 0;
      console.log(`Class coefficient for ${classSection.studentCount} students: ${classCoefficientValue}`);

      // Calculate adjusted periods
      const courseCoefficientValue = course.coefficient || 1.0;
      const adjustedPeriods = course.periods * (courseCoefficientValue + classCoefficientValue);

      // Calculate salary for this class
      const classSalary = adjustedPeriods * teacherCoeff.coefficient * salaryRate.ratePerPeriod;
      totalSalary += classSalary;

      console.log(`Class salary: ${adjustedPeriods} × ${teacherCoeff.coefficient} × ${salaryRate.ratePerPeriod} = ${classSalary} VND`);

      calculationDetails.push({
        classId: classSection._id,
        classCode: classSection.classCode,
        className: classSection.className,
        courseCode: course.code,
        courseName: course.name,
        periods: course.periods,
        courseCoefficient: courseCoefficientValue,
        classCoefficient: classCoefficientValue,
        adjustedPeriods: adjustedPeriods,
        teacherCoefficient: teacherCoeff.coefficient,
        ratePerPeriod: salaryRate.ratePerPeriod,
        classSalary: classSalary,
        studentCount: classSection.studentCount
      });
    }

    const result = {
      teacher: {
        _id: teacher._id,
        teacherCode: teacher.code,
        name: teacher.name,
        degree: teacher.degreeId?.fullName || 'N/A'
      },
      semester: assignments[0].classSectionId.semesterId,
      salaryRate: salaryRate,
      teacherCoefficient: teacherCoeff.coefficient,
      assignments: calculationDetails,
      totalSalary: totalSalary,
      summary: {
        totalClasses: calculationDetails.length,
        totalPeriods: calculationDetails.reduce((sum, detail) => sum + detail.periods, 0),
        totalAdjustedPeriods: calculationDetails.reduce((sum, detail) => sum + detail.adjustedPeriods, 0)
      }
    };

    console.log(`=== CALCULATION COMPLETE ===`);
    console.log(`Total salary: ${totalSalary} VND`);
    
    res.json(result);
  } catch (error) {
    console.error('Salary calculation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Debug endpoint to check assignments in a semester
router.get('/debug/assignments/:semesterId', async (req, res) => {
  try {
    console.log('=== DEBUG ASSIGNMENTS ===');
    console.log('Semester ID:', req.params.semesterId);
    
    // First check assignments with classSectionId structure
    const rawAssignments = await Assignment.find({});
    console.log('Total assignments in database:', rawAssignments.length);
    
    // Check assignments for this semester using the correct structure
    const semesterAssignments = await Assignment.find({
      'classSectionId.semesterId': req.params.semesterId
    });
    console.log('Assignments with nested semesterId:', semesterAssignments.length);
    
    // Also try populated query
    const populatedAssignments = await Assignment.find({})
      .populate({
        path: 'classSectionId',
        populate: {
          path: 'semesterId'
        }
      })
      .populate('teacherId');
    
    // Filter for this semester after population
    const filteredAssignments = populatedAssignments.filter(a => 
      a.classSectionId?.semesterId?._id?.toString() === req.params.semesterId
    );
    
    console.log('Filtered assignments after population:', filteredAssignments.length);
    
    const result = {
      semesterId: req.params.semesterId,
      totalAssignments: rawAssignments.length,
      semesterAssignments: semesterAssignments.length,
      filteredAssignments: filteredAssignments.length,
      assignments: filteredAssignments.map(a => ({
        _id: a._id,
        teacherId: a.teacherId?._id,
        teacher: a.teacherId ? { 
          _id: a.teacherId._id, 
          name: a.teacherId.name, 
          code: a.teacherId.code 
        } : null,
        class: a.classSectionId ? {
          _id: a.classSectionId._id,
          classCode: a.classSectionId.classCode,
          className: a.classSectionId.className,
          studentCount: a.classSectionId.studentCount
        } : null,
        semester: a.classSectionId?.semesterId ? {
          _id: a.classSectionId.semesterId._id,
          name: a.classSectionId.semesterId.name,
          year: a.classSectionId.semesterId.year
        } : null
      })),
      rawSample: rawAssignments.slice(0, 2).map(a => ({
        _id: a._id,
        teacherId: a.teacherId,
        classSectionId: a.classSectionId
      }))
    };
    
    console.log('=== END DEBUG ===');
    res.json(result);
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get teachers with assignments in a semester
router.get('/teachers/:semesterId', async (req, res) => {
  try {
    console.log('Getting teachers for semester:', req.params.semesterId);
    
    // Get assignments for this semester using populated query
    const assignments = await Assignment.find({})
      .populate({
        path: 'classSectionId',
        populate: {
          path: 'semesterId'
        }
      })
      .populate('teacherId');
    
    console.log('Total assignments found:', assignments.length);
    
    // Filter for this semester
    const semesterAssignments = assignments.filter(a => 
      a.classSectionId?.semesterId?._id?.toString() === req.params.semesterId
    );
    
    console.log('Assignments in semester:', semesterAssignments.length);
    
    // Extract unique teacher IDs
    const teacherIds = [...new Set(semesterAssignments.map(assignment => assignment.teacherId?._id).filter(Boolean))];
    
    console.log('Unique teacher IDs:', teacherIds);
    
    // Get teachers with full info
    const teachers = await Teacher.find({ _id: { $in: teacherIds } })
      .populate('degreeId facultyId');
    
    console.log('Found teachers:', teachers.length);
    
    res.json(teachers);
  } catch (error) {
    console.error('Error getting teachers for semester:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 