const mongoose = require('mongoose');
const Degree = require('./models/Degree');

async function checkDegrees() {
  try {
    await mongoose.connect('mongodb://localhost:27017/quan_ly_giao_vien');
    
    const degrees = await Degree.find({});
    console.log(`Found ${degrees.length} degrees:`);
    
    degrees.forEach(degree => {
      console.log(`- ${degree.fullName} (${degree.shortName}) - ID: ${degree._id}`);
    });
    
    // Also check what collections exist in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDegrees(); 