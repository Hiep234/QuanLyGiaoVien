// js/degrees.js
const DegreeHandlers = {
    editingId: null,

    renderTable: (degrees) => {
        const tableBody = document.getElementById('degreeTable');
        tableBody.innerHTML = degrees.map((d, i) => `
            <tr>
                <td class="border px-4 py-2">${i + 1}</td>
                <td class="border px-4 py-2">${d.fullName}</td>
                <td class="border px-4 py-2">${d.shortName}</td>
                <td class="border px-4 py-2 space-x-2">
                    <button onclick="DegreeHandlers.edit('${d._id}')" class="text-blue-500 hover:underline">✏️</button>
                    <button onclick="DegreeHandlers.delete('${d._id}')" class="text-red-500 hover:underline">🗑️</button>
                </td>
            </tr>`).join('');
    },

    add: async () => {
        const fullName = document.getElementById('degreeFullName').value;
        const shortName = document.getElementById('degreeShortName').value;
        if (!fullName || !shortName) return alert('Vui lòng nhập đầy đủ thông tin');
        try {
            await API.addDegree({ fullName, shortName });
            document.getElementById('degreeFullName').value = '';
            document.getElementById('degreeShortName').value = '';
            UI.togglePopup('popupForm');
            mainData.fetchAndRenderAllData(); // Gọi hàm load lại dữ liệu từ main.js
        } catch (err) {
            alert('Lỗi khi thêm bằng cấp');
            console.error(err);
        }
    },

    delete: async (id) => {
        if (!confirm('Bạn có chắc muốn xóa?')) return;
        try {
            await API.deleteDegree(id);
            mainData.fetchAndRenderAllData();
        } catch (err) {
            alert('Lỗi khi xóa bằng cấp');
            console.error(err);
        }
    },

    edit: (id) => {
        const degree = mainData.degrees.find(d => d._id === id); // Lấy dữ liệu từ main.js
        if (!degree) return;
        DegreeHandlers.editingId = id;
        document.getElementById('editDegreeFullName').value = degree.fullName;
        document.getElementById('editDegreeShortName').value = degree.shortName;
        UI.togglePopup('popupEditForm');
    },

    update: async () => {
        const fullName = document.getElementById('editDegreeFullName').value;
        const shortName = document.getElementById('editDegreeShortName').value;
        try {
            await API.updateDegree(DegreeHandlers.editingId, { fullName, shortName });
            UI.togglePopup('popupEditForm');
            mainData.fetchAndRenderAllData();
        } catch (err) {
            alert('Lỗi khi cập nhật bằng cấp');
            console.error(err);
        }
    }
};