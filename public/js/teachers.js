// js/teachers.js
const TeacherHandlers = {
    editingId: null,

    populateFormsDropdowns: () => {
        UI.populateDropdown('teacherFaculty', mainData.faculties, '_id', 'fullName', 'Chọn khoa');
        UI.populateDropdown('teacherDegree', mainData.degrees, '_id', 'fullName', 'Chọn bằng cấp');
        UI.populateDropdown('editTeacherFaculty', mainData.faculties, '_id', 'fullName', 'Chọn khoa');
        UI.populateDropdown('editTeacherDegree', mainData.degrees, '_id', 'fullName', 'Chọn bằng cấp');
    },

    renderTable: (teachers) => {
        const tableBody = document.getElementById('teacherTable');
        tableBody.innerHTML = teachers.map((t, i) => {
            const facultyName = mainData.faculties.find(f => f._id === t.facultyId._id)?.fullName || 'N/A';
            const degreeName = mainData.degrees.find(d => d._id === t.degreeId._id)?.fullName || 'N/A';
            return `
            <tr>
                <td class="border px-4 py-2">${i + 1}</td>
                <td class="border px-4 py-2">${t.code || ''}</td>
                <td class="border px-4 py-2">${t.name || ''}</td>
                <td class="border px-4 py-2">${UI.formatDateForDisplay(t.birthDate)}</td>
                <td class="border px-4 py-2">${t.email || ''}</td>
                <td class="border px-4 py-2">${t.phone || ''}</td>
                <td class="border px-4 py-2">${facultyName}</td>
                <td class="border px-4 py-2">${degreeName}</td>
                <td class="border px-4 py-2 space-x-2">
                    <button onclick="TeacherHandlers.edit('${t._id}')" class="text-blue-500 hover:underline">✏️</button>
                    <button onclick="TeacherHandlers.delete('${t._id}')" class="text-red-500 hover:underline">🗑️</button>
                </td>
            </tr>`;
        }).join('');
    },

    add: async () => {
        const teacherData = {
            code: document.getElementById('teacherCode').value,
            name: document.getElementById('teacherName').value,
            birthDate: document.getElementById('teacherBirthDate').value,
            email: document.getElementById('teacherEmail').value,
            phone: document.getElementById('teacherPhone').value,
            facultyId: document.getElementById('teacherFaculty').value,
            degreeId: document.getElementById('teacherDegree').value
        };
        if (!teacherData.code || !teacherData.name || !teacherData.birthDate || !teacherData.facultyId || !teacherData.degreeId) {
            return alert('Vui lòng nhập đầy đủ thông tin (Mã GV, Họ tên, Ngày Sinh, Khoa, Bằng cấp)');
        }
        try {
            await API.addTeacher(teacherData);
            // Clear form
            document.getElementById('teacherCode').value = '';
            document.getElementById('teacherName').value = '';
            document.getElementById('teacherBirthDate').value = '';
            document.getElementById('teacherEmail').value = '';
            document.getElementById('teacherPhone').value = '';
            document.getElementById('teacherFaculty').value = '';
            document.getElementById('teacherDegree').value = '';
            UI.togglePopup('popupTeacherForm');
            mainData.fetchAndRenderAllData();
        } catch (err) {
            alert('Lỗi khi thêm giáo viên: ' + (err.response?.data?.message || err.message));
            console.error(err);
        }
    },

    delete: async (id) => {
        if (!confirm('Bạn có chắc muốn xóa?')) return;
        try {
            await API.deleteTeacher(id);
            mainData.fetchAndRenderAllData();
        } catch (err) {
            alert('Lỗi khi xóa giáo viên');
            console.error(err);
        }
    },

    edit: (id) => {
        const teacher = mainData.teachers.find(t => t._id === id);
        if (!teacher) return alert('Không tìm thấy giáo viên');
        TeacherHandlers.editingId = id;
        document.getElementById('editTeacherCode').value = teacher.code || '';
        document.getElementById('editTeacherName').value = teacher.name || '';
        document.getElementById('editTeacherBirthDate').value = UI.formatDateForInput(teacher.birthDate);
        document.getElementById('editTeacherEmail').value = teacher.email || '';
        document.getElementById('editTeacherPhone').value = teacher.phone || '';
        document.getElementById('editTeacherFaculty').value = teacher.facultyId._id || '';
        document.getElementById('editTeacherDegree').value = teacher.degreeId._id || '';
        UI.togglePopup('popupEditTeacherForm');
    },

    update: async () => {
        const teacherData = {
            code: document.getElementById('editTeacherCode').value,
            name: document.getElementById('editTeacherName').value,
            birthDate: document.getElementById('editTeacherBirthDate').value,
            email: document.getElementById('editTeacherEmail').value,
            phone: document.getElementById('editTeacherPhone').value,
            facultyId: document.getElementById('editTeacherFaculty').value,
            degreeId: document.getElementById('editTeacherDegree').value
        };
        if (!teacherData.code || !teacherData.name || !teacherData.birthDate || !teacherData.facultyId || !teacherData.degreeId) {
            return alert('Vui lòng nhập đầy đủ thông tin (Mã GV, Họ tên, Ngày Sinh, Khoa, Bằng cấp)');
        }
        try {
            await API.updateTeacher(TeacherHandlers.editingId, teacherData);
            UI.togglePopup('popupEditTeacherForm');
            mainData.fetchAndRenderAllData();
        } catch (err) {
            alert('Lỗi khi cập nhật giáo viên: ' + (err.response?.data?.message || err.message));
            console.error(err);
        }
    }
};