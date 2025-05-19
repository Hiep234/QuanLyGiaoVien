// js/main.js
const mainData = {
    degrees: [],
    faculties: [],
    teachers: [],

    fetchAndRenderAllData: async () => {
        try {
            const [facultiesRes, degreesRes, teachersRes] = await Promise.all([
                API.fetchFaculties(),
                API.fetchDegrees(),
                API.fetchTeachers()
            ]);

            mainData.faculties = facultiesRes.data;
            mainData.degrees = degreesRes.data;
            mainData.teachers = teachersRes.data;
            
            // Render tables
            DegreeHandlers.renderTable(mainData.degrees);
            FacultyHandlers.renderTable(mainData.faculties);
            TeacherHandlers.renderTable(mainData.teachers);

            // Populate dropdowns for forms and filters
            TeacherHandlers.populateFormsDropdowns(); // For teacher add/edit forms
            StatisticsHandlers.populateFilters(); // For statistics filters

            // Update statistics count and table
            StatisticsHandlers.updateTeacherCountAndTable();

        } catch (err) {
            console.error('Lỗi khi lấy dữ liệu:', err);
            alert('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối API.');
        }
    },

    init: () => {
        UI.showSection('welcome'); // Hiển thị section chào mừng ban đầu
        mainData.fetchAndRenderAllData(); // Tải dữ liệu lần đầu
        StatisticsHandlers.addEventListeners(); // Thêm listeners cho bộ lọc thống kê
        
        // Gán các handlers vào global scope để HTML có thể gọi (nếu bạn giữ onclick trong HTML)
        // Hoặc bạn có thể chuyển sang addEventListener tại đây cho tất cả các nút
        window.DegreeHandlers = DegreeHandlers;
        window.FacultyHandlers = FacultyHandlers;
        window.TeacherHandlers = TeacherHandlers;
        window.UI = UI; // Cho các onclick gọi UI.togglePopup
    }
};

// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', mainData.init);

console.log('Faculties:', mainData.faculties);
console.log('Degrees:', mainData.degrees);
console.log('Teachers:', mainData.teachers);
