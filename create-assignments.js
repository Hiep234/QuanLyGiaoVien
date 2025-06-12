const mongoose = require('mongoose');

// Import models
const Teacher = require('./models/Teacher');
const Assignment = require('./models/Assignment');
const ClassSection = require('./models/ClassSection');

async function createAssignments() {
  try {
    // Kết nối MongoDB
    await mongoose.connect('mongodb+srv://hiep445:admin123@qlgv.q8asegt.mongodb.net/?retryWrites=true&w=majority&appName=QLGV');
    console.log('Connected to MongoDB');

    // Lấy teachers và class sections
    const teachers = await Teacher.find({});
    const classSections = await ClassSection.find({});

    console.log(`Found ${teachers.length} teachers and ${classSections.length} class sections`);

    if (teachers.length === 0 || classSections.length === 0) {
      console.log('No teachers or class sections found. Please create them first.');
      return;
    }

    console.log('Creating assignments...');
    let assignmentCount = 0;

    // Tạo assignments - mỗi teacher sẽ dạy một vài lớp
    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[i];
      
      // Mỗi teacher dạy 2-4 lớp ngẫu nhiên
      const numClasses = Math.floor(Math.random() * 3) + 2; // 2-4 classes
      const shuffledClasses = classSections.sort(() => 0.5 - Math.random());
      
      for (let j = 0; j < Math.min(numClasses, shuffledClasses.length); j++) {
        const classSection = shuffledClasses[j];
        
        // Kiểm tra assignment đã tồn tại chưa
        const existingAssignment = await Assignment.findOne({
          teacherId: teacher._id,
          classSectionId: classSection._id
        });

        if (!existingAssignment) {
          await Assignment.create({
            teacherId: teacher._id,
            classSectionId: classSection._id,
            assignedDate: new Date(),
            status: 'active'
          });
          
          console.log(`Created assignment: ${teacher.name} -> ${classSection.classCode}`);
          assignmentCount++;
        }
      }
    }

    console.log(`Created ${assignmentCount} assignments successfully!`);

  } catch (error) {
    console.error('Error creating assignments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAssignments(); 