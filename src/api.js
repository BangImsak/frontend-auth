// src/api.js
import axios from 'axios';

// เปลี่ยน URL ถ้า backend คุณรัน port อื่น
const API_BASE_URL = 'http://localhost:4000';

export async function registerUser(data) {
  // data = { firstName, lastName, gender, dateOfBirth, email, password }
  const res = await axios.post(`${API_BASE_URL}/api/register`, data);
  return res.data;
}

export async function loginUser(data) {
  // data = { email, password }
  const res = await axios.post(`${API_BASE_URL}/api/login`, data);
  return res.data;
}

export async function forgotPassword(data) {
  // data = { email }
  const res = await axios.post(`${API_BASE_URL}/api/forgot-password`, data);
  return res.data;
}
