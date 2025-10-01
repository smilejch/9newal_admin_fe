// src/modules/setting/api/user.js
import instance from '@/api/axios';

// 사용자 생성
export async function createUser(userData) {
  const response = await instance.post('/setting/users', userData);
  return response.data;
}

// 사용자 수정
export async function updateUser(userNo, userData) {
  const response = await instance.put(`/setting/users/${userNo}`, userData);
  return response.data;
}

// 사용자 삭제
export async function deleteUser(userNo) {
  const response = await instance.delete(`/setting/users/${userNo}`);
  return response.data;
}

// 사용자 목록 조회 (페이지네이션 및 필터링)
export async function fetchUserList(queryParams, requestBody = {}) {
  const response = await instance.post('/setting/users/search', requestBody, {
    params: queryParams
  });
  return response.data;
}

// 사용자 상세 조회
export async function fetchUser(userNo) {
  const response = await instance.get(`/setting/users/${userNo}`);
  return response.data;
}
