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

/**
 * 센터 목록 조회 (발주서별)
 */
export async function fetchShipmentList(orderMstNo) {
  const response = await instance.get(`/purchase/orders/${orderMstNo}/shipments`);
  return response.data;
}

/**
 * 센터별 발주 구매 정보 조회 (shipmentDtl) - estimated_yn이 0일 때
 */
export async function fetchShipmentDtl(queryParams, shipmentMstNo) {
  const response = await instance.get(`/purchase/shipments/${shipmentMstNo}/purchase`, {
    params: queryParams
  });
  return response.data;
}

/**
 * 센터별 견적 상품 정보 조회 (shipmentEstimateProduct) - estimated_yn이 1일 때
 */
export async function fetchShipmentEstimateProduct(queryParams, shipmentMstNo) {
  const response = await instance.get(`/purchase/shipments/${shipmentMstNo}/estimate-products`, {
    params: queryParams
  });
  return response.data;
}

/**
 * 발주 구매 정보 조회 (전체센터) - orderMstNo로 전체 발주 구매 정보 조회
 */
export async function fetchPurchaseList(queryParams, orderMstNo) {
  const response = await instance.get(`/purchase/orders/${orderMstNo}/purchase`, {
    params: queryParams
  });
  return response.data;
}

/**
 * 구매 탭용 견적 상품 정보 전체 조회 - orderMstNo로 estimated_yn이 1인 모든 데이터 조회
 */
export async function fetchEstimateProductsAll(queryParams, orderMstNo) {
  const response = await instance.get(`/purchase/shipments/${orderMstNo}/estimate-products-all`, {
    params: queryParams
  });
  return response.data;
}

/**
 * 견적 목록 조회 - orderMstNo로 견적 목록 조회
 */
export async function fetchEstimateList(queryParams, orderMstNo) {
  const response = await instance.get(`/purchase/shipments/estimates/${orderMstNo}`, {
    params: queryParams
  });
  return response.data;
}

/**
 * 견적서 상세 조회 - estimateId로 견적서 상세 정보 조회
 */
export async function fetchEstimateDetail(estimateId) {
  const response = await instance.get(`/purchase/shipments/estimates/${estimateId}/detail`);
  return response.data;
}

/**
 * 견적서 입금확인 - orderShipmentEstimateNo로 입금확인 처리
 */
export async function confirmEstimateDeposit(orderShipmentEstimateNo) {
  const response = await instance.put(`/purchase/shipments/estimates/${orderShipmentEstimateNo}/deposit-confirm`);
  return response.data;
}

/**
 * 전체센터 탭 엑셀 다운로드 - orderMstNo로 전체센터 구매 정보 엑셀 다운로드 (estimated_yn이 1인 데이터만)
 */
export async function downloadPurchaseListExcel(orderMstNo) {
  return await downloadExcel(`/purchase/orders/${orderMstNo}/shipments/download`, '전체센터_구매정보.xlsx');
}

/**
 * 견적 탭 엑셀 다운로드 - orderMstNo로 견적 목록 엑셀 다운로드
 */
export async function downloadEstimateListExcel(orderMstNo) {
  return await downloadExcel(`/purchase/shipments/estimates/${orderMstNo}/download`, '견적목록.xlsx');
}

/**
 * 구매 탭 엑셀 다운로드 - orderMstNo로 구매 탭 견적 상품 정보 전체 엑셀 다운로드
 */
export async function downloadEstimateProductsAllExcel(orderMstNo) {
  return await downloadExcel(`/purchase/shipments/${orderMstNo}/estimate-products-all/download`, '구매정보.xlsx');
}

/**
 * 1688 송장번호 업로드 - orderMstNo로 1688 송장번호 엑셀 파일 업로드
 */
export async function upload1688TrackingNumber(orderMstNo, file) {
  return await uploadExcel(`/purchase/orders/${orderMstNo}/1688-tracking-number/upload`, file);
}

/**
 * CJ 운송장 발급 - 구매 탭에서 선택된 항목들의 order_shipment_packing_mst_no로 CJ 운송장 발급
 */
export async function issueCjTrackingNumber(orderShipmentPackingMstNos) {
  const response = await instance.post('/purchase/shipments/cj-tracking-number/issue', {
    order_shipment_packing_mst_nos: orderShipmentPackingMstNos
  });
  return response.data;
}

/**
 * 선택 아이템 구매 - order_shipment_dtl_no 배열로 1688 주문 생성
 */
export async function create1688Order(orderShipmentDtlNos) {
  const response = await instance.post('/purchase/shipments/1688-order/create', {
    order_shipment_dtl_nos: orderShipmentDtlNos
  });
  return response.data;
}
