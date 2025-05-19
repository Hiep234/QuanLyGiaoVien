// js/faculties.js
const FacultyHandlers = {
    editingId: null,

    renderTable: (faculties) => {
        const tableBody = document.getElementById('facultyTable');
        tableBody.innerHTML = faculties.map((f, i) => `
            <tr>
                <td class="border px-4 py-2">${i + 1}</td>
                <td class="border px-4 py-2">${f.fullName}</td>
                <td class="border px-4 py-2">${f.shortName}</td>
                <td class="border px-4 py-2">${f.description || ''}</td>
                <td class="border px-4 py-2 space-x-2">
                    <button onclick="FacultyHandlers.edit('${f._id}')" class="text-blue-500 hover:underline">✏️</button>
                    <button onclick="FacultyHandlers.delete('${f._id}')" class="text-red-500 hover:underline">🗑️</button>
                </td>
            </tr>`).join('');
    },

    add: async () => {
        const fullName = document.getElementById('facultyFullName').value;
        const shortName = document.getElementById('facultyShortName').value;
        const description = document.getElementById('facultyDescription').value;
        if (!fullName || !shortName) return alert('Vui lòng nhập đầy đủ Tên đầy đủ và Tên viết tắt');
        try {
            await API.addFaculty({ fullName, shortName, description });
            document.getElementById('facultyFullName').value = '';
            document.getElementById('facultyShortName').value = '';
            document.getElementById('facultyDescription').value = '';
            UI.togglePopup('popupFacultyForm');
            mainData.fetchAndRenderAllData();
        } catch (err) {
            alert('Lỗi khi thêm khoa');
            console.error(err);
        }
    },

    delete: async (id) => {
        if (!confirm('Bạn có chắc muốn xóa?')) return;
        try {
            await API.deleteFaculty(id);
            mainData.fetchAndRenderAllData();
        } catch (err) {
            alert('Lỗi khi xóa khoa');
            console.error(err);
        }
    },

    edit: (id) => {
        const faculty = mainData.faculties.find(f => f._id === id);
        if (!faculty) return;
        FacultyHandlers.editingId = id;
        document.getElementById('editFacultyFullName').value = faculty.fullName;
        document.getElementById('editFacultyShortName').value = faculty.shortName;
        document.getElementById('editFacultyDescription').value = faculty.description || '';
        UI.togglePopup('popupEditFacultyForm');
    },

    update: async () => {
        const fullName = document.getElementById('editFacultyFullName').value;
        const shortName = document.getElementById('editFacultyShortName').value;
        const description = document.getElementById('editFacultyDescription').value;
        try {
            await API.updateFaculty(FacultyHandlers.editingId, { fullName, shortName, description });
            UI.togglePopup('popupEditFacultyForm');
            mainData.fetchAndRenderAllData();
        } catch (err) {
            alert('Lỗi khi cập nhật khoa');
            console.error(err);
        }
    }
};