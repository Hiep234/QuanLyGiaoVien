const mongoose = require('mongoose');

// Import models
const Semester = require('./models/Semester');
const Course = require('./models/Course'); 
const ClassSection = require('./models/ClassSection');
const Assignment = require('./models/Assignment');

async function createSampleData() {
  try {
    // Kết nối MongoDB
    await mongoose.connect('mongodb+srv://hiep445:admin123@qlgv.q8asegt.mongodb.net/?retryWrites=true&w=majority&appName=QLGV');
    console.log('Connected to MongoDB');

    // Tạo dữ liệu mẫu cho semesters
    const semestersData = [
      {
        name: 'Học kì 1',
        year: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-31')
      },
      {
        name: 'Học kì 2', 
        year: '2024-2025',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-05-31')
      },
      {
        name: 'Học kì 1',
        year: '2023-2024',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2023-12-31')
      },
      {
        name: 'Học kì 2',
        year: '2023-2024', 
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-05-31')
      }
    ];

    console.log('Creating semesters...');
    for (const semesterData of semestersData) {
      const existingSemester = await Semester.findOne({
        name: semesterData.name,
        year: semesterData.year
      });
      
      if (!existingSemester) {
        await Semester.create(semesterData);
        console.log(`Created semester: ${semesterData.name} - ${semesterData.year}`);
      } else {
        console.log(`Semester already exists: ${semesterData.name} - ${semesterData.year}`);
      }
    }

    // Tạo dữ liệu mẫu cho courses
    const coursesData = [
      {
        code: 'CS101',
        name: 'Lập trình căn bản',
        credits: 3,
        coefficient: 1.0,
        periods: 45,
        description: 'Môn học lập trình căn bản'
      },
      {
        code: 'CS102',
        name: 'Cấu trúc dữ liệu',
        credits: 3,
        coefficient: 1.2,
        periods: 45,
        description: 'Môn học cấu trúc dữ liệu và giải thuật'
      },
      {
        code: 'MA101',
        name: 'Toán cao cấp',
        credits: 4,
        coefficient: 1.0,
        periods: 60,
        description: 'Môn toán cao cấp'
      }
    ];

    console.log('Creating courses...');
    for (const courseData of coursesData) {
      const existingCourse = await Course.findOne({ code: courseData.code });
      
      if (!existingCourse) {
        await Course.create(courseData);
        console.log(`Created course: ${courseData.code} - ${courseData.name}`);
      } else {
        console.log(`Course already exists: ${courseData.code}`);
      }
    }

    // Lấy dữ liệu đã tạo để tạo class sections
    const semesters = await Semester.find({});
    const courses = await Course.find({});

    console.log('Creating class sections...');
    let classCount = 1;
    
    for (const semester of semesters) {
      for (const course of courses) {
        const classSectionData = {
          classCode: `${course.code}_${semester.name.replace(' ', '')}_${semester.year.replace('-', '')}`,
          className: `Lớp ${course.name} - ${semester.name} ${semester.year}`,
          semesterId: semester._id,
          courseId: course._id,
          studentCount: Math.floor(Math.random() * 50) + 20, // Random 20-70 students
          maxStudents: 70,
          scheduleDetails: 'Thứ 2, 3, 5',
          status: 'active'
        };

        const existingClass = await ClassSection.findOne({ 
          classCode: classSectionData.classCode 
        });

        if (!existingClass) {
          await ClassSection.create(classSectionData);
          console.log(`Created class: ${classSectionData.classCode}`);
          classCount++;
        } else {
          console.log(`Class already exists: ${classSectionData.classCode}`);
        }
      }
    }

    console.log('Sample data created successfully!');

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createSampleData(); 