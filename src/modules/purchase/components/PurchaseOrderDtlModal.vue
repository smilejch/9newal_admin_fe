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
                                        <div class="flex items-center gap-3">
                                            <!-- 스위치 (구매 탭일 때만 표시) -->
                                            <div v-if="currentTabIndex === 1" class="flex items-center gap-2">
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
import { fetchShipmentList, fetchShipmentDtl, fetchShipmentEstimateProduct, fetchPurchaseList, fetchEstimateProductsAll } from '@/modules/purchase/api/purchase'

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
// 이전 선택 상태 추적 (linked_open_uid 동기화용)
const previousSelectedLinkedOpenUids = ref(new Set())
// 이전 선택된 row ID 추적 (체크박스 해제 감지용)
const previousSelectedRowIds = ref(new Set())
// 프로그래밍 방식으로 선택/해제 중인지 추적 (무한 루프 방지)
const isProcessingSelection = ref(false)
// 연동 선택 스위치 상태 (켜져있으면 같은 linked_open_uid를 가진 row들도 함께 선택/해제)
const isAutoSelectEnabled = ref(true)

// 행 선택 설정 (구매 탭에서만 활성화)
const rowSelection = computed(() => {
  if (currentTabIndex.value === 1) {
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

// 기본 탭 정의 (전체센터 탭, 구매 탭)
const defaultTabs = [
  {
    id: 'all_centers',
    label: '전체센터'
  },
  {
    id: 'purchase',
    label: '구매'
  }
]

const tabs = ref([...defaultTabs])

// 현재 선택된 탭의 shipmentMstNo 가져오기
const currentShipmentMstNo = computed(() => {
  if (!tabs.value || currentTabIndex.value < 2) return null
  const currentTab = tabs.value[currentTabIndex.value]
  return currentTab?.order_shipment_mst_no || null
})

// 현재 선택된 탭의 estimated_yn 가져오기
const currentEstimatedYn = computed(() => {
  if (!tabs.value || currentTabIndex.value < 2) return null
  const currentTab = tabs.value[currentTabIndex.value]
  return currentTab?.estimated_yn ?? null
})

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
    if (currentTabIndex.value === 1 && agGrid.value) {
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

  // 전체센터 탭과 구매 탭에서만 확정상태 컬럼 표시
  if (currentTabIndex.value === 0 || currentTabIndex.value === 1) {
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

  // 구매 탭 또는 estimated_yn이 1인 센터 탭에만 금액 관련 컬럼 추가
  if (currentTabIndex.value === 1 || (currentTabIndex.value > 1 && currentEstimatedYn.value === 1)) {
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

// 행 클릭 이벤트 핸들러 (전체센터 탭에서만 동작)
const onRowClicked = async (params) => {
  // 전체센터 탭이 아니면 동작하지 않음
  if (currentTabIndex.value !== 0) return
  
  // 구매 탭에서는 클릭 동작 없음
  if (currentTabIndex.value === 1) return
  
  // 클릭된 row의 센터 정보 확인
  const clickedRow = params.data
  if (!clickedRow) return
  
  // order_shipment_mst_no로 해당 센터 탭 찾기
  const shipmentMstNo = clickedRow.order_shipment_mst_no
  if (!shipmentMstNo) return
  
  // tabs 배열에서 해당 센터 탭의 인덱스 찾기 (구매 탭이 추가되어 인덱스 +1)
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

// 선택 변경 이벤트 핸들러 (구매 탭에서만 동작)
const onSelectionChanged = async (params) => {
  // 프로그래밍 방식으로 선택/해제 중이면 무시 (무한 루프 방지)
  if (isProcessingSelection.value) {
    return
  }
  
  // 구매 탭이 아니면 동작하지 않음
  if (currentTabIndex.value !== 1) {
    previousSelectedLinkedOpenUids.value = new Set()
    previousSelectedRowIds.value = new Set()
    return
  }
  
  // 연동 선택이 비활성화되어 있으면 동일 linked_open_uid 체크 기능을 사용하지 않음
  // 체크한 체크박스만 체크/해제하고 종료
  if (!isAutoSelectEnabled.value) {
    // 상태만 업데이트하고 종료 (연동 선택 기능 사용 안함)
    const selectedRows = params.api.getSelectedRows() || []
    const selectedNodes = params.api.getSelectedNodes() || []
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
  const selectedNodes = params.api.getSelectedNodes() || []
  
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

// 행 스타일 설정 (전체센터 탭에서 estimated_yn이 1인 경우 연한 파란색 배경)
const getRowStyle = (params) => {
  const style = {}
  
  // 전체센터 탭인 경우 cursor pointer 적용
  if (currentTabIndex.value === 0) {
    style.cursor = 'pointer'
  }
  
  // 전체센터 탭에서만 estimated_yn이 1인 경우 연한 파란색 배경
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
  
  // 전체센터 탭: estimated_yn이 1인 경우에만 엑셀 다운로드
  if (currentTabIndex.value === 0) {
    // 전체센터 탭에서는 estimated_yn이 1인 데이터가 있는지 확인
    const hasEstimatedYn1 = dataList.value.some(item => item.estimated_yn === 1)
    if (hasEstimatedYn1) {
      dataManagementButtons.push({ label: '엑셀 다운로드', value: 'excelDownload' })
    }
  }
  
  // 구매 탭: 선택 아이템 구매, CJ 운송장 발급, 엑셀 다운로드
  if (currentTabIndex.value === 1) {
    dataManagementButtons.push({ label: '선택 아이템 구매', value: 'purchaseSelectedItems' })
    dataManagementButtons.push({ label: 'CJ 운송장 발급', value: 'issueCjTrackingNumber' })
    dataManagementButtons.push({ label: '엑셀 다운로드', value: 'excelDownload' })
  }
  
  // estimated_yn이 0인 센터 탭: 엑셀 다운로드만
  if (currentTabIndex.value > 1 && currentEstimatedYn.value === 0) {
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

// 연동 선택 스위치 토글
// 켜져있으면: 체크박스 체크시 동일 linked_open_uid를 가진 다른 row들도 함께 체크/해제
// 꺼져있으면: 체크한 체크박스만 체크/해제 (동일 linked_open_uid 체크 기능 사용 안함)
const toggleAutoSelect = () => {
  isAutoSelectEnabled.value = !isAutoSelectEnabled.value
}

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
    // 구매 탭에서만 동작
    if (currentTabIndex.value !== 1) {
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
    // 구매 탭에서만 동작
    if (currentTabIndex.value !== 1) {
      showError('탭 오류', '구매 탭에서만 사용할 수 있습니다.')
      return
    }
    
    // TODO: CJ 운송장 발급 API 호출 (구매 탭의 선택된 항목 또는 전체)
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
  // 구매 탭(index === 1)이면 pageSize를 10000으로, 아니면 50으로 설정
  pageSize.value = index === 1 ? 10000 : 50
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
  // 구매 탭(index === 1)이면 pageSize를 10000으로, 아니면 50으로 설정
  if (newIndex === 1) {
    pageSize.value = 10000
  } else if (pageSize.value === 10000) {
    // 구매 탭이 아닌 다른 탭으로 변경될 때만 50으로 변경
    pageSize.value = 50
  }
})

</script>

