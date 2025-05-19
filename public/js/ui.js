// js/ui.js
const UI = {
    togglePopup: (id) => {
        document.getElementById(id).classList.toggle('hidden');
    },

    showSection: (sectionIdToShow) => {
        ALL_SECTION_IDS.forEach(sectionId => {
            document.getElementById(sectionId).classList.add('hidden');
        });
        document.getElementById(sectionIdToShow).classList.remove('hidden');
    },

    populateDropdown: (elementId, items, valueField, displayField, defaultOptionText) => {
        const select = document.getElementById(elementId);
        select.innerHTML = `<option value="">${defaultOptionText}</option>` +
            items.map(item => `<option value="${item[valueField]}">${item[displayField]}</option>`).join('');
    },

    formatDateForInput: (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    },

    formatDateForDisplay: (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return !isNaN(date) ? date.toLocaleDateString('vi-VN') : '';
    }
};

// Hàm này sẽ được gọi từ HTML, nên cần ở global scope hoặc được quản lý bởi main.js
function handleShowSection(sectionId) {
    UI.showSection(sectionId);
    if (sectionId !== 'welcome') {
        // Gọi hàm load dữ liệu chung từ main.js
        // Đảm bảo mainData.fetchAndRenderAllData đã được định nghĩa trước khi gọi
        if (typeof mainData !== 'undefined' && mainData.fetchAndRenderAllData) {
            mainData.fetchAndRenderAllData();
        }
    }
}