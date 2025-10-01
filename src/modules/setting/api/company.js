// src/modules/setting/api/company.js
import instance from '@/api/axios';

// 회사 생성
export async function createCompany(companyData) {
  const response = await instance.post('/setting/companies', companyData);
  return response.data;
}

// 회사 수정
export async function updateCompany(companyNo, companyData) {
  const response = await instance.put(`/setting/companies/${companyNo}`, companyData);
  return response.data;
}

// 회사 삭제
export async function deleteCompany(companyNo) {
  const response = await instance.delete(`/setting/companies/${companyNo}`);
  return response.data;
}

// 회사 목록 조회 (페이지네이션 및 필터링)
export async function fetchCompanyList(queryParams, requestBody = {}) {
  const response = await instance.post('/setting/companies/search', requestBody, {
    params: queryParams
  });
  return response.data;
}

// 회사 상세 조회
export async function fetchCompany(companyNo) {
  const response = await instance.get(`/setting/companies/${companyNo}`);
  return response.data;
}
