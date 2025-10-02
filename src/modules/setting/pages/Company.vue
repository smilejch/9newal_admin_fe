<template>
  <div class="page-container">
    <!-- 필터 영역 -->
    <PageFilter>
      <!-- 기본 필터 (항상 표시) -->
      <template #basic-filters>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">회사명</label>
          <input
            v-model="filters.company_name"
            type="text"
            placeholder="회사명 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">쿠팡 벤더ID</label>
          <input
            v-model="filters.coupang_vendor_id"
            type="text"
            placeholder="쿠팡 벤더ID 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">사업자번호</label>
          <input
            v-model="filters.business_registration_number"
            type="text"
            placeholder="사업자번호 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">주소</label>
          <input
            v-model="filters.address"
            type="text"
            placeholder="주소 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>
      </template>

      <!-- 커스텀 버튼 추가 -->
      <template #buttons>
        <button
          @click="searchData"
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
        title="회사 목록"
        :loading="loading"
        :rowData="dataList"
        height="100%"
      >
        <template #header-buttons>
          <CommonButtons
            :buttons="formatButtons"
            :dropdownButtons="dropdownButtons"
            :currentValue="currentFormat"
            @button-click="changeFormat"
            @dropdown-click="handleDropdownClick"
          />
        </template>
        <template #ag-grid>
          <ag-grid-vue
            ref="companyGridRef"
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

    <!-- 회사 등록/수정 모달 -->
    <CompanyModal
      :isOpen="isModalOpen"
      :mode="modalMode"
      :companyNo="selectedCompanyNo"
      @close="closeModal"
      @saved="handleModalSaved"
      @deleted="handleModalDeleted"
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
import CommonButtons from '@/components/CommonButtons.vue'
import CompanyModal from '@/modules/setting/components/CompanyModal.vue'
import { deleteCompany, fetchCompanyList } from '@/modules/setting/api/company'
import { showError, showSuccess, showInfo, confirmDelete, showConfirm } from '@/utils/alert'

// 반응형 데이터
const loading = ref(false)
const dataList = ref([])
const currentFormat = ref('normal')
const companyGridRef = ref(null)

// 페이지네이션 상태
const currentPage = ref(1)
const pageSize = ref(50)
const totalItems = ref(0)

// 모달 상태
const isModalOpen = ref(false)
const selectedCompanyNo = ref(null)
const modalMode = ref('register')

// 필터
const filters = reactive({
  company_name: '',
  coupang_vendor_id: '',
  business_registration_number: '',
  address: ''
})

// 포맷 및 버튼 관련
const formatButtons = ref([
  { label: '등록', value: 'register', variant: 'primary' }
])

const dropdownButtons = ref([
  { label: '템플릿 다운로드', value: 'template-download' },
  { label: '업로드', value: 'upload' }
])

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
  
  // 회사명 필터
  if (filters.company_name && filters.company_name.trim()) {
    body.company_name = filters.company_name.trim()
  }
  
  // 쿠팡 벤더ID 필터
  if (filters.coupang_vendor_id && filters.coupang_vendor_id.trim()) {
    body.coupang_vendor_id = filters.coupang_vendor_id.trim()
  }
  
  // 사업자번호 필터
  if (filters.business_registration_number && filters.business_registration_number.trim()) {
    body.business_registration_number = filters.business_registration_number.trim()
  }
  
  // 주소 필터
  if (filters.address && filters.address.trim()) {
    body.address = filters.address.trim()
  }
  
  return body
})

// 페이지네이션된 데이터 (클라이언트 사이드 페이지네이션용)
const paginatedData = computed(() => {
  return dataList.value || []
})

// ag-Grid 컬럼 정의
const colDefs = ref([
  {
    headerName: '회사명',
    field: 'company_name',
    width: 200,
    minWidth: 150,
    filter: false,
    headerClass: 'ag-header-cell-center',
  },
  {
    headerName: '플랫폼',
    field: 'platform_type_name',
    width: 80,
    minWidth: 80,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-center',
  },
  {
    headerName: '쿠팡 벤더ID',
    field: 'coupang_vendor_id',
    width: 120,
    minWidth: 100,
    filter: false,
    headerClass: 'ag-header-cell-center',
  },
  {
    headerName: '사업자번호',
    field: 'business_registration_number',
    width: 120,
    minWidth: 100,
    filter: false,
    headerClass: 'ag-header-cell-center',
  },
  {
    headerName: '주소',
    field: 'address',
    width: 250,
    minWidth: 200,
    filter: false,
    headerClass: 'ag-header-cell-center',
  },
  {
    headerName: '상세주소',
    field: 'address_dtl',
    width: 200,
    minWidth: 150,
    filter: false,
    headerClass: 'ag-header-cell-center',
  },
  {
    headerName: '회사상태',
    field: 'company_status_name',
    width: 100,
    minWidth: 80,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-center',
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
    cellRenderer: (params) => {
      const container = document.createElement('div')
      container.className = 'action-buttons flex space-x-1 justify-center'
      
      // 편집 버튼 (연필 아이콘)
      const editBtn = document.createElement('button')
      editBtn.className = 'px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center'
      editBtn.innerHTML = `
        <span class="material-icons" style="font-size: 16px">edit</span>
      `
      editBtn.addEventListener('click', () => editItem(params.data.company_no))
      
      // 삭제 버튼 (쓰레기통 아이콘)
      const deleteBtn = document.createElement('button')
      deleteBtn.className = 'px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center'
      deleteBtn.innerHTML = `
        <span class="material-icons" style="font-size: 16px">delete</span>
      `
      deleteBtn.addEventListener('click', () => deleteItem(params.data.company_no))
      
      container.appendChild(editBtn)
      container.appendChild(deleteBtn)
      
      return container
    }
  }
])

// 데이터 조회
const searchData = async () => {
  loading.value = true
  try {
    const companyListData = await fetchCompanyListData()
    dataList.value = companyListData
    
  } catch (error) {
    console.error('회사 데이터 조회 실패:', error)
    // 에러 시 안전하게 빈 배열로 초기화
    dataList.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

// 회사 목록 데이터 조회 함수
const fetchCompanyListData = async () => {
  try {
    const companyResponse = await fetchCompanyList(queryParams.value, requestBody.value)
    
    // 총 아이템 수 업데이트
    totalItems.value = companyResponse.data.page_info.total_elements || 0
    
    // 서버에서 받은 페이지네이션된 데이터 반환
    return companyResponse.data.content || []
  } catch (error) {
    console.error('API 호출 오류:', error)
    // 에러 시 totalItems 초기화
    totalItems.value = 0
    return []
  }
}

// 필터 검색
const searchDataByFilters = () => {
  currentPage.value = 1
  searchData()
}

// 액션 핸들러
const handleAction = (value) => {
  const { action, id } = value
  
  switch (action) {
    case 'view':
      viewItem(id)
      break
    case 'edit':
      editItem(id)
      break
    case 'delete':
      deleteItem(id)
      break
    default:
      console.log('알 수 없는 액션:', value)
  }
}

// 포맷 버튼 클릭 핸들러 (등록 버튼 포함)
const changeFormat = (format) => {
  if (format === 'register') {
    openModal(null, 'register')
  } else {
    currentFormat.value = format
  }
}

// 드롭다운 클릭 핸들러
const handleDropdownClick = (value) => {
  switch (value) {
    case 'template-download':
      // 템플릿 다운로드 로직
      console.log('템플릿 다운로드')
      break
    case 'upload':
      // 업로드 로직
      console.log('업로드')
      break
    default:
      console.log('알 수 없는 드롭다운 액션:', value)
  }
}

// 필터 초기화
const resetFilters = () => {
  filters.company_name = ''
  filters.coupang_vendor_id = ''
  filters.business_registration_number = ''
  filters.address = ''
  
  currentPage.value = 1 // 페이지를 첫 페이지로 초기화
  pageSize.value = 50 // 페이지당 개수를 기본값으로 초기화
  searchData()
}

const editItem = (companyNo) => {
  openModal(companyNo, 'edit')
}

const viewItem = (companyNo) => {
  openModal(companyNo, 'view')
}

const deleteItem = async (companyNo) => {
  try {
    const confirmed = await confirmDelete('회사 삭제', '정말로 이 회사를 삭제하시겠습니까?')
    if (confirmed) {
      await deleteCompany(companyNo)
      showSuccess('삭제 완료', '회사가 성공적으로 삭제되었습니다.')
      searchData()
    }
  } catch (error) {
    console.error('회사 삭제 실패:', error)
    showError('삭제 실패', '회사 삭제 중 오류가 발생했습니다.')
  }
}

// 포맷 변경 핸들러
const handleFormatChange = (format) => {
  currentFormat.value = format
}

// 모달 관련 함수들
const openModal = (companyNo, type) => {
  console.log('companyNo', companyNo)
  console.log('type', type)
  selectedCompanyNo.value = companyNo
  modalMode.value = type
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedCompanyNo.value = null
  modalMode.value = 'register'
}

// 새로운 모달 핸들러들
const handleModalSaved = () => {
  searchData() // 데이터 새로고침
}

const handleModalDeleted = () => {
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
