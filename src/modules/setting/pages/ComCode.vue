<template>
  <div class="page-container">
    <!-- 필터 영역 -->
    <PageFilter>
      <!-- 기본 필터 (항상 표시) -->
      <template #basic-filters>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">부모코드</label>
          <input
            v-model="filters.parent_com_code"
            type="text"
            placeholder="부모코드 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">코드명</label>
          <input
            v-model="filters.code_name"
            type="text"
            placeholder="코드명 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">사용여부</label>
          <select
            v-model="filters.use_yn"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">전체</option>
            <option :value="1">사용</option>
            <option :value="0">미사용</option>
          </select>
        </div>
      </template>

      <!-- 커스텀 버튼 추가 -->
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
        title="공통코드 목록"
        :loading="loading"
        :rowData="dataList"
        height="100%"
      >
        <template #ag-grid>
          <ag-grid-vue
            ref="comCodeGridRef"
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

    <!-- 공통코드 등록/수정 모달 -->
    <ComCodeModal
      :isOpen="isModalOpen"
      :mode="modalMode"
      :comCode="selectedComCode"
      :parentComCode="selectedParentComCode"
      @close="closeModal"
      @saved="handleModalSaved"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'

// 컴포넌트 import
import PageFilter from '@/components/PageFilter.vue'
import PageDataGrid from '@/components/PageDataGrid.vue'
import PagePagination from '@/components/PagePagination.vue'
import ComCodeModal from '@/modules/setting/components/ComCodeModal.vue'
import { fetchComCodeList } from '@/modules/setting/api/comCode'
import { showError } from '@/utils/alert'

// 반응형 데이터
const loading = ref(false)
const dataList = ref([])
const comCodeGridRef = ref(null)

// 페이지네이션 상태
const currentPage = ref(1)
const pageSize = ref(50)
const totalItems = ref(0)

// 모달 상태
const isModalOpen = ref(false)
const selectedComCode = ref(null)
const selectedParentComCode = ref('')
const modalMode = ref('edit')

// 필터
const filters = reactive({
  parent_com_code: '',
  code_name: '',
  use_yn: ''
})


// ag-Grid 기본 설정
const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  minWidth: 100,
  flex: 1
}

// URL 쿼리 파라미터 (페이지네이션 상태만)
const queryParams = computed(() => ({
  page: currentPage.value,
  size: pageSize.value
}))

// 요청 바디 (필터 조건들)
const requestBody = computed(() => {
  const body = {}
  
  // 부모코드 필터
  if (filters.parent_com_code && filters.parent_com_code.trim()) {
    body.parent_com_code = filters.parent_com_code.trim()
  }
  
  // 코드명 필터
  if (filters.code_name && filters.code_name.trim()) {
    body.code_name = filters.code_name.trim()
  }
  
  // 사용여부 필터
  if (filters.use_yn !== '' && filters.use_yn !== null && filters.use_yn !== undefined) {
    body.use_yn = filters.use_yn
  }
  
  return body
})

// 페이지네이션된 데이터 (서버 사이드 페이지네이션)
const paginatedData = computed(() => {
  return dataList.value || []
})

// ag-Grid 컬럼 정의
const colDefs = ref([
  {
    headerName: '부모코드',
    field: 'parent_com_code',
    width: 200,
    minWidth: 150,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-left',
  },
  {
    headerName: '코드',
    field: 'com_code',
    width: 150,
    minWidth: 120,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-center',
  },
  {
    headerName: '코드명',
    field: 'code_name',
    width: 200,
    minWidth: 150,
    filter: false,
    headerClass: 'ag-header-cell-center',
  },
  {
    headerName: '정렬순서',
    field: 'sort_order',
    width: 100,
    minWidth: 80,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-center',
    type: 'numericColumn'
  },
  {
    headerName: '키워드1',
    field: 'keyword1',
    width: 150,
    minWidth: 100,
    filter: false,
    headerClass: 'ag-header-cell-center',
  },
  {
    headerName: '키워드2',
    field: 'keyword2',
    width: 150,
    minWidth: 100,
    filter: false,
    headerClass: 'ag-header-cell-center',
  },
  {
    headerName: '키워드3',
    field: 'keyword3',
    width: 150,
    minWidth: 100,
    filter: false,
    headerClass: 'ag-header-cell-center',
  },
  {
    headerName: '사용여부',
    field: 'use_yn',
    width: 100,
    minWidth: 80,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-center',
    cellRenderer: (params) => {
      return params.value === 1 ? '사용' : '미사용'
    }
  },
  {
    headerName: '생성일자',
    field: 'created_at',
    width: 150,
    minWidth: 120,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-center',
    valueFormatter: (params) => {
      if (!params.value) return ''
      const date = new Date(params.value)
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\./g, '-').replace(/,/g, '')
    }
  },
  {
    headerName: '수정일자',
    field: 'updated_at',
    width: 150,
    minWidth: 120,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-center',
    valueFormatter: (params) => {
      if (!params.value) return ''
      const date = new Date(params.value)
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\./g, '-').replace(/,/g, '')
    }
  },
  {
    headerName: '액션',
    field: 'actions',
    width: 80,
    minWidth: 80,
    sortable: false,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-center',
    pinned: 'right',
    cellRenderer: (params) => {
      const container = document.createElement('div')
      container.className = 'action-buttons flex space-x-1 justify-center'
      
      // 편집 버튼 (연필 아이콘)
      const editBtn = document.createElement('button')
      editBtn.className = 'px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center'
      editBtn.innerHTML = `
        <span class="material-icons" style="font-size: 16px">edit</span>
      `
      editBtn.addEventListener('click', () => editItem(params.data.com_code, params.data))
      
      container.appendChild(editBtn)
      
      return container
    }
  }
])

// 데이터 조회
const searchData = async () => {
  loading.value = true
  try {
    const comCodeListData = await fetchComCodeListData()
    dataList.value = comCodeListData
    
  } catch (error) {
    console.error('공통코드 데이터 조회 실패:', error)
    dataList.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

// 공통코드 목록 데이터 조회 함수
const fetchComCodeListData = async () => {
  try {
    const comCodeResponse = await fetchComCodeList(queryParams.value, requestBody.value)
    
    // 총 아이템 수 업데이트
    totalItems.value = comCodeResponse.data.page_info?.total_elements || 0
    
    // 서버에서 받은 페이지네이션된 데이터 반환
    return comCodeResponse.data.content || []
  } catch (error) {
    console.error('API 호출 오류:', error)
    totalItems.value = 0
    return []
  }
}

// 필터 검색
const searchDataByFilters = () => {
  currentPage.value = 1
  searchData()
}

// 필터 초기화
const resetFilters = () => {
  filters.parent_com_code = ''
  filters.code_name = ''
  filters.use_yn = ''
  
  currentPage.value = 1
  pageSize.value = 50
  searchData()
}

const editItem = (comCode, comCodeData) => {
  openModal(comCode, 'edit', comCodeData?.parent_com_code || '')
}

// 모달 관련 함수들
const openModal = (comCode, type, parentComCode = '') => {
  selectedComCode.value = comCode
  selectedParentComCode.value = parentComCode
  modalMode.value = type
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedComCode.value = null
  selectedParentComCode.value = ''
  modalMode.value = 'edit'
}

// 새로운 모달 핸들러들
const handleModalSaved = () => {
  searchData() // 데이터 새로고침
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

// ag-Grid 이벤트 핸들러
const onGridReady = (params) => {
  console.log('Grid ready')
  // 컬럼을 그리드 너비에 맞게 조정
  params.api.sizeColumnsToFit()
}

const onFirstDataRendered = (params) => {
  console.log('First data rendered')
  // 데이터 렌더링 후에도 컬럼 크기 조정
  params.api.sizeColumnsToFit()
}

onMounted(() => {
  searchData()
})
</script>

