const BASE_URL = 'http://localhost:8080/hospital';
const API_ENDPOINTS = {
    LOGIN: BASE_URL + '/user/login',
    PROFILE: BASE_URL + '/user/profile',
    UPDATE_PROFILE: BASE_URL + '/user/update-profile',
    UPDATE_PROFILE_PICTURE: BASE_URL + '/user/update-profile-picture',
    SIGNUP: BASE_URL + '/patient/signup',
    DELETE_USER: BASE_URL + '/user/delete',
    GET_PATIENTS: BASE_URL + '/patient/getPatients',
    GET_DOCTORS: BASE_URL + '/doctor/getDoctors',
    ADD_DOCTOR: BASE_URL + '/doctor/addDoctor'
}

export default API_ENDPOINTS;
