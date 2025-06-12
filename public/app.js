// --- Global Variables and Helper Functions ---
let currentActiveItem = null;
let currentActiveSubmenuId = null;
const API_URL = 'http://localhost:3000/api';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Menu system ready
}); 

function toggleSubmenu(submenuId, parentItem) {
    
    // Chỉ toggle submenu hiện tại, không đóng submenu khác
    const submenu = document.getElementById(submenuId);
    const arrow = parentItem.querySelector('.arrow-icon');
    const isOpening = !submenu.classList.contains('open');
    
    if (submenu) { 
        submenu.classList.toggle('open'); 
        
        // Update parent item state
        if (isOpening) {
            parentItem.classList.add('parent-active');
        } else {
            parentItem.classList.remove('parent-active');
        }
        
        if (arrow) { 
            arrow.classList.toggle('open'); 
            arrow.classList.toggle('fa-chevron-right'); 
            arrow.classList.toggle('fa-chevron-down'); 
        } 
    } 
}

function setActive(item, submenuId) {
    // Remove active from all items
    document.querySelectorAll('.sidebar-item.active').forEach(activeItem => {
        activeItem.classList.remove('active');
    });
    
    // Add loading state briefly
    if (item) {
        item.classList.add('loading');
        setTimeout(() => {
            item.classList.remove('loading');
            item.classList.add('active');
        }, 200);
        currentActiveItem = item;
    } else {
        currentActiveItem = null;
    }
    
    currentActiveSubmenuId = submenuId;
}

function handleShowSection(sectionId) {
  const allPossibleSectionIds = [
    'welcome', 'degrees', 'faculties', 'teachers', 'statistics',
    'courses-section', 'add-course-form', 
    'semesters-section', 'add-semester-form',
    'classes-section', 'add-class-form', 'bulk-create-classes-form',
    'assignments-section',
    'statisticsLopMo-section',
    'salary-rates', 'teacher-coefficients', 'class-coefficients', 'salary-calculation',
    'teacher-report', 'faculty-report', 'school-report', 'chart-report'
  ];
  allPossibleSectionIds.forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });
  
  let targetSectionId = sectionId;
  const sectionMappings = {
      'courses': 'courses-section', 'semesters': 'semesters-section',
      'classes': 'classes-section', 'assignments': 'assignments-section',
      'statisticsLopMo': 'statisticsLopMo-section',
  };
  if (sectionMappings[sectionId]) { targetSectionId = sectionMappings[sectionId]; }
  
  const activeSection = document.getElementById(targetSectionId);
  if (activeSection) { activeSection.classList.remove('hidden'); } 
  else { console.warn(`Section with ID '${targetSectionId}' not found.`); }

  switch(sectionId) {
    case 'degrees': case 'faculties': case 'teachers': case 'statistics':
      fetchDataForTeacherManagement(); break;
    case 'courses': CourseHandlers.load(); break;
    case 'semesters': SemesterHandlers.load(); break; 
    case 'classes': ClassHandlers.load(); break; 
    case 'assignments': AssignmentHandlers.load(); break; 
    case 'statisticsLopMo': StatisticsLopMoHandlers.load(); break; 
    case 'salary-rates': SalaryHandlers.loadSalaryRates(); break;
    case 'teacher-coefficients': SalaryHandlers.loadTeacherCoefficients(); break;
    case 'class-coefficients': SalaryHandlers.loadClassCoefficients(); break;
    case 'salary-calculation': SalaryHandlers.loadSalaryCalculation(); break;
    case 'teacher-report': 
    case 'faculty-report': 
    case 'school-report': 
    case 'chart-report': 
      ReportHandlers.loadReportSection(sectionId); 
      break;
  }
}

// --- Teacher Management Script ---
let degrees = []; let faculties = []; let teachers = []; 
let editingDegreeId = null; let editingFacultyId = null; let editingTeacherId = null;

function togglePopup(id) { document.getElementById(id).classList.toggle('hidden'); }

async function fetchDataForTeacherManagement(){
    try{
        const[facultiesRes,degreesRes,teachersRes]=await Promise.all([axios.get(`${API_URL}/faculties`),axios.get(`${API_URL}/degrees`),axios.get(`${API_URL}/teachers`)]);
        faculties=facultiesRes.data;degrees=degreesRes.data;teachers=teachersRes.data;
        const facultyFilterEl = document.getElementById('facultyFilter');
        if(facultyFilterEl) facultyFilterEl.innerHTML='<option value="">Tất cả</option>'+faculties.map(f=>`<option value="${f._id}">${f.fullName}</option>`).join('');
        const degreeFilterEl = document.getElementById('degreeFilter');
        if(degreeFilterEl) degreeFilterEl.innerHTML='<option value="">Tất cả</option>'+degrees.map(d=>`<option value="${d._id}">${d.fullName}</option>`).join('');
        
        const teacherFacultyEl = document.getElementById('teacherFaculty');
        if(teacherFacultyEl) teacherFacultyEl.innerHTML='<option value="">Chọn khoa</option>'+faculties.map(f=>`<option value="${f._id}">${f.fullName}</option>`).join('');
        const teacherDegreeEl = document.getElementById('teacherDegree');
        if(teacherDegreeEl) teacherDegreeEl.innerHTML='<option value="">Chọn bằng cấp</option>'+degrees.map(d=>`<option value="${d._id}">${d.fullName}</option>`).join('');
        const editTeacherFacultyEl = document.getElementById('editTeacherFaculty');
        if(editTeacherFacultyEl) editTeacherFacultyEl.innerHTML='<option value="">Chọn khoa</option>'+faculties.map(f=>`<option value="${f._id}">${f.fullName}</option>`).join('');
        const editTeacherDegreeEl = document.getElementById('editTeacherDegree');
        if(editTeacherDegreeEl) editTeacherDegreeEl.innerHTML='<option value="">Chọn bằng cấp</option>'+degrees.map(d=>`<option value="${d._id}">${d.fullName}</option>`).join('');

        const facultyTableEl = document.getElementById('facultyTable');
        if(facultyTableEl) facultyTableEl.innerHTML=faculties.map((f,i)=>`<tr><td class="border px-4 py-2">${i+1}</td><td class="border px-4 py-2">${f.fullName}</td><td class="border px-4 py-2">${f.shortName}</td><td class="border px-4 py-2">${f.description||''}</td><td class="border px-4 py-2 space-x-2"><button onclick="editFaculty('${f._id}')" class="text-blue-500 hover:underline">✏️</button><button onclick="deleteFaculty('${f._id}')" class="text-red-500 hover:underline">🗑️</button></td></tr>`).join('');
        const degreeTableEl = document.getElementById('degreeTable');
        if(degreeTableEl) degreeTableEl.innerHTML=degrees.map((d,i)=>`<tr><td class="border px-4 py-2">${i+1}</td><td class="border px-4 py-2">${d.fullName}</td><td class="border px-4 py-2">${d.shortName}</td><td class="border px-4 py-2 space-x-2"><button onclick="editDegree('${d._id}')" class="text-blue-500 hover:underline">✏️</button><button onclick="deleteDegree('${d._id}')" class="text-red-500 hover:underline">🗑️</button></td></tr>`).join('');
        const teacherTableEl = document.getElementById('teacherTable');
        if(teacherTableEl) teacherTableEl.innerHTML=teachers.map((t,i)=>{let fb='';if(t.birthDate){const date=new Date(t.birthDate);fb=!isNaN(date)?date.toLocaleDateString('vi-VN'):''}
return `<tr><td class="border px-4 py-2">${i+1}</td><td class="border px-4 py-2">${t.code||''}</td><td class="border px-4 py-2">${t.name||''}</td><td class="border px-4 py-2">${fb}</td><td class="border px-4 py-2">${t.email||''}</td><td class="border px-4 py-2">${t.phone||''}</td><td class="border px-4 py-2">${t.facultyId?.fullName||''}</td><td class="border px-4 py-2">${t.degreeId?.fullName||''}</td><td class="border px-4 py-2 space-x-2"><button onclick="editTeacher('${t._id}')" class="text-blue-500 hover:underline">✏️</button><button onclick="deleteTeacher('${t._id}')" class="text-red-500 hover:underline">🗑️</button></td></tr>`;}).join('');
        updateTeacherStatsCount();
    } catch(err){console.error('Lỗi QLGV:',err);alert('Lỗi tải dữ liệu QLGV.')}
}

async function addDegree(){const fn=document.getElementById('degreeFullName').value;const sn=document.getElementById('degreeShortName').value;if(!fn||!sn)return alert('Nhập đủ');try{await axios.post(`${API_URL}/degrees`,{fullName:fn,shortName:sn});document.getElementById('degreeFullName').value='';document.getElementById('degreeShortName').value='';togglePopup('popupFormDegreeAdd');fetchDataForTeacherManagement()}catch(e){alert('Lỗi thêm BC');console.error(e)}}

async function deleteDegree(id){if(!confirm('Xóa?'))return;try{await axios.delete(`${API_URL}/degrees/${id}`);fetchDataForTeacherManagement()}catch(e){alert('Lỗi xóa BC');console.error(e)}}

function editDegree(id){const d=degrees.find(deg=>deg._id===id);if(!d)return;editingDegreeId=id;document.getElementById('editDegreeFullName').value=d.fullName;document.getElementById('editDegreeShortName').value=d.shortName;togglePopup('popupFormDegreeEdit')}

async function updateDegree(){const fn=document.getElementById('editDegreeFullName').value;const sn=document.getElementById('editDegreeShortName').value;try{await axios.put(`${API_URL}/degrees/${editingDegreeId}`,{fullName:fn,shortName:sn});togglePopup('popupFormDegreeEdit');fetchDataForTeacherManagement()}catch(e){alert('Lỗi update BC');console.error(e)}}

async function addFaculty(){const fn=document.getElementById('facultyFullName').value;const sn=document.getElementById('facultyShortName').value;const ds=document.getElementById('facultyDescription').value;if(!fn||!sn)return alert('Nhập đủ tên');try{await axios.post(`${API_URL}/faculties`,{fullName:fn,shortName:sn,description:ds});document.getElementById('facultyFullName').value='';document.getElementById('facultyShortName').value='';document.getElementById('facultyDescription').value='';togglePopup('popupFacultyFormAdd');fetchDataForTeacherManagement()}catch(e){alert('Lỗi thêm khoa');console.error(e)}}

async function deleteFaculty(id){if(!confirm('Xóa?'))return;try{await axios.delete(`${API_URL}/faculties/${id}`);fetchDataForTeacherManagement()}catch(e){alert('Lỗi xóa khoa');console.error(e)}}

function editFaculty(id){const f=faculties.find(fac=>fac._id===id);if(!f)return;editingFacultyId=id;document.getElementById('editFacultyFullName').value=f.fullName;document.getElementById('editFacultyShortName').value=f.shortName;document.getElementById('editFacultyDescription').value=f.description||'';togglePopup('popupFacultyFormEdit')}

async function updateFaculty(){const fn=document.getElementById('editFacultyFullName').value;const sn=document.getElementById('editFacultyShortName').value;const ds=document.getElementById('editFacultyDescription').value;try{await axios.put(`${API_URL}/faculties/${editingFacultyId}`,{fullName:fn,shortName:sn,description:ds});togglePopup('popupFacultyFormEdit');fetchDataForTeacherManagement()}catch(e){alert('Lỗi update khoa');console.error(e)}}

async function addTeacher(){const c=document.getElementById('teacherCode').value;const n=document.getElementById('teacherName').value;const bd=document.getElementById('teacherBirthDate').value;const em=document.getElementById('teacherEmail').value;const p=document.getElementById('teacherPhone').value;const fi=document.getElementById('teacherFaculty').value;const di=document.getElementById('teacherDegree').value;if(!c||!n||!bd||!fi||!di)return alert('Nhập đủ');try{await axios.post(`${API_URL}/teachers`,{code:c,name:n,birthDate:bd,email:em,phone:p,facultyId:fi,degreeId:di});document.getElementById('teacherCode').value='';document.getElementById('teacherName').value='';document.getElementById('teacherBirthDate').value='';document.getElementById('teacherEmail').value='';document.getElementById('teacherPhone').value='';document.getElementById('teacherFaculty').value='';document.getElementById('teacherDegree').value='';togglePopup('popupTeacherFormAdd');fetchDataForTeacherManagement()}catch(e){alert('Lỗi thêm GV: '+(e.response?.data?.message||e.message));console.error(e)}}

async function deleteTeacher(id){if(!confirm('Xóa?'))return;try{await axios.delete(`${API_URL}/teachers/${id}`);fetchDataForTeacherManagement()}catch(e){alert('Lỗi xóa GV');console.error(e)}}

function editTeacher(id){const t=teachers.find(tc=>tc._id===id);if(!t)return alert('Không tìm thấy GV');editingTeacherId=id;document.getElementById('editTeacherCode').value=t.code||'';document.getElementById('editTeacherName').value=t.name||'';document.getElementById('editTeacherBirthDate').value=t.birthDate?new Date(t.birthDate).toISOString().split('T')[0]:'';document.getElementById('editTeacherEmail').value=t.email||'';document.getElementById('editTeacherPhone').value=t.phone||'';document.getElementById('editTeacherFaculty').value=t.facultyId?._id||'';document.getElementById('editTeacherDegree').value=t.degreeId?._id||'';togglePopup('popupTeacherFormEdit')}

async function updateTeacher(){const c=document.getElementById('editTeacherCode').value;const n=document.getElementById('editTeacherName').value;const bd=document.getElementById('editTeacherBirthDate').value;const em=document.getElementById('editTeacherEmail').value;const p=document.getElementById('editTeacherPhone').value;const fi=document.getElementById('editTeacherFaculty').value;const di=document.getElementById('editTeacherDegree').value;if(!c||!n||!bd||!fi||!di)return alert('Nhập đủ');try{await axios.put(`${API_URL}/teachers/${editingTeacherId}`,{code:c,name:n,birthDate:bd,email:em,phone:p,facultyId:fi,degreeId:di});togglePopup('popupTeacherFormEdit');fetchDataForTeacherManagement()}catch(e){alert('Lỗi update GV: '+(e.response?.data?.message||e.message));console.error(e)}}

function updateTeacherStatsCount(){const ffe=document.getElementById('facultyFilter');const dfe=document.getElementById('degreeFilter');const tce=document.getElementById('teacherCount');const ftte=document.getElementById('filteredTeacherTable');if(!ffe||!dfe||!tce||!ftte)return;const sf=ffe.value;const sd=dfe.value;const filt=teachers.filter(t=>{const mf=!sf||t.facultyId?._id===sf;const md=!sd||t.degreeId?._id===sd;return mf&&md});tce.textContent=filt.length;ftte.innerHTML=filt.map((t,i)=>{let fb='';if(t.birthDate){const d=new Date(t.birthDate);fb=!isNaN(d)?d.toLocaleDateString('vi-VN'):''}
return `<tr><td class="border px-4 py-2">${i+1}</td><td class="border px-4 py-2">${t.code||''}</td><td class="border px-4 py-2">${t.name||''}</td><td class="border px-4 py-2">${fb}</td><td class="border px-4 py-2">${t.email||''}</td><td class="border px-4 py-2">${t.phone||''}</td><td class="border px-4 py-2">${t.facultyId?.fullName||''}</td><td class="border px-4 py-2">${t.degreeId?.fullName||''}</td></tr>`;}).join('')}

// --- Course Management Script ---
let courses = []; 
const CourseHandlers = {
    editingCourseId: null,
    load: async () => { try { const response = await axios.get(`${API_URL}/courses`); courses = response.data; const courseTableBody = document.getElementById('courseTable'); if (courseTableBody) { courseTableBody.innerHTML = courses.map((course, index) => `<tr><td class="border px-4 py-2">${index + 1}</td><td class="border px-4 py-2">${course.code}</td><td class="border px-4 py-2">${course.name}</td><td class="border px-4 py-2">${course.credits}</td><td class="border px-4 py-2">${course.coefficient}</td><td class="border px-4 py-2">${course.periods}</td><td class="border px-4 py-2 space-x-2"><button onclick="CourseHandlers.showEditForm('${course._id}')" class="text-blue-500 hover:underline">✏️</button><button onclick="CourseHandlers.delete('${course._id}')" class="text-red-500 hover:underline">🗑️</button></td></tr>`).join(''); } } catch (error) { console.error('Error loading courses:', error); alert('Không thể tải danh sách học phần.'); } },
    clearForm: () => { document.getElementById('courseCodeFormInput').value = ''; document.getElementById('courseNameFormInput').value = ''; document.getElementById('courseCreditsFormInput').value = ''; document.getElementById('courseCoefficientFormInput').value = '1'; document.getElementById('coursePeriodsFormInput').value = ''; document.getElementById('courseDescriptionFormInput').value = ''; document.getElementById('courseCodeFormInput').disabled = false; },
    showAddForm: () => { CourseHandlers.editingCourseId = null; CourseHandlers.clearForm(); document.getElementById('courseFormTitle').textContent = 'Thêm học phần mới'; document.getElementById('courseFormSubmitButton').textContent = 'Lưu lại'; handleShowSection('add-course-form'); },
    showEditForm: async (id) => { CourseHandlers.editingCourseId = id; try { const course = courses.find(c => c._id === id) || (await axios.get(`${API_URL}/courses/${id}`)).data; if (course) { document.getElementById('courseCodeFormInput').value = course.code; document.getElementById('courseCodeFormInput').disabled = true; document.getElementById('courseNameFormInput').value = course.name; document.getElementById('courseCreditsFormInput').value = course.credits; document.getElementById('courseCoefficientFormInput').value = course.coefficient; document.getElementById('coursePeriodsFormInput').value = course.periods; document.getElementById('courseDescriptionFormInput').value = course.description || ''; document.getElementById('courseFormTitle').textContent = 'Sửa học phần'; document.getElementById('courseFormSubmitButton').textContent = 'Cập nhật'; handleShowSection('add-course-form'); } else { alert('Không tìm thấy học phần để sửa.'); CourseHandlers.editingCourseId = null; } } catch (error) { console.error('Error fetching course for edit:', error); alert('Lỗi khi tải thông tin học phần để sửa.'); CourseHandlers.editingCourseId = null; } },
    hideForm: () => { CourseHandlers.clearForm(); CourseHandlers.editingCourseId = null; document.getElementById('courseCodeFormInput').disabled = false; handleShowSection('courses-section'); const targetMenuItem = document.querySelector(`.sidebar-item[onclick*="handleShowSection('courses')"]`); if(targetMenuItem) setActive(targetMenuItem, 'quanLyLopHocSubmenu'); },
    saveOrUpdate: async () => { if (CourseHandlers.editingCourseId) { await CourseHandlers.update(); } else { await CourseHandlers.add(); } },
    add: async () => { const code = document.getElementById('courseCodeFormInput').value; const name = document.getElementById('courseNameFormInput').value; const credits = document.getElementById('courseCreditsFormInput').value; const coefficient = document.getElementById('courseCoefficientFormInput').value; const periods = document.getElementById('coursePeriodsFormInput').value; const description = document.getElementById('courseDescriptionFormInput').value; if (!code || !name || !credits || !periods) return alert('Vui lòng điền đủ Mã HP, Tên HP, Số tín chỉ, Số tiết.'); try { await axios.post(`${API_URL}/courses`, { code, name, credits: parseInt(credits), coefficient: parseFloat(coefficient), periods: parseInt(periods), description }); CourseHandlers.hideForm(); CourseHandlers.load(); } catch (error) { console.error('Error adding course:', error); alert('Lỗi khi thêm học phần: ' + (error.response?.data?.message || error.message)); } },
    update: async () => { const name = document.getElementById('courseNameFormInput').value; const credits = document.getElementById('courseCreditsFormInput').value; const coefficient = document.getElementById('courseCoefficientFormInput').value; const periods = document.getElementById('coursePeriodsFormInput').value; const description = document.getElementById('courseDescriptionFormInput').value; const code = document.getElementById('courseCodeFormInput').value; if (!name || !credits || !periods) return alert('Vui lòng điền đủ Tên HP, Số tín chỉ, Số tiết.'); try { await axios.put(`${API_URL}/courses/${CourseHandlers.editingCourseId}`, { code, name, credits: parseInt(credits), coefficient: parseFloat(coefficient), periods: parseInt(periods), description }); CourseHandlers.hideForm(); CourseHandlers.load(); } catch (error) { console.error('Error updating course:', error); alert('Lỗi khi cập nhật học phần: ' + (error.response?.data?.message || error.message)); } },
    delete: async (id) => { if (!confirm('Bạn có chắc muốn xóa học phần này?')) return; try { await axios.delete(`${API_URL}/courses/${id}`); CourseHandlers.load(); } catch (error) { console.error('Error deleting course:', error); alert('Lỗi khi xóa học phần: ' + (error.response?.data?.message || error.message)); } }
};

// --- Semester Management Handlers ---
const SemesterHandlers = { 
    editingSemesterId: null, 
    semesters: [], 
    load: async () => { 
        try { 
            const response = await axios.get(`${API_URL}/semesters`); 
            SemesterHandlers.semesters = response.data; 
            const semesterTableBody = document.getElementById('semesterTable'); 
            if (semesterTableBody) { 
                semesterTableBody.innerHTML = SemesterHandlers.semesters.map((semester, index) => 
                    `<tr>
                        <td class="border px-4 py-2">${index + 1}</td>
                        <td class="border px-4 py-2">${semester.name}</td>
                        <td class="border px-4 py-2">${semester.year}</td>
                        <td class="border px-4 py-2">${new Date(semester.startDate).toLocaleDateString('vi-VN')}</td>
                        <td class="border px-4 py-2">${new Date(semester.endDate).toLocaleDateString('vi-VN')}</td>
                        <td class="border px-4 py-2 space-x-2">
                            <button onclick="SemesterHandlers.showEditForm('${semester._id}')" class="text-blue-500 hover:underline">✏️</button>
                            <button onclick="SemesterHandlers.delete('${semester._id}')" class="text-red-500 hover:underline">🗑️</button>
                        </td>
                    </tr>`
                ).join(''); 
            } 
        } catch (error) { 
            console.error('Error loading semesters:', error); 
            alert('Không thể tải danh sách kì học.'); 
        } 
    },
    clearForm: () => {
        document.getElementById('semesterNameFormInput').value = '';
        document.getElementById('semesterYearFormInput').value = '';
        document.getElementById('semesterStartDateFormInput').value = '';
        document.getElementById('semesterEndDateFormInput').value = '';
    },
    showAddForm: () => { 
        SemesterHandlers.editingSemesterId = null; 
        SemesterHandlers.clearForm();
        document.getElementById('semesterFormTitle').textContent = 'Thêm kì học'; 
        document.getElementById('semesterFormSubmitButton').textContent = 'Lưu'; 
        handleShowSection('add-semester-form');
    }, 
    hideForm: () => { 
        SemesterHandlers.clearForm();
        handleShowSection('semesters-section'); 
        const item = document.querySelector(`.sidebar-item[onclick*="handleShowSection('semesters')"]`); 
        if(item) setActive(item, 'quanLyLopHocSubmenu'); 
    }, 
    saveOrUpdate: async () => {
        if (SemesterHandlers.editingSemesterId) {
            await SemesterHandlers.update();
        } else {
            await SemesterHandlers.add();
        }
    },
    add: async () => {
        const name = document.getElementById('semesterNameFormInput').value;
        const year = document.getElementById('semesterYearFormInput').value;
        const startDate = document.getElementById('semesterStartDateFormInput').value;
        const endDate = document.getElementById('semesterEndDateFormInput').value;
        
        if (!name || !year || !startDate || !endDate) {
            return alert('Vui lòng điền đủ thông tin.');
        }
        
        try {
            await axios.post(`${API_URL}/semesters`, {
                name, year, startDate, endDate
            });
            SemesterHandlers.hideForm();
            SemesterHandlers.load();
        } catch (error) {
            console.error('Error adding semester:', error);
            alert('Lỗi khi thêm kì học: ' + (error.response?.data?.message || error.message));
        }
    },
    update: async () => {
        const name = document.getElementById('semesterNameFormInput').value;
        const year = document.getElementById('semesterYearFormInput').value;
        const startDate = document.getElementById('semesterStartDateFormInput').value;
        const endDate = document.getElementById('semesterEndDateFormInput').value;
        
        if (!name || !year || !startDate || !endDate) {
            return alert('Vui lòng điền đủ thông tin.');
        }
        
        try {
            await axios.put(`${API_URL}/semesters/${SemesterHandlers.editingSemesterId}`, {
                name, year, startDate, endDate
            });
            SemesterHandlers.hideForm();
            SemesterHandlers.load();
        } catch (error) {
            console.error('Error updating semester:', error);
            alert('Lỗi khi cập nhật kì học: ' + (error.response?.data?.message || error.message));
        }
    },
    showEditForm: async (id) => {
        SemesterHandlers.editingSemesterId = id;
        try {
            const semester = SemesterHandlers.semesters.find(s => s._id === id) || (await axios.get(`${API_URL}/semesters/${id}`)).data;
            if (semester) {
                document.getElementById('semesterNameFormInput').value = semester.name;
                document.getElementById('semesterYearFormInput').value = semester.year;
                document.getElementById('semesterStartDateFormInput').value = new Date(semester.startDate).toISOString().split('T')[0];
                document.getElementById('semesterEndDateFormInput').value = new Date(semester.endDate).toISOString().split('T')[0];
                document.getElementById('semesterFormTitle').textContent = 'Sửa kì học';
                document.getElementById('semesterFormSubmitButton').textContent = 'Cập nhật';
                handleShowSection('add-semester-form');
            }
        } catch (error) {
            console.error('Error fetching semester for edit:', error);
            alert('Lỗi khi tải thông tin kì học để sửa.');
        }
    },
    delete: async (id) => {
        if (!confirm('Bạn có chắc muốn xóa kì học này?')) return;
        try {
            await axios.delete(`${API_URL}/semesters/${id}`);
            SemesterHandlers.load();
        } catch (error) {
            console.error('Error deleting semester:', error);
            alert('Lỗi khi xóa kì học: ' + (error.response?.data?.message || error.message));
        }
    }
};

const ClassHandlers = { 
    editingClassId: null, 
    classes: [],
    load: async () => { 
        try {
            const [classesRes, coursesRes, semestersRes] = await Promise.all([
                axios.get(`${API_URL}/classsections`),
                axios.get(`${API_URL}/courses`),
                axios.get(`${API_URL}/semesters`)
            ]);
            
            ClassHandlers.classes = classesRes.data;
            console.log('ClassHandlers.load - Classes data:', ClassHandlers.classes);
            
            const classTableBody = document.getElementById('classTable');
            if (classTableBody) {
                classTableBody.innerHTML = ClassHandlers.classes.map((classSection, index) => {
                    console.log(`Class ${index}:`, classSection);
                    return `<tr>
                        <td class="border px-4 py-2">${index + 1}</td>
                        <td class="border px-4 py-2">${classSection.classCode || 'N/A'}</td>
                        <td class="border px-4 py-2">${classSection.className || 'N/A'}</td>
                        <td class="border px-4 py-2">${classSection.courseId?.name || ''} (${classSection.courseId?.code || ''})</td>
                        <td class="border px-4 py-2">${classSection.semesterId?.name || ''} ${classSection.semesterId?.year || ''}</td>
                        <td class="border px-4 py-2">${classSection.studentCount || 0}</td>
                        <td class="border px-4 py-2 space-x-2">
                            <button onclick="ClassHandlers.showEditForm('${classSection._id}')" class="text-blue-500 hover:underline">✏️</button>
                            <button onclick="ClassHandlers.delete('${classSection._id}')" class="text-red-500 hover:underline">🗑️</button>
                        </td>
                    </tr>`;
                }).join('');
            }
            
            // Load dropdowns
            const classFilterCourse = document.getElementById('classFilterCourse');
            const classCourseFormInput = document.getElementById('classCourseFormInput');
            const classFilterSemester = document.getElementById('classFilterSemester');
            const classSemesterFormInput = document.getElementById('classSemesterFormInput');
            
            if (classFilterCourse) {
                classFilterCourse.innerHTML = '<option value="">Tất cả HP</option>' + 
                    coursesRes.data.map(c => `<option value="${c._id}">${c.name} (${c.code})</option>`).join('');
            }
            if (classCourseFormInput) {
                classCourseFormInput.innerHTML = '<option value="">Chọn học phần</option>' + 
                    coursesRes.data.map(c => `<option value="${c._id}">${c.name} (${c.code})</option>`).join('');
            }
            if (classFilterSemester) {
                classFilterSemester.innerHTML = '<option value="">Tất cả Kì</option>' + 
                    semestersRes.data.map(s => `<option value="${s._id}">${s.name} (${s.year})</option>`).join('');
            }
            if (classSemesterFormInput) {
                classSemesterFormInput.innerHTML = '<option value="">Chọn kì học</option>' + 
                    semestersRes.data.map(s => `<option value="${s._id}">${s.name} (${s.year})</option>`).join('');
            }
        } catch (error) {
            console.error("Error loading classes:", error);
            alert("Không thể tải danh sách lớp học phần.");
        }
    },
    clearForm: () => {
        document.getElementById('classCodeFormInput').value = '';
        document.getElementById('classNameFormInput').value = '';
        document.getElementById('classCourseFormInput').value = '';
        document.getElementById('classSemesterFormInput').value = '';
        document.getElementById('classStudentCountFormInput').value = '';
    },
    showAddForm: () => { 
        ClassHandlers.editingClassId = null; 
        ClassHandlers.clearForm();
        document.getElementById('classFormTitle').textContent = 'Thêm Lớp học phần'; 
        document.getElementById('classFormSubmitButton').textContent = 'Lưu'; 
        handleShowSection('add-class-form');
    }, 
    hideForm: () => { 
        ClassHandlers.clearForm();
        handleShowSection('classes-section'); 
        const item = document.querySelector(`.sidebar-item[onclick*="handleShowSection('classes')"]`); 
        if(item) setActive(item, 'quanLyLopHocSubmenu');
    },
    
    // Bulk Create Methods
    showBulkCreateForm: () => {
        ClassHandlers.loadBulkCreateDropdowns();
        ClassHandlers.clearBulkCreateForm();
        ClassHandlers.updateBulkPreview();
        handleShowSection('bulk-create-classes-form');
    },
    
    hideBulkCreateForm: () => {
        ClassHandlers.clearBulkCreateForm();
        handleShowSection('classes-section');
        const item = document.querySelector(`.sidebar-item[onclick*="handleShowSection('classes')"]`);
        if(item) setActive(item, 'quanLyLopHocSubmenu');
    },
    
    loadBulkCreateDropdowns: async () => {
        try {
            const [coursesRes, semestersRes] = await Promise.all([
                axios.get(`${API_URL}/courses`),
                axios.get(`${API_URL}/semesters`)
            ]);
            
            const courseSelect = document.getElementById('bulkClassCourseFormInput');
            const semesterSelect = document.getElementById('bulkClassSemesterFormInput');
            
            if (courseSelect) {
                courseSelect.innerHTML = '<option value="">Chọn học phần</option>' + 
                    coursesRes.data.map(c => `<option value="${c._id}">${c.name} (${c.code})</option>`).join('');
            }
            
            if (semesterSelect) {
                semesterSelect.innerHTML = '<option value="">Chọn kì học</option>' + 
                    semestersRes.data.map(s => `<option value="${s._id}">${s.name} (${s.year})</option>`).join('');
            }
        } catch (error) {
            console.error('Error loading bulk create dropdowns:', error);
        }
    },
    
    clearBulkCreateForm: () => {
        document.getElementById('bulkClassCourseFormInput').value = '';
        document.getElementById('bulkClassSemesterFormInput').value = '';
        document.getElementById('bulkClassStudentCountFormInput').value = '';
        document.getElementById('bulkClassCountInput').value = '5';
        document.getElementById('bulkClassCodeFormatInput').value = 'N{##}';
        document.getElementById('bulkClassNameFormatInput').value = 'same';
        document.getElementById('customCodeFormatInput').value = '';
        document.getElementById('customNameFormatInput').value = '';
        document.getElementById('customCodeFormatDiv').classList.add('hidden');
        document.getElementById('customNameFormatDiv').classList.add('hidden');
    },
    
    updateBulkPreview: () => {
        const count = parseInt(document.getElementById('bulkClassCountInput').value) || 5;
        const codeFormat = document.getElementById('bulkClassCodeFormatInput').value;
        const nameFormat = document.getElementById('bulkClassNameFormatInput').value;
        const customCodeFormat = document.getElementById('customCodeFormatInput').value;
        const customNameFormat = document.getElementById('customNameFormatInput').value;
        
        // Show/hide custom format inputs
        document.getElementById('customCodeFormatDiv').classList.toggle('hidden', codeFormat !== 'custom');
        document.getElementById('customNameFormatDiv').classList.toggle('hidden', nameFormat !== 'custom');
        
        // Update button text
        document.getElementById('bulkCreateCount').textContent = count;
        
        // Generate preview
        const preview = ClassHandlers.generateClassPreview(count, codeFormat, nameFormat, customCodeFormat, customNameFormat);
        document.getElementById('bulkCreatePreview').innerHTML = preview;
    },
    
    generateClassPreview: (count, codeFormat, nameFormat, customCodeFormat, customNameFormat) => {
        const classes = [];
        
        for (let i = 1; i <= count; i++) {
            let classCode = '';
            let className = '';
            
            // Generate class code
            if (codeFormat === 'custom' && customCodeFormat) {
                classCode = customCodeFormat
                    .replace('{##}', i.toString().padStart(2, '0'))
                    .replace('{#}', i.toString());
            } else {
                classCode = codeFormat
                    .replace('{##}', i.toString().padStart(2, '0'))
                    .replace('{#}', i.toString());
            }
            
            // Generate class name
            if (nameFormat === 'same') {
                className = classCode;
            } else if (nameFormat === 'course_code') {
                const courseSelect = document.getElementById('bulkClassCourseFormInput');
                const selectedOption = courseSelect.options[courseSelect.selectedIndex];
                if (selectedOption && selectedOption.textContent.includes('(')) {
                    const courseCode = selectedOption.textContent.match(/\(([^)]+)\)/)?.[1] || 'HP';
                    className = `${courseCode}_${i.toString().padStart(2, '0')}`;
                } else {
                    className = `HP_${i.toString().padStart(2, '0')}`;
                }
            } else if (nameFormat === 'custom' && customNameFormat) {
                className = customNameFormat
                    .replace('{##}', i.toString().padStart(2, '0'))
                    .replace('{#}', i.toString());
            } else {
                className = classCode;
            }
            
            classes.push({ code: classCode, name: className });
        }
        
        if (classes.length === 0) {
            return '<p class="text-gray-500">Chưa có lớp nào để hiển thị</p>';
        }
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                ${classes.map((cls, index) => `
                    <div class="bg-white p-3 rounded border">
                        <div class="font-semibold text-blue-600">${cls.code}</div>
                        <div class="text-sm text-gray-600">${cls.name}</div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-3 text-sm text-gray-600">
                Sẽ tạo <strong>${classes.length}</strong> lớp học phần
            </div>
        `;
    },
    
    bulkCreate: async () => {
        const courseId = document.getElementById('bulkClassCourseFormInput').value;
        const semesterId = document.getElementById('bulkClassSemesterFormInput').value;
        const studentCount = document.getElementById('bulkClassStudentCountFormInput').value;
        const count = parseInt(document.getElementById('bulkClassCountInput').value) || 5;
        const codeFormat = document.getElementById('bulkClassCodeFormatInput').value;
        const nameFormat = document.getElementById('bulkClassNameFormatInput').value;
        const customCodeFormat = document.getElementById('customCodeFormatInput').value;
        const customNameFormat = document.getElementById('customNameFormatInput').value;
        
        if (!courseId || !semesterId) {
            return alert('Vui lòng chọn học phần và kì học.');
        }
        
        if (count < 1 || count > 50) {
            return alert('Số lượng lớp phải từ 1 đến 50.');
        }
        
        const confirmMsg = `Bạn có chắc muốn tạo ${count} lớp học phần?`;
        if (!confirm(confirmMsg)) return;
        
        try {
            const promises = [];
            
            for (let i = 1; i <= count; i++) {
                let classCode = '';
                let className = '';
                
                // Generate class code
                if (codeFormat === 'custom' && customCodeFormat) {
                    classCode = customCodeFormat
                        .replace('{##}', i.toString().padStart(2, '0'))
                        .replace('{#}', i.toString());
                } else {
                    classCode = codeFormat
                        .replace('{##}', i.toString().padStart(2, '0'))
                        .replace('{#}', i.toString());
                }
                
                // Generate class name
                if (nameFormat === 'same') {
                    className = classCode;
                } else if (nameFormat === 'course_code') {
                    const courseSelect = document.getElementById('bulkClassCourseFormInput');
                    const selectedOption = courseSelect.options[courseSelect.selectedIndex];
                    if (selectedOption && selectedOption.textContent.includes('(')) {
                        const courseCode = selectedOption.textContent.match(/\(([^)]+)\)/)?.[1] || 'HP';
                        className = `${courseCode}_${i.toString().padStart(2, '0')}`;
                    } else {
                        className = `HP_${i.toString().padStart(2, '0')}`;
                    }
                } else if (nameFormat === 'custom' && customNameFormat) {
                    className = customNameFormat
                        .replace('{##}', i.toString().padStart(2, '0'))
                        .replace('{#}', i.toString());
                } else {
                    className = classCode;
                }
                
                promises.push(
                    axios.post(`${API_URL}/classsections`, {
                        classCode,
                        className,
                        courseId,
                        semesterId,
                        studentCount: studentCount ? parseInt(studentCount) : 0
                    })
                );
            }
            
            await Promise.all(promises);
            
            alert(`Đã tạo thành công ${count} lớp học phần!`);
            ClassHandlers.hideBulkCreateForm();
            ClassHandlers.load();
            
        } catch (error) {
            console.error('Error bulk creating classes:', error);
            alert('Lỗi khi tạo lớp hàng loạt: ' + (error.response?.data?.message || error.message));
        }
    }, 
    saveOrUpdate: async () => {
        if (ClassHandlers.editingClassId) {
            await ClassHandlers.update();
        } else {
            await ClassHandlers.add();
        }
    },
    add: async () => {
        const classCode = document.getElementById('classCodeFormInput').value;
        const className = document.getElementById('classNameFormInput').value;
        const courseId = document.getElementById('classCourseFormInput').value;
        const semesterId = document.getElementById('classSemesterFormInput').value;
        const studentCount = document.getElementById('classStudentCountFormInput').value;
        
        // Debug logging
        console.log('ClassHandlers.add - Form values:', {
            classCode, className, courseId, semesterId, studentCount
        });
        
        if (!classCode || !className || !courseId || !semesterId) {
            return alert('Vui lòng điền đủ thông tin bắt buộc.');
        }
        
        try {
            const payload = {
                classCode, 
                className, 
                courseId, 
                semesterId, 
                studentCount: studentCount ? parseInt(studentCount) : 0
            };
            console.log('ClassHandlers.add - Sending payload:', payload);
            
            const response = await axios.post(`${API_URL}/classsections`, payload);
            console.log('ClassHandlers.add - Response:', response.data);
            
            ClassHandlers.hideForm();
            ClassHandlers.load();
        } catch (error) {
            console.error('Error adding class:', error);
            console.error('Error details:', error.response?.data);
            alert('Lỗi khi thêm lớp học phần: ' + (error.response?.data?.message || error.message));
        }
    },
    update: async () => {
        const classCode = document.getElementById('classCodeFormInput').value;
        const className = document.getElementById('classNameFormInput').value;
        const courseId = document.getElementById('classCourseFormInput').value;
        const semesterId = document.getElementById('classSemesterFormInput').value;
        const studentCount = document.getElementById('classStudentCountFormInput').value;
        
        if (!classCode || !className || !courseId || !semesterId) {
            return alert('Vui lòng điền đủ thông tin bắt buộc.');
        }
        
        try {
            await axios.put(`${API_URL}/classsections/${ClassHandlers.editingClassId}`, {
                classCode, className, courseId, semesterId, 
                studentCount: studentCount ? parseInt(studentCount) : 0
            });
            ClassHandlers.hideForm();
            ClassHandlers.load();
        } catch (error) {
            console.error('Error updating class:', error);
            alert('Lỗi khi cập nhật lớp học phần: ' + (error.response?.data?.message || error.message));
        }
    },
    showEditForm: async (id) => {
        ClassHandlers.editingClassId = id;
        try {
            const classSection = ClassHandlers.classes.find(c => c._id === id) || (await axios.get(`${API_URL}/classsections/${id}`)).data;
            if (classSection) {
                document.getElementById('classCodeFormInput').value = classSection.classCode;
                document.getElementById('classNameFormInput').value = classSection.className;
                document.getElementById('classCourseFormInput').value = classSection.courseId?._id || '';
                document.getElementById('classSemesterFormInput').value = classSection.semesterId?._id || '';
                document.getElementById('classStudentCountFormInput').value = classSection.studentCount || '';
                document.getElementById('classFormTitle').textContent = 'Sửa lớp học phần';
                document.getElementById('classFormSubmitButton').textContent = 'Cập nhật';
                handleShowSection('add-class-form');
            }
        } catch (error) {
            console.error('Error fetching class for edit:', error);
            alert('Lỗi khi tải thông tin lớp học phần để sửa.');
        }
    },
    delete: async (id) => {
        if (!confirm('Bạn có chắc muốn xóa lớp học phần này?')) return;
        try {
            await axios.delete(`${API_URL}/classsections/${id}`);
            ClassHandlers.load();
        } catch (error) {
            console.error('Error deleting class:', error);
            alert('Lỗi khi xóa lớp học phần: ' + (error.response?.data?.message || error.message));
        }
    }
};

const AssignmentHandlers = { 
    assignments: [],
    teachers: [],
    classes: [],
    semesters: [],
    courses: [],
    pendingAssignments: new Map(), // Store pending assignments before save
    
    load: async () => { 
        try {
            const [assignmentsRes, teachersRes, classesRes, semestersRes, coursesRes] = await Promise.all([
                axios.get(`${API_URL}/assignments`),
                axios.get(`${API_URL}/teachers`),
                axios.get(`${API_URL}/classsections`),
                axios.get(`${API_URL}/semesters`),
                axios.get(`${API_URL}/courses`)
            ]);
            
            AssignmentHandlers.assignments = assignmentsRes.data;
            AssignmentHandlers.teachers = teachersRes.data;
            AssignmentHandlers.classes = classesRes.data;
            AssignmentHandlers.semesters = semestersRes.data;
            AssignmentHandlers.courses = coursesRes.data;
            
            // Load filter dropdowns
            AssignmentHandlers.loadFilters();
            
            // Load class assignment table
            AssignmentHandlers.loadClassAssignmentTable();
            
        } catch (error) {
            console.error("Error loading assignments:", error);
            alert("Không thể tải danh sách phân công.");
        }
    },
    
    loadFilters: () => {
        const semesterFilter = document.getElementById('assignmentSemesterFilter');
        const courseFilter = document.getElementById('assignmentCourseFilter');
        
        if (semesterFilter) {
            semesterFilter.innerHTML = '<option value="">Tất cả kì học</option>' + 
                AssignmentHandlers.semesters.map(s => `<option value="${s._id}">${s.name} (${s.year})</option>`).join('');
        }
        
        if (courseFilter) {
            courseFilter.innerHTML = '<option value="">Tất cả học phần</option>' + 
                AssignmentHandlers.courses.map(c => `<option value="${c._id}">${c.name} (${c.code})</option>`).join('');
        }
    },
    
    loadClassAssignmentTable: () => {
        const tableBody = document.getElementById('classAssignmentTable');
        if (!tableBody) return;
        
        // Apply filters
        let filteredClasses = AssignmentHandlers.getFilteredClasses();
        
        tableBody.innerHTML = filteredClasses.map((classItem, index) => {
            const existingAssignment = AssignmentHandlers.assignments.find(a => a.classSectionId?._id === classItem._id);
            const pendingAssignment = AssignmentHandlers.pendingAssignments.get(classItem._id);
            
            const currentTeacherId = pendingAssignment?.teacherId || existingAssignment?.teacherId?._id || '';
            const currentNotes = pendingAssignment?.notes || existingAssignment?.notes || '';
            
            const teacherDropdown = AssignmentHandlers.createTeacherDropdown(classItem._id, currentTeacherId);
            const isAssigned = currentTeacherId !== '';
            
            return `<tr class="${isAssigned ? 'bg-green-50' : 'bg-red-50'}">
                <td class="border px-4 py-2">${index + 1}</td>
                <td class="border px-4 py-2">${classItem.classCode || ''}</td>
                <td class="border px-4 py-2">${classItem.className || ''}</td>
                <td class="border px-4 py-2">${classItem.courseId?.name || ''} (${classItem.courseId?.code || ''})</td>
                <td class="border px-4 py-2">${classItem.semesterId?.name || ''} ${classItem.semesterId?.year || ''}</td>
                <td class="border px-4 py-2">${classItem.studentCount || 0}</td>
                <td class="border px-4 py-2">${teacherDropdown}</td>
                <td class="border px-4 py-2">
                    <input type="text" value="${currentNotes}" 
                           onchange="AssignmentHandlers.updatePendingNotes('${classItem._id}', this.value)"
                           class="w-full p-1 border rounded text-sm" placeholder="Ghi chú...">
                </td>
                <td class="border px-4 py-2">
                    ${existingAssignment ? 
                        `<button onclick="AssignmentHandlers.deleteAssignment('${existingAssignment._id}')" 
                                class="text-red-500 hover:underline text-sm">🗑️ Xóa</button>` : 
                        `<span class="text-gray-400 text-sm">Chưa lưu</span>`
                    }
                </td>
            </tr>`;
        }).join('');
        
        AssignmentHandlers.updateSummary(filteredClasses);
    },
    getFilteredClasses: () => {
        const semesterFilter = document.getElementById('assignmentSemesterFilter')?.value || '';
        const courseFilter = document.getElementById('assignmentCourseFilter')?.value || '';
        const statusFilter = document.getElementById('assignmentStatusFilter')?.value || '';
        
        let filtered = AssignmentHandlers.classes.filter(c => {
            const matchSemester = !semesterFilter || c.semesterId?._id === semesterFilter;
            const matchCourse = !courseFilter || c.courseId?._id === courseFilter;
            
            let matchStatus = true;
            if (statusFilter) {
                const hasAssignment = AssignmentHandlers.assignments.some(a => a.classSectionId?._id === c._id) ||
                                     AssignmentHandlers.pendingAssignments.has(c._id);
                matchStatus = (statusFilter === 'assigned' && hasAssignment) || 
                             (statusFilter === 'unassigned' && !hasAssignment);
            }
            
            return matchSemester && matchCourse && matchStatus;
        });
        
        return filtered;
    },
    
    createTeacherDropdown: (classId, selectedTeacherId) => {
        const options = '<option value="">-- Chọn giáo viên --</option>' + 
            AssignmentHandlers.teachers.map(t => 
                `<option value="${t._id}" ${t._id === selectedTeacherId ? 'selected' : ''}>
                    ${t.name} (${t.code})
                </option>`
            ).join('');
        
        return `<select onchange="AssignmentHandlers.updatePendingAssignment('${classId}', this.value)"
                        class="w-full p-1 border rounded text-sm">
                    ${options}
                </select>`;
    },
    
    updatePendingAssignment: (classId, teacherId) => {
        if (teacherId) {
            const existing = AssignmentHandlers.pendingAssignments.get(classId) || {};
            AssignmentHandlers.pendingAssignments.set(classId, {
                ...existing,
                teacherId,
                classSectionId: classId
            });
        } else {
            AssignmentHandlers.pendingAssignments.delete(classId);
        }
        
        // Refresh table to update colors and status
        AssignmentHandlers.loadClassAssignmentTable();
    },
    
    updatePendingNotes: (classId, notes) => {
        const existing = AssignmentHandlers.pendingAssignments.get(classId) || {};
        if (existing.teacherId || notes.trim()) {
            AssignmentHandlers.pendingAssignments.set(classId, {
                ...existing,
                notes: notes.trim(),
                classSectionId: classId
            });
        }
    },
    
    filterClasses: () => {
        AssignmentHandlers.loadClassAssignmentTable();
    },
    
    updateSummary: (filteredClasses) => {
        const totalClasses = filteredClasses.length;
        const assignedClasses = filteredClasses.filter(c => {
            return AssignmentHandlers.assignments.some(a => a.classSectionId?._id === c._id) ||
                   AssignmentHandlers.pendingAssignments.has(c._id);
        }).length;
        const unassignedClasses = totalClasses - assignedClasses;
        
        const totalEl = document.getElementById('totalClassesCount');
        const assignedEl = document.getElementById('assignedClassesCount');
        const unassignedEl = document.getElementById('unassignedClassesCount');
        
        if (totalEl) totalEl.textContent = totalClasses;
        if (assignedEl) assignedEl.textContent = assignedClasses;
        if (unassignedEl) unassignedEl.textContent = unassignedClasses;
    },
    
    saveAllAssignments: async () => {
        if (AssignmentHandlers.pendingAssignments.size === 0) {
            return alert('Không có phân công nào để lưu.');
        }
        
        const confirmMsg = `Bạn có muốn lưu ${AssignmentHandlers.pendingAssignments.size} phân công?`;
        if (!confirm(confirmMsg)) return;
        
        try {
            const promises = [];
            
            for (const [classId, assignment] of AssignmentHandlers.pendingAssignments) {
                if (assignment.teacherId) {
                    // Check if assignment already exists
                    const existingAssignment = AssignmentHandlers.assignments.find(a => a.classSectionId?._id === classId);
                    
                    if (existingAssignment) {
                        // Update existing
                        promises.push(
                            axios.put(`${API_URL}/assignments/${existingAssignment._id}`, {
                                teacherId: assignment.teacherId,
                                classSectionId: assignment.classSectionId,
                                notes: assignment.notes || ''
                            })
                        );
                    } else {
                        // Create new
                        promises.push(
                            axios.post(`${API_URL}/assignments`, {
                                teacherId: assignment.teacherId,
                                classSectionId: assignment.classSectionId,
                                notes: assignment.notes || ''
                            })
                        );
                    }
                }
            }
            
            await Promise.all(promises);
            
            // Clear pending assignments and reload
            AssignmentHandlers.pendingAssignments.clear();
            await AssignmentHandlers.load();
            
            alert('Đã lưu thành công tất cả phân công!');
            
        } catch (error) {
            console.error('Error saving assignments:', error);
            alert('Lỗi khi lưu phân công: ' + (error.response?.data?.message || error.message));
        }
    },
    
    deleteAssignment: async (id) => {
        if (!confirm('Bạn có chắc muốn xóa phân công này?')) return;
        try {
            await axios.delete(`${API_URL}/assignments/${id}`);
            await AssignmentHandlers.load();
            alert('Đã xóa phân công thành công!');
        } catch (error) {
            console.error('Error deleting assignment:', error);
            alert('Lỗi khi xóa phân công: ' + (error.response?.data?.message || error.message));
        }
    }
};

const StatisticsLopMoHandlers = { 
    chartInstance: null,
    load: async () => { 
        try {
            const [semestersRes, coursesRes, classesRes] = await Promise.all([
                axios.get(`${API_URL}/semesters`),
                axios.get(`${API_URL}/courses`),
                axios.get(`${API_URL}/classsections`)
            ]);
            
            // Load filter dropdowns
            const yearFilter = document.getElementById('statsLopMoYearFilter');
            const semesterFilter = document.getElementById('statsLopMoSemesterFilter');
            const courseFilter = document.getElementById('statsLopMoCourseFilter');
            
            if (yearFilter) {
                const years = [...new Set(semestersRes.data.map(s => s.year))].sort();
                yearFilter.innerHTML = '<option value="">Tất cả năm</option>' + 
                    years.map(y => `<option value="${y}">${y}</option>`).join('');
            }
            
            if (semesterFilter) {
                semesterFilter.innerHTML = '<option value="">Tất cả kì</option>' + 
                    semestersRes.data.map(s => `<option value="${s._id}">${s.name} (${s.year})</option>`).join('');
            }
            
            if (courseFilter) {
                courseFilter.innerHTML = '<option value="">Tất cả học phần</option>' + 
                    coursesRes.data.map(c => `<option value="${c._id}">${c.name} (${c.code})</option>`).join('');
            }
            
            // Load initial statistics
            StatisticsLopMoHandlers.updateStatistics();
            
        } catch (error) {
            console.error("Error loading statistics filters:", error);
            alert("Không thể tải bộ lọc thống kê.");
        }
    },
    updateStatistics: async () => {
        try {
            const year = document.getElementById('statsLopMoYearFilter')?.value || '';
            const semesterId = document.getElementById('statsLopMoSemesterFilter')?.value || '';
            const courseId = document.getElementById('statsLopMoCourseFilter')?.value || '';
            
            // Try dedicated statistics endpoint first
            let url = `${API_URL}/classsections/statistics?`;
            if (year) url += `year=${year}&`;
            if (semesterId) url += `semesterId=${semesterId}&`;
            if (courseId) url += `courseId=${courseId}&`;
            
            let stats;
            try {
                const statsRes = await axios.get(url);
                stats = statsRes.data;
            } catch (apiError) {
                console.warn("Statistics API not available, calculating manually:", apiError);
                // Fallback: Calculate statistics manually from existing data
                stats = await StatisticsLopMoHandlers.calculateStatisticsManually(year, semesterId, courseId);
            }
            
            // Update summary cards
            const totalClassesEl = document.getElementById('totalClasses');
            const totalCoursesEl = document.getElementById('totalCourses');
            const totalStudentsEl = document.getElementById('totalStudents');
            
            if (totalClassesEl) totalClassesEl.textContent = stats.totalClasses || 0;
            if (totalCoursesEl) totalCoursesEl.textContent = stats.totalCourses || 0;
            if (totalStudentsEl) totalStudentsEl.textContent = stats.totalStudents || 0;
            
            // Update detail table
            const detailTableEl = document.getElementById('statsDetailTable');
            if (detailTableEl && stats.details) {
                detailTableEl.innerHTML = stats.details.map((item, index) => 
                    `<tr>
                        <td class="border px-4 py-2">${index + 1}</td>
                        <td class="border px-4 py-2">${item.courseName} (${item.courseCode})</td>
                        <td class="border px-4 py-2">${item.classCount}</td>
                        <td class="border px-4 py-2">${item.totalStudents}</td>
                        <td class="border px-4 py-2">${item.semesterName} ${item.year}</td>
                    </tr>`
                ).join('');
            }
            
            // Update chart
            StatisticsLopMoHandlers.updateChart(stats.chartData);
            
        } catch (error) {
            console.error("Error updating statistics:", error);
            alert("Không thể tải thống kê: " + error.message);
        }
    },
    calculateStatisticsManually: async (year, semesterId, courseId) => {
        try {
            // Get all necessary data
            const [classesRes, coursesRes, semestersRes] = await Promise.all([
                axios.get(`${API_URL}/classsections`),
                axios.get(`${API_URL}/courses`),
                axios.get(`${API_URL}/semesters`)
            ]);
            
            let classes = classesRes.data;
            const courses = coursesRes.data;
            const semesters = semestersRes.data;
            
            // Apply filters
            if (year) {
                classes = classes.filter(c => c.semesterId?.year == year);
            }
            if (semesterId) {
                classes = classes.filter(c => c.semesterId?._id === semesterId);
            }
            if (courseId) {
                classes = classes.filter(c => c.courseId?._id === courseId);
            }
            
            // Calculate totals
            const totalClasses = classes.length;
            const uniqueCourses = [...new Set(classes.map(c => c.courseId?._id).filter(Boolean))];
            const totalCourses = uniqueCourses.length;
            const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
            
            // Group by course for details
            const courseStats = {};
            classes.forEach(c => {
                const courseKey = c.courseId?._id;
                if (!courseKey) return;
                
                if (!courseStats[courseKey]) {
                    courseStats[courseKey] = {
                        courseName: c.courseId?.name || '',
                        courseCode: c.courseId?.code || '',
                        classCount: 0,
                        totalStudents: 0,
                        semesterName: c.semesterId?.name || '',
                        year: c.semesterId?.year || ''
                    };
                }
                
                courseStats[courseKey].classCount++;
                courseStats[courseKey].totalStudents += (c.studentCount || 0);
            });
            
            const details = Object.values(courseStats);
            
            // Create chart data
            const chartData = {
                labels: details.map(d => `${d.courseName} (${d.courseCode})`),
                data: details.map(d => d.classCount)
            };
            
            return {
                totalClasses,
                totalCourses,
                totalStudents,
                details,
                chartData
            };
            
        } catch (error) {
            console.error("Error calculating statistics manually:", error);
            return {
                totalClasses: 0,
                totalCourses: 0,
                totalStudents: 0,
                details: [],
                chartData: { labels: [], data: [] }
            };
        }
    },
    updateChart: (chartData) => {
        const chartCanvas = document.getElementById('statsChart');
        if (!chartCanvas || !chartData) return;
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded, displaying text instead');
            chartCanvas.style.display = 'none';
            let textDiv = document.getElementById('statsChartText');
            if (!textDiv) {
                textDiv = document.createElement('div');
                textDiv.id = 'statsChartText';
                textDiv.className = 'p-4 text-center';
                chartCanvas.parentNode.appendChild(textDiv);
            }
            
            const labels = chartData.labels || [];
            const data = chartData.data || [];
            let chartText = '<h3 class="font-bold mb-4">Thống kê số lớp mở theo học phần</h3>';
            
            if (labels.length > 0) {
                chartText += '<ul class="text-left">';
                labels.forEach((label, index) => {
                    chartText += `<li>${label}: ${data[index] || 0} lớp</li>`;
                });
                chartText += '</ul>';
            } else {
                chartText += '<p>Chưa có dữ liệu để hiển thị</p>';
            }
            
            textDiv.innerHTML = chartText;
            return;
        }
        
        const ctx = chartCanvas.getContext('2d');
        
        // Destroy existing chart
        if (StatisticsLopMoHandlers.chartInstance) {
            StatisticsLopMoHandlers.chartInstance.destroy();
        }
        
        // Create new chart
        try {
            StatisticsLopMoHandlers.chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.labels || [],
                    datasets: [{
                        label: 'Số lớp mở',
                        data: chartData.data || [],
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Thống kê số lớp mở theo học phần'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating chart:', error);
            chartCanvas.style.display = 'none';
        }
    },
    filterStatistics: () => {
        StatisticsLopMoHandlers.updateStatistics();
    }
};

document.addEventListener('DOMContentLoaded', () => {
  const qlGiaoVienSubmenu = document.getElementById('quanLyGiaoVienSubmenu');
  if (qlGiaoVienSubmenu) {
      const qlGiaoVienParentItem = qlGiaoVienSubmenu.previousElementSibling;
      if (qlGiaoVienParentItem) toggleSubmenu('quanLyGiaoVienSubmenu', qlGiaoVienParentItem); 
      const defaultActiveTeacherItem = qlGiaoVienSubmenu.querySelector('a[onclick*="handleShowSection(\'teachers\')"]');
      if (defaultActiveTeacherItem) { setActive(defaultActiveTeacherItem, 'quanLyGiaoVienSubmenu'); handleShowSection('teachers'); } 
      else { handleShowSection('welcome'); }
  } else { handleShowSection('welcome'); }
  
  const facultyFilterEl = document.getElementById('facultyFilter'); 
  const degreeFilterEl = document.getElementById('degreeFilter');
  if(facultyFilterEl) facultyFilterEl.addEventListener('change', updateTeacherStatsCount);
  if(degreeFilterEl) degreeFilterEl.addEventListener('change', updateTeacherStatsCount);
}); 

// === SALARY MANAGEMENT HANDLERS ===
const SalaryHandlers = {
    editingSalaryRateId: null,
    editingTeacherCoefficientId: null,
    editingClassCoefficientId: null,

    // === SALARY RATES ===
    loadSalaryRates: async () => {
        try {
            const response = await axios.get(`${API_URL}/salary/rates`);
            const rates = response.data;
            
            const tableBody = document.getElementById('salaryRateTable');
            if (tableBody) {
                tableBody.innerHTML = rates.map((rate, index) =>
                    `<tr>
                        <td class="border px-4 py-2">${index + 1}</td>
                        <td class="border px-4 py-2">${rate.name}</td>
                        <td class="border px-4 py-2">${rate.ratePerPeriod.toLocaleString('vi-VN')} VNĐ</td>
                        <td class="border px-4 py-2">${rate.description || ''}</td>
                        <td class="border px-4 py-2">
                            <span class="px-2 py-1 rounded text-sm ${rate.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                ${rate.isActive ? 'Đang áp dụng' : 'Không áp dụng'}
                            </span>
                        </td>
                        <td class="border px-4 py-2 space-x-2">
                            <button onclick="SalaryHandlers.showEditSalaryRateForm('${rate._id}')" class="text-blue-500 hover:underline">✏️</button>
                            <button onclick="SalaryHandlers.deleteSalaryRate('${rate._id}')" class="text-red-500 hover:underline">🗑️</button>
                            ${!rate.isActive ? `<button onclick="SalaryHandlers.activateSalaryRate('${rate._id}')" class="text-green-500 hover:underline">✅ Kích hoạt</button>` : ''}
                        </td>
                    </tr>`
                ).join('');
            }
        } catch (error) {
            console.error('Error loading salary rates:', error);
            alert('Không thể tải danh sách định mức tiền/tiết.');
        }
    },

    showAddRateForm: () => {
        SalaryHandlers.editingSalaryRateId = null;
        document.getElementById('salaryRateName').value = '';
        document.getElementById('salaryRateAmount').value = '';
        document.getElementById('salaryRateDescription').value = '';
        document.getElementById('popupSalaryRateAdd').classList.remove('hidden');
    },

    showEditSalaryRateForm: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/salary/rates`);
            const rate = response.data.find(r => r._id === id);
            
            if (rate) {
                SalaryHandlers.editingSalaryRateId = id;
                document.getElementById('editSalaryRateName').value = rate.name;
                document.getElementById('editSalaryRateAmount').value = rate.ratePerPeriod;
                document.getElementById('editSalaryRateDescription').value = rate.description || '';
                document.getElementById('popupSalaryRateEdit').classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error loading salary rate for edit:', error);
            alert('Không thể tải thông tin định mức để sửa.');
        }
    },

    saveSalaryRate: async () => {
        const name = document.getElementById('salaryRateName').value;
        const amount = document.getElementById('salaryRateAmount').value;
        const description = document.getElementById('salaryRateDescription').value;

        if (!name || !amount) {
            return alert('Vui lòng chọn năm học và nhập số tiền.');
        }

        try {
            await axios.post(`${API_URL}/salary/rates`, {
                name: name,
                ratePerPeriod: parseInt(amount),
                description: description
            });

            alert(`Đã tạo thành công định mức tiền/tiết cho năm học ${name}!`);
            SalaryHandlers.closePopup('popupSalaryRateAdd');
            SalaryHandlers.loadSalaryRates();
        } catch (error) {
            console.error('Error saving salary rate:', error);
            if (error.response?.status === 400 && error.response?.data?.message?.includes('đã có định mức tiền/tiết')) {
                alert(error.response.data.message);
            } else {
                alert('Lỗi khi lưu định mức: ' + (error.response?.data?.message || error.message));
            }
        }
    },

    updateSalaryRate: async () => {
        const name = document.getElementById('editSalaryRateName').value;
        const amount = document.getElementById('editSalaryRateAmount').value;
        const description = document.getElementById('editSalaryRateDescription').value;

        if (!name || !amount) {
            return alert('Vui lòng chọn năm học và nhập số tiền.');
        }

        try {
            await axios.put(`${API_URL}/salary/rates/${SalaryHandlers.editingSalaryRateId}`, {
                name: name,
                ratePerPeriod: parseInt(amount),
                description: description
            });

            alert(`Đã cập nhật thành công định mức tiền/tiết cho năm học ${name}!`);
            SalaryHandlers.closePopup('popupSalaryRateEdit');
            SalaryHandlers.loadSalaryRates();
        } catch (error) {
            console.error('Error updating salary rate:', error);
            if (error.response?.status === 400 && error.response?.data?.message?.includes('đã có định mức tiền/tiết')) {
                alert(error.response.data.message);
            } else {
                alert('Lỗi khi cập nhật định mức: ' + (error.response?.data?.message || error.message));
            }
        }
    },

    deleteSalaryRate: async (id) => {
        if (!confirm('Bạn có chắc muốn xóa định mức này?')) return;

        try {
            await axios.delete(`${API_URL}/salary/rates/${id}`);
            SalaryHandlers.loadSalaryRates();
        } catch (error) {
            console.error('Error deleting salary rate:', error);
            alert('Lỗi khi xóa định mức: ' + (error.response?.data?.message || error.message));
        }
    },

    activateSalaryRate: async (id) => {
        if (!confirm('Bạn có chắc muốn kích hoạt định mức này? (Định mức hiện tại sẽ bị vô hiệu hóa)')) return;

        try {
            await axios.put(`${API_URL}/salary/rates/${id}/activate`);
            SalaryHandlers.loadSalaryRates();
        } catch (error) {
            console.error('Error activating salary rate:', error);
            alert('Lỗi khi kích hoạt định mức: ' + (error.response?.data?.message || error.message));
        }
    },

    // === TEACHER COEFFICIENTS ===
    loadTeacherCoefficients: async () => {
        try {
            // Get year filter value
            const yearFilter = document.getElementById('teacherCoefficientYearFilter')?.value || '';
            const url = yearFilter ? `${API_URL}/salary/teacher-coefficients?year=${yearFilter}` : `${API_URL}/salary/teacher-coefficients`;
            
            // Load both coefficients and degrees
            const [coeffResponse, degreesResponse, yearsResponse] = await Promise.all([
                axios.get(url),
                axios.get(`${API_URL}/salary/degrees`),
                axios.get(`${API_URL}/salary/teacher-coefficients/years`)
            ]);
            
            const coefficients = coeffResponse.data;
            const degrees = degreesResponse.data;
            const years = yearsResponse.data;
            
            // Populate dropdowns
            SalaryHandlers.populateDegreeDropdowns(degrees);
            SalaryHandlers.populateYearFilter('teacherCoefficientYearFilter', years, yearFilter);
            SalaryHandlers.populateYearFilter('copyTeacherCoeffFromYear', years);
            
            // Update count
            const countElement = document.getElementById('teacherCoefficientsCount');
            if (countElement) {
                countElement.textContent = `${coefficients.length} hệ số`;
            }
            
            const tableBody = document.getElementById('teacherCoefficientTable');
            if (tableBody) {
                tableBody.innerHTML = coefficients.map((coeff, index) =>
                    `<tr>
                        <td class="border px-4 py-2">${index + 1}</td>
                        <td class="border px-4 py-2">${coeff.year || 'N/A'}</td>
                        <td class="border px-4 py-2">${coeff.degreeId?.fullName || 'N/A'}</td>
                        <td class="border px-4 py-2">${coeff.coefficient}</td>
                        <td class="border px-4 py-2">${coeff.description || ''}</td>
                        <td class="border px-4 py-2 space-x-2">
                            <button onclick="SalaryHandlers.showEditTeacherCoefficientForm('${coeff._id}')" class="text-blue-500 hover:underline">✏️</button>
                            <button onclick="SalaryHandlers.deleteTeacherCoefficient('${coeff._id}')" class="text-red-500 hover:underline">🗑️</button>
                        </td>
                    </tr>`
                ).join('');
            }
        } catch (error) {
            console.error('Error loading teacher coefficients:', error);
            alert('Không thể tải danh sách hệ số giáo viên.');
        }
    },

    showAddTeacherCoefficientForm: async () => {
        SalaryHandlers.editingTeacherCoefficientId = null;
        
        // Load degrees if not already loaded
        try {
            const response = await axios.get(`${API_URL}/salary/degrees`);
            SalaryHandlers.populateDegreeDropdowns(response.data);
        } catch (error) {
            console.error('Error loading degrees:', error);
        }
        
        document.getElementById('teacherCoefficientDegree').value = '';
        document.getElementById('teacherCoefficientValue').value = '';
        document.getElementById('teacherCoefficientDescription').value = '';
        document.getElementById('popupTeacherCoefficientAdd').classList.remove('hidden');
    },

    showEditTeacherCoefficientForm: async (id) => {
        try {
            const [coeffResponse, degreesResponse] = await Promise.all([
                axios.get(`${API_URL}/salary/teacher-coefficients`),
                axios.get(`${API_URL}/salary/degrees`)
            ]);
            
            const coeff = coeffResponse.data.find(c => c._id === id);
            const degrees = degreesResponse.data;
            
            if (coeff) {
                // Populate degrees dropdown
                SalaryHandlers.populateDegreeDropdowns(degrees);
                
                SalaryHandlers.editingTeacherCoefficientId = id;
                document.getElementById('editTeacherCoefficientYear').value = coeff.year || '';
                document.getElementById('editTeacherCoefficientDegree').value = coeff.degreeId?._id || '';
                document.getElementById('editTeacherCoefficientValue').value = coeff.coefficient;
                document.getElementById('editTeacherCoefficientDescription').value = coeff.description || '';
                document.getElementById('popupTeacherCoefficientEdit').classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error loading teacher coefficient for edit:', error);
            alert('Không thể tải thông tin hệ số để sửa.');
        }
    },

    saveTeacherCoefficient: async () => {
        const year = document.getElementById('teacherCoefficientYear').value;
        const degreeId = document.getElementById('teacherCoefficientDegree').value;
        const value = document.getElementById('teacherCoefficientValue').value;
        const description = document.getElementById('teacherCoefficientDescription').value;

        if (!year || !degreeId || !value) {
            return SalaryHandlers.showError('Vui lòng chọn năm học, bằng cấp và nhập hệ số.');
        }

        try {
            await axios.post(`${API_URL}/salary/teacher-coefficients`, {
                year: year,
                degreeId: degreeId,
                coefficient: parseFloat(value),
                description: description
            });

            SalaryHandlers.showSuccess('Thêm hệ số giáo viên thành công!');
            SalaryHandlers.closePopup('popupTeacherCoefficientAdd');
            SalaryHandlers.loadTeacherCoefficients();
        } catch (error) {
            console.error('Error saving teacher coefficient:', error);
            const errorMessage = error.response?.data?.message || error.message;
            SalaryHandlers.showError('❌ ' + errorMessage);
        }
    },

    updateTeacherCoefficient: async () => {
        const year = document.getElementById('editTeacherCoefficientYear').value;
        const degreeId = document.getElementById('editTeacherCoefficientDegree').value;
        const value = document.getElementById('editTeacherCoefficientValue').value;
        const description = document.getElementById('editTeacherCoefficientDescription').value;

        if (!year || !degreeId || !value) {
            return SalaryHandlers.showError('Vui lòng chọn năm học, bằng cấp và nhập hệ số.');
        }

        try {
            await axios.put(`${API_URL}/salary/teacher-coefficients/${SalaryHandlers.editingTeacherCoefficientId}`, {
                year: year,
                degreeId: degreeId,
                coefficient: parseFloat(value),
                description: description
            });

            SalaryHandlers.showSuccess('Cập nhật hệ số giáo viên thành công!');
            SalaryHandlers.closePopup('popupTeacherCoefficientEdit');
            SalaryHandlers.loadTeacherCoefficients();
        } catch (error) {
            console.error('Error updating teacher coefficient:', error);
            const errorMessage = error.response?.data?.message || error.message;
            SalaryHandlers.showError('❌ ' + errorMessage);
        }
    },

    deleteTeacherCoefficient: async (id) => {
        if (!confirm('Bạn có chắc muốn xóa hệ số này?')) return;

        try {
            await axios.delete(`${API_URL}/salary/teacher-coefficients/${id}`);
            SalaryHandlers.loadTeacherCoefficients();
        } catch (error) {
            console.error('Error deleting teacher coefficient:', error);
            alert('Lỗi khi xóa hệ số giáo viên: ' + (error.response?.data?.message || error.message));
        }
    },

    // === CLASS COEFFICIENTS ===
    loadClassCoefficients: async () => {
        try {
            // Get year filter value
            const yearFilter = document.getElementById('classCoefficientYearFilter')?.value || '';
            const url = yearFilter ? `${API_URL}/salary/class-coefficients?year=${yearFilter}` : `${API_URL}/salary/class-coefficients`;
            
            const [coeffResponse, yearsResponse] = await Promise.all([
                axios.get(url),
                axios.get(`${API_URL}/salary/class-coefficients/years`)
            ]);
            
            const coefficients = coeffResponse.data;
            const years = yearsResponse.data;
            
            // Populate year filters
            SalaryHandlers.populateYearFilter('classCoefficientYearFilter', years, yearFilter);
            SalaryHandlers.populateYearFilter('copyClassCoeffFromYear', years);
            
            // Update count
            const countElement = document.getElementById('classCoefficientsCount');
            if (countElement) {
                countElement.textContent = `${coefficients.length} hệ số`;
            }
            
            const tableBody = document.getElementById('classCoefficientTable');
            if (tableBody) {
                tableBody.innerHTML = coefficients.map((coeff, index) =>
                    `<tr>
                        <td class="border px-4 py-2">${index + 1}</td>
                        <td class="border px-4 py-2">${coeff.year || 'N/A'}</td>
                        <td class="border px-4 py-2">${coeff.minStudents}</td>
                        <td class="border px-4 py-2">${coeff.maxStudents}</td>
                        <td class="border px-4 py-2">${coeff.coefficient}</td>
                        <td class="border px-4 py-2">${coeff.description || ''}</td>
                        <td class="border px-4 py-2 space-x-2">
                            <button onclick="SalaryHandlers.showEditClassCoefficientForm('${coeff._id}')" class="text-blue-500 hover:underline">✏️</button>
                            <button onclick="SalaryHandlers.deleteClassCoefficient('${coeff._id}')" class="text-red-500 hover:underline">🗑️</button>
                        </td>
                    </tr>`
                ).join('');
            }
        } catch (error) {
            console.error('Error loading class coefficients:', error);
            alert('Không thể tải danh sách hệ số lớp.');
        }
    },

    showAddClassCoefficientForm: () => {
        SalaryHandlers.editingClassCoefficientId = null;
        document.getElementById('classCoefficientMinStudents').value = '';
        document.getElementById('classCoefficientMaxStudents').value = '';
        document.getElementById('classCoefficientValue').value = '';
        document.getElementById('classCoefficientDescription').value = '';
        document.getElementById('popupClassCoefficientAdd').classList.remove('hidden');
    },

    showEditClassCoefficientForm: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/salary/class-coefficients`);
            const coeff = response.data.find(c => c._id === id);
            
            if (coeff) {
                SalaryHandlers.editingClassCoefficientId = id;
                document.getElementById('editClassCoefficientYear').value = coeff.year || '';
                document.getElementById('editClassCoefficientMinStudents').value = coeff.minStudents;
                document.getElementById('editClassCoefficientMaxStudents').value = coeff.maxStudents;
                document.getElementById('editClassCoefficientValue').value = coeff.coefficient;
                document.getElementById('editClassCoefficientDescription').value = coeff.description || '';
                document.getElementById('popupClassCoefficientEdit').classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error loading class coefficient for edit:', error);
            alert('Không thể tải thông tin hệ số để sửa.');
        }
    },

    saveClassCoefficient: async () => {
        const year = document.getElementById('classCoefficientYear').value;
        const minStudents = document.getElementById('classCoefficientMinStudents').value;
        const maxStudents = document.getElementById('classCoefficientMaxStudents').value;
        const value = document.getElementById('classCoefficientValue').value;
        const description = document.getElementById('classCoefficientDescription').value;

        if (!year || !minStudents || !maxStudents || !value) {
            return SalaryHandlers.showError('Vui lòng chọn năm học và điền đầy đủ thông tin.');
        }

        if (parseInt(minStudents) < 0 || parseInt(maxStudents) < 0) {
            return SalaryHandlers.showError('Số lượng sinh viên không thể là số âm. Vui lòng nhập số từ 0 trở lên.');
        }

        if (parseInt(minStudents) > parseInt(maxStudents)) {
            return SalaryHandlers.showError('Số sinh viên tối thiểu không thể lớn hơn tối đa.');
        }

        try {
            await axios.post(`${API_URL}/salary/class-coefficients`, {
                year: year,
                minStudents: parseInt(minStudents),
                maxStudents: parseInt(maxStudents),
                coefficient: parseFloat(value),
                description: description
            });

            SalaryHandlers.showSuccess('Thêm hệ số lớp thành công!');
            SalaryHandlers.closePopup('popupClassCoefficientAdd');
            SalaryHandlers.loadClassCoefficients();
        } catch (error) {
            console.error('Error saving class coefficient:', error);
            const errorMessage = error.response?.data?.message || error.message;
            SalaryHandlers.showError('❌ ' + errorMessage);
        }
    },

    updateClassCoefficient: async () => {
        const year = document.getElementById('editClassCoefficientYear').value;
        const minStudents = document.getElementById('editClassCoefficientMinStudents').value;
        const maxStudents = document.getElementById('editClassCoefficientMaxStudents').value;
        const value = document.getElementById('editClassCoefficientValue').value;
        const description = document.getElementById('editClassCoefficientDescription').value;

        if (!year || !minStudents || !maxStudents || !value) {
            return SalaryHandlers.showError('Vui lòng chọn năm học và điền đầy đủ thông tin.');
        }

        if (parseInt(minStudents) < 0 || parseInt(maxStudents) < 0) {
            return SalaryHandlers.showError('Số lượng sinh viên không thể là số âm. Vui lòng nhập số từ 0 trở lên.');
        }

        if (parseInt(minStudents) > parseInt(maxStudents)) {
            return SalaryHandlers.showError('Số sinh viên tối thiểu không thể lớn hơn tối đa.');
        }

        try {
            await axios.put(`${API_URL}/salary/class-coefficients/${SalaryHandlers.editingClassCoefficientId}`, {
                year: year,
                minStudents: parseInt(minStudents),
                maxStudents: parseInt(maxStudents),
                coefficient: parseFloat(value),
                description: description
            });

            SalaryHandlers.showSuccess('Cập nhật hệ số lớp thành công!');
            SalaryHandlers.closePopup('popupClassCoefficientEdit');
            SalaryHandlers.loadClassCoefficients();
        } catch (error) {
            console.error('Error updating class coefficient:', error);
            const errorMessage = error.response?.data?.message || error.message;
            SalaryHandlers.showError('❌ ' + errorMessage);
        }
    },

    deleteClassCoefficient: async (id) => {
        if (!confirm('Bạn có chắc muốn xóa hệ số này?')) return;

        try {
            await axios.delete(`${API_URL}/salary/class-coefficients/${id}`);
            SalaryHandlers.loadClassCoefficients();
        } catch (error) {
            console.error('Error deleting class coefficient:', error);
            alert('Lỗi khi xóa hệ số lớp: ' + (error.response?.data?.message || error.message));
        }
    },

    // === SALARY CALCULATION ===
    loadSalaryCalculation: async () => {
        try {
            // Load semesters for dropdown
            const semestersResponse = await axios.get(`${API_URL}/semesters`);
            const semesters = semestersResponse.data;
            
            const semesterSelect = document.getElementById('salaryCalculationSemesterFilter');
            if (semesterSelect) {
                semesterSelect.innerHTML = '<option value="">-- Chọn kì học --</option>' +
                    semesters.map(s => `<option value="${s._id}">${s.name} (${s.year})</option>`).join('');
            }

            // Hide results initially
            const resultsDiv = document.getElementById('salaryResults');
            if (resultsDiv) {
                resultsDiv.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error loading salary calculation:', error);
            alert('Không thể tải thông tin tính tiền dạy.');
        }
    },

    loadTeachersInSemester: async () => {
        const semesterId = document.getElementById('salaryCalculationSemesterFilter').value;
        const teacherSelect = document.getElementById('salaryCalculationTeacherFilter');
        
        console.log('Loading teachers for semester:', semesterId);
        
        if (!semesterId) {
            teacherSelect.innerHTML = '<option value="">-- Chọn giáo viên --</option>';
            return;
        }

        try {
            console.log('Making request to:', `${API_URL}/salary/teachers/${semesterId}`);
            
            teacherSelect.innerHTML = '<option value="">-- Đang tải... --</option>';
            
            const response = await axios.get(`${API_URL}/salary/teachers/${semesterId}`);
            const teachers = response.data;
            
            console.log('Received teachers:', teachers);
            
            if (teachers.length === 0) {
                teacherSelect.innerHTML = '<option value="">-- Không có giáo viên nào được phân công --</option>';
            } else {
                teacherSelect.innerHTML = '<option value="">-- Chọn giáo viên --</option>' +
                    teachers.map(t => `<option value="${t._id}">${t.name} (${t.code || t.teacherCode || 'N/A'})</option>`).join('');
            }
        } catch (error) {
            console.error('Error loading teachers:', error);
            console.error('Error details:', error.response?.data);
            teacherSelect.innerHTML = '<option value="">-- Lỗi tải danh sách --</option>';
            alert('Lỗi khi tải danh sách giáo viên: ' + (error.response?.data?.message || error.message));
        }
    },

    calculateSalary: async () => {
        const semesterId = document.getElementById('salaryCalculationSemesterFilter').value;
        const teacherId = document.getElementById('salaryCalculationTeacherFilter').value;

        if (!semesterId || !teacherId) {
            return alert('Vui lòng chọn kì học và giáo viên.');
        }

        try {
            const response = await axios.post(`${API_URL}/salary/calculate`, {
                teacherId: teacherId,
                semesterId: semesterId
            });

            const result = response.data;
            
            // Show results
            const resultsDiv = document.getElementById('salaryResults');
            if (resultsDiv) {
                resultsDiv.classList.remove('hidden');
            }

            // Update summary cards
            document.getElementById('totalClassesAssigned').textContent = result.summary.totalClasses;
            document.getElementById('totalPeriods').textContent = result.summary.totalPeriods;
            document.getElementById('totalAdjustedPeriods').textContent = result.summary.totalAdjustedPeriods.toFixed(1);
            document.getElementById('totalSalary').textContent = result.totalSalary.toLocaleString('vi-VN') + ' VNĐ';

            // Update teacher info
            document.getElementById('teacherCodeResult').textContent = result.teacher.teacherCode || result.teacher.teacherCode || 'N/A';
            document.getElementById('teacherNameResult').textContent = result.teacher.name;
            document.getElementById('teacherDegreeResult').textContent = result.teacher.degree;

            // Update detail table
            const detailTable = document.getElementById('salaryDetailTable');
            if (detailTable && result.assignments) {
                detailTable.innerHTML = result.assignments.map((assignment, index) =>
                    `<tr>
                        <td class="border px-2 py-2">${index + 1}</td>
                        <td class="border px-2 py-2">${assignment.classCode}</td>
                        <td class="border px-2 py-2">${assignment.className || assignment.classCode}</td>
                        <td class="border px-2 py-2">${assignment.courseName} (${assignment.courseCode})</td>
                        <td class="border px-2 py-2">${assignment.periods}</td>
                        <td class="border px-2 py-2">${assignment.studentCount}</td>
                        <td class="border px-2 py-2">${assignment.courseCoefficient}</td>
                        <td class="border px-2 py-2">${assignment.classCoefficient}</td>
                        <td class="border px-2 py-2">${assignment.adjustedPeriods.toFixed(1)}</td>
                        <td class="border px-2 py-2">${assignment.teacherCoefficient}</td>
                        <td class="border px-2 py-2">${assignment.ratePerPeriod.toLocaleString('vi-VN')}</td>
                        <td class="border px-2 py-2">${assignment.classSalary.toLocaleString('vi-VN')} VNĐ</td>
                    </tr>`
                ).join('');
            }

        } catch (error) {
            console.error('Error calculating salary:', error);
            alert('Lỗi khi tính tiền dạy: ' + (error.response?.data?.message || error.message));
        }
    },

    // === COMMON ===
    populateDegreeDropdowns: (degrees) => {
        const dropdowns = ['teacherCoefficientDegree', 'editTeacherCoefficientDegree'];
        
        dropdowns.forEach(dropdownId => {
            const dropdown = document.getElementById(dropdownId);
            if (dropdown) {
                dropdown.innerHTML = '<option value="">-- Chọn bằng cấp --</option>' +
                    degrees.map(degree => `<option value="${degree._id}">${degree.fullName}</option>`).join('');
            }
        });
    },

    populateYearFilter: (elementId, years, selectedYear = '') => {
        const element = document.getElementById(elementId);
        if (element) {
            const options = years.map(year => `<option value="${year}" ${year === selectedYear ? 'selected' : ''}>${year}</option>`).join('');
            if (elementId.includes('Filter')) {
                element.innerHTML = '<option value="">-- Tất cả năm học --</option>' + options;
            } else {
                element.innerHTML = '<option value="">-- Chọn năm học --</option>' + options;
            }
        }
    },

    closePopup: (popupId) => {
        document.getElementById(popupId).classList.add('hidden');
    },

    // === COPY FUNCTIONS ===
    showCopyTeacherCoefficientsForm: async () => {
        try {
            const yearsResponse = await axios.get(`${API_URL}/salary/teacher-coefficients/years`);
            SalaryHandlers.populateYearFilter('copyTeacherCoeffFromYear', yearsResponse.data);
            document.getElementById('copyTeacherCoeffToYear').value = '';
            document.getElementById('popupCopyTeacherCoefficients').classList.remove('hidden');
        } catch (error) {
            console.error('Error loading years:', error);
            alert('Không thể tải danh sách năm học.');
        }
    },

    copyTeacherCoefficients: async () => {
        const fromYear = document.getElementById('copyTeacherCoeffFromYear').value;
        const toYear = document.getElementById('copyTeacherCoeffToYear').value;

        if (!fromYear || !toYear) {
            return SalaryHandlers.showError('Vui lòng chọn năm học nguồn và đích.');
        }

        if (fromYear === toYear) {
            return SalaryHandlers.showError('Năm học nguồn và đích không thể giống nhau.');
        }

        try {
            const response = await axios.post(`${API_URL}/salary/teacher-coefficients/copy`, {
                fromYear: fromYear,
                toYear: toYear
            });

            SalaryHandlers.showSuccess(response.data.message);
            SalaryHandlers.closePopup('popupCopyTeacherCoefficients');
            SalaryHandlers.loadTeacherCoefficients();
        } catch (error) {
            console.error('Error copying teacher coefficients:', error);
            const errorMessage = error.response?.data?.message || error.message;
            SalaryHandlers.showError('❌ ' + errorMessage);
        }
    },

    showCopyClassCoefficientsForm: async () => {
        try {
            const yearsResponse = await axios.get(`${API_URL}/salary/class-coefficients/years`);
            SalaryHandlers.populateYearFilter('copyClassCoeffFromYear', yearsResponse.data);
            document.getElementById('copyClassCoeffToYear').value = '';
            document.getElementById('popupCopyClassCoefficients').classList.remove('hidden');
        } catch (error) {
            console.error('Error loading years:', error);
            alert('Không thể tải danh sách năm học.');
        }
    },

    copyClassCoefficients: async () => {
        const fromYear = document.getElementById('copyClassCoeffFromYear').value;
        const toYear = document.getElementById('copyClassCoeffToYear').value;

        if (!fromYear || !toYear) {
            return SalaryHandlers.showError('Vui lòng chọn năm học nguồn và đích.');
        }

        if (fromYear === toYear) {
            return SalaryHandlers.showError('Năm học nguồn và đích không thể giống nhau.');
        }

        try {
            const response = await axios.post(`${API_URL}/salary/class-coefficients/copy`, {
                fromYear: fromYear,
                toYear: toYear
            });

            SalaryHandlers.showSuccess(response.data.message);
            SalaryHandlers.closePopup('popupCopyClassCoefficients');
            SalaryHandlers.loadClassCoefficients();
        } catch (error) {
            console.error('Error copying class coefficients:', error);
            const errorMessage = error.response?.data?.message || error.message;
            SalaryHandlers.showError('❌ ' + errorMessage);
        }
    },

    // === NOTIFICATION FUNCTIONS ===
    showError: (message) => {
        SalaryHandlers.showNotification(message, 'error');
    },

    showSuccess: (message) => {
        SalaryHandlers.showNotification(message, 'success');
    },

    showNotification: (message, type = 'info') => {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification-toast');
        existingNotifications.forEach(notif => notif.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification-toast fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg transition-all duration-300 transform`;
        
        if (type === 'error') {
            notification.className += ' bg-red-100 border border-red-400 text-red-700';
        } else if (type === 'success') {
            notification.className += ' bg-green-100 border border-green-400 text-green-700';
        } else {
            notification.className += ' bg-blue-100 border border-blue-400 text-blue-700';
        }

        notification.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <p class="font-medium">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-lg font-bold hover:opacity-70">&times;</button>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Auto remove after 5 seconds for success, 8 seconds for error
        const timeout = type === 'error' ? 8000 : 5000;
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, timeout);
    }
};

// === REPORT HANDLERS ===
const ReportHandlers = {
    currentReportData: null,
    facultyChart: null,
    semesterChart: null,

    loadReportSection: async (sectionId) => {
        try {
            // Hide all report result sections first
            ['teacherReportResult', 'facultyReportResult', 'schoolReportResult', 'chartReportResult'].forEach(resultId => {
                const element = document.getElementById(resultId);
                if (element) element.classList.add('hidden');
            });

            // Load common data for all reports
            await ReportHandlers.loadAvailableYears();
            
            if (sectionId === 'teacher-report') {
                await ReportHandlers.loadTeachers();
            } else if (sectionId === 'faculty-report') {
                await ReportHandlers.loadFaculties();
            }
        } catch (error) {
            console.error('Error loading report section:', error);
            SalaryHandlers.showError('Lỗi tải dữ liệu báo cáo.');
        }
    },

    loadAvailableYears: async () => {
        try {
            const response = await axios.get(`${API_URL}/reports/available-years`);
            const years = response.data;
            
            // Populate year dropdowns
            ['reportTeacherYear', 'reportFacultyYear', 'reportSchoolYear', 'chartReportYear'].forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.innerHTML = '<option value="">-- Chọn năm học --</option>' +
                        years.map(year => `<option value="${year}">${year}</option>`).join('');
                }
            });
        } catch (error) {
            console.error('Error loading available years:', error);
        }
    },

    loadTeachers: async () => {
        try {
            const response = await axios.get(`${API_URL}/teachers`);
            const teachers = response.data;
            
            const teacherSelect = document.getElementById('reportTeacherSelect');
            if (teacherSelect) {
                teacherSelect.innerHTML = '<option value="">-- Chọn giáo viên --</option>' +
                    teachers.map(teacher => 
                        `<option value="${teacher._id}">${teacher.code} - ${teacher.name}</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Error loading teachers:', error);
        }
    },

    loadFaculties: async () => {
        try {
            const response = await axios.get(`${API_URL}/faculties`);
            const faculties = response.data;
            
            const facultySelect = document.getElementById('reportFacultySelect');
            if (facultySelect) {
                facultySelect.innerHTML = '<option value="">-- Chọn khoa --</option>' +
                    faculties.map(faculty => 
                        `<option value="${faculty._id}">${faculty.shortName} - ${faculty.fullName}</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Error loading faculties:', error);
        }
    },

    // UC4.1 - Báo cáo tiền dạy của giáo viên trong một năm
    generateTeacherReport: async () => {
        const teacherId = document.getElementById('reportTeacherSelect').value;
        const year = document.getElementById('reportTeacherYear').value;

        if (!teacherId || !year) {
            return SalaryHandlers.showError('Vui lòng chọn giáo viên và năm học.');
        }

        try {
            SalaryHandlers.showNotification('Đang tạo báo cáo...', 'info');
            const response = await axios.get(`${API_URL}/reports/teacher-salary-by-year/${teacherId}/${year}`);
            ReportHandlers.currentReportData = response.data;
            
            ReportHandlers.displayTeacherReport(response.data);
            document.getElementById('teacherReportResult').classList.remove('hidden');
            SalaryHandlers.showNotification('Tạo báo cáo thành công!', 'success');
            
        } catch (error) {
            console.error('Error generating teacher report:', error);
            SalaryHandlers.showError('Lỗi tạo báo cáo: ' + (error.response?.data?.message || error.message));
        }
    },

    displayTeacherReport: (data) => {
        const content = document.getElementById('teacherReportContent');
        if (!content) return;

        let html = `
            <div class="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 class="text-lg font-bold mb-2">Thông tin Giáo viên</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div><strong>Mã GV:</strong> ${data.teacher.code}</div>
                    <div><strong>Họ tên:</strong> ${data.teacher.name}</div>
                    <div><strong>Khoa:</strong> ${data.teacher.faculty}</div>
                    <div><strong>Bằng cấp:</strong> ${data.teacher.degree}</div>
                </div>
                                    <div class="mt-2">
                        <strong>Năm học:</strong> ${data.year} | 
                        <strong class="text-green-600">Tổng tiền dạy:</strong> ${(data.totalSalary || 0).toLocaleString('vi-VN')} VNĐ
                    </div>
            </div>

            <div class="space-y-4">
        `;

        data.reportData.forEach(semester => {
            html += `
                <div class="border rounded-lg p-4">
                    <h4 class="font-bold text-lg mb-3 text-blue-600">
                        ${semester.semester} (${semester.semesterCode})
                        <span class="text-green-600 ml-4">
                            Tiền kì: ${(semester.semesterSalary || 0).toLocaleString('vi-VN')} VNĐ
                        </span>
                    </h4>
                    
                    ${semester.classes.length > 0 ? `
                        <table class="w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                                <tr class="bg-gray-100">
                                    <th class="border p-2">STT</th>
                                    <th class="border p-2">Mã lớp</th>
                                    <th class="border p-2">Tên học phần</th>
                                    <th class="border p-2">Số tiết</th>
                                    <th class="border p-2">SL SV</th>
                                    <th class="border p-2">Tiền dạy</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${semester.classes.map((cls, index) => `
                                    <tr>
                                        <td class="border p-2">${index + 1}</td>
                                        <td class="border p-2">${cls.classCode}</td>
                                        <td class="border p-2">${cls.course}</td>
                                        <td class="border p-2">${cls.periods}</td>
                                        <td class="border p-2">${cls.studentCount}</td>
                                        <td class="border p-2">${(cls.salary || 0).toLocaleString('vi-VN')} VNĐ</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p class="text-gray-500 italic">Không có lớp nào trong kì này.</p>'}
                </div>
            `;
        });

        html += '</div>';
        content.innerHTML = html;
    },

    // UC4.2 - Báo cáo tiền dạy của giáo viên một khoa
    generateFacultyReport: async () => {
        const facultyId = document.getElementById('reportFacultySelect').value;
        const year = document.getElementById('reportFacultyYear').value;

        if (!facultyId || !year) {
            return SalaryHandlers.showError('Vui lòng chọn khoa và năm học.');
        }

        try {
            SalaryHandlers.showNotification('Đang tạo báo cáo...', 'info');
            const response = await axios.get(`${API_URL}/reports/faculty-salary-report/${facultyId}/${year}`);
            ReportHandlers.currentReportData = response.data;
            
            ReportHandlers.displayFacultyReport(response.data);
            document.getElementById('facultyReportResult').classList.remove('hidden');
            SalaryHandlers.showNotification('Tạo báo cáo thành công!', 'success');
            
        } catch (error) {
            console.error('Error generating faculty report:', error);
            SalaryHandlers.showError('Lỗi tạo báo cáo: ' + (error.response?.data?.message || error.message));
        }
    },

    displayFacultyReport: (data) => {
        const content = document.getElementById('facultyReportContent');
        if (!content) return;

        let html = `
            <div class="mb-6 p-4 bg-purple-50 rounded-lg">
                <h3 class="text-lg font-bold mb-2">Thông tin Khoa</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div><strong>Tên khoa:</strong> ${data.faculty.fullName}</div>
                    <div><strong>Tên viết tắt:</strong> ${data.faculty.shortName}</div>
                    <div><strong>Năm học:</strong> ${data.year}</div>
                    <div><strong>Số giáo viên có dạy:</strong> ${data.totalTeachers}</div>
                </div>
                <div class="mt-2">
                    <strong class="text-green-600">Tổng tiền dạy khoa:</strong> ${data.facultyTotalSalary.toLocaleString('vi-VN')} VNĐ
                </div>
            </div>

            <table class="w-full border-collapse border border-gray-300">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="border p-3">STT</th>
                        <th class="border p-3">Mã GV</th>
                        <th class="border p-3">Họ tên</th>
                        <th class="border p-3">Bằng cấp</th>
                        <th class="border p-3">Số kì dạy</th>
                        <th class="border p-3">Tổng tiền dạy</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.teacherReports.forEach((teacherReport, index) => {
            html += `
                <tr>
                    <td class="border p-3">${index + 1}</td>
                    <td class="border p-3">${teacherReport.teacher.code || 'N/A'}</td>
                    <td class="border p-3">${teacherReport.teacher.name || 'N/A'}</td>
                    <td class="border p-3">${teacherReport.teacher.degree || 'N/A'}</td>
                    <td class="border p-3">${teacherReport.semesters.length}</td>
                    <td class="border p-3">${teacherReport.totalSalary.toLocaleString('vi-VN')} VNĐ</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        content.innerHTML = html;
    },

    // UC4.3 - Báo cáo tiền dạy của giáo viên toàn trường
    generateSchoolReport: async () => {
        const year = document.getElementById('reportSchoolYear').value;

        if (!year) {
            return SalaryHandlers.showError('Vui lòng chọn năm học.');
        }

        try {
            SalaryHandlers.showNotification('Đang tạo báo cáo...', 'info');
            const response = await axios.get(`${API_URL}/reports/school-salary-report/${year}`);
            ReportHandlers.currentReportData = response.data;
            
            ReportHandlers.displaySchoolReport(response.data);
            document.getElementById('schoolReportResult').classList.remove('hidden');
            SalaryHandlers.showNotification('Tạo báo cáo thành công!', 'success');
            
        } catch (error) {
            console.error('Error generating school report:', error);
            SalaryHandlers.showError('Lỗi tạo báo cáo: ' + (error.response?.data?.message || error.message));
        }
    },

    displaySchoolReport: (data) => {
        const content = document.getElementById('schoolReportContent');
        if (!content) return;

        let html = `
            <div class="mb-6 p-4 bg-red-50 rounded-lg">
                <h3 class="text-lg font-bold mb-2">Báo cáo Toàn trường</h3>
                <div class="grid grid-cols-3 gap-4">
                    <div><strong>Năm học:</strong> ${data.year}</div>
                    <div><strong>Số khoa:</strong> ${data.totalFaculties}</div>
                    <div><strong class="text-green-600">Tổng tiền dạy:</strong> ${data.schoolTotalSalary.toLocaleString('vi-VN')} VNĐ</div>
                </div>
            </div>

            <table class="w-full border-collapse border border-gray-300">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="border p-3">STT</th>
                        <th class="border p-3">Tên khoa</th>
                        <th class="border p-3">Viết tắt</th>
                        <th class="border p-3">Số GV dạy</th>
                        <th class="border p-3">Tổng tiền dạy</th>
                        <th class="border p-3">% Tổng trường</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.facultyReports.forEach((facultyReport, index) => {
            const percentage = ((facultyReport.totalSalary / data.schoolTotalSalary) * 100).toFixed(1);
            html += `
                <tr>
                    <td class="border p-3">${index + 1}</td>
                    <td class="border p-3">${facultyReport.faculty.fullName}</td>
                    <td class="border p-3">${facultyReport.faculty.shortName}</td>
                    <td class="border p-3">${facultyReport.teacherCount}</td>
                    <td class="border p-3">${facultyReport.totalSalary.toLocaleString('vi-VN')} VNĐ</td>
                    <td class="border p-3">${percentage}%</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        content.innerHTML = html;
    },

    // Biểu đồ thống kê
    generateChartReport: async () => {
        const year = document.getElementById('chartReportYear').value;

        if (!year) {
            return SalaryHandlers.showError('Vui lòng chọn năm học.');
        }

        try {
            SalaryHandlers.showNotification('Đang tạo biểu đồ...', 'info');
            const response = await axios.get(`${API_URL}/reports/statistics/${year}`);
            const data = response.data;
            
            ReportHandlers.displayCharts(data);
            document.getElementById('chartReportResult').classList.remove('hidden');
            SalaryHandlers.showNotification('Tạo biểu đồ thành công!', 'success');
            
        } catch (error) {
            console.error('Error generating chart report:', error);
            SalaryHandlers.showError('Lỗi tạo biểu đồ: ' + (error.response?.data?.message || error.message));
        }
    },

    displayCharts: (data) => {
        // Faculty Chart
        ReportHandlers.createFacultyChart(data.facultyStats);
        
        // Semester Chart
        ReportHandlers.createSemesterChart(data.semesterStats);
    },

    createFacultyChart: (facultyStats) => {
        const ctx = document.getElementById('facultyChart');
        if (!ctx) return;

        // Destroy existing chart
        if (ReportHandlers.facultyChart) {
            ReportHandlers.facultyChart.destroy();
        }

        const labels = facultyStats.map(f => f.faculty);
        const salaryData = facultyStats.map(f => f.salary);
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ];

        ReportHandlers.facultyChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: salaryData,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value.toLocaleString('vi-VN')} VNĐ (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    createSemesterChart: (semesterStats) => {
        const ctx = document.getElementById('semesterChart');
        if (!ctx) return;

        // Destroy existing chart
        if (ReportHandlers.semesterChart) {
            ReportHandlers.semesterChart.destroy();
        }

        const labels = semesterStats.map(s => s.semester);
        const salaryData = semesterStats.map(s => s.salary);

        ReportHandlers.semesterChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tiền dạy (VNĐ)',
                    data: salaryData,
                    backgroundColor: '#36A2EB',
                    borderColor: '#36A2EB',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y.toLocaleString('vi-VN')} VNĐ`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('vi-VN');
                            }
                        }
                    }
                }
            }
        });
    },

    // Export functions (placeholder - can be enhanced with actual export functionality)
    exportTeacherReport: () => {
        if (!ReportHandlers.currentReportData) {
            return SalaryHandlers.showError('Không có dữ liệu để xuất.');
        }
        
        // Simple CSV export
        const data = ReportHandlers.currentReportData;
        let csv = 'STT,Kì học,Mã lớp,Tên học phần,Số tiết,Số SV,Tiền dạy\n';
        
        let stt = 1;
        data.reportData.forEach(semester => {
            semester.classes.forEach(cls => {
                csv += `${stt},${semester.semester},${cls.classCode},${cls.courseName},${cls.periods},${cls.studentCount},${cls.salary}\n`;
                stt++;
            });
        });

        ReportHandlers.downloadCSV(csv, `BaoCao_GV_${data.teacher.teacherCode}_${data.year}.csv`);
    },

    exportFacultyReport: () => {
        if (!ReportHandlers.currentReportData) {
            return SalaryHandlers.showError('Không có dữ liệu để xuất.');
        }
        
        const data = ReportHandlers.currentReportData;
        let csv = 'STT,Mã GV,Họ tên,Bằng cấp,Số kì dạy,Tổng tiền dạy\n';
        
        data.teacherReports.forEach((teacher, index) => {
            csv += `${index + 1},${teacher.teacher.teacherCode},${teacher.teacher.fullName},${teacher.teacher.degree},${teacher.semesters.length},${teacher.totalSalary}\n`;
        });

        ReportHandlers.downloadCSV(csv, `BaoCao_Khoa_${data.faculty.shortName}_${data.year}.csv`);
    },

    exportSchoolReport: () => {
        if (!ReportHandlers.currentReportData) {
            return SalaryHandlers.showError('Không có dữ liệu để xuất.');
        }
        
        const data = ReportHandlers.currentReportData;
        let csv = 'STT,Tên khoa,Viết tắt,Số GV dạy,Tổng tiền dạy,% Tổng trường\n';
        
        data.facultyReports.forEach((faculty, index) => {
            const percentage = ((faculty.totalSalary / data.schoolTotalSalary) * 100).toFixed(1);
            csv += `${index + 1},${faculty.faculty.fullName},${faculty.faculty.shortName},${faculty.teacherCount},${faculty.totalSalary},${percentage}%\n`;
        });

        ReportHandlers.downloadCSV(csv, `BaoCao_ToanTruong_${data.year}.csv`);
    },

    downloadCSV: (csvContent, filename) => {
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            SalaryHandlers.showSuccess('✅ Đã xuất file thành công!');
        }
    }
};