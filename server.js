const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();



app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect('mongodb+srv://hiep445:admin123@qlgv.q8asegt.mongodb.net/?retryWrites=true&w=majority&appName=QLGV');

app.use('/api/degrees', require('./routes/degrees'));
app.use('/api/faculties', require('./routes/faculties'));
app.use('/api/teachers', require('./routes/teachers'));

app.use('/api/courses', require('./routes/courses'));
app.use('/api/semesters', require('./routes/semesters'));
app.use('/api/classsections', require('./routes/classsections'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/salary', require('./routes/salaryRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));



app.listen(3000, () => console.log('Server running at http://localhost:3000'));