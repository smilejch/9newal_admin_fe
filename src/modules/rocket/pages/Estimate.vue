<template>
  <div class="page-container">
    <!-- 필터 영역 -->
    <PageFilter>
      <template #basic-filters>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">견적일 시작일</label>
          <input 
            v-model="filters.estimate_date_start"
            type="date" 
            placeholder="견적일 시작일"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">견적일 종료일</label>
          <input 
            v-model="filters.estimate_date_end"
            type="date" 
            placeholder="견적일 종료일"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">고객명</label>
          <input 
            v-model="filters.customer_name"
            type="text" 
            placeholder="고객명"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">견적상태</label>
          <select 
            v-model="filters.estimate_status"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">전체</option>
            <option value="draft">작성중</option>
            <option value="sent">발송완료</option>
            <option value="approved">승인</option>
            <option value="rejected">거절</option>
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

    <!-- 데이터 그리드 영역 -->
    <div class="flex-1 min-h-0">
      <PageDataGrid
        title="견적서 목록"
        :loading="loading"
        :rowData="dataList"
        height="100%"
      >
        <template #header-buttons>
          <button 
            @click="addEstimate"
            class="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-700 transition-colors cursor-pointer"
          >
            test 버튼
          </button>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import PageFilter from '@/components/PageFilter.vue'
import PageDataGrid from '@/components/PageDataGrid.vue'
import PagePagination from '@/components/PagePagination.vue'
import { refreshTokenTest } from '@/modules/rocket/api/estimate'

// 반응형 데이터
const loading = ref(false)
const dataList = ref([])
const currentPage = ref(1)
const pageSize = ref(50)
const totalItems = ref(0)
const agGridRef = ref(null)

// 필터
const filters = reactive({
  estimate_date_start: '',
  estimate_date_end: '',
  customer_name: '',
  estimate_status: ''
})

// ag-Grid 설정
const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  minWidth: 100
}

const colDefs = ref([
  { field: 'rocket_order_shipment_estimate_no', headerName: '견적서 번호', width: 120 },
  { field: 'rocket_order_mst_no', headerName: '발주서 번호', width: 120 },
  { field: 'company_no', headerName: '회사 번호', width: 100 },
  { field: 'estimate_id', headerName: '견적서 ID', width: 120 },
  { field: 'estimate_date', headerName: '견적일자', width: 120 },
  { field: 'estimate_total_amount', headerName: '견적 총 금액', width: 130 },
  { field: 'product_total_amount', headerName: '제품 총액', width: 120 },
  { field: 'vinyl_total_amount', headerName: '포장비닐 총액', width: 130 },
  { field: 'box_total_amount', headerName: '박스 총액', width: 120 }
])

// 페이지네이션된 데이터
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return dataList.value.slice(start, end)
})

// 메서드
const searchDataByFilters = () => {
  console.log('검색:', filters)
  // TODO: API 호출
}

const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = ''
  })
  searchDataByFilters()
}

const addEstimate = () => {
  console.log('신규 견적서 추가')
  // TODO: 견적서 추가 모달
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const onGridReady = (params) => {
  console.log('Grid ready')
}

const onFirstDataRendered = (params) => {
  console.log('First data rendered')
}

onMounted(() => {
  refreshTokenTest()
  searchDataByFilters()
})
</script>
