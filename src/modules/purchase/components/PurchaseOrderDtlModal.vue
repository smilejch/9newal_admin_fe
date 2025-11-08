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
      <div class="purchase-dtl-form modal-content h-[80vh] flex flex-col">
        <TabGroup :selectedIndex="currentTabIndex" @change="handleTabChange">
            <div class="sticky top-0 bg-white z-10 border-b border-gray-200">
                <div class="px-6 pt-6 pb-2">
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
                        class="bg-white p-6 h-full"
                    >
                        <div class="h-full flex flex-col">
                            <div class="flex-1 min-h-0">
                                <PageDataGrid
                                    :loading="dataLoading"
                                    :rowData="dataList"
                                    height="100%"
                                >
                                    <template #header-buttons>
                                        <CommonButtons
                                            :buttons="[]"
                                            :dropdownButtons="dropdownButtons"
                                            @dropdown-click="handleDropdownClick"
                                        />
                                    </template>
                                    <template #ag-grid>
                                        <ag-grid-vue
                                            ref="agGridRef"
                                            :key="`ag-grid-${currentTabIndex}-${dataList.length}`"
                                            class="ag-theme-alpine"
                                            theme="legacy"
                                            :rowData="dataList"
                                            :columnDefs="colDefs"
                                            :style="{ height: '100%', width: '100%' }"
                                            :suppressPaginationPanel="true"
                                            :defaultColDef="defaultColDef"
                                            :getRowStyle="getRowStyle"
                                            :rowSelection="rowSelection"
                                            @grid-ready="onGridReady"
                                            @row-clicked="onRowClicked"
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
                        </div>
                    </TabPanel>
                </TabPanels>
            </div>
        </TabGroup>
      </div>
    </template>
  </CommonModal>
</template>

<script setup>
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import { ref, watch, nextTick, computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import CommonModal from '@/components/CommonModal.vue'
import PageDataGrid from '@/components/PageDataGrid.vue'
import PagePagination from '@/components/PagePagination.vue'
import CommonButtons from '@/components/CommonButtons.vue'
import { showError, showSuccess, showInfo } from '@/utils/alert'
import { fetchShipmentList, fetchShipmentDtl, fetchShipmentEstimateProduct, fetchPurchaseList } from '@/modules/purchase/api/purchase'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  orderMstNo: {
    type: [String, Number],
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

// 행 선택 설정 (estimated_yn이 1인 센터 탭에서만 활성화)
const rowSelection = computed(() => {
  if (currentTabIndex.value > 0 && currentEstimatedYn.value === 1) {
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

// 기본 탭 정의 (전체센터 탭)
const defaultTabs = [
  {
    id: 'all_centers',
    label: '전체센터'
  }
]

const tabs = ref([...defaultTabs])

// 현재 선택된 탭의 shipmentMstNo 가져오기
const currentShipmentMstNo = computed(() => {
  if (!tabs.value || currentTabIndex.value < 1) return null
  const currentTab = tabs.value[currentTabIndex.value]
  return currentTab?.order_shipment_mst_no || null
})

// 현재 선택된 탭의 estimated_yn 가져오기
const currentEstimatedYn = computed(() => {
  if (!tabs.value || currentTabIndex.value < 1) return null
  const currentTab = tabs.value[currentTabIndex.value]
  return currentTab?.estimated_yn ?? null
})

const loadShipmentMstData = async () => {
  if (!props.orderMstNo) return
  
  loading.value = true
  try {
    const response = await fetchShipmentList(props.orderMstNo)
    const apiTabs = response?.data?.tabs || []
    
    // 전체센터 탭 + API에서 받아온 센터 데이터를 함께 설정
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
  const baseColDefs = [
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
  ]

  // 전체센터 탭에서만 확정상태 컬럼 표시
  if (currentTabIndex.value === 0) {
    baseColDefs.push({
      field: "order_shipment_mst_status_name", 
      headerName: "상태", 
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-center',
      minWidth: 100,
      cellRenderer: (params) => {
        const status = params.value;
        const color = params.data.order_shipment_mst_status_color;
        if (!status) return '';
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800">${status}</span>`;
      }
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
      field: "tracking_number", 
      headerName: "송장번호", 
      minWidth: 100,
      headerClass: 'ag-header-cell-center',
      cellClass: 'text-right',
    },
  ]

  return baseColDefs.concat(commonColDefs)
})

// ag-Grid 이벤트 핸들러
const onGridReady = (params) => {
  agGrid.value = params.api
}

// 행 클릭 이벤트 핸들러 (전체센터 탭에서만 동작)
const onRowClicked = async (params) => {
  // 전체센터 탭이 아니면 동작하지 않음
  if (currentTabIndex.value !== 0) return
  
  // 클릭된 row의 센터 정보 확인
  const clickedRow = params.data
  if (!clickedRow) return
  
  // order_shipment_mst_no로 해당 센터 탭 찾기
  const shipmentMstNo = clickedRow.order_shipment_mst_no
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

// 행 스타일 설정 (전체센터 탭에서 estimated_yn이 1인 경우 연한 파란색 배경)
const getRowStyle = (params) => {
  const style = {}
  
  // 전체센터 탭인 경우 cursor pointer 적용
  if (currentTabIndex.value === 0) {
    style.cursor = 'pointer'
  }
  
  // 전체센터 탭이고 estimated_yn이 1인 경우 연한 파란색 배경
  if (currentTabIndex.value === 0 && params.data?.estimated_yn === 1) {
    style.backgroundColor = '#e0f2fe' // 연한 파란색 (blue-100)
  }
  
  return Object.keys(style).length > 0 ? style : null
}

// 드롭다운 버튼을 현재 탭 상태에 따라 동적으로 생성
const dropdownButtons = computed(() => {
  const baseButtons = []
  
  // 데이터 관리 그룹
  const dataManagementButtons = []
  
  // 전체센터 탭 또는 estimated_yn이 0인 센터 탭: 엑셀 다운로드만
  if (currentTabIndex.value === 0 || (currentTabIndex.value > 0 && currentEstimatedYn.value === 0)) {
    dataManagementButtons.push({ label: '엑셀 다운로드', value: 'excelDownload' })
  }
  
  // estimated_yn이 1인 센터 탭: 선택 아이템 구매, CJ 운송장 발급, 엑셀 다운로드
  if (currentTabIndex.value > 0 && currentEstimatedYn.value === 1) {
    dataManagementButtons.push({ label: '선택 아이템 구매', value: 'purchaseSelectedItems' })
    dataManagementButtons.push({ label: 'CJ 운송장 발급', value: 'issueCjTrackingNumber' })
    dataManagementButtons.push({ label: '엑셀 다운로드', value: 'excelDownload' })
  }
  
  if (dataManagementButtons.length > 0) {
    baseButtons.push({
      title: '데이터 관리',
      children: dataManagementButtons
    })
  }
  
  return baseButtons
})

// 드롭다운 클릭 핸들러
const handleDropdownClick = (value) => {
  switch (value) {
    case 'excelDownload':
      handleExcelDownload()
      break
    case 'purchaseSelectedItems':
      handlePurchaseSelectedItems()
      break
    case 'issueCjTrackingNumber':
      handleIssueCjTrackingNumber()
      break
    default:
      console.log('알 수 없는 액션:', value)
  }
}

// 엑셀 다운로드
const handleExcelDownload = async () => {
  try {
    // TODO: 엑셀 다운로드 API 호출
    showInfo('준비중', '엑셀 다운로드 기능은 준비중입니다.')
  } catch (error) {
    console.error('엑셀 다운로드 실패:', error)
    showError('다운로드 실패', '엑셀 파일 다운로드 중 오류가 발생했습니다.')
  }
}

// 선택 아이템 구매
const handlePurchaseSelectedItems = async () => {
  try {
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
    
    // TODO: 선택 아이템 구매 API 호출
    showInfo('준비중', '선택 아이템 구매 기능은 준비중입니다.')
  } catch (error) {
    console.error('구매 실패:', error)
    showError('구매 실패', '구매 처리 중 오류가 발생했습니다.')
  }
}

// CJ 운송장 발급
const handleIssueCjTrackingNumber = async () => {
  try {
    // shipmentMstNo 확인
    if (!currentShipmentMstNo.value) {
      showError('센터 오류', '센터 정보를 찾을 수 없습니다.')
      return
    }
    
    // TODO: CJ 운송장 발급 API 호출
    showInfo('준비중', 'CJ 운송장 발급 기능은 준비중입니다.')
  } catch (error) {
    console.error('운송장 발급 실패:', error)
    showError('운송장 발급 실패', '운송장 발급 중 오류가 발생했습니다.')
  }
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
  pageSize.value = 50
  // 탭 전환 시 데이터 조회
  loadTabData()
}

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.orderMstNo) {
    // 탭 인덱스 초기화
    currentTabIndex.value = 0
    // 페이지네이션 초기화
    currentPage.value = 1
    pageSize.value = 50
    // 센터 목록 로드
    await loadShipmentMstData()
    // 전체센터 탭 데이터 로드
    await loadTabData()
  }
})

</script>

