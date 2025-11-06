<template>
  <div class="page-container">
    <PageFilter>
      <template #basic-filters>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">발주일 시작일</label>
          <input 
            v-model="filters.order_date_start"
            type="date" 
            placeholder="발주일 시작일"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">발주일 종료일</label>
          <input 
            v-model="filters.order_date_end"
            type="date" 
            placeholder="발주일 종료일"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">메모</label>
          <input 
            v-model="filters.order_memo"
            type="text" 
            placeholder="메모"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">발주상태</label>
          <select 
              v-model="filters.order_mst_status_cd"
              class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option 
                v-for="option in orderStatusOptions" 
                :key="option.com_code" 
                :value="option.com_code"
              >
                {{ option.code_name }}
              </option>
          </select>
        </div>
      </template>

      <template #buttons>
        <button 
          @click="searchDataByFilters"
          class="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700 transition-colors cursor-pointer"
        >
          조회
        </button>
        <button 
          @click="resetFilters"
          class="bg-gray-500 text-white px-3 py-1 text-xs rounded hover:bg-gray-600 transition-colors cursor-pointer"
        >
          초기화
        </button>
      </template>
    </PageFilter>

    <div class="flex-1 min-h-0">
      <PageDataGrid
        title="발주서 목록"
        :loading="loading"
        :rowData="dataList"
        height="100%"
      >
        <template #header-buttons>
        </template>
        <template #ag-grid>
          <ag-grid-vue
            ref="agGridRef"
            :key="`ag-grid-${currentPage}-${dataList.length}`"
            class="ag-theme-alpine"
            theme="legacy"
            :rowData="paginatedData"
            :columnDefs="colDefs"
            :style="{ height: '100%', width: '100%' }"
            :suppressPaginationPanel="true"
            :defaultColDef="defaultColDef"
            @grid-ready="onGridReady"
            @first-data-rendered="onFirstDataRendered"
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
    
    <!-- TODO: 상세 조회 모달 컴포넌트 추가 필요 -->
    <!-- <PurchaseOrderDtlModal
      :isOpen="isDtlModalOpen"
      :orderMstNo="selectedOrderMstNo"
      @close="closeDtlModal"
    /> -->

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'

// 컴포넌트 import
import PageFilter from '@/components/PageFilter.vue'
import PageDataGrid from '@/components/PageDataGrid.vue'
import PagePagination from '@/components/PagePagination.vue'
import { fetchOrderMstList } from '@/modules/purchase/api/purchase'
import { commonCodeList } from '@/modules/common/api/common'

// 반응형 데이터
const loading = ref(false)
const dataList = ref([])
const agGrid = ref(null)
const agGridRef = ref(null)

// 페이지네이션 상태
const currentPage = ref(1)
const pageSize = ref(50)
const totalItems = ref(0)
const orderStatusOptions = ref([]);

const isDtlModalOpen = ref(false)
const selectedOrderMstNo = ref(null)

// URL 쿼리 파라미터 (페이지네이션 상태만)
const queryParams = computed(() => ({
  page: currentPage.value,
  size: pageSize.value
}))

// POST body에 전달할 필터 데이터
const requestBody = computed(() => ({
  order_date_start: filters.order_date_start || '',
  order_date_end: filters.order_date_end || '',
  order_memo: filters.order_memo || '',
  order_mst_status_cd: filters.order_mst_status_cd || '',
}))

// 서버 사이드 페이지네이션: 서버에서 이미 페이지네이션된 데이터를 받으므로 그대로 반환
const paginatedData = computed(() => {
  return dataList.value
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

// 모달 관련 함수들
const openDtlModal = (orderMstNo) => {
  selectedOrderMstNo.value = orderMstNo
  isDtlModalOpen.value = true
}

const dtlEditItem = (orderMstNo) => {
  alert("상세 조회 모달 개발 진행중")
  // openDtlModal(orderMstNo)
}

const closeDtlModal = () => {
  isDtlModalOpen.value = false
  selectedOrderMstNo.value = null
  searchData()
}

const searchDataByFilters = () => {
  currentPage.value = 1
  searchData()
}


// ag-Grid 컬럼 정의
const colDefs = ref([
  // 기본 식별 정보
  { 
    field: "company_name", 
    headerName: "회사", 
    width: 120,
    minWidth: 120,
    sortable: true,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-left',
  },
  { 
    field: "platform_type_name", 
    headerName: "구분", 
    width: 80,
    minWidth: 80,
    sortable: true,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-center',
  },
  { 
    field: "order_date", 
    headerName: "발주일", 
    width: 80,
    minWidth: 80,
    sortable: true,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-center',
  },
  { 
    field: "order_memo", 
    headerName: "메모", 
    width: 400,
    minWidth: 400,
    sortable: true,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-left',
  },
  { 
    field: "order_mst_status_name", 
    headerName: "상태", 
    width: 100,
    minWidth: 100,
    sortable: true,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-center',
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 120,
    minWidth: 120,
    sortable: false,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-center',
    pinned: 'right',
    cellRenderer: (params) => {
      const container = document.createElement('div')
      container.className = 'action-buttons'

      const viewBtn = document.createElement('button')
      viewBtn.innerHTML = `
        <span class="material-icons" style="font-size: 16px">search</span>
      `
      viewBtn.addEventListener('click', () => dtlEditItem(params.data.order_mst_no))
      
      container.appendChild(viewBtn)
      
      return container
    }
  }
]);

const filters = reactive({
  order_date_start:'',
  order_date_end:'',
  order_memo:'',
  order_mst_status_cd:''
})

const searchData = async () => {
  loading.value = true
  
  try {
    const orderMstListData = await fetchOrderMstListData()
    dataList.value = orderMstListData
    
    await nextTick()
    setTimeout(() => {
      autoSizeAllColumns()
    }, 100)
    
  } catch (error) {
    console.error('데이터 조회 실패:', error)
    dataList.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

const fetchOrderMstListData = async () => {
  try {

    const orderMstResponse = await fetchOrderMstList(queryParams.value, requestBody.value)
    
    totalItems.value = orderMstResponse.data.page_info.total_elements
    
    return orderMstResponse.data.content || []
  } catch (error) {
    console.error('API 호출 오류:', error)
    totalItems.value = 0
    return []
  }
}

const fetchCommonCodes = async () => {
  try {
    const response = await commonCodeList('ORDER_MST_STATUS_CD')
    orderStatusOptions.value = response.data
  } catch (error) {
    console.error('공통 코드 조회 실패:', error)
  }
}

const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = ''
  })
  currentPage.value = 1
  searchData()
}

// 페이지네이션 핸들러
const handlePageChange = (page) => {
  currentPage.value = page
  searchData()
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  searchData()
}

// ag-Grid 이벤트 핸들러들
const onGridReady = (params) => {
  agGrid.value = params.api
}

const onFirstDataRendered = (params) => {
  setTimeout(() => {
    autoSizeAllColumns()
  }, 300)
}

const autoSizeAllColumns = () => {
  if (agGrid.value) {
    try {
      // sizeColumnsToFit 사용 - 전체 너비에 맞게 컬럼들을 조정
      agGrid.value.sizeColumnsToFit()
    } catch (error) {
      console.error('Error in sizeColumnsToFit:', error)
    }
  }
}

const sizeColumnsToFit = () => {
  if (agGrid.value) {
    agGrid.value.sizeColumnsToFit()
  }
}

const autoSizeColumns = (columnKeys) => {
  if (agGrid.value) {
    agGrid.value.autoSizeColumns(columnKeys)
  }
}

// 컴포넌트 마운트 시 초기 데이터 로드
onMounted(() => {
  fetchCommonCodes()
  searchData()
})
</script>
