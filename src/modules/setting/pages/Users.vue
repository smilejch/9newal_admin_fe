<template>
  <div class="page-container">
    <!-- 필터 영역 -->
    <PageFilter>
      <!-- 기본 필터 (항상 표시) -->
      <template #basic-filters>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">회사</label>
          <div class="relative" ref="companyDropdownRef">
            <div
              @click="toggleCompanyDropdown()"
              class="w-full border border-gray-300 rounded p-2 text-xs cursor-pointer bg-white hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-blue-500': isCompanyDropdownOpen }"
            >
              <div class="flex items-center justify-between">
                <div class="flex flex-wrap gap-1">
                  <span v-if="selectedCompanies.length === 0" class="text-gray-500">회사를 선택하세요</span>
                  <template v-for="companyNo in selectedCompanies" :key="companyNo">
                    <span
                      v-if="getCompanyName(companyNo)"
                      class="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800"
                    >
                      {{ getCompanyName(companyNo) }}
                      <button
                        @click.stop="removeCompany(companyNo)"
                        class="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  </template>
                </div>
                <svg
                  class="w-4 h-4 text-gray-400 transition-transform duration-200"
                  :class="{ 'rotate-180': isCompanyDropdownOpen }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            
            <!-- 드롭다운 메뉴 -->
            <div
              v-if="isCompanyDropdownOpen"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="company in companyOptions"
                :key="company.company_no"
                @click="toggleCompany(company.company_no)"
                class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100 flex items-center"
                :class="{ 'bg-blue-50 text-blue-800': selectedCompanies.includes(company.company_no) }"
              >
                <input
                  type="checkbox"
                  :checked="selectedCompanies.includes(company.company_no)"
                  class="mr-2 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  readonly
                />
                {{ company.company_name }}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">사용자 ID</label>
          <input
            v-model="filters.user_id"
            type="text"
            placeholder="사용자 ID 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>
        <!--
        사용자명, 이메일은 암호화 되어 있어 데이터 전체를 복호화 한 후 필터를 해야하여 우선 필터에서 제외
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">사용자명</label>
          <input
            v-model="filters.user_name"
            type="text"
            placeholder="사용자명 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">이메일</label>
          <input
            v-model="filters.user_email"
            type="text"
            placeholder="이메일 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>
      -->
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
        title="사용자 목록"
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
            ref="userGridRef"
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

    <!-- 사용자 등록/수정 모달 -->
    <UserModal
      :isOpen="isModalOpen"
      :mode="modalMode"
      :userId="selectedUserId"
      @close="closeModal"
      @saved="handleModalSaved"
      @deleted="handleModalDeleted"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'

// 컴포넌트 import
import PageFilter from '@/components/PageFilter.vue'
import PageDataGrid from '@/components/PageDataGrid.vue'
import PagePagination from '@/components/PagePagination.vue'
import CommonButtons from '@/components/CommonButtons.vue'
import UserModal from '@/modules/setting/components/UserModal.vue'
import { deleteUser, fetchUserList, approveUser } from '@/modules/setting/api/user'
import { showError, showSuccess, showInfo, confirmDelete, showConfirm } from '@/utils/alert'
import { fetchCompanyList } from '@/modules/common/api/common'

// 반응형 데이터
const loading = ref(false)
const dataList = ref([])
const currentFormat = ref('normal')
const userGridRef = ref(null)
const companyOptions = ref([])

// 페이지네이션 상태
const currentPage = ref(1)
const pageSize = ref(50)
const totalItems = ref(0)

// 모달 상태
const isModalOpen = ref(false)
const selectedUserId = ref(null)
const modalMode = ref('register')

// 필터
const filters = reactive({
  company_no: [],
  user_id: '',
  user_name: '',
  user_email: ''
})

// 회사 다중 선택 관련
const selectedCompanies = ref([])
const isCompanyDropdownOpen = ref(false)
const companyDropdownRef = ref(null)

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
  
  // 회사 필터
  if (filters.company_no && filters.company_no.length > 0) {
    body.company_no = filters.company_no
  }
  
  // 사용자 ID 필터
  if (filters.user_id && filters.user_id.trim()) {
    body.user_id = filters.user_id.trim()
  }
  
  // 사용자명 필터
  if (filters.user_name && filters.user_name.trim()) {
    body.user_name = filters.user_name.trim()
  }
  
  // 이메일 필터
  if (filters.user_email && filters.user_email.trim()) {
    body.user_email = filters.user_email.trim()
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
    headerName: '사용자ID',
    field: 'user_id',
    width: 80,
    minWidth: 80,
    filter: false,
    headerClass: 'ag-header-cell-center',
  },
  {
    headerName: '사용자명',
    field: 'user_name',
    width: 100,
    minWidth: 100,
    filter: false,
    headerClass: 'ag-header-cell-center',
  },
  {
    headerName: '이메일',
    field: 'user_email',
    width: 150,
    minWidth: 150,
    filter: false,
    headerClass: 'ag-header-cell-center',
  },
  {
    headerName: '연락처',
    field: 'contact',
    width: 100,
    minWidth: 100,
    filter: false,
    headerClass: 'ag-header-cell-center',
  },
  {
    headerName: '회사명',
    field: 'company_name',
    width: 150,
    minWidth: 120,
    filter: false,
    headerClass: 'ag-header-cell-center',
  },
  {
    headerName: '사용자상태',
    field: 'user_status_name',
    filter: false,
    headerClass: 'ag-header-cell-center',
    width: 100,
    minWidth: 80
  },
  
  {
    headerName: 'Actions',
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
      
      // approval_yn이 0이면 승인 버튼 표시
      if (params.data.approval_yn === 0) {
        const approveBtn = document.createElement('button')
        approveBtn.style.cssText = `
          padding: 8px 16px;
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 60px;
        `
        approveBtn.innerHTML = '승인'
        approveBtn.addEventListener('click', () => approveItem(params.data.user_no))
        approveBtn.addEventListener('mouseenter', () => {
          approveBtn.style.backgroundColor = '#059669'
        })
        approveBtn.addEventListener('mouseleave', () => {
          approveBtn.style.backgroundColor = '#10b981'
        })
        container.appendChild(approveBtn)
      } else {
        // 편집 버튼 (연필 아이콘)
        const editBtn = document.createElement('button')
        editBtn.className = 'px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center'
        editBtn.innerHTML = `
          <span class="material-icons" style="font-size: 16px">edit</span>
        `
        editBtn.addEventListener('click', () => editItem(params.data.user_no))
        
        // 삭제 버튼 (쓰레기통 아이콘)
        const deleteBtn = document.createElement('button')
        deleteBtn.className = 'px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center'
        deleteBtn.innerHTML = `
          <span class="material-icons" style="font-size: 16px">delete</span>
        `
        deleteBtn.addEventListener('click', () => deleteItem(params.data.user_no))
        
        container.appendChild(editBtn)
        container.appendChild(deleteBtn)
      }
      
      return container
    }
  }
])

// 데이터 조회
const searchData = async () => {
  loading.value = true
  try {
    const userListData = await fetchUserListData()
    console.log('Users 데이터 로드됨:', userListData)
    console.log('총 아이템 수:', totalItems.value)
    dataList.value = userListData
    
  } catch (error) {
    console.error('사용자 데이터 조회 실패:', error)
    // 에러 시 안전하게 빈 배열로 초기화
    dataList.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

// 사용자 목록 데이터 조회 함수
const fetchUserListData = async () => {
  try {
    const userResponse = await fetchUserList(queryParams.value, requestBody.value)
    
    // 총 아이템 수 업데이트
    totalItems.value = userResponse.data.page_info.total_elements || 0
    
    // 서버에서 받은 페이지네이션된 데이터 반환
    return userResponse.data.content || []
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

// 필터 초기화
const resetFilters = () => {
  filters.company_no = []
  filters.user_id = ''
  filters.user_name = ''
  filters.user_email = ''
  
  // 회사 다중 선택 상태도 초기화
  selectedCompanies.value = []
  isCompanyDropdownOpen.value = false
  
  currentPage.value = 1 // 페이지를 첫 페이지로 초기화
  pageSize.value = 50 // 페이지당 개수를 기본값으로 초기화
  searchData()
}

const editItem = (userId) => {
  openModal(userId, 'edit')
}

const viewItem = (userId) => {
  openModal(userId, 'view')
}

const deleteItem = async (userId) => {
  try {
    const confirmed = await confirmDelete('사용자 삭제', '정말로 이 사용자를 삭제하시겠습니까?')
    if (confirmed) {
      await deleteUser(userId)
      showSuccess('삭제 완료', '사용자가 성공적으로 삭제되었습니다.')
      searchData()
    }
  } catch (error) {
    console.error('사용자 삭제 실패:', error)
    showError('삭제 실패', '사용자 삭제 중 오류가 발생했습니다.')
  }
}

const approveItem = async (userId) => {
  try {
    const confirmed = await showConfirm('사용자 승인', '이 사용자를 승인하시겠습니까?')
    if (confirmed) {
      await approveUser(userId)
      showSuccess('승인 완료', '사용자가 성공적으로 승인되었습니다.')
      searchData()
    }
  } catch (error) {
    console.error('사용자 승인 실패:', error)
    showError('승인 실패', '사용자 승인 중 오류가 발생했습니다.')
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

// 모달 관련 함수들
const openModal = (userId, type) => {
  console.log('userId', userId)
  console.log('type', type)
  selectedUserId.value = userId
  modalMode.value = type
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedUserId.value = null
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

// 회사 다중 선택 관련 함수들
const toggleCompanyDropdown = () => {
  isCompanyDropdownOpen.value = !isCompanyDropdownOpen.value
}

const toggleCompany = (companyNo) => {
  const index = selectedCompanies.value.indexOf(companyNo)
  if (index > -1) {
    selectedCompanies.value.splice(index, 1)
  } else {
    selectedCompanies.value.push(companyNo)
  }
  
  // filters.company_no 업데이트
  filters.company_no = [...selectedCompanies.value]
  searchDataByFilters()
}

const removeCompany = (companyNo) => {
  const index = selectedCompanies.value.indexOf(companyNo)
  if (index > -1) {
    selectedCompanies.value.splice(index, 1)
  }
  
  // filters.company_no 업데이트
  filters.company_no = [...selectedCompanies.value]
  searchDataByFilters()
}

const getCompanyName = (companyNo) => {
  const company = companyOptions.value.find(c => c.company_no === companyNo)
  if (company?.company_name) {
    return company.company_name
  } else {
    // 알 수 없는 회사인 경우 selectedCompanies에서 제거
    const index = selectedCompanies.value.indexOf(companyNo)
    if (index > -1) {
      selectedCompanies.value.splice(index, 1)
      filters.company_no = [...selectedCompanies.value]
    }
    return null
  }
}

// 외부 클릭 감지
const handleCompanyClickOutside = (event) => {
  if (companyDropdownRef.value && !companyDropdownRef.value.contains(event.target)) {
    isCompanyDropdownOpen.value = false
  }
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

// 회사 목록 로드
const loadCompanyOptions = async () => {
  try {
    const response = await fetchCompanyList()
    companyOptions.value = response.data || []
  } catch (error) {
    console.error('회사 목록 로드 실패:', error)
    showError('데이터 로드 실패', '회사 목록을 불러오는 중 오류가 발생했습니다.')
  }
}

onMounted(async () => {
  await loadCompanyOptions()
  searchData()
  
  // 외부 클릭 이벤트 리스너 등록
  document.addEventListener('click', handleCompanyClickOutside)
})

onUnmounted(() => {
  // 이벤트 리스너 제거
  document.removeEventListener('click', handleCompanyClickOutside)
})
</script>
