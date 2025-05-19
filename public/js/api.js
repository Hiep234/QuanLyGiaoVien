// js/api.js








const API = {
    fetchFaculties: () => axios.get(`${API_BASE_URL}/faculties`),
    addFaculty: (data) => axios.post(`${API_BASE_URL}/faculties`, data),
    updateFaculty: (id, data) => axios.put(`${API_BASE_URL}/faculties/${id}`, data),
    deleteFaculty: (id) => axios.delete(`${API_BASE_URL}/faculties/${id}`),

    fetchDegrees: () => axios.get(`${API_BASE_URL}/degrees`),
    addDegree: (data) => axios.post(`${API_BASE_URL}/degrees`, data),
    updateDegree: (id, data) => axios.put(`${API_BASE_URL}/degrees/${id}`, data),
    deleteDegree: (id) => axios.delete(`${API_BASE_URL}/degrees/${id}`),

    fetchTeachers: () => axios.get(`${API_BASE_URL}/teachers`),
    addTeacher: (data) => axios.post(`${API_BASE_URL}/teachers`, data),
    updateTeacher: (id, data) => axios.put(`${API_BASE_URL}/teachers/${id}`, data),
    deleteTeacher: (id) => axios.delete(`${API_BASE_URL}/teachers/${id}`),


    
};
