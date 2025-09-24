// src/modules/auth/api/auth.js
import instance from '@/api/axios';
import axios from 'axios';

// 로그인 전용 axios 인스턴스 (인터셉터 우회)
const loginInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  withCredentials: true,
});

// 로그인 API (인터셉터 우회)
export function login(payload) {
  // payload: { user_id, user_password }
  return loginInstance.post('/auth/login', payload);
}

// 토큰 갱신 API
export function refreshToken() {
  return instance.post('/auth/refresh');
}

// 로그아웃 API
export function logout() {
  return instance.post('/auth/logout');
}

// 회사 정보 변경
export function switchCompany(payload) {
  return instance.post('/auth/switch-company', payload);
}

// 패스워드 변경 API
export function changePassword(payload) {
  // payload: { current_password, new_password, new_password_confirm }
  return instance.post('/auth/change-password', payload);
}

// 사용자 정보 조회
export function getMe() {
  return instance.get('/auth/me');
}

// 비밀번호 재설정 요청 (이메일로 링크 발송) - 인터셉터 우회
export function resetPassword(payload) {
  // payload: { email }
  return loginInstance.post('/auth/reset-password', payload);
}

// 토큰 검증 (선택적 기능)
export function verifyToken() {
  return instance.get('/auth/verify');
}

// 패스워드 재설정 요청 - 인터셉터 우회
export function requestPasswordReset(email) {
  return loginInstance.post('/auth/password-reset-request', { email });
}

// 패스워드 재설정 확인 - 인터셉터 우회
export function confirmPasswordReset(payload) {
  return loginInstance.post('/auth/password-reset-confirm', payload);
}