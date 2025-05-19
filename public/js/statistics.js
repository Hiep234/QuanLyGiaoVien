// js/statistics.js
const StatisticsHandlers = {
    populateFilters: () => {
        UI.populateDropdown('facultyFilter', mainData.faculties, '_id', 'fullName', 'Tất cả');
        UI.populateDropdown('degreeFilter', mainData.degrees, '_id', 'fullName', 'Tất cả');
    },

    renderFilteredTable: (filteredTeachers) => {
        const tableBody = document.getElementById('filteredTeacherTable');
        tableBody.innerHTML = filteredTeachers.map((t, i) => {
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
            </tr>`;
        }).join('');
    },

    updateTeacherCountAndTable: () => {
        const selectedFaculty = document.getElementById('facultyFilter').value;
        const selectedDegree = document.getElementById('degreeFilter').value;

        const filtered = mainData.teachers.filter(t => {
            const matchFaculty = !selectedFaculty || t.facultyId._id === selectedFaculty;
            const matchDegree = !selectedDegree || t.degreeId._id === selectedDegree;
            return matchFaculty && matchDegree;
        });

        document.getElementById('teacherCount').textContent = filtered.length;
        StatisticsHandlers.renderFilteredTable(filtered);
    },

    addEventListeners: () => {
        document.getElementById('facultyFilter').addEventListener('change', StatisticsHandlers.updateTeacherCountAndTable);
        document.getElementById('degreeFilter').addEventListener('change', StatisticsHandlers.updateTeacherCountAndTable);
    }
};