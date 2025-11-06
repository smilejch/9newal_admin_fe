// src/modules/purchase/api/purchase.js
import instance from '@/api/axios';
import { downloadExcel, uploadExcel } from '@/utils/excel';


/**
 * 발주 목록 조회
 */
export async function fetchOrderMstList(queryParams, requestBody = {}) {
    const response = await instance.post('/purchase/orders/search', requestBody, {
      params: queryParams
    });
    
    return response.data;
}

/**
 * 발주 마스터 상세 조회
 */
export async function fetchOrderMst(orderMstNo) {
  const response = await instance.get(`/purchase/orders/${orderMstNo}`);
  return response.data;
}

/**
 * 발주 디테일 상세 조회
 */
export async function fetchOrderDtlList(queryParams, orderMstNo) {
  const response = await instance.get(`/purchase/orders/${orderMstNo}/details`, {
    params: queryParams
  });
  return response.data;
}

/**
 * 발주 디테일 업로드
 */
export async function fetchOrderDtlUpload(orderMstNo, file) {
  return await uploadExcel(`/purchase/orders/${orderMstNo}/details/upload`, file);
}

/**
 * 발주 디테일 다운로드
 */
export async function fetchOrderDtlDownload(orderMstNo) {
  return await downloadExcel(`/purchase/orders/${orderMstNo}/details/download`,  '발주서_상세목록.xlsx');
}

/**
 * 발주 디테일 삭제
 */
export async function deleteOrderDtl(orderDtlNo) {
  const response = await instance.delete(`/purchase/orders/details/${orderDtlNo}`);
  return response.data;
}

/**
 * 발주 디테일 일괄 삭제
 */
export async function deleteOrderDtlBatch(orderDtlNos) {
  const response = await instance.delete('/purchase/orders/details/delete/batch', {
    data: {
      order_dtl_nos: orderDtlNos
    }
  })
  return response.data
}
