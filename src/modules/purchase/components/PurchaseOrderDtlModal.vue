<template>
  <CommonModal
    :isOpen="isOpen"
    title="발주서 상세정보"
    size="fullscreen"
    :showSave="false"
    :showDelete="false"
    @close="handleClose"
  >
    <template #content>
      <div class="purchase-dtl-form modal-content h-[calc(98.5vh-8.5rem)] flex flex-col">
        <!-- 발주 정보 표시 -->
        <div v-if="orderInfo" class="px-4 pt-2 pb-1 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center gap-4 text-xs text-gray-600">
            <span v-if="orderInfo.company_name">
              <span class="font-medium text-gray-700">회사:</span> {{ orderInfo.company_name }}
            </span>
            <span v-if="orderInfo.platform_type_name">
              <span class="font-medium text-gray-700">구분:</span> {{ orderInfo.platform_type_name }}
            </span>
            <span v-if="orderInfo.order_date">
              <span class="font-medium text-gray-700">발주일:</span> {{ orderInfo.order_date }}
            </span>
          </div>
        </div>
        <TabGroup :selectedIndex="currentTabIndex" @change="handleTabChange">
            <div class="sticky top-0 bg-white z-10 border-b border-gray-200">
                <div class="px-4 pt-1 pb-2">
                    <!-- 도움말 아이콘 -->
                    <div class="flex justify-end mb-2">
                        <div class="relative group">
                            <button 
                                type="button"
                                class="text-gray-400 hover:text-gray-600 transition-colors"
                                @mouseenter="showTooltip = true"
                                @mouseleave="showTooltip = false"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </button>
                            <!-- 툴팁 -->
                            <div 
                                v-show="showTooltip"
                                class="absolute right-0 top-full mt-2 w-80 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-4 z-50"
                                @mouseenter="showTooltip = true"
                                @mouseleave="showTooltip = false"
                            >
                                <div class="space-y-3">
                                    <div>
                                        <div class="font-semibold mb-2 text-sm">센터 탭 설명</div>
                                        <div class="space-y-1.5">
                                            <div class="flex items-center gap-2">
                                                <div class="w-4 h-4 bg-purple-500 rounded"></div>
                                                <span>구매 요청 센터</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="border-t border-gray-700 pt-3">
                                        <div class="font-semibold mb-2 text-sm">상품 색상 설명</div>
                                        <div class="space-y-1.5">
                                            <div class="flex items-center gap-2">
                                                <div class="w-4 h-4 bg-blue-100 rounded"></div>
                                                <span>전체센터 탭에서의 구매요청 상품</span>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <div class="w-4 h-4 bg-red-50 rounded"></div>
                                                <span>견적 실패 상품</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- 화살표 -->
                                <div class="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                        </div>
                    </div>
                    <div ref="tabListContainer" class="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <TabList class="flex space-x-1 min-w-max mt-2">
                        <Tab v-for="(tab, index) in (tabs || [])" :key="tab.order_shipment_mst_no || tab.id" v-slot="{ selected }">
                            <div class="relative">
                            <button
                              :class="[
                                  'px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 relative',
                                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                  'whitespace-nowrap flex-shrink-0',
                                  selected
                                  ? tab.estimated_yn === 1 
                                    ? 'bg-purple-500 text-white shadow-lg border-b-2 border-purple-500 -mb-0.5'
                                    : 'bg-blue-500 text-white shadow-lg border-b-2 border-blue-500 -mb-0.5'
                                  : tab.estimated_yn === 1
                                    ? 'bg-purple-50 text-purple-700 hover:text-purple-800 hover:bg-purple-100 border border-purple-200 border-b-0'
                                    : 'bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 border-b-0'
                              ]"
                            >
                            {{ tab.label }}
                            <!-- estimated_yn이 1인 경우 배지 표시 -->
                            <span 
                                v-if="tab.estimated_yn === 1"
                                class="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white"
                                title="견적"
                            ></span>
                            </button>
                            </div>
                        </Tab>
                        </TabList>
                    </div>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto">
                <TabPanels class="h-full">
                    <TabPanel 
                        v-for="(tab, index) in (tabs || [])" 
                        :key="tab.order_shipment_mst_no || tab.id"
                        class="bg-white p-4 h-full"
                    >
                        <div class="h-full flex flex-col">
                            <div class="flex-1 min-h-0">
                                <PageDataGrid
                                    :loading="dataLoading"
                                    :rowData="dataList"
                                    height="100%"
                                >
                                    <template #header-buttons>
                                        <div class="flex items-center gap-3">
                                            <!-- 스위치 (구매 탭일 때만 표시) -->
                                            <div v-if="currentTabIndex === 2" class="flex items-center gap-2">
                                                <label class="text-xs text-gray-700">동일 판매자 선택</label>
                                                <button
                                                    @click="toggleAutoSelect"
                                                    :class="[
                                                        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                                        isAutoSelectEnabled ? 'bg-blue-600' : 'bg-gray-300'
                                                    ]"
                                                >
                                                    <span
                                                        :class="[
                                                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                                            isAutoSelectEnabled ? 'translate-x-5' : 'translate-x-1'
                                                        ]"
                                                    ></span>
                                                </button>
                                            </div>
                                            <!-- 드롭다운 버튼 -->
                                            <CommonButtons
                                                :buttons="[]"
                                                :dropdownButtons="dropdownButtons"
                                                @dropdown-click="handleDropdownClick"
                                            />
                                        </div>
                                    </template>
                                    <template #ag-grid>
                                        <ag-grid-vue
                                            ref="agGridRef"
                                            :key="`ag-grid-${currentTabIndex}-${dataList.length}`"
                                            class="ag-theme-alpine purchase-order-grid"
                                            theme="legacy"
                                            :rowData="dataList"
                                            :columnDefs="colDefs"
                                            :style="{ height: '100%', width: '100%' }"
                                            :suppressPaginationPanel="true"
                                            :defaultColDef="defaultColDef"
                                            :getRowStyle="getRowStyle"
                                            :getRowClass="getRowClass"
                                            :rowSelection="rowSelection"
                                            :isRowSelectable="isRowSelectable"
                                            @grid-ready="onGridReady"
                                            @row-clicked="onRowClicked"
                                            @selection-changed="onSelectionChanged"
                                        >
                                        </ag-grid-vue>
                                    </template>
                                    <template #pagination>
                                        <PagePagination
                                            :currentPage="currentPage"
                                            :totalItems="totalItems"
                                            :pageSize="pageSize"
                                            @page-change="handlePageChange"
                                            @page-size-change="handlePageSizeChange"
                                        />
                                    </template>
                                </PageDataGrid>
                            </div>
                            <!-- 통계 영역 (구매 탭 또는 estimated_yn이 1인 동적 센터 탭에서만 표시) -->
                            <div v-if="currentTabIndex === 2 || (currentTabIndex > 2 && currentEstimatedYn === 1)" class="mt-2 border-t border-gray-200 pt-2">
                                <div class="grid grid-cols-4 gap-3">
                                    <div class="bg-gray-50 rounded p-2">
                                        <div class="text-xs text-gray-600 mb-0.5">확정수량 합계</div>
                                        <div class="text-sm font-semibold text-gray-900">
                                            {{ formatNumber(statistics.confirmedQuantity) }}
                                        </div>
                                    </div>
                                    <div class="bg-gray-50 rounded p-2">
                                        <div class="text-xs text-gray-600 mb-0.5">제품금액 합계</div>
                                        <div class="text-sm font-semibold text-gray-900">
                                            {{ formatCurrency(statistics.productTotalAmount) }}
                                        </div>
                                    </div>
                                    <div class="bg-gray-50 rounded p-2">
                                        <div class="text-xs text-gray-600 mb-0.5">포장금액 합계</div>
                                        <div class="text-sm font-semibold text-gray-900">
                                            {{ formatCurrency(statistics.packageTotalAmount) }}
                                        </div>
                                    </div>
                                    <div class="bg-blue-50 rounded p-2 border border-blue-200">
                                        <div class="text-xs text-blue-600 mb-0.5 font-medium">총금액 합계</div>
                                        <div class="text-sm font-bold text-blue-900">
                                            {{ formatCurrency(statistics.totalAmount) }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                </TabPanels>
            </div>
        </TabGroup>
      </div>
    </template>
  </CommonModal>
  
  <!-- 견적서 모달 -->
  <EstimateModal
    :isOpen="isEstimateModalOpen"
    :orderShipmentEstimateNo="selectedOrderShipmentEstimateNo"
    @close="closeEstimateModal"
  />
  
  <!-- 1688 구매번호 업로드 모달 -->
  <UploadModal
    :isOpen="is1688UploadModalOpen"
    title="1688 구매번호 업로드"
    :uploadFunction="handle1688OrderNumberUpload"
    @close="close1688UploadModal"
    @upload-success="handle1688UploadSuccess"
  />
</template>

<script setup>
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import { ref, watch, nextTick, computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import CommonModal from '@/components/CommonModal.vue'
import PageDataGrid from '@/components/PageDataGrid.vue'
import PagePagination from '@/components/PagePagination.vue'
import CommonButtons from '@/components/CommonButtons.vue'
import { showError, showSuccess, showInfo, showWarning, confirmAction } from '@/utils/alert'
import { fetchShipmentList, fetchShipmentDtl, fetchShipmentEstimateProduct, fetchPurchaseList, fetchEstimateProductsAll, fetchEstimateList, fetchEstimateDetail, downloadPurchaseListExcel, downloadEstimateListExcel, downloadEstimateProductsAllExcel, upload1688OrderNumber, issueCjTrackingNumber, create1688Order } from '@/modules/purchase/api/purchase'
import EstimateModal from './EstimateModal.vue'
import UploadModal from '@/components/UploadModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  orderMstNo: {
    type: [String, Number],
    default: null
  },
  orderInfo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const dataLoading = ref(false)
const currentTabIndex = ref(0)
const dataList = ref([])
const agGridRef = ref(null)
const agGrid = ref(null)
const tabListContainer = ref(null)
// 이전 선택 상태 추적 (linked_open_uid 동기화용)
const previousSelectedLinkedOpenUids = ref(new Set())
// 이전 선택된 row ID 추적 (체크박스 해제 감지용)
const previousSelectedRowIds = ref(new Set())
// 프로그래밍 방식으로 선택/해제 중인지 추적 (무한 루프 방지)
const isProcessingSelection = ref(false)
// 연동 선택 스위치 상태 (켜져있으면 같은 linked_open_uid를 가진 row들도 함께 선택/해제)
const isAutoSelectEnabled = ref(true)
// 견적서 모달 상태
const isEstimateModalOpen = ref(false)
const selectedOrderShipmentEstimateNo = ref(null)
// 툴팁 표시 상태
const showTooltip = ref(false)
// 1688 구매번호 업로드 모달 상태
const is1688UploadModalOpen = ref(false)

// 행 선택 설정 (구매 탭에서만 활성화)
const rowSelection = computed(() => {
  if (currentTabIndex.value === 2) {
    return {
      mode: 'multiRow',
      checkboxes: true,
      headerCheckbox: true,
      enableClickSelection: false,
    }
  }
  return undefined
})

// 페이지네이션 상태
const currentPage = ref(1)
const pageSize = ref(50)
const totalItems = ref(0)

// 기본 탭 정의 (전체센터 탭, 견적 탭, 구매 탭)
const defaultTabs = [
  {
    id: 'all_centers',
    label: '전체센터'
  },
  {
    id: 'estimate',
    label: '견적'
  },
  {
    id: 'purchase',
    label: '구매'
  }
]

const tabs = ref([...defaultTabs])

// 현재 선택된 탭의 shipmentMstNo 가져오기
const currentShipmentMstNo = computed(() => {
  if (!tabs.value || currentTabIndex.value < 3) return null
  const currentTab = tabs.value[currentTabIndex.value]
  return currentTab?.order_shipment_mst_no || null
})

// 현재 선택된 탭의 estimated_yn 가져오기
const currentEstimatedYn = computed(() => {
  if (!tabs.value || currentTabIndex.value < 3) return null
  const currentTab = tabs.value[currentTabIndex.value]
  return currentTab?.estimated_yn ?? null
})

// 통계 계산 (구매 탭 또는 estimated_yn이 1인 동적 센터 탭에서 fail_yn이 1이 아닌 row만 포함)
const statistics = computed(() => {
  // 구매 탭 또는 estimated_yn이 1인 동적 센터 탭이 아니면 빈 통계 반환
  const isPurchaseTab = currentTabIndex.value === 2
  const isEstimatedCenterTab = currentTabIndex.value > 2 && currentEstimatedYn.value === 1
  
  if (!isPurchaseTab && !isEstimatedCenterTab) {
    return {
      confirmedQuantity: 0,
      productTotalAmount: 0,
      packageTotalAmount: 0,
      totalAmount: 0
    }
  }

  // fail_yn이 1이 아닌 row만 필터링
  const filteredData = dataList.value.filter(item => item.fail_yn !== 1)

  // 합계 계산
  const confirmedQuantity = filteredData.reduce((sum, item) => {
    return sum + (Number(item.confirmed_quantity) || 0)
  }, 0)

  const productTotalAmount = filteredData.reduce((sum, item) => {
    return sum + (Number(item.product_product_total_amount) || 0)
  }, 0)

  const packageTotalAmount = filteredData.reduce((sum, item) => {
    return sum + (Number(item.package_vinyl_spec_total_amount) || 0)
  }, 0)

  const totalAmount = filteredData.reduce((sum, item) => {
    return sum + (Number(item.total_amount) || 0)
  }, 0)

  return {
    confirmedQuantity,
    productTotalAmount,
    packageTotalAmount,
    totalAmount
  }
})

// 숫자 포맷팅 함수
const formatNumber = (value) => {
  if (value == null) return '0'
  return new Intl.NumberFormat('ko-KR').format(value)
}

// 통화 포맷팅 함수
const formatCurrency = (value) => {
  if (value == null) return '0'
  return new Intl.NumberFormat('ko-KR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(value)
}

const loadShipmentMstData = async () => {
  if (!props.orderMstNo) return
  
  loading.value = true
  try {
    const response = await fetchShipmentList(props.orderMstNo)
    const apiTabs = response?.data?.tabs || []
    
    // 전체센터 탭, 구매 탭 + API에서 받아온 센터 데이터를 함께 설정
    tabs.value = [...defaultTabs, ...apiTabs]

    await nextTick()

  } catch (error) {
    console.error('센터 목록 로드 실패:', error)
    showError('로드 실패', '센터 목록을 불러오는 중 오류가 발생했습니다.')
    // 에러 발생 시에도 기본 탭은 보여주기
    tabs.value = [...defaultTabs]
  } finally {
    loading.value = false
  }
}

// 탭별 데이터 조회
const loadTabData = async () => {
  dataLoading.value = true
  try {
    const queryParams = {
      page: currentPage.value,
      size: pageSize.value
    }

    let response
    
    // 전체센터 탭인 경우
    if (currentTabIndex.value === 0) {
      // 전체 발주 구매 정보 조회
      response = await fetchPurchaseList(queryParams, props.orderMstNo)
    } else if (currentTabIndex.value === 1) {
      // 견적 탭인 경우: 견적 목록 조회
      response = await fetchEstimateList(queryParams, props.orderMstNo)
    } else if (currentTabIndex.value === 2) {
      // 구매 탭인 경우: estimate-products-all API 호출
      response = await fetchEstimateProductsAll(queryParams, props.orderMstNo)
    } else {
      // 개별 센터 탭인 경우
      // shipmentMstNo가 없으면 조회하지 않음
      if (!currentShipmentMstNo.value) {
        dataList.value = []
        totalItems.value = 0
        return
      }

      // estimated_yn에 따라 다른 API 호출
      if (currentEstimatedYn.value === 0) {
        // estimated_yn이 0이면 shipmentDtl 조회
        response = await fetchShipmentDtl(queryParams, currentShipmentMstNo.value)
      } else if (currentEstimatedYn.value === 1) {
        // estimated_yn이 1이면 shipmentEstimateProduct 조회
        response = await fetchShipmentEstimateProduct(queryParams, currentShipmentMstNo.value)
      } else {
        // estimated_yn이 없거나 다른 값이면 조회하지 않음
        dataList.value = []
        totalItems.value = 0
        return
      }
    }

    // API 응답에서 데이터 추출
    if (response && response.data) {
      dataList.value = response.data.content || []
      totalItems.value = response.data.page_info?.total_elements || 0
    } else {
      dataList.value = []
      totalItems.value = 0
    }

    // 구매 탭인 경우 데이터 로드 후 선택 상태 초기화
    if (currentTabIndex.value === 2 && agGrid.value) {
      await nextTick()
      // 그리드가 파괴되지 않았는지 확인
      if (agGrid.value && !agGrid.value.isDestroyed && typeof agGrid.value.getSelectedRows === 'function') {
        try {
          const selectedRows = agGrid.value.getSelectedRows() || []
          const selectedNodes = agGrid.value.getSelectedNodes() || []
          const currentUids = new Set()
          const currentRowIds = new Set()
          
          selectedRows.forEach(row => {
            if (row && row.linked_open_uid) {
              currentUids.add(row.linked_open_uid)
            }
          })
          
          selectedNodes.forEach(node => {
            if (node.id) {
              currentRowIds.add(node.id)
            }
          })
          
          previousSelectedLinkedOpenUids.value = currentUids
          previousSelectedRowIds.value = currentRowIds
        } catch (error) {
          console.warn('getSelectedRows 호출 실패 (그리드가 파괴되었을 수 있음):', error)
          previousSelectedLinkedOpenUids.value = new Set()
          previousSelectedRowIds.value = new Set()
        }
      } else {
        previousSelectedLinkedOpenUids.value = new Set()
        previousSelectedRowIds.value = new Set()
      }
    } else {
      previousSelectedLinkedOpenUids.value = new Set()
      previousSelectedRowIds.value = new Set()
    }

  } catch (error) {
    console.error('데이터 로드 실패:', error)
    showError('로드 실패', '데이터를 불러오는 중 오류가 발생했습니다.')
    dataList.value = []
    totalItems.value = 0
  } finally {
    dataLoading.value = false
  }
}

const handleClose = () => {
  emit('close')
}

// 견적서 모달 열기
const openEstimateModal = (orderShipmentEstimateNo) => {
  selectedOrderShipmentEstimateNo.value = orderShipmentEstimateNo
  isEstimateModalOpen.value = true
}

// 견적서 모달 닫기
const closeEstimateModal = () => {
  isEstimateModalOpen.value = false
  selectedOrderShipmentEstimateNo.value = null
}

// 전역 함수로 등록 (ag-grid cellRenderer에서 사용)
// 모달이 열릴 때 등록하고 닫힐 때 제거
watch(() => props.isOpen, (newVal) => {
  if (typeof window !== 'undefined') {
    if (newVal) {
      window.openEstimateModal = openEstimateModal
    } else {
      delete window.openEstimateModal
    }
  }
})

// ag-Grid 기본 컬럼 설정
const defaultColDef = ref({
  sortable: true,
  filter: true,
  resizable: true,
  autoHeaderHeight: true,
  wrapHeaderText: true,
  flex: 1
})

// ag-Grid 컬럼 정의
const colDefs = computed(() => {
  // 견적 탭인 경우 견적 목록용 컬럼 정의
  if (currentTabIndex.value === 1) {
    return [
      {
        field: "estimate_id",
        headerName: "견적서 번호",
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: "estimate_date",
        headerName: "견적일자",
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-center',
        minWidth: 120,
      },
      {
        field: "estimate_total_amount",
        headerName: "견적총액",
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        minWidth: 120,
        valueFormatter: (params) => {
          if (params.value == null) return ''
          return new Intl.NumberFormat('ko-KR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          }).format(params.value)
        }
      },
      {
        field: "actions",
        headerName: "액션",
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-center',
        minWidth: 100,
        sortable: false,
        filter: false,
        cellRenderer: (params) => {
          const orderShipmentEstimateNo = params.data?.order_shipment_estimate_no
          if (!orderShipmentEstimateNo) return ''
          return `
            <button 
              class="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              onclick="if(window.openEstimateModal) window.openEstimateModal('${orderShipmentEstimateNo}')"
              title="견적서 보기"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          `
        }
      }
    ]
  }

  const baseColDefs = []
  
  // 전체센터 탭에 ACTIONS 컬럼 추가 (가장 앞에)
  if (currentTabIndex.value === 0) {
    baseColDefs.push({
      field: "actions",
      headerName: "Actions",
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-center flex items-center justify-center',
      minWidth: 90,
      maxWidth: 90,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        const container = document.createElement('div')
        container.className = 'flex items-center justify-center h-full w-full'
        container.style.display = 'flex'
        container.style.alignItems = 'center'
        container.style.justifyContent = 'center'
        
        const button = document.createElement('button')
        button.className = 'inline-flex items-center justify-center w-7 h-7 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors'
        button.title = '센터 탭으로 이동'
        button.innerHTML = `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
          </svg>
        `
        button.addEventListener('click', (e) => {
          e.stopPropagation() // row 클릭 이벤트 전파 방지
          const shipmentMstNo = params.data?.order_shipment_mst_no
          if (shipmentMstNo) {
            navigateToCenterTab(shipmentMstNo)
          }
        })
        
        container.appendChild(button)
        return container
      }
    })
  }
  
  // 구매 탭에서만 견적서 번호 컬럼을 가장 앞에 추가
  if (currentTabIndex.value === 2) {
    baseColDefs.push({
      field: "estimate_id",
      headerName: "견적서 번호",
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-center',
      minWidth: 150,
    })
    
    // 구매 탭에 구매번호 컬럼 추가 (견적서 번호 다음)
    baseColDefs.push({
      field: "purchase_order_number",
      headerName: "구매번호",
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-center',
      minWidth: 150,
    })
  }
  
  baseColDefs.push(
    { 
      field: "order_number", 
      headerName: "발주번호", 
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-center',
      minWidth: 120,
    },
    { 
      field: "center_name", 
      headerName: "물류센터", 
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-center',
      minWidth: 100,
    }
  )
  
  // 동적 탭에서 estimated_yn이 1인 경우 발주번호 다음에 구매번호 컬럼 추가
  if (currentTabIndex.value > 2 && currentEstimatedYn.value === 1) {
    // 발주번호와 물류센터 다음에 구매번호 추가
    baseColDefs.push({
      field: "purchase_order_number",
      headerName: "구매번호",
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-center',
      minWidth: 150,
    })
  }

  // 전체센터 탭과 구매 탭에서만 확정상태 컬럼 표시
  if (currentTabIndex.value === 0 || currentTabIndex.value === 2) {
    baseColDefs.push({
      field: "order_shipment_dtl_status_name", 
      headerName: "상태", 
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-center',
      minWidth: 120,
      cellRenderer: (params) => {
        const status = params.value;
        const color = params.data.order_shipment_dtl_status_color;
        if (!status) return '';
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800">${status}</span>`;
      }
    })
  }
  
  // 구매 탭 또는 estimated_yn이 1인 동적 탭에 배송상태 컬럼 추가
  if (currentTabIndex.value === 2 || (currentTabIndex.value > 2 && currentEstimatedYn.value === 1)) {
    baseColDefs.push({
      field: "delivery_status",
      headerName: "배송상태",
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-center',
      minWidth: 120,
    })
  }

  const commonColDefs = [
    { 
      field: "transport_type", 
      headerName: "입고유형", 
      minWidth: 100,
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-center',
    },
    { 
      field: "edd", 
      headerName: "입고예정일", 
      minWidth: 120,
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-center',
    },
    {
      field: "sku_id",
      headerName: "상품번호(SKU ID)",
      minWidth: 120,
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-center',
    },
    { 
      field: "sku_barcode", 
      headerName: "상품바코드", 
      minWidth: 120,
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-center',
    },
    { 
      field: "sku_name", 
      headerName: "상품이름", 
      minWidth: 200,
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-left',
    },
    { 
      field: "confirmed_quantity", 
      headerName: "확정수량", 
      minWidth: 100,
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-right',
    },
    { 
      field: "packing_quantity", 
      headerName: "포장수량", 
      minWidth: 100,
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-right',
    },
    { 
      field: "box_name", 
      headerName: "박스명", 
      minWidth: 100,
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-right',
    },
    { 
      field: "purchase_tracking_number", 
      headerName: "1688 운송장번호", 
      minWidth: 200,
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-right',
    },
    { 
      field: "tracking_number", 
      headerName: "CJ 운송장번호", 
      minWidth: 200,
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-right',
    },
  ]

  // 전체센터 탭이 아닐 때만 비고 컬럼 추가
  if (currentTabIndex.value !== 0) {
    commonColDefs.push({
      field: "remark", 
      headerName: "비고", 
      minWidth: 150,
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-left',
    })
  }

  // 구매 탭 또는 estimated_yn이 1인 센터 탭에만 금액 관련 컬럼 추가
  if (currentTabIndex.value === 2 || (currentTabIndex.value > 2 && currentEstimatedYn.value === 1)) {
    commonColDefs.push(
      { 
        field: "product_unit_price", 
        headerName: "단가", 
        minWidth: 100,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        valueFormatter: (params) => {
          if (params.value == null) return ''
          return new Intl.NumberFormat('ko-KR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          }).format(params.value)
        }
      },
      { 
        field: "product_product_total_amount", 
        headerName: "제품금액", 
        minWidth: 120,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        valueFormatter: (params) => {
          if (params.value == null) return ''
          return new Intl.NumberFormat('ko-KR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          }).format(params.value)
        }
      },
      { 
        field: "package_vinyl_spec_total_amount", 
        headerName: "포장금액", 
        minWidth: 120,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        valueFormatter: (params) => {
          if (params.value == null) return ''
          return new Intl.NumberFormat('ko-KR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          }).format(params.value)
        }
      },
      { 
        field: "total_amount", 
        headerName: "총금액", 
        minWidth: 120,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        valueFormatter: (params) => {
          if (params.value == null) return ''
          return new Intl.NumberFormat('ko-KR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          }).format(params.value)
        }
      }
    )
  }

  return baseColDefs.concat(commonColDefs)
})

// ag-Grid 이벤트 핸들러
const onGridReady = (params) => {
  agGrid.value = params.api
}

// 센터 탭으로 이동하는 함수 (재사용 가능)
const navigateToCenterTab = async (shipmentMstNo) => {
  if (!shipmentMstNo) return
  
  // tabs 배열에서 해당 센터 탭의 인덱스 찾기
  const targetTabIndex = tabs.value.findIndex(tab => tab.order_shipment_mst_no === shipmentMstNo)
  
  // 탭을 찾았으면 해당 탭으로 이동
  if (targetTabIndex !== -1) {
    currentTabIndex.value = targetTabIndex
    // 페이지네이션 초기화
    currentPage.value = 1
    pageSize.value = 50
    
    // DOM 업데이트 후 탭 스크롤 이동
    await nextTick()
    scrollToTab(targetTabIndex)
    
    // 데이터 조회
    loadTabData()
  }
}

// 행 클릭 이벤트 핸들러 (전체센터 탭에서는 비활성화)
const onRowClicked = async (params) => {
  // 전체센터 탭에서는 row 클릭 비활성화 (버튼으로만 이동)
  if (currentTabIndex.value === 0) return
  
  // 견적 탭과 구매 탭에서는 클릭 동작 없음
  if (currentTabIndex.value === 1 || currentTabIndex.value === 2) return
}

// 선택 변경 이벤트 핸들러 (구매 탭에서만 동작)
const onSelectionChanged = async (params) => {
  // 프로그래밍 방식으로 선택/해제 중이면 무시 (무한 루프 방지)
  if (isProcessingSelection.value) {
    return
  }
  
  // 구매 탭이 아니면 동작하지 않음
  if (currentTabIndex.value !== 2) {
    previousSelectedLinkedOpenUids.value = new Set()
    previousSelectedRowIds.value = new Set()
    return
  }
  
  // 비활성화된 행이 선택되었는지 확인하고 제거
  let selectedNodes = params.api.getSelectedNodes() || []
  const nodesToDeselect = []
  
  // 선택 가능한 모든 행과 선택된 행 수집
  const selectableNodes = []
  let selectedSelectableCount = 0
  
  // 모든 노드를 순회하여 비활성화된 행이 선택되어 있는지 확인
  params.api.forEachNode((node) => {
    if (node.data) {
      // 비활성화 조건: order_shipment_mst_status_cd !== 'PAYMENT_COMPLETED' 또는 fail_yn === 1
      const isDisabled = node.data.order_shipment_mst_status_cd !== 'PAYMENT_COMPLETED' || node.data.fail_yn === 1
      
      if (!isDisabled) {
        // 선택 가능한 행
        selectableNodes.push(node)
        if (node.isSelected()) {
          selectedSelectableCount++
        }
      } else if (isDisabled && node.isSelected()) {
        // 비활성화된 행이 선택되어 있으면 해제 대상에 추가
        nodesToDeselect.push(node)
      }
    }
  })
  
  // 비활성화된 행이 선택되어 있으면 해제
  if (nodesToDeselect.length > 0) {
    isProcessingSelection.value = true
    // suppressEvent를 false로 설정하여 이벤트가 발생하도록 함
    // 하지만 isProcessingSelection 플래그로 무한 루프 방지
    nodesToDeselect.forEach(node => {
      node.setSelected(false, false)
    })
    await nextTick()
    
    // 선택 상태 업데이트
    const updatedSelectedNodes = params.api.getSelectedNodes() || []
    const updatedSelectedRowIds = new Set()
    const updatedSelectedLinkedOpenUids = new Set()
    
    updatedSelectedNodes.forEach(node => {
      if (node.id) {
        updatedSelectedRowIds.add(node.id)
      }
      if (node.data && node.data.linked_open_uid) {
        updatedSelectedLinkedOpenUids.add(node.data.linked_open_uid)
      }
    })
    
    previousSelectedLinkedOpenUids.value = new Set(updatedSelectedLinkedOpenUids)
    previousSelectedRowIds.value = new Set(updatedSelectedRowIds)
    
    isProcessingSelection.value = false
    // 비활성화된 행을 제거한 후 종료
    return
  }
  
  // 선택 가능한 모든 행이 선택되어 있는지 확인
  // 모든 행이 선택되었을 때만 헤더 체크박스를 체크
  // ag-grid의 헤더 체크박스를 찾는 다른 방법 사용
  let gridElement = null
  let headerCheckbox = null
  
  // agGridRef.value가 배열인 경우 첫 번째 요소 확인
  if (agGridRef.value && Array.isArray(agGridRef.value) && agGridRef.value.length > 0) {
    const firstElement = agGridRef.value[0]
    if (firstElement && firstElement.$el) {
      gridElement = firstElement.$el
    }
  } else if (agGridRef.value && agGridRef.value.$el) {
    gridElement = agGridRef.value.$el
  }
  
  // gridElement에서 헤더 체크박스 찾기
  if (gridElement) {
    headerCheckbox = gridElement.querySelector('.ag-header-select-all input') || 
                     gridElement.querySelector('.ag-header .ag-checkbox input') ||
                     gridElement.querySelector('.ag-header input[type="checkbox"]')
  }
  
  // gridElement를 찾지 못한 경우 document에서 직접 찾기
  if (!headerCheckbox) {
    // 현재 탭의 ag-grid만 찾기 위해 클래스로 필터링
    const allGrids = document.querySelectorAll('.purchase-order-grid')
    for (const grid of allGrids) {
      const checkbox = grid.querySelector('.ag-header-select-all input') || 
                       grid.querySelector('.ag-header .ag-checkbox input') ||
                       grid.querySelector('.ag-header input[type="checkbox"]')
      if (checkbox) {
        headerCheckbox = checkbox
        gridElement = grid
        break
      }
    }
  }
  
  // 선택 가능한 모든 행이 선택되었을 때만 헤더 체크박스 체크
  if (selectableNodes.length > 0 && selectedSelectableCount === selectableNodes.length) {
    if (headerCheckbox && !headerCheckbox.checked) {
      params.api.refreshHeader()
      await nextTick()
    }
  }
  
  // 연동 선택이 비활성화되어 있으면 동일 linked_open_uid 체크 기능을 사용하지 않음
  // 체크한 체크박스만 체크/해제하고 종료
  if (!isAutoSelectEnabled.value) {
    // 상태만 업데이트하고 종료 (연동 선택 기능 사용 안함)
    const selectedRows = params.api.getSelectedRows() || []
    const currentSelectedRowIds = new Set()
    const currentSelectedLinkedOpenUids = new Set()
    
    selectedNodes.forEach(node => {
      if (node.id) {
        currentSelectedRowIds.add(node.id)
      }
    })
    
    selectedRows.forEach(row => {
      if (row && row.linked_open_uid) {
        currentSelectedLinkedOpenUids.add(row.linked_open_uid)
      }
    })
    
    previousSelectedLinkedOpenUids.value = new Set(currentSelectedLinkedOpenUids)
    previousSelectedRowIds.value = new Set(currentSelectedRowIds)
    return
  }
  
  if (!agGrid.value) {
    return
  }
  
  // 프로그래밍 방식으로 선택/해제 시작
  isProcessingSelection.value = true
  
  const selectedRows = params.api.getSelectedRows() || []
  selectedNodes = params.api.getSelectedNodes() || []
  
  // 현재 선택된 row ID 수집
  const currentSelectedRowIds = new Set()
  selectedNodes.forEach(node => {
    if (node.id) {
      currentSelectedRowIds.add(node.id)
    }
  })
  
  // 새로 선택된 row ID와 해제된 row ID 찾기
  const newlySelectedRowIds = [...currentSelectedRowIds].filter(id => !previousSelectedRowIds.value.has(id))
  const newlyDeselectedRowIds = [...previousSelectedRowIds.value].filter(id => !currentSelectedRowIds.has(id))
  
  const currentSelectedLinkedOpenUids = new Set()
  
  // 현재 선택된 row들의 linked_open_uid 수집
  selectedRows.forEach(row => {
    if (row && row.linked_open_uid) {
      currentSelectedLinkedOpenUids.add(row.linked_open_uid)
    }
  })
  
  // 새로 선택된 row의 linked_open_uid 찾기
  const newlySelectedUids = new Set()
  newlySelectedRowIds.forEach(rowId => {
    const node = params.api.getRowNode(rowId)
    if (node && node.data && node.data.linked_open_uid) {
      newlySelectedUids.add(node.data.linked_open_uid)
    }
  })
  
  // 새로 해제된 row의 linked_open_uid 찾기
  const newlyDeselectedUids = new Set()
  newlyDeselectedRowIds.forEach(rowId => {
    params.api.forEachNode((node) => {
      if (node.id === rowId && node.data && node.data.linked_open_uid) {
        newlyDeselectedUids.add(node.data.linked_open_uid)
      }
    })
  })
  
  // 새로 선택된 linked_open_uid와 같은 uid를 가진 모든 row 선택
  // 단, 새로 해제된 row ID는 제외 (같은 uid를 가진 row를 해제하면서 동시에 선택하는 것을 방지)
  // 그리고 새로 선택된 row ID는 이미 선택되어 있으므로 제외
  newlySelectedUids.forEach(uid => {
    params.api.forEachNode((node) => {
      // 새로 해제된 row ID가 아니고, 새로 선택된 row ID도 아니며, 
      // 같은 linked_open_uid를 가지며, 아직 선택되지 않은 경우만 선택
      if (node.data && 
          node.data.linked_open_uid === uid && 
          !node.isSelected() &&
          !newlyDeselectedRowIds.includes(node.id) &&
          !newlySelectedRowIds.includes(node.id)) {
        node.setSelected(true, false)
      }
    })
  })
  
  // 새로 해제된 linked_open_uid와 같은 uid를 가진 모든 row 해제
  // 단, 새로 선택된 row ID는 제외 (같은 uid를 가진 row를 선택하면서 동시에 해제하는 것을 방지)
  // 그리고 새로 해제된 row ID는 이미 해제되어 있으므로 제외
  newlyDeselectedUids.forEach(uid => {
    params.api.forEachNode((node) => {
      // 새로 선택된 row ID가 아니고, 새로 해제된 row ID도 아니며,
      // 같은 linked_open_uid를 가지며, 현재 선택된 경우만 해제
      if (node.data && 
          node.data.linked_open_uid === uid && 
          node.isSelected() &&
          !newlySelectedRowIds.includes(node.id) &&
          !newlyDeselectedRowIds.includes(node.id)) {
        node.setSelected(false, false)
      }
    })
  })
  
  // 선택/해제 작업 후 최종 상태를 다시 가져와서 저장
  // (프로그래밍 방식으로 선택/해제한 후 상태가 변경되었을 수 있음)
  // 약간의 지연을 두어 ag-grid가 상태를 업데이트할 시간을 줌
  await nextTick()
  
  const finalSelectedRows = params.api.getSelectedRows() || []
  const finalSelectedNodes = params.api.getSelectedNodes() || []
  const finalSelectedLinkedOpenUids = new Set()
  const finalSelectedRowIds = new Set()
  
  finalSelectedRows.forEach(row => {
    if (row && row.linked_open_uid) {
      finalSelectedLinkedOpenUids.add(row.linked_open_uid)
    }
  })
  
  finalSelectedNodes.forEach(node => {
    if (node.id) {
      finalSelectedRowIds.add(node.id)
    }
  })
  
  // 새로 선택된 row ID가 최종 상태에 포함되어 있는지 확인
  // 만약 포함되어 있지 않다면 다시 선택 (사용자가 직접 클릭한 row가 해제되지 않도록)
  newlySelectedRowIds.forEach(rowId => {
    if (!finalSelectedRowIds.has(rowId)) {
      const node = params.api.getRowNode(rowId)
      if (node && !node.isSelected()) {
        node.setSelected(true, true)
        finalSelectedRowIds.add(rowId)
        if (node.data && node.data.linked_open_uid) {
          finalSelectedLinkedOpenUids.add(node.data.linked_open_uid)
        }
      }
    }
  })
  
  // 현재 선택 상태를 이전 선택 상태로 저장
  previousSelectedLinkedOpenUids.value = new Set(finalSelectedLinkedOpenUids)
  previousSelectedRowIds.value = new Set(finalSelectedRowIds)
  
  // 프로그래밍 방식으로 선택/해제 완료
  isProcessingSelection.value = false
}

// 탭으로 스크롤 이동
const scrollToTab = (tabIndex) => {
  if (!tabListContainer.value) return
  
  // TabList 내의 모든 탭 버튼 찾기
  const tabButtons = tabListContainer.value.querySelectorAll('button')
  if (tabButtons.length > tabIndex) {
    const targetTab = tabButtons[tabIndex]
    if (targetTab) {
      // 탭이 보이도록 스크롤 이동
      targetTab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }
}

// 행 스타일 설정 (전체센터 탭에서 estimated_yn이 1인 경우 연한 파란색 배경, fail_yn이 1인 경우 연한 빨간색 배경)
const getRowStyle = (params) => {
  const style = {}
  
  // 전체센터 탭에서는 row 클릭 비활성화로 cursor pointer 제거
  
  // fail_yn이 1인 경우 연한 빨간색 배경 (우선순위 높음)
  if (params.data?.fail_yn === 1) {
    style.backgroundColor = '#fef2f2' // 연한 빨간색 (red-50)
  }
  // 전체센터 탭에서만 estimated_yn이 1인 경우 연한 파란색 배경 (fail_yn이 1이 아닐 때만)
  else if (currentTabIndex.value === 0 && params.data?.estimated_yn === 1) {
    style.backgroundColor = '#e0f2fe' // 연한 파란색 (blue-100)
  }
  
  return Object.keys(style).length > 0 ? style : null
}

// 행 클래스 설정 (구매 탭에서 PAYMENT_COMPLETED가 아닌 row 또는 fail_yn이 1인 row에 disabled 클래스 추가)
const getRowClass = (params) => {
  // 구매 탭이고 (PAYMENT_COMPLETED가 아니거나 fail_yn이 1인 경우) disabled 클래스 추가
  if (currentTabIndex.value === 2 && 
      (params.data?.order_shipment_mst_status_cd !== 'PAYMENT_COMPLETED' || params.data?.fail_yn === 1)) {
    return 'row-checkbox-disabled'
  }
  return null
}

// 행 선택 가능 여부 설정 (구매 탭에서만 PAYMENT_COMPLETED 상태이고 fail_yn이 1이 아닌 row만 선택 가능)
const isRowSelectable = (params) => {
  // 구매 탭이 아니면 모든 row 선택 가능
  if (currentTabIndex.value !== 2) {
    return true
  }
  
  // 구매 탭인 경우 PAYMENT_COMPLETED 상태이고 fail_yn이 1이 아닌 row만 선택 가능
  return params.data?.order_shipment_mst_status_cd === 'PAYMENT_COMPLETED' && params.data?.fail_yn !== 1
}

// 드롭다운 버튼을 현재 탭 상태에 따라 동적으로 생성
const dropdownButtons = computed(() => {
  const baseButtons = []
  
  // 데이터 관리 그룹
  const dataManagementButtons = []
  
  // 전체센터 탭: estimated_yn이 1인 경우에만 엑셀 다운로드
  if (currentTabIndex.value === 0) {
    // 전체센터 탭에서는 estimated_yn이 1인 데이터가 있는지 확인
    const hasEstimatedYn1 = dataList.value.some(item => item.estimated_yn === 1)
    if (hasEstimatedYn1) {
      dataManagementButtons.push({ label: '엑셀 다운로드', value: 'excelDownload' })
    }
  }
  
  // 견적 탭: 엑셀 다운로드
  if (currentTabIndex.value === 1) {
    dataManagementButtons.push({ label: '엑셀 다운로드', value: 'excelDownload' })
  }
  
  // 구매 탭: 선택 아이템 구매, CJ 운송장 발급, 1688 구매번호 업로드, 엑셀 다운로드
  if (currentTabIndex.value === 2) {
    dataManagementButtons.push({ label: '선택 아이템 구매', value: 'purchaseSelectedItems' })
    dataManagementButtons.push({ label: 'CJ 운송장 발급', value: 'issueCjTrackingNumber' })
    dataManagementButtons.push({ label: '1688 구매번호 업로드', value: 'upload1688OrderNumber' })
    dataManagementButtons.push({ label: '엑셀 다운로드', value: 'excelDownload' })
  }
  
  // 동적 센터 탭 중 estimated_yn이 1인 경우만: CJ 운송장 발급
  if (currentTabIndex.value > 2 && currentEstimatedYn.value === 1) {
    dataManagementButtons.push({ label: 'CJ 운송장 발급', value: 'issueCjTrackingNumber' })
  }
  
  if (dataManagementButtons.length > 0) {
    baseButtons.push({
      title: '데이터 관리',
      children: dataManagementButtons
    })
  }
  
  return baseButtons
})

// 연동 선택 스위치 토글
// 켜져있으면: 체크박스 체크시 동일 linked_open_uid를 가진 다른 row들도 함께 체크/해제
// 꺼져있으면: 체크한 체크박스만 체크/해제 (동일 linked_open_uid 체크 기능 사용 안함)
const toggleAutoSelect = () => {
  isAutoSelectEnabled.value = !isAutoSelectEnabled.value
}

// 드롭다운 클릭 핸들러
const handleDropdownClick = async (value) => {
  switch (value) {
    case 'excelDownload':
      const excelConfirmed = await confirmAction('엑셀 다운로드', '엑셀 파일을 다운로드하시겠습니까?', '다운로드', '취소')
      if (excelConfirmed) {
        handleExcelDownload()
      }
      break
    case 'purchaseSelectedItems':
      const purchaseConfirmed = await confirmAction('선택 아이템 구매', '선택한 항목을 구매하시겠습니까?', '구매', '취소')
      if (purchaseConfirmed) {
        handlePurchaseSelectedItems()
      }
      break
    case 'issueCjTrackingNumber':
      const cjConfirmed = await confirmAction('CJ 운송장 발급', 'CJ 운송장을 발급하시겠습니까?', '발급', '취소')
      if (cjConfirmed) {
        handleIssueCjTrackingNumber()
      }
      break
    case 'upload1688OrderNumber':
      open1688UploadModal()
      break
    default:
      console.log('알 수 없는 액션:', value)
  }
}

// 엑셀 다운로드
const handleExcelDownload = async () => {
  try {
    if (!props.orderMstNo) {
      showError('오류', '발주번호가 없습니다.')
      return
    }

    // 전체센터 탭인 경우
    if (currentTabIndex.value === 0) {
      await downloadPurchaseListExcel(props.orderMstNo)
      showSuccess('다운로드 완료', '엑셀 파일이 다운로드되었습니다.')
    } 
    // 견적 탭인 경우
    else if (currentTabIndex.value === 1) {
      await downloadEstimateListExcel(props.orderMstNo)
      showSuccess('다운로드 완료', '엑셀 파일이 다운로드되었습니다.')
    } 
    // 구매 탭인 경우
    else if (currentTabIndex.value === 2) {
      await downloadEstimateProductsAllExcel(props.orderMstNo)
      showSuccess('다운로드 완료', '엑셀 파일이 다운로드되었습니다.')
    } 
    else {
      // TODO: 다른 탭의 엑셀 다운로드 API 호출
      showInfo('준비중', '엑셀 다운로드 기능은 준비중입니다.')
    }
  } catch (error) {
    console.error('엑셀 다운로드 실패:', error)
    showError('다운로드 실패', '엑셀 파일 다운로드 중 오류가 발생했습니다.')
  }
}

// 선택 아이템 구매
const handlePurchaseSelectedItems = async () => {
  try {
    // 구매 탭에서만 동작
    if (currentTabIndex.value !== 2) {
      showError('탭 오류', '구매 탭에서만 사용할 수 있습니다.')
      return
    }
    
    const gridApi = agGrid.value
    if (!gridApi) {
      showError('그리드 오류', '데이터 그리드가 아직 준비되지 않았습니다.')
      return
    }
    
    const selectedRows = gridApi.getSelectedRows()
    if (!selectedRows || selectedRows.length === 0) {
      showInfo('선택 필요', '구매할 항목을 선택하세요.')
      return
    }
    
    // 선택된 row들에서 order_shipment_dtl_no 추출 (중복 제거)
    const orderShipmentDtlNos = [...new Set(
      selectedRows
        .map(row => row.order_shipment_dtl_no)
        .filter(no => no != null)
    )]
    
    if (orderShipmentDtlNos.length === 0) {
      showError('오류', '선택된 항목에 유효한 주문 상세번호가 없습니다.')
      return
    }
    
    // 선택 아이템 구매 API 호출
    await create1688Order(orderShipmentDtlNos)
    showSuccess('구매 완료', '선택한 항목이 성공적으로 구매되었습니다.')
    
    // 데이터 새로고침
    loadTabData()
  } catch (error) {
    console.error('구매 실패:', error)
    showError('구매 실패', '구매 처리 중 오류가 발생했습니다.')
  }
}

// CJ 운송장 발급
const handleIssueCjTrackingNumber = async () => {
  try {
    // 구매 탭 또는 동적 센터 탭에서만 동작
    if (currentTabIndex.value === 2) {
      // 구매 탭인 경우
      const gridApi = agGrid.value
      if (!gridApi) {
        showError('그리드 오류', '데이터 그리드가 아직 준비되지 않았습니다.')
        return
      }
      
      const selectedRows = gridApi.getSelectedRows()
      if (!selectedRows || selectedRows.length === 0) {
        showInfo('선택 필요', 'CJ 운송장을 발급할 항목을 선택하세요.')
        return
      }
      
      // 선택된 row들에서 order_shipment_estimate_no 추출 (중복 제거)
      const orderShipmentEstimateNos = [...new Set(
        selectedRows
          .map(row => row.order_shipment_packing_mst_no)
          .filter(no => no != null)
      )]
      
      if (orderShipmentEstimateNos.length === 0) {
        showError('오류', '선택된 항목에 유효한 견적번호가 없습니다.')
        return
      }
      
      // CJ 운송장 발급 API 호출
      const response = await issueCjTrackingNumber(orderShipmentEstimateNos)
      
      // API 응답 처리
      const apiMessage = response?.message || 'CJ 운송장 발급 처리되었습니다.'
      const errorDetails = response?.data?.error_details || []
      
      // error_details를 문자열 배열로 변환
      const errorDetailsText = errorDetails.map((error, index) => {
        const boxName = error.box_name || 'N/A'
        const errorMsg = error.error || '알 수 없는 오류'
        const cjInvoiceNo = error.cj_response?.DATA?.INVC_NO || 'N/A'
        return `${index + 1}. 박스명: ${boxName}, 오류: ${errorMsg}, CJ 송장번호: ${cjInvoiceNo}`
      })
      
      // error_count가 0이면 성공, 아니면 에러/경고
      const errorCount = response?.data?.error_count || 0
      const successCount = response?.data?.success_count || 0
      
      if (errorCount === 0 && successCount > 0) {
        // 모두 성공
        showSuccess('CJ 운송장 발급', apiMessage, errorDetailsText)
      } else if (errorCount > 0 && successCount > 0) {
        // 일부 성공
        showWarning('CJ 운송장 발급', apiMessage, errorDetailsText)
      } else {
        // 모두 실패
        showError('CJ 운송장 발급', apiMessage, errorDetailsText)
      }
      
      // 데이터 새로고침
      loadTabData()
    } else if (currentTabIndex.value > 2) {
      // 동적 센터 탭인 경우
      if (!currentShipmentMstNo.value) {
        showError('오류', '센터 정보가 없습니다.')
        return
      }
      
      // fail_yn이 0인 row들에서 order_shipment_packing_mst_no 추출 (중복 제거)
      const orderShipmentPackingMstNos = [...new Set(
        dataList.value
          .filter(row => row.fail_yn === 0)
          .map(row => row.order_shipment_packing_mst_no)
          .filter(no => no != null)
      )]
      
      if (orderShipmentPackingMstNos.length === 0) {
        showError('오류', 'CJ 운송장을 발급할 수 있는 항목이 없습니다. (fail_yn이 0인 항목이 없습니다)')
        return
      }
      
      // 동적 센터 탭 CJ 운송장 발급 API 호출
      const response = await issueCjTrackingNumber(orderShipmentPackingMstNos)
      
      // API 응답 처리
      const apiMessage = response?.message || 'CJ 운송장 발급 처리되었습니다.'
      const errorDetails = response?.data?.error_details || []
      
      // error_details를 문자열 배열로 변환
      const errorDetailsText = errorDetails.map((error, index) => {
        const boxName = error.box_name || 'N/A'
        const errorMsg = error.error || '알 수 없는 오류'
        const cjInvoiceNo = error.cj_response?.DATA?.INVC_NO || 'N/A'
        return `${index + 1}. 박스명: ${boxName}, 오류: ${errorMsg}, CJ 송장번호: ${cjInvoiceNo}`
      })
      
      // error_count가 0이면 성공, 아니면 에러/경고
      const errorCount = response?.data?.error_count || 0
      const successCount = response?.data?.success_count || 0
      
      if (errorCount === 0 && successCount > 0) {
        // 모두 성공
        showSuccess('CJ 운송장 발급', apiMessage, errorDetailsText)
      } else if (errorCount > 0 && successCount > 0) {
        // 일부 성공
        showWarning('CJ 운송장 발급', apiMessage, errorDetailsText)
      } else {
        // 모두 실패
        showError('CJ 운송장 발급', apiMessage, errorDetailsText)
      }
      
      // 데이터 새로고침
      loadTabData()
    } else {
      showError('탭 오류', '구매 탭 또는 센터 탭에서만 사용할 수 있습니다.')
      return
    }
  } catch (error) {
    console.error('운송장 발급 실패:', error)
    showError('운송장 발급 실패', '운송장 발급 중 오류가 발생했습니다.')
  }
}

// 1688 구매번호 업로드 모달 열기
const open1688UploadModal = () => {
  if (!props.orderMstNo) {
    showError('오류', '발주번호가 없습니다.')
    return
  }
  is1688UploadModalOpen.value = true
}

// 1688 구매번호 업로드 모달 닫기
const close1688UploadModal = () => {
  is1688UploadModalOpen.value = false
  // 데이터 새로고침
  loadTabData()
}

// 1688 구매번호 업로드 처리
const handle1688OrderNumberUpload = async (file) => {
  if (!props.orderMstNo) {
    throw new Error('발주번호가 없습니다.')
  }
  
  const response = await upload1688OrderNumber(props.orderMstNo, file)
  return response
}

// 1688 구매번호 업로드 성공 처리
const handle1688UploadSuccess = () => {
  showSuccess('업로드 완료', '1688 구매번호가 성공적으로 업로드되었습니다.')
  // 데이터 새로고침
  loadTabData()
}

// 페이지네이션 핸들러
const handlePageChange = (page) => {
  currentPage.value = page
  loadTabData()
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadTabData()
}

const handleTabChange = (index) => {
  if (!tabs.value || !tabs.value[index]) return
  
  currentTabIndex.value = index
  // 페이지네이션 초기화
  currentPage.value = 1
  // 구매 탭(index === 2)이면 pageSize를 10000으로, 아니면 50으로 설정
  pageSize.value = index === 2 ? 10000 : 50
  // 이전 선택 상태 초기화
  previousSelectedLinkedOpenUids.value = new Set()
  previousSelectedRowIds.value = new Set()
  // 탭 전환 시 데이터 조회
  loadTabData()
}

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.orderMstNo) {
    // 탭 인덱스 초기화
    currentTabIndex.value = 0
    // 페이지네이션 초기화
    currentPage.value = 1
    // 전체센터 탭이므로 pageSize는 50
    pageSize.value = 50
    // 센터 목록 로드
    await loadShipmentMstData()
    // 전체센터 탭 데이터 로드
    await loadTabData()
  }
})

// 탭 변경 시 pageSize 자동 조정
watch(() => currentTabIndex.value, (newIndex) => {
  // 구매 탭(index === 2)이면 pageSize를 10000으로, 아니면 50으로 설정
  if (newIndex === 2) {
    pageSize.value = 10000
  } else if (pageSize.value === 10000) {
    // 구매 탭이 아닌 다른 탭으로 변경될 때만 50으로 변경
    pageSize.value = 50
  }
})

</script>

<style scoped>
/* 구매 탭에서 체크박스가 비활성화된 row 스타일 */
.purchase-order-grid :deep(.row-checkbox-disabled .ag-checkbox-input-wrapper) {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.purchase-order-grid :deep(.row-checkbox-disabled .ag-checkbox-input-wrapper input) {
  cursor: not-allowed;
  pointer-events: none;
}

.purchase-order-grid :deep(.row-checkbox-disabled .ag-checkbox-input-wrapper .ag-checkbox-input) {
  cursor: not-allowed;
  pointer-events: none;
}

/* 비활성화된 체크박스의 체크 표시도 뿌옇게 */
.purchase-order-grid :deep(.row-checkbox-disabled .ag-checkbox-input-wrapper .ag-checkbox-input:checked) {
  opacity: 0.4;
}
</style>

