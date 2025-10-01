// src/modules/setting/api/sku.js
import instance from '@/api/axios';
import { downloadExcel, uploadExcel } from '@/utils/excel';

/**
 * GET    /set/skus       - 목록 조회
 * POST   /set/skus       - 새 리소스 생성  
 * GET    /set/skus/:id   - 특정 리소스 조회
 * PUT    /set/skus/:id   - 특정 리소스 전체 수정
 * PATCH  /set/skus/:id   - 특정 리소스 부분 수정  
 * DELETE /set/skus/:id   - 특정 리소스 삭제
 */

/**
 * SKU 등록 set
 * @param {Object} skuData - SKU 등록 데이터
 * @returns {Promise} set 응답
 */
export async function createSku(skuData) {
  const response = await instance.post('/setting/skus', skuData);
  return response.data;
}

/**
 * SKU 수정 set
 * @param {string|number} skuId - SKU ID
 * @param {Object} skuData - SKU 수정 데이터
 * @returns {Promise} set 응답
 */
export async function updateSku(skuNo, skuData) {
  const response = await instance.put(`/setting/skus/${skuNo}`, skuData);
  return response.data;
}

/**
 * SKU 삭제 set
 * @param {string|number} skuId - SKU ID
 * @returns {Promise} set 응답
 */
export async function deleteSku(skuNo) {
  const response = await instance.delete(`/setting/skus/${skuNo}`);
  return response.data;
}

/**
 * SKU 목록 조회 set (POST 방식)
 * @param {Object} queryParams - 페이지네이션 및 정렬 파라미터 (URL 쿼리)
 * @param {Object} requestBody - 필터 조건 (POST body)
 * @returns {Promise} set 응답
 */
export async function fetchSkuList(queryParams, requestBody = {}) {
  const response = await instance.post('/setting/skus/search', requestBody, {
    params: queryParams
  });
  return response.data;
}

/**
 * SKU 상세 조회 set
 * @param {string|number} skuId - SKU ID
 * @returns {Promise} set 응답
 */
export async function fetchSku(skuNo) {
  const response = await instance.get(`/setting/skus/${skuNo}`);
  return response.data;
}

/**
 * SKU 템플릿 다운로드
 * @returns {Promise} 파일 다운로드
 */
export async function fetchSkuTemplateDownload() {
  return await downloadExcel('/setting/skus/template/download', 'sku_template.xlsx');
}

export async function fetchSkuTemplateUpload(file) {
  return await uploadExcel('/setting/skus/template/upload', file);
}

/**
 * SKU 이미지 업로드
 * @param {string|number} skuNo - SKU 번호
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise} API 응답
 */
export async function uploadSkuImage(skuNo, file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await instance.post(`/setting/skus/${skuNo}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

/**
 * SKU 이미지 목록 조회
 * @param {string|number} skuNo - SKU 번호
 * @returns {Promise} API 응답
 */
export async function fetchSkuImages(skuNo) {
  const response = await instance.get(`/setting/skus/${skuNo}/images`);
  return response.data;
}

/**
 * SKU 이미지 삭제
 * @param {string|number} skuNo - SKU 번호
 * @returns {Promise} API 응답
 */
export async function deleteSkuImage(skuNo) {
  const response = await instance.delete(`/setting/skus/${skuNo}/images`);
  return response.data;
}
