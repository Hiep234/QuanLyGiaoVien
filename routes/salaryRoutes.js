const express = require('express');
const router = express.Router();
const SalaryRate = require('../models/SalaryRate');
const TeacherCoefficient = require('../models/TeacherCoefficient');
const ClassCoefficient = require('../models/ClassCoefficient');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const ClassSection = require('../models/ClassSection');
const Assignment = require('../models/Assignment');
const Semester = require('../models/Semester');
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
    if (error.code === 11000) { // Lỗi trùng lặp unique index
      return res.status(400).json({ message: `Năm học '${req.body.name}' đã có định mức tiền/tiết. Vui lòng chọn năm học khác hoặc sửa định mức hiện tại.` });
    }
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
    if (error.code === 11000) { // Lỗi trùng lặp unique index
      return res.status(400).json({ message: `Năm học '${req.body.name}' đã có định mức tiền/tiết khác. Vui lòng chọn năm học khác.` });
    }
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

// Get teacher coefficients by academic year
router.get('/teacher-coefficients', async (req, res) => {
  try {
    const { year } = req.query;
    const filter = year ? { year } : {};
    const coefficients = await TeacherCoefficient.find(filter).populate('degreeId').sort({ year: -1, coefficient: 1 });
    res.json(coefficients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available academic years for teacher coefficients
router.get('/teacher-coefficients/years', async (req, res) => {
  try {
    const years = await TeacherCoefficient.distinct('year');
    res.json(years.sort().reverse());
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
    if (error.code === 11000) { // Lỗi trùng lặp unique index
      return res.status(400).json({ message: `Hệ số giáo viên cho bằng cấp này đã tồn tại trong năm học '${req.body.year}'. Vui lòng chọn bằng cấp khác hoặc sửa hệ số hiện tại.` });
    }
    res.status(400).json({ message: error.message });
  }
});

// Copy teacher coefficients to another academic year
router.post('/teacher-coefficients/copy', async (req, res) => {
  try {
    const { fromYear, toYear } = req.body;
    
    if (!fromYear || !toYear) {
      return res.status(400).json({ message: 'Vui lòng cung cấp năm học nguồn và năm học đích' });
    }

    if (fromYear === toYear) {
      return res.status(400).json({ message: 'Năm học nguồn và năm học đích không được giống nhau' });
    }

    // Check if target year already has data
    const existingCoeffs = await TeacherCoefficient.find({ year: toYear });
    if (existingCoeffs.length > 0) {
      return res.status(400).json({ message: `Năm học '${toYear}' đã có dữ liệu hệ số giáo viên. Vui lòng xóa dữ liệu cũ trước khi copy.` });
    }

    // Get source coefficients
    const sourceCoeffs = await TeacherCoefficient.find({ year: fromYear });
    if (sourceCoeffs.length === 0) {
      return res.status(400).json({ message: `Không tìm thấy dữ liệu hệ số giáo viên trong năm học '${fromYear}'` });
    }

    // Copy to target year
    const newCoeffs = sourceCoeffs.map(coeff => ({
      degreeId: coeff.degreeId,
      coefficient: coeff.coefficient,
      year: toYear,
      description: coeff.description,
      isActive: coeff.isActive,
      createdDate: new Date(),
      updatedDate: new Date()
    }));

    const savedCoeffs = await TeacherCoefficient.insertMany(newCoeffs);
    const populatedCoeffs = await TeacherCoefficient.find({ 
      _id: { $in: savedCoeffs.map(c => c._id) } 
    }).populate('degreeId');

    res.status(201).json({
      message: `Đã copy thành công ${savedCoeffs.length} hệ số giáo viên từ năm học '${fromYear}' sang '${toYear}'`,
      count: savedCoeffs.length,
      coefficients: populatedCoeffs
    });
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
    if (error.code === 11000) { // Lỗi trùng lặp unique index
      return res.status(400).json({ message: `Hệ số giáo viên cho bằng cấp này đã tồn tại trong năm học '${req.body.year}'. Vui lòng chọn bằng cấp khác.` });
    }
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

// Get class coefficients by academic year
router.get('/class-coefficients', async (req, res) => {
  try {
    const { year } = req.query;
    const filter = year ? { year } : {};
    const coefficients = await ClassCoefficient.find(filter).sort({ year: -1, minStudents: 1 });
    res.json(coefficients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available academic years for class coefficients
router.get('/class-coefficients/years', async (req, res) => {
  try {
    const years = await ClassCoefficient.distinct('year');
    res.json(years.sort().reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create class coefficient
router.post('/class-coefficients', async (req, res) => {
  try {
    const { minStudents, maxStudents, year } = req.body;

    // Validation: Kiểm tra số sinh viên không âm
    if (minStudents < 0 || maxStudents < 0) {
      return res.status(400).json({ 
        message: 'Số lượng sinh viên không thể là số âm. Vui lòng nhập số từ 0 trở lên.' 
      });
    }

    // Validation: Kiểm tra minStudents <= maxStudents
    if (minStudents > maxStudents) {
      return res.status(400).json({ 
        message: 'Số sinh viên tối thiểu không thể lớn hơn số tối đa.' 
      });
    }

    // Validation: kiểm tra chồng lấn khoảng sinh viên trong cùng năm học
    const overlappingCoeffs = await ClassCoefficient.find({
      year: year,
      $or: [
        // Khoảng mới nằm hoàn toàn trong khoảng đã có
        { 
          minStudents: { $lte: minStudents }, 
          maxStudents: { $gte: maxStudents } 
        },
        // Khoảng đã có nằm hoàn toàn trong khoảng mới
        { 
          minStudents: { $gte: minStudents }, 
          maxStudents: { $lte: maxStudents } 
        },
        // Overlap bên trái: minStudents nằm trong khoảng đã có
        { 
          minStudents: { $lte: minStudents }, 
          maxStudents: { $gte: minStudents, $lt: maxStudents } 
        },
        // Overlap bên phải: maxStudents nằm trong khoảng đã có  
        { 
          minStudents: { $gt: minStudents, $lte: maxStudents }, 
          maxStudents: { $gte: maxStudents } 
        }
      ]
    });

    if (overlappingCoeffs.length > 0) {
      const existingRange = overlappingCoeffs[0];
      return res.status(400).json({ 
        message: `Khoảng sinh viên ${minStudents}-${maxStudents} bị chồng lấn với khoảng đã tồn tại ${existingRange.minStudents}-${existingRange.maxStudents} trong năm học '${year}'. Vui lòng chọn khoảng khác không bị trùng lấp.` 
      });
    }

    const coefficient = new ClassCoefficient(req.body);
    const savedCoefficient = await coefficient.save();
    res.status(201).json(savedCoefficient);
  } catch (error) {
    if (error.code === 11000) { // Lỗi trùng lặp unique index
      return res.status(400).json({ message: `Khoảng sinh viên này đã có hệ số trong năm học '${req.body.year}'. Vui lòng chọn khoảng sinh viên khác hoặc sửa hệ số hiện tại.` });
    }
    res.status(400).json({ message: error.message });
  }
});

// Copy class coefficients to another academic year
router.post('/class-coefficients/copy', async (req, res) => {
  try {
    const { fromYear, toYear } = req.body;
    
    if (!fromYear || !toYear) {
      return res.status(400).json({ message: 'Vui lòng cung cấp năm học nguồn và năm học đích' });
    }

    if (fromYear === toYear) {
      return res.status(400).json({ message: 'Năm học nguồn và năm học đích không được giống nhau' });
    }

    // Check if target year already has data
    const existingCoeffs = await ClassCoefficient.find({ year: toYear });
    if (existingCoeffs.length > 0) {
      return res.status(400).json({ message: `Năm học '${toYear}' đã có dữ liệu hệ số lớp. Vui lòng xóa dữ liệu cũ trước khi copy.` });
    }

    // Get source coefficients
    const sourceCoeffs = await ClassCoefficient.find({ year: fromYear });
    if (sourceCoeffs.length === 0) {
      return res.status(400).json({ message: `Không tìm thấy dữ liệu hệ số lớp trong năm học '${fromYear}'` });
    }

    // Copy to target year
    const newCoeffs = sourceCoeffs.map(coeff => ({
      minStudents: coeff.minStudents,
      maxStudents: coeff.maxStudents,
      coefficient: coeff.coefficient,
      year: toYear,
      description: coeff.description,
      isActive: coeff.isActive,
      createdDate: new Date(),
      updatedDate: new Date()
    }));

    const savedCoeffs = await ClassCoefficient.insertMany(newCoeffs);

    res.status(201).json({
      message: `Đã copy thành công ${savedCoeffs.length} hệ số lớp từ năm học '${fromYear}' sang '${toYear}'`,
      count: savedCoeffs.length,
      coefficients: savedCoeffs
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update class coefficient
router.put('/class-coefficients/:id', async (req, res) => {
  try {
    const { minStudents, maxStudents, year } = req.body;
    const currentId = req.params.id;

    // Validation: Kiểm tra số sinh viên không âm
    if (minStudents < 0 || maxStudents < 0) {
      return res.status(400).json({ 
        message: 'Số lượng sinh viên không thể là số âm. Vui lòng nhập số từ 0 trở lên.' 
      });
    }

    // Validation: Kiểm tra minStudents <= maxStudents
    if (minStudents > maxStudents) {
      return res.status(400).json({ 
        message: 'Số sinh viên tối thiểu không thể lớn hơn số tối đa.' 
      });
    }

    // Validation: kiểm tra chồng lấn khoảng sinh viên trong cùng năm học (trừ record hiện tại)
    const overlappingCoeffs = await ClassCoefficient.find({
      _id: { $ne: currentId }, // Loại trừ record đang sửa
      year: year,
      $or: [
        // Khoảng mới nằm hoàn toàn trong khoảng đã có
        { 
          minStudents: { $lte: minStudents }, 
          maxStudents: { $gte: maxStudents } 
        },
        // Khoảng đã có nằm hoàn toàn trong khoảng mới
        { 
          minStudents: { $gte: minStudents }, 
          maxStudents: { $lte: maxStudents } 
        },
        // Overlap bên trái: minStudents nằm trong khoảng đã có
        { 
          minStudents: { $lte: minStudents }, 
          maxStudents: { $gte: minStudents, $lt: maxStudents } 
        },
        // Overlap bên phải: maxStudents nằm trong khoảng đã có  
        { 
          minStudents: { $gt: minStudents, $lte: maxStudents }, 
          maxStudents: { $gte: maxStudents } 
        }
      ]
    });

    if (overlappingCoeffs.length > 0) {
      const existingRange = overlappingCoeffs[0];
      return res.status(400).json({ 
        message: `Khoảng sinh viên ${minStudents}-${maxStudents} bị chồng lấn với khoảng đã tồn tại ${existingRange.minStudents}-${existingRange.maxStudents} trong năm học '${year}'. Vui lòng chọn khoảng khác không bị trùng lấp.` 
      });
    }

    req.body.updatedDate = new Date();
    const coefficient = await ClassCoefficient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(coefficient);
  } catch (error) {
    if (error.code === 11000) { // Lỗi trùng lặp unique index
      return res.status(400).json({ message: `Khoảng sinh viên này đã có hệ số trong năm học '${req.body.year}'. Vui lòng chọn khoảng sinh viên khác.` });
    }
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

    // Get semester info to determine academic year
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    console.log(`Semester: ${semester.name} - Academic Year: ${semester.year}`);

    // Get salary rate for the academic year
    const salaryRate = await SalaryRate.findOne({ name: semester.year });
    if (!salaryRate) {
      return res.status(400).json({ 
        message: `No salary rate found for academic year ${semester.year}. Please set up salary rate for this academic year first.` 
      });
    }
    console.log(`Salary rate for ${semester.year}: ${salaryRate.ratePerPeriod} VND/period`);

    // Get teacher info
    const teacher = await Teacher.findById(teacherId).populate('degreeId');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    console.log(`Teacher found: ${teacher.name} (${teacher.code})`);

    // Get teacher coefficient based on degree and academic year
    const teacherCoeff = await TeacherCoefficient.findOne({ 
      degreeId: teacher.degreeId._id,
      year: semester.year
    });
    if (!teacherCoeff) {
      return res.status(400).json({ message: `No coefficient found for degree: ${teacher.degreeId.fullName} in academic year ${semester.year}. Please set up teacher coefficients for this academic year first.` });
    }
    console.log(`Teacher coefficient for ${semester.year}: ${teacherCoeff.coefficient}`);

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

      // Get class coefficient based on student count and academic year
      const classCoeff = await ClassCoefficient.findOne({
        minStudents: { $lte: classSection.studentCount },
        maxStudents: { $gte: classSection.studentCount },
        year: semester.year
      });

      const classCoefficientValue = classCoeff ? classCoeff.coefficient : 0;
      console.log(`Class coefficient for ${classSection.studentCount} students in ${semester.year}: ${classCoefficientValue}`);

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