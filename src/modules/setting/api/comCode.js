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

// 부모 코드 목록 조회 (parent_com_code가 null이거나 빈 값인 것들)
export async function fetchParentComCodeList(queryParams, requestBody = {}) {
  const response = await instance.post('/setting/com-codes/parents', requestBody, {
    params: queryParams
  });
  return response.data;
}

// 자식 코드 목록 조회 (특정 parent_com_code에 해당하는 것들)
export async function fetchChildComCodeList(parentComCode, queryParams, requestBody = {}) {
  const response = await instance.post(`/setting/com-codes/children/${parentComCode}`, requestBody, {
    params: queryParams
  });
  return response.data;
}

