<template>
  <CommonModal
    :isOpen="isOpen"
    title="견적서 조회"
    size="fullscreen"
    :showSave="false"
    :showDelete="false"
    @close="handleClose"
  >
    <template #header-actions>
      <div class="flex items-center space-x-2">
        <div v-if="isEstimateLoaded && depositYn === 1" class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm flex items-center">
          <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          입금확인완료
        </div>
        <button
          v-else-if="isEstimateLoaded"
          @click="handleDepositConfirm"
          :disabled="depositYn === 1"
          class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          입금확인
        </button>
        <button
          v-if="isEstimateLoaded"
          @click="printEstimate"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
        >
          프린트
        </button>
      </div>
    </template>
    <template #content>
      <div class="estimate-modal-content p-2 h-full flex flex-col">
        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="flex-1 flex items-center justify-center">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-blue-800 text-sm">견적서를 불러오는 중...</p>
          </div>
        </div>

        <!-- 견적서 표시 섹션 -->
        <div v-else-if="isEstimateLoaded" class="flex-1 overflow-y-auto">
          <!-- 실제 견적서 형태 -->
          <div id="estimate-document" class="bg-white border border-gray-300 shadow-lg p-8 max-w-6xl mx-auto">
            <!-- 견적서 헤더 -->
            <div class="estimate-header mb-6 border-b-2 border-gray-300 pb-4">
              <div class="flex justify-between items-start">
                <!-- 왼쪽: 견적서 타이틀 -->
                <div>
                  <h1 class="text-3xl font-bold text-gray-800 mb-2">견적서</h1>
                  <div class="text-sm text-gray-600">
                    <p>견적일자: {{ estimateDate }}</p>
                    <p>견적번호: {{ estimateId }}</p>
                  </div>
                </div>
                
                <!-- 오른쪽: 견적 요청처/제공처 테이블 -->
                <div class="estimate-parties">
                  <table class="text-sm border-collapse">
                    <thead>
                      <tr>
                        <th class="border border-gray-300 px-3 py-2 bg-gray-50 text-left font-semibold">견적 요청처</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="border border-gray-300 px-3 py-2">
                          <div class="font-semibold text-gray-800">{{ companyInfo.company_name }}</div>
                          <div class="text-gray-600">사업자등록번호: {{ companyInfo.business_registration_number }}</div>
                          <div class="text-gray-600">
                            {{ companyInfo.address }}
                            <span v-if="companyInfo.address_dtl"> {{ companyInfo.address_dtl }}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- 견적 실패 목록 -->
            <div v-if="productFailList.length > 0" class="mb-6 estimate-section">
              <h3 class="text-md font-semibold text-red-600 mb-3">견적 실패 목록</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm border-collapse border border-red-400 product-fail-table">
                  <thead>
                    <tr class="bg-red-50">
                      <th class="w-15 border border-red-400 px-3 py-2 text-left">센터명</th>
                      <th class="w-10 border border-red-400 px-3 py-2 text-left">SKU ID</th>
                      <th class="w-50 border border-red-400 px-3 py-2 text-left">상품명</th>
                      <th class="w-15 border border-red-400 px-3 py-2 text-center">묶음</th>
                      <th class="w-10 border border-red-400 px-3 py-2 text-center">수량</th>
                      <th class="w-15 border border-red-400 px-3 py-2 text-center">비닐규격</th>
                      <th class="w-40 border border-red-400 px-3 py-2 text-center">실패 사유</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="product in productFailList" :key="product.sku_name">
                      <td class="border border-red-400 px-3 py-2">{{ product.center_name }}</td>
                      <td class="border border-red-400 px-3 py-2">{{ product.sku_id }}</td>
                      <td class="border border-red-400 px-3 py-2">{{ product.sku_name }}</td>
                      <td class="border border-red-400 px-3 py-2 text-center">{{ product.bundle }}</td>
                      <td class="border border-red-400 px-3 py-2 text-center">{{ product.quantity }}개</td>
                      <td class="border border-red-400 px-3 py-2 text-center">{{ product.package_vinyl_spec_name }}</td>
                      <td class="border border-red-400 px-3 py-2 text-center text-red-600" v-html="product.error_message"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="mt-3 text-right">
                <p class="text-sm text-red-600"><strong>실패 제품 수: {{ productFailList.length }}개</strong></p>
              </div>
            </div>

            <!-- 구매 제품 목록 -->
            <div class="mb-6 estimate-section">
              <h3 class="text-md font-semibold text-gray-800 mb-3">구매 제품 목록</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm border-collapse border border-gray-400 product-table">
                  <thead>
                    <tr class="bg-gray-100">
                        <th class="w-28 border border-gray-400 px-3 py-2 text-left">센터명</th>
                        <th class="w-32 border border-gray-400 px-3 py-2 text-left">SKU ID</th>
                        <th class="w-80 border border-gray-400 px-3 py-2 text-left">상품명</th>
                        <th class="w-15 border border-gray-400 px-3 py-2 text-center">묶음</th>
                        <th class="w-15 border border-gray-400 px-3 py-2 text-center">수량</th>
                        <th class="w-20 border border-gray-400 px-3 py-2 text-center">단가</th>
                        <th class="w-24 border border-gray-400 px-3 py-2 text-center">제품금액</th>
                        <th class="w-20 border border-gray-400 px-3 py-2 text-center">비닐규격</th>
                        <th class="w-24 border border-gray-400 px-3 py-2 text-center">포장금액</th>
                        <th class="w-24 border border-gray-400 px-3 py-2 text-center">총금액</th>
                      </tr>
                  </thead>
                  <tbody>
                    <tr v-for="product in productList" :key="product.sku_name">
                      <td class="border border-gray-400 px-3 py-2">{{ product.center_name }}</td>
                      <td class="border border-gray-400 px-3 py-2">{{ product.sku_id }}</td>
                      <td class="border border-gray-400 px-3 py-2">{{ product.sku_name }}</td>
                      <td class="border border-gray-400 px-3 py-2 text-center">{{ product.bundle }}</td>
                      <td class="border border-gray-400 px-3 py-2 text-center">{{ product.quantity }}개</td>
                      <td class="border border-gray-400 px-3 py-2 text-center">{{ product.unit_price.toLocaleString() }}원</td>
                      <td class="border border-gray-400 px-3 py-2 text-center">{{ product.product_amount.toLocaleString() }}원</td>
                      <td class="border border-gray-400 px-3 py-2 text-center">{{ product.package_vinyl_spec_name }}</td>
                      <td class="border border-gray-400 px-3 py-2 text-center">{{ product.package_amount.toLocaleString() }}원</td>
                      <td class="border border-gray-400 px-3 py-2 text-center">{{ product.total_amount.toLocaleString() }}원</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="mt-3 text-right">
                <p class="text-sm"><strong>제품 총액: {{ productTotal.toLocaleString() }}원</strong></p>
              </div>
            </div>

            <!-- 박스 견적 -->
            <div class="mb-6 estimate-section">
              <h3 class="text-md font-semibold text-gray-800 mb-3">박스 견적</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm border-collapse border border-gray-400 box-packaging-table">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="border border-gray-400 px-3 py-2 text-left">센터명</th>
                      <th class="border border-gray-400 px-3 py-2 text-left">박스크기</th>
                      <th class="border border-gray-400 px-3 py-2 text-center">수량</th>
                      <th class="border border-gray-400 px-3 py-2 text-center">단가</th>
                      <th class="border border-gray-400 px-3 py-2 text-center">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="box in boxEstimate" :key="`${box.center_name}-${box.package_box_spec_name}`">
                      <td class="border border-gray-400 px-3 py-2">{{ box.center_name }}</td>
                      <td class="border border-gray-400 px-3 py-2">{{ box.package_box_spec_name }}</td>
                      <td class="border border-gray-400 px-3 py-2 text-center">{{ box.quantity }}개</td>
                      <td class="border border-gray-400 px-3 py-2 text-center">{{ box.unit_price.toLocaleString() }}원</td>
                      <td class="border border-gray-400 px-3 py-2 text-center">{{ box.amount.toLocaleString() }}원</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="mt-3 text-right">
                <p class="text-sm"><strong>박스 총액: {{ boxTotal.toLocaleString() }}원</strong></p>
              </div>
            </div>

            <!-- 총 견적 비용 -->
            <div class="mt-6 border-t-2 border-gray-300 pt-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">총 견적 비용</h3>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span>제품 총액:</span>
                    <span>{{ productTotal.toLocaleString() }}원</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span>포장 총액:</span>
                    <span>{{ packagingTotal.toLocaleString() }}원</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span>박스 총액:</span>
                    <span>{{ boxTotal.toLocaleString() }}원</span>
                  </div>
                  <div class="flex justify-between text-base font-bold border-t border-gray-300 pt-2">
                    <span>총 견적 금액:</span>
                    <span>{{ grandTotal.toLocaleString() }}원</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 로고 -->
            <div class="mt-6 text-center">
              <img 
                src="/src/assets/9NEWALL_sample_logo.png" 
                alt="9NEWALL" 
                class="h-30 mx-auto"
              />
            </div>

          </div>
        </div>

        <!-- 에러 상태 -->
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800 text-sm">견적서를 불러올 수 없습니다.</p>
          </div>
        </div>
      </div>
    </template>
  </CommonModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import CommonModal from '@/components/CommonModal.vue'
import { showError, showSuccess, showConfirm } from '@/utils/alert'
import { fetchEstimateDetail, confirmEstimateDeposit } from '@/modules/purchase/api/purchase'
import { fetchCompanyProfile } from '@/modules/common/api/common'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  orderShipmentEstimateNo: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['close'])

const isLoading = ref(false)
const isEstimateLoaded = ref(false)

// 견적서 관련 데이터
const estimateId = ref('')
const estimateDate = ref('')
const depositYn = ref(0)
const companyInfo = ref({})
const productList = ref([])
const productFailList = ref([])
const boxEstimate = ref([])
const packagingEstimate = ref([])

// 견적서 데이터 로드
const loadEstimateData = async () => {
  if (!props.orderShipmentEstimateNo) {
    showError('견적서 조회 실패', '견적서 번호가 없습니다.')
    return
  }

  isLoading.value = true
  isEstimateLoaded.value = false
  
  try {
    // 견적서 상세 정보 조회
    const estimateData = await fetchEstimateDetail(props.orderShipmentEstimateNo)
    
    // 견적서 기본 정보 설정
    if (estimateData && estimateData.data) {
      const estimateInfo = estimateData.data.estimate_info || {}
      estimateId.value = estimateInfo.estimate_id || ''
      estimateDate.value = estimateInfo.estimate_date || new Date().toLocaleDateString('ko-KR')
      depositYn.value = estimateInfo.deposit_yn || 0
      
      // 구매 제품 목록 설정
      productList.value = estimateData.data.product_estimates || []
      
      // 가구매 견적 실패 목록 설정
      productFailList.value = estimateData.data.product_estimates_fail || []
      
      // 박스 견적 설정
      boxEstimate.value = estimateData.data.box_estimates || []
      
      // 포장 견적은 제품 정보에 포함되므로 별도 배열은 비움
      packagingEstimate.value = []

      console.log("--------------------------------")
      console.log(estimateInfo)
      console.log(estimateInfo.company_no)
      console.log("--------------------------------")

      // 회사 정보 설정
      try {
        const companyData = await fetchCompanyProfile(estimateInfo.company_no)
        if (companyData) {
          companyInfo.value = companyData
        } else {
          companyInfo.value = {}
        }
      } catch (error) {
        console.error('회사 정보 로드 실패:', error)
        companyInfo.value = {}
      }
    }
    
    
    isEstimateLoaded.value = true
    
  } catch (error) {
    console.error('견적서 로드 실패:', error)
    showError('견적서 로드 실패', '견적서를 불러오는 중 오류가 발생했습니다.')
    isEstimateLoaded.value = false
  } finally {
    isLoading.value = false
  }
}

// 입금확인 처리
const handleDepositConfirm = async () => {
  if (!props.orderShipmentEstimateNo) {
    showError('입금확인 실패', '견적서 번호가 없습니다.')
    return
  }

  try {
    const confirmed = await showConfirm(
      '입금확인',
      '입금확인으로 변경하시겠습니까?',
      '확인',
      '취소',
      'success'
    )

    if (!confirmed) {
      return
    }

    await confirmEstimateDeposit(props.orderShipmentEstimateNo)
    showSuccess('입금확인 완료', '입금확인이 완료되었습니다.')
    
    // 입금확인 후 견적서 데이터 다시 로드
    await loadEstimateData()
  } catch (error) {
    console.error('입금확인 실패:', error)
    showError('입금확인 실패', '입금확인 처리 중 오류가 발생했습니다.')
  }
}

// 견적서 프린트
const printEstimate = () => {
  // 프린트 전에 페이지 분할을 위한 스타일 적용
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    alert('팝업이 차단되었습니다. 팝업을 허용해주세요.')
    return
  }
  
  // 현재 페이지의 HTML 내용 가져오기
  const estimateElement = document.getElementById('estimate-document')
  if (!estimateElement) {
    alert('견적서를 찾을 수 없습니다.')
    return
  }
  
  // 프린트용 HTML 생성
  const printHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>견적서</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
        }
        
        @page {
          margin: 1cm;
          size: A4;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          page-break-inside: auto;
        }
        
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        
        tr {
          page-break-inside: avoid;
        }
        
        thead {
          display: table-header-group;
        }
        
        h1, h2, h3 {
          page-break-after: avoid;
        }
        
        .estimate-section {
          page-break-inside: auto;
          margin-bottom: 20px;
        }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .mb-4 { margin-bottom: 16px; }
        .mb-3 { margin-bottom: 12px; }
        .mt-3 { margin-top: 12px; }
        .p-4 { padding: 16px; }
        .border-b { border-bottom: 1px solid #000; }
        .border-b-2 { border-bottom: 2px solid #000; }
        .pb-4 { padding-bottom: 16px; }
        
        /* 이미지 로고 프린트 지원 */
        img {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
          visibility: visible !important;
        }
        
        .h-30 { height: 7.5rem !important; }
        .mx-auto { margin-left: auto !important; margin-right: auto !important; }
        .text-center { text-align: center !important; }
        .mt-6 { margin-top: 24px !important; }
        
        /* 견적서 타이틀 아래 선 프린트에서 보이도록 */
        .estimate-header {
          border-bottom: 2px solid #000 !important;
          padding-bottom: 16px !important;
          margin-bottom: 20px !important;
        }
        
        /* 새로운 헤더 레이아웃 */
        .flex { display: flex !important; }
        .justify-between { justify-content: space-between !important; }
        .items-start { align-items: flex-start !important; }
        .items-center { align-items: center !important; }
        .space-x-4 > * + * { margin-left: 16px !important; }
        .text-right { text-align: right !important; }
        .text-left { text-align: left !important; }
        .mb-6 { margin-bottom: 24px !important; }
        .mb-2 { margin-bottom: 8px !important; }
        .mt-1 { margin-top: 4px !important; }
        .text-2xl { font-size: 1.5rem !important; }
        .text-xs { font-size: 0.75rem !important; }
        .text-3xl { font-size: 1.875rem !important; }
        .font-bold { font-weight: 700 !important; }
        .border-collapse { border-collapse: collapse !important; }
        .bg-gray-50 { background-color: #f9fafb !important; }
        .border-gray-300 { border-color: #d1d5db !important; }
        .px-3 { padding-left: 12px !important; padding-right: 12px !important; }
        .py-2 { padding-top: 8px !important; padding-bottom: 8px !important; }
        
        /* 견적 요청처/제공처 테이블 스타일 */
        .estimate-parties table {
          width: auto !important;
          min-width: 300px !important;
        }
        
        .estimate-parties th,
        .estimate-parties td {
          border: 1px solid #d1d5db !important;
          padding: 8px 12px !important;
          text-align: left !important;
        }
        
        .estimate-parties th {
          background-color: #f9fafb !important;
          font-weight: 600 !important;
        }
        
        /* 가구매 견적 실패 목록 테이블 스타일 */
        .product-fail-table th,
        .product-fail-table td {
          border: 1px solid #dc2626 !important;
          padding: 8px 12px !important;
          text-align: left !important;
        }
        
        .product-fail-table th {
          background-color: #fef2f2 !important;
          font-weight: 600 !important;
        }
        
        .product-fail-table .text-red-600 {
          color: #dc2626 !important;
        }
        
        /* 총 견적 비용 섹션 */
        .bg-gray-50 { background-color: #f9fafb !important; }
        .rounded-lg { border-radius: 8px !important; }
        .space-y-2 > * + * { margin-top: 8px !important; }
        .border-t { border-top: 1px solid #d1d5db !important; }
        .pt-2 { padding-top: 8px !important; }
        .pt-4 { padding-top: 16px !important; }
        .mt-6 { margin-top: 24px !important; }
        .text-lg { font-size: 1.125rem !important; }
        .text-base { font-size: 1rem !important; }
        .font-bold { font-weight: 700 !important; }
        
        /* 로고 스타일 */
        .text-center { text-align: center !important; }
        .h-12 { height: 3rem !important; }
        .mx-auto { margin-left: auto !important; margin-right: auto !important; }
        
        /* 이미지 로고 프린트 최적화 */
        img {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
          visibility: visible !important;
        }
        
        /* 로고 이미지 특별 처리 */
        .estimate-header img,
        #estimate-document img {
          visibility: visible !important;
          display: block !important;
          margin: 0 auto !important;
        }
        
        /* h-30 클래스 추가 */
        .h-30 { height: 7.5rem !important; }
        
        /* 모던한 스타일 프린트에서도 적용 */
        .bg-slate-50 { background-color: #f8fafc !important; }
        .border-slate-200 { border-color: #e2e8f0 !important; }
        .text-slate-700 { color: #334155 !important; }
        .text-slate-600 { color: #475569 !important; }
        .text-slate-500 { color: #64748b !important; }
        .text-slate-800 { color: #1e293b !important; }
        .rounded-xl { border-radius: 12px !important; }
        .border { border-width: 1px !important; }
        .p-5 { padding: 20px !important; }
        .mb-3 { margin-bottom: 12px !important; }
        .mb-1 { margin-bottom: 4px !important; }
        .mb-6 { margin-bottom: 24px !important; }
        .uppercase { text-transform: uppercase !important; }
        .tracking-wide { letter-spacing: 0.025em !important; }
        .font-semibold { font-weight: 600 !important; }
      </style>
    </head>
    <body>
      ${estimateElement.outerHTML}
    </body>
    </html>
  `
  
  printWindow.document.write(printHTML)
  printWindow.document.close()
  
  // 프린트 창 열기
  printWindow.focus()
  printWindow.print()
  
  // 프린트 후 창 닫기
  printWindow.onafterprint = () => {
    printWindow.close()
  }
}

// 계산된 속성들
const productTotal = computed(() => {
  return productList.value.reduce((sum, product) => {
    return sum + (Number(product.product_amount) || 0)
  }, 0)
})

const boxTotal = computed(() => {
  return boxEstimate.value.reduce((sum, box) => {
    return sum + (Number(box.amount) || 0)
  }, 0)
})

const packagingTotal = computed(() => {
  return productList.value.reduce((sum, product) => {
    return sum + (Number(product.package_amount) || 0)
  }, 0)
})

const grandTotal = computed(() => {
  return (Number(productTotal.value) || 0) + (Number(boxTotal.value) || 0) + (Number(packagingTotal.value) || 0)
})

// 모달이 열릴 때 견적서 데이터 로드 (API 중복 호출 방지)
watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.orderShipmentEstimateNo) {
    await loadEstimateData()
  } else {
    // 모달이 닫힐 때 데이터 초기화
    isLoading.value = false
    isEstimateLoaded.value = false
    estimateId.value = ''
    estimateDate.value = ''
    depositYn.value = 0
    companyInfo.value = {}
    productList.value = []
    productFailList.value = []
    boxEstimate.value = []
    packagingEstimate.value = []
  }
})

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.estimate-modal-content {
  height: calc(100vh - 8rem);
  overflow-y: auto;
}

/* 프린트용 스타일 - 자동 페이지 분할 */
@media print {
  /* 전체 페이지 스타일 */
  body * {
    visibility: hidden;
  }
  
  /* 견적서만 보이게 */
  #estimate-document, #estimate-document * {
    visibility: visible;
  }
  
  /* 견적서 위치 조정 */
  #estimate-document {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    box-shadow: none;
    border: none;
    margin: 0;
    padding: 20px;
    background: white;
    page-break-inside: auto;
    overflow: visible;
  }
  
  /* 페이지 설정 */
  @page {
    margin: 1cm;
    size: A4;
  }
  
  /* 테이블 페이지 분할 설정 - 허용 */
  table {
    page-break-inside: auto;
    page-break-after: auto;
  }
  
  /* 테이블 행은 분할 방지하되, 테이블 자체는 분할 허용 */
  tr {
    page-break-inside: avoid;
  }
  
  /* 테이블 헤더는 각 페이지에 반복 */
  thead {
    display: table-header-group;
  }
  
  /* 섹션별 페이지 분할 - 제품 목록은 분할 허용 */
  .estimate-section {
    page-break-inside: auto;
    page-break-after: auto;
  }
  
        /* 제품 목록 테이블 - 분할 허용 */
        .product-table {
          page-break-inside: auto;
          page-break-after: auto;
        }
        
        /* 가구매 견적 실패 목록 테이블 - 분할 허용 */
        .product-fail-table {
          page-break-inside: auto;
          page-break-after: auto;
        }
  
  /* 박스 및 포장 견적 테이블 - 분할 허용 */
  .box-packaging-table {
    page-break-inside: auto;
    page-break-after: auto;
  }
  
  /* 제목은 페이지 분할 방지 */
  h1, h2, h3 {
    page-break-after: avoid;
  }
  
  /* 프린트 시 숨길 요소들 */
  .no-print {
    display: none !important;
  }
  
  /* 버튼 숨기기 */
  button {
    display: none !important;
  }
  
  /* 긴 내용이 잘리지 않도록 */
  * {
    overflow: visible !important;
  }
  
  /* 브라우저별 호환성을 위한 추가 설정 */
  html, body {
    height: auto !important;
    overflow: visible !important;
  }
  
  /* 견적서 컨테이너 높이 제한 해제 */
  #estimate-document {
    height: auto !important;
    max-height: none !important;
    min-height: auto !important;
  }
  
  /* 테이블 셀 내용이 잘리지 않도록 */
  td, th {
    overflow: visible !important;
    white-space: nowrap;
  }
  
  /* 페이지 분할 강제 설정 */
  .force-page-break {
    page-break-before: always;
  }
  
  /* 테이블이 너무 길 때 강제 분할 */
  .product-table tbody tr:nth-child(20n) {
    page-break-after: always;
  }
}
</style>
