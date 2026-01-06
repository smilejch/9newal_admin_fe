<template>
  <div class="page-container">
    <!-- 필터 영역 -->
    <PageFilter>
      <!-- 기본 필터 (항상 표시) -->
      <template #basic-filters>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">카테고리명</label>
          <input
            v-model="filters.code_name"
            type="text"
            placeholder="카테고리명 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">비고</label>
          <input
            v-model="filters.description"
            type="text"
            placeholder="비고 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
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

    <!-- 데이터 그리드 영역 - 3:7 비율 -->
    <div class="flex-1 min-h-0 flex gap-4">
      <!-- 왼쪽: 카테고리 목록 (30%) -->
      <div class="w-[30%] min-w-0">
        <PageDataGrid
          title="카테고리 목록"
          :loading="parentLoading"
          :rowData="parentDataList"
          height="100%"
        >
          <template #ag-grid>
            <ag-grid-vue
              ref="parentGridRef"
              :key="`parent-grid-${parentCurrentPage}-${parentDataList.length}`"
              class="ag-theme-alpine parent-grid"
              theme="legacy"
              :rowData="parentPaginatedData"
              :columnDefs="parentColDefs"
              :style="{ height: '100%', width: '100%' }"
              :suppressPaginationPanel="true"
              :defaultColDef="defaultColDef"
              :rowSelection="'single'"
              @grid-ready="onParentGridReady"
              @first-data-rendered="onParentFirstDataRendered"
            >
            </ag-grid-vue>
          </template>
          <template #pagination>
            <PagePagination
              :currentPage="parentCurrentPage"
              :totalItems="parentTotalItems"
              :pageSize="parentPageSize"
              @page-change="handleParentPageChange"
              @page-size-change="handleParentPageSizeChange"
            />
          </template>
        </PageDataGrid>
      </div>

      <!-- 오른쪽: 값 목록 (70%) -->
      <div class="flex-1 min-w-0">
        <PageDataGrid
          title="값 목록"
          :loading="childLoading"
          :rowData="childDataList"
          height="100%"
        >
          <template #ag-grid>
            <ag-grid-vue
              ref="childGridRef"
              :key="`child-grid-${childCurrentPage}-${childDataList.length}`"
              class="ag-theme-alpine"
              theme="legacy"
              :rowData="childPaginatedData"
              :columnDefs="childColDefs"
              :style="{ height: '100%', width: '100%' }"
              :suppressPaginationPanel="true"
              :defaultColDef="defaultColDef"
              @grid-ready="onChildGridReady"
              @first-data-rendered="onChildFirstDataRendered"
            >
            </ag-grid-vue>
          </template>
          <template #pagination>
            <PagePagination
              :currentPage="childCurrentPage"
              :totalItems="childTotalItems"
              :pageSize="childPageSize"
              @page-change="handleChildPageChange"
              @page-size-change="handleChildPageSizeChange"
            />
          </template>
        </PageDataGrid>
      </div>
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

    <!-- 비고 수정 모달 -->
    <CommonModal
      :isOpen="isDescriptionModalOpen"
      title="비고 수정"
      size="medium"
      :showSave="true"
      :showDelete="false"
      @close="closeDescriptionModal"
      @save="handleDescriptionSave"
    >
      <template #content>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">카테고리명</label>
            <input
              :value="selectedDescriptionData?.code_name || ''"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">비고</label>
            <textarea
              v-model="descriptionInput"
              rows="5"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="비고를 입력하세요"
            ></textarea>
          </div>
        </div>
      </template>
    </CommonModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'

// 컴포넌트 import
import PageFilter from '@/components/PageFilter.vue'
import PageDataGrid from '@/components/PageDataGrid.vue'
import PagePagination from '@/components/PagePagination.vue'
import CommonModal from '@/components/CommonModal.vue'
import ComCodeModal from '@/modules/setting/components/ComCodeModal.vue'
import { fetchParentComCodeList, fetchChildComCodeList, updateComCode } from '@/modules/setting/api/comCode'
import { showError, showSuccess, confirmSave } from '@/utils/alert'

// 카테고리 그리드 관련
const parentLoading = ref(false)
const parentDataList = ref([])
const parentGridRef = ref(null)
const parentCurrentPage = ref(1)
const parentPageSize = ref(50)
const parentTotalItems = ref(0)
const selectedParentCode = ref(null) // 선택된 카테고리

// 값 그리드 관련
const childLoading = ref(false)
const childDataList = ref([])
const childGridRef = ref(null)
const childCurrentPage = ref(1)
const childPageSize = ref(50)
const childTotalItems = ref(0)

// 모달 상태
const isModalOpen = ref(false)
const selectedComCode = ref(null)
const selectedParentComCode = ref('')
const modalMode = ref('edit')

// 비고 수정 모달 상태
const isDescriptionModalOpen = ref(false)
const selectedDescriptionData = ref(null)
const descriptionInput = ref('')

// 필터
const filters = reactive({
  code_name: '',
  description: ''
})


// ag-Grid 기본 설정
const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  minWidth: 100,
  flex: 1
}

// 카테고리 그리드 쿼리 파라미터
const parentQueryParams = computed(() => ({
  page: parentCurrentPage.value,
  size: parentPageSize.value
}))

// 값 그리드 쿼리 파라미터
const childQueryParams = computed(() => ({
  page: childCurrentPage.value,
  size: childPageSize.value
}))

// 요청 바디 (필터 조건들)
const requestBody = computed(() => {
  const body = {}
  
  // 카테고리 필터
  if (filters.code_name && filters.code_name.trim()) {
    body.code_name = filters.code_name.trim()
  }
  
  // 비고 필터
  if (filters.description && filters.description.trim()) {
    body.description = filters.description.trim()
  }
  
  return body
})

// 카테고리 그리드 페이지네이션된 데이터
const parentPaginatedData = computed(() => {
  return parentDataList.value || []
})

// 값 그리드 페이지네이션된 데이터
const childPaginatedData = computed(() => {
  return childDataList.value || []
})

// 공통 컬럼 정의 함수
const createColumnDefs = (isParent = false) => {
  return [
    {
      headerName: '부모코드',
      field: 'parent_com_code',
      hide: true, // 화면에 표시하지 않음
    },
    {
      headerName: '코드',
      field: 'com_code',
      hide: true, // 화면에 표시하지 않음
    },
    {
      headerName: '기준값명',
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
      headerName: '비고',
      field: 'description',
      width: 300,
      minWidth: 200,
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
        editBtn.addEventListener('click', () => editItem(params.data.com_code, params.data, isParent))
        
        container.appendChild(editBtn)
        
        return container
      }
    }
  ]
}

// 카테고리 그리드 컬럼 정의 (카테고리명, 비고, 액션)
const parentColDefs = ref([
  {
    headerName: '부모코드',
    field: 'parent_com_code',
    hide: true,
  },
  {
    headerName: '코드',
    field: 'com_code',
    hide: true,
  },
  {
    headerName: '카테고리명',
    field: 'code_name',
    width: 100,
    minWidth: 100,
    filter: false,
    headerClass: 'ag-header-cell-center',
    flex: 1,
  },
  {
    headerName: '비고',
    field: 'description',
    width: 300,
    minWidth: 200,
    filter: false,
    headerClass: 'ag-header-cell-center',
    flex: 1,
  },
  {
    headerName: '액션',
    field: 'actions',
    width: 120,
    minWidth: 120,
    sortable: false,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-center',
    pinned: 'right',
    cellRenderer: (params) => {
      const container = document.createElement('div')
      container.className = 'action-buttons flex space-x-1 justify-center'
      
      // 돋보기 아이콘 버튼 (자식 리스트 조회)
      const searchBtn = document.createElement('button')
      searchBtn.innerHTML = `
        <span class="material-icons" style="font-size: 16px">search</span>
      `
      searchBtn.title = '값 조회'
      searchBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        onParentRowClicked({ data: params.data })
      })
      
      // 비고 수정 버튼
      const editDescBtn = document.createElement('button')
      editDescBtn.className = 'px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center'
      editDescBtn.innerHTML = `
        <span class="material-icons" style="font-size: 16px">edit</span>
      `
      editDescBtn.title = '비고 수정'
      editDescBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        openDescriptionModal(params.data)
      })
      
      container.appendChild(searchBtn)
      container.appendChild(editDescBtn)
      
      return container
    }
  },
])

// 값 그리드 컬럼 정의
const childColDefs = ref(createColumnDefs(false))

// 카테고리 목록 조회
const searchParentData = async () => {
  parentLoading.value = true
  try {
    const parentResponse = await fetchParentComCodeList(parentQueryParams.value, requestBody.value)
    
    parentTotalItems.value = parentResponse.data.page_info?.total_elements || 0
    parentDataList.value = parentResponse.data.content || []
    
  } catch (error) {
    console.error('카테고리 데이터 조회 실패:', error)
    parentDataList.value = []
    parentTotalItems.value = 0
    showError('카테고리 목록을 불러오는데 실패했습니다.')
  } finally {
    parentLoading.value = false
  }
}

// 값 목록 조회
const searchChildData = async (parentComCode) => {
  if (!parentComCode) {
    childDataList.value = []
    childTotalItems.value = 0
    return
  }
  
  childLoading.value = true
  try {
    // 값 조회는 필터 없이 조회 (빈 객체 전달)
    const childResponse = await fetchChildComCodeList(parentComCode, childQueryParams.value, {})
    
    childTotalItems.value = childResponse.data.page_info?.total_elements || 0
    childDataList.value = childResponse.data.content || []
    
  } catch (error) {
    console.error('값 데이터 조회 실패:', error)
    childDataList.value = []
    childTotalItems.value = 0
    showError('값 목록을 불러오는데 실패했습니다.')
  } finally {
    childLoading.value = false
  }
}

// 필터 검색 (카테고리 리스트에만 적용)
const searchDataByFilters = () => {
  parentCurrentPage.value = 1
  searchParentData()
  // 필터 검색 시 값 데이터는 초기화 (필터는 카테고리 리스트에만 적용)
  if (selectedParentCode.value) {
    searchChildData(selectedParentCode.value)
  } else {
    childDataList.value = []
    childTotalItems.value = 0
  }
}

// 필터 초기화
const resetFilters = () => {
  filters.code_name = ''
  filters.description = ''
  
  parentCurrentPage.value = 1
  parentPageSize.value = 50
  childCurrentPage.value = 1
  childPageSize.value = 50
  selectedParentCode.value = null
  
  searchParentData()
  childDataList.value = []
  childTotalItems.value = 0
}

// 카테고리 그리드 row 클릭 핸들러 (돋보기 아이콘 클릭 시 호출)
const onParentRowClicked = (event) => {
  if (event.data && event.data.com_code) {
    selectedParentCode.value = event.data.com_code
    childCurrentPage.value = 1
    searchChildData(event.data.com_code)
  }
}

const editItem = (comCode, comCodeData, isParent = false) => {
  const parentCode = isParent ? comCode : (comCodeData?.parent_com_code || selectedParentCode.value || '')
  openModal(comCode, 'edit', parentCode)
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

// 카테고리 그리드 페이지네이션 핸들러
const handleParentPageChange = (page) => {
  parentCurrentPage.value = page
  searchParentData()
}

const handleParentPageSizeChange = (size) => {
  parentPageSize.value = size
  parentCurrentPage.value = 1
  searchParentData()
}

// 값 그리드 페이지네이션 핸들러
const handleChildPageChange = (page) => {
  childCurrentPage.value = page
  if (selectedParentCode.value) {
    searchChildData(selectedParentCode.value)
  }
}

const handleChildPageSizeChange = (size) => {
  childPageSize.value = size
  childCurrentPage.value = 1
  if (selectedParentCode.value) {
    searchChildData(selectedParentCode.value)
  }
}

// 카테고리 그리드 이벤트 핸들러
const onParentGridReady = (params) => {
  console.log('Parent Grid ready')
  params.api.sizeColumnsToFit()
}

const onParentFirstDataRendered = (params) => {
  console.log('Parent First data rendered')
  params.api.sizeColumnsToFit()
}

// 값 그리드 이벤트 핸들러
const onChildGridReady = (params) => {
  console.log('Child Grid ready')
  params.api.sizeColumnsToFit()
}

const onChildFirstDataRendered = (params) => {
  console.log('Child First data rendered')
  params.api.sizeColumnsToFit()
}

// 새로운 모달 핸들러들
const handleModalSaved = () => {
  searchParentData() // 카테고리 데이터 새로고침
  if (selectedParentCode.value) {
    searchChildData(selectedParentCode.value) // 값 데이터 새로고침
  }
}

// 비고 수정 모달 관련 함수들
const openDescriptionModal = (rowData) => {
  selectedDescriptionData.value = rowData
  descriptionInput.value = rowData.description || ''
  isDescriptionModalOpen.value = true
}

const closeDescriptionModal = () => {
  isDescriptionModalOpen.value = false
  selectedDescriptionData.value = null
  descriptionInput.value = ''
}

const handleDescriptionSave = async () => {
  if (!selectedDescriptionData.value) return
  
  const confirmed = await confirmSave('비고 수정', '비고를 저장하시겠습니까?')
  if (!confirmed) return
  
  try {
    const comCode = selectedDescriptionData.value.com_code
    const parentComCode = selectedDescriptionData.value.parent_com_code || ''
    
    const updateData = {
      ...selectedDescriptionData.value,
      description: descriptionInput.value
    }
    
    await updateComCode(parentComCode, comCode, updateData)
    showSuccess('수정 완료', '비고가 성공적으로 수정되었습니다.')
    
    // 데이터 새로고침
    searchParentData()
    if (selectedParentCode.value) {
      searchChildData(selectedParentCode.value)
    }
    
    closeDescriptionModal()
  } catch (error) {
    console.error('비고 수정 실패:', error)
    showError('비고 수정에 실패했습니다.')
  }
}

onMounted(() => {
  searchParentData()
})
</script>

<style scoped>
/* 카테고리 그리드 row hover 시 배경색 변경 (클릭 기능은 제거) */
:deep(.parent-grid .ag-row:hover) {
  background-color: #f3f4f6;
}
</style>


