// src/modules/setting/api/comCode.js
import instance from '@/api/axios';
// 공통코드 수정
export async function updateComCode(parentComCode, comCode, comCodeData) {
  const response = await instance.put(`/setting/com-codes/${parentComCode}/${comCode}`, comCodeData);
  return response.data;
}

// 공통코드 목록 조회 (페이지네이션 및 필터링)
export async function fetchComCodeList(queryParams, requestBody = {}) {
  const response = await instance.post('/setting/com-codes/search', requestBody, {
    params: queryParams
  });
  return response.data;
}

// 공통코드 상세 조회
export async function fetchComCode(parentComCode, comCode) {
  const response = await instance.get(`/setting/com-codes/${parentComCode}/${comCode}`);
  return response.data;
}

