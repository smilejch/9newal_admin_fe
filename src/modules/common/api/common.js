// src/modules/common/api/common.js
import instance from '@/api/axios';

// 메뉴 목록 API
export function menuList(payload) {
  return instance.get('/common/menu', payload);
}

// 공통코드 API
export async function commonCodeList(parent_com_code) {
  const response = await instance.get(`/common/codes/${parent_com_code}`);
  return response.data;
}

/**
* 연동옵션 목록 조회
* @returns {Promise} 연동옵션 목록 응답
*/
export async function fetchLinkedOptions(offer_id) {
  const response = await instance.get(`/common/products/${offer_id}/options`);
  return response.data;
}

export async function saveLinkedOption(sku_no, selectedOption) {
  const response = await instance.put(`/common/products/${sku_no}/options`, selectedOption);
  return response.data;
}

// HS Code 목록 조회
export function getHsCodeList() {
  return instance.get('/common/hs-codes').then(response => response.data);
}

// 회사 프로필 저장
export async function updateCompanyProfile(profile) {
  const response = await instance.put('/common/company/profile', profile);
  return response.data;
}

// 회사 프로필 조회
export async function fetchCompanyProfile(company_no) {
  const response = await instance.get(`/common/company/${company_no}/profile`);
  return response.data;
}

// 회사 목록 조회
export async function fetchCompanyList() {
  const response = await instance.get('/common/companies');
  return response.data;
}
