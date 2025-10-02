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
          <label class="block text-xs font-medium text-gray-700 mb-1">SKU ID</label>
          <input
            v-model="filters.sku_id"
            type="text"
            placeholder="SKU ID 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">노출 ID</label>
          <input
            v-model="filters.exposure_id"
            type="text"
            placeholder="노출 ID 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">상품명</label>
          <input
            v-model="filters.sku_name"
            type="text"
            placeholder="상품명 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">바코드</label>
          <input
            v-model="filters.barcode"
            type="text"
            placeholder="바코드 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            @keyup.enter="searchDataByFilters"
          />
        </div>

      </template>

      <!-- 확장 필터 (펼치기/접기) -->
       <!--
      확장 필터 필요할 경우 주석 풀고 아래 코드 사용
      <template #expanded-filters>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">상품명</label>
          <input
            :value="filters.productName"
            type="text"
            placeholder="상품명 검색"
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        title="상품 목록"
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
            ref="skuGridRef"
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

    <!-- SKU 모달 -->
    <SkuModal
      :isOpen="isModalOpen"
      :skuId="selectedSkuId"
      :mode="modalMode"
      @close="closeModal"
      @saved="handleModalSaved"
      @deleted="handleModalDeleted"
    />

    <!-- 이미지 업로드 모달 -->
    <SkuImageModal
      :isOpen="isImageModalOpen"
      :skuNo="selectedSkuNoForImage"
      :skuId="selectedSkuIdForImage"
      @close="closeImageModal"
      @uploaded="handleImageUploaded"
    />

    <!-- 업로드 모달 -->
    <UploadModal
      :isOpen="isUploadModalOpen"
      title="SKU 엑셀 업로드"
      :uploadFunction="fetchSkuTemplateUpload"
      acceptedTypes=".xlsx,.xls"
      :maxFileSize="10 * 1024 * 1024"
      @close="closeUploadModal"
      @upload-success="handleUploadSuccess"
    />

    <!-- HS코드 모달 -->
    <HsCodeModal
      :isOpen="isHsCodeModalOpen"
      @close="closeHsCodeModal"
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
import SkuModal from '@/modules/setting/components/SkuModal.vue'
import SkuImageModal from '@/modules/setting/components/SkuImageModal.vue'
import HsCodeModal from '@/modules/setting/components/HsCodeModal.vue'
import UploadModal from '@/components/UploadModal.vue'
import { deleteSku, fetchSkuList, fetchSkuTemplateDownload, fetchSkuTemplateUpload } from '@/modules/setting/api/sku'
import { showError, showSuccess, showInfo, confirmDelete, showConfirm } from '@/utils/alert'
import { fetchLinkedOptions, saveLinkedOption, fetchCompanyList } from '@/modules/common/api/common'

// 반응형 데이터
const loading = ref(false)
const dataList = ref([])
const currentFormat = ref('normal')
const skuGridRef = ref(null)
const companyOptions = ref([])

// 페이지네이션 상태
const currentPage = ref(1)
const pageSize = ref(50)
const totalItems = ref(0)

// 모달 관련 상태
const isModalOpen = ref(false)
const selectedSkuId = ref(null)
const modalMode = ref('register') // 'view', 'edit', 'register'

// HS코드 모달 관련 상태
const isHsCodeModalOpen = ref(false)

// 업로드 모달 관련 상태
const isUploadModalOpen = ref(false)

// 이미지 모달 관련 상태
const isImageModalOpen = ref(false)
const selectedSkuNoForImage = ref(null)
const selectedSkuIdForImage = ref(null)

// 필터
const filters = reactive({
  company_no: [],
  sku_id: '',
  exposure_id: '',
  sku_name: '',
  barcode: ''
})

// 회사 다중 선택 관련
const selectedCompanies = ref([])
const isCompanyDropdownOpen = ref(false)
const companyDropdownRef = ref(null)

// URL 쿼리 파라미터 (페이지네이션 상태만)
const queryParams = computed(() => ({
  page: currentPage.value,
  size: pageSize.value
}))

// POST body에 전달할 필터 데이터 (자동으로 모든 filters 필드 포함)
const requestBody = computed(() => {
  const body = {}
  for (const key in filters) {
    body[key] = filters[key] || ''
  }
  return body
})

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
  wrapHeaderText: true
})

// 포맷 버튼 설정
const formatButtons = ref([
  { label: '등록', value: 'register', color: 'blue' }
])

// 포맷 변경
const changeFormat = (format) => {
  currentFormat.value = format
  openModal(null, 'register')
}

// 드롭다운 버튼 설정
const dropdownButtons = ref([
  {
    title: '다운로드',
    children: [
      { label: '엑셀 다운로드', value: 'excelDownload' },
    ]
  },
  {
    title: '업로드',
    children: [
      { label: '엑셀 업로드', value: 'excelUpload' },
    ]
  },
  {
    title: '참고자료',
    children: [
      { label: 'HS코드', value: 'hsCodeModal' },
    ]
  }
])

class LinkedOptionCellEditor {
  init(params) {
    this.params = params
    this.options = []
    this.filteredOptions = []
    this.isLoading = true
    this.createEditor()
    this.loadOptionsAndOpen()
  }
 
  createEditor() {
    // 컨테이너 생성
    this.eGui = document.createElement('div')
    this.eGui.style.position = 'relative'
    this.eGui.style.width = '100%'
    this.eGui.style.height = '100%'

    // 검색 input 생성
    this.searchInput = document.createElement('input')
    this.searchInput.type = 'text'
    this.searchInput.placeholder = '검색...'
    this.searchInput.style.width = '100%'
    this.searchInput.style.height = '100%'
    this.searchInput.style.border = 'none'
    this.searchInput.style.outline = 'none'
    this.searchInput.style.fontSize = '12px'
    this.searchInput.style.padding = '2px 20px 2px 4px'
    this.searchInput.style.backgroundColor = 'white'

    // 드롭다운 화살표 아이콘
    this.dropdownIcon = document.createElement('span')
    this.dropdownIcon.innerHTML = '▼'
    this.dropdownIcon.style.position = 'absolute'
    this.dropdownIcon.style.right = '4px'
    this.dropdownIcon.style.top = '50%'
    this.dropdownIcon.style.transform = 'translateY(-50%)'
    this.dropdownIcon.style.fontSize = '10px'
    this.dropdownIcon.style.color = '#666'
    this.dropdownIcon.style.cursor = 'pointer'
    this.dropdownIcon.style.userSelect = 'none'

    // 옵션 리스트 컨테이너
    this.optionsList = document.createElement('div')
    this.optionsList.style.position = 'fixed' // absolute에서 fixed로 변경
    this.optionsList.style.maxHeight = '200px'
    this.optionsList.style.overflowY = 'auto'
    this.optionsList.style.backgroundColor = 'white'
    this.optionsList.style.border = '1px solid #ccc'
    this.optionsList.style.borderRadius = '4px'
    this.optionsList.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
    this.optionsList.style.zIndex = '9999' // 더 높은 z-index
    this.optionsList.style.display = 'none'
    this.optionsList.style.fontSize = '12px'
    this.optionsList.style.minWidth = '150px'

    // 이벤트 리스너 추가
    this.addEventListeners()

    this.eGui.appendChild(this.searchInput)
    this.eGui.appendChild(this.dropdownIcon)
    // optionsList는 나중에 body에 동적으로 추가됨
  }

  addEventListeners() {
    // 검색 입력 이벤트
    this.searchInput.addEventListener('input', (e) => {
      this.filterOptions(e.target.value)
    })

    // 포커스/클릭 이벤트로 드롭다운 열기
    this.searchInput.addEventListener('focus', () => {
      this.showDropdown()
    })

    this.searchInput.addEventListener('click', (e) => {
      e.stopPropagation()
      this.showDropdown()
    })

    this.dropdownIcon.addEventListener('click', (e) => {
      e.stopPropagation()
      this.toggleDropdown()
    })

    // ESC/Enter 키 처리
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideDropdown()
        this.params.api.stopEditing()
      } else if (e.key === 'Enter') {
        this.selectFirstOption()
        this.params.api.stopEditing()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        this.focusNextOption()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        this.focusPreviousOption()
      }
    })

    // 외부 클릭으로 드롭다운 닫기
    this.documentClickHandler = (e) => {
      if (!this.eGui.contains(e.target) && !this.optionsList.contains(e.target)) {
        this.hideDropdown()
      }
    }
    document.addEventListener('click', this.documentClickHandler)
  }

  async loadOptionsAndOpen() {
    try {
      const link = this.params.data.link
      const offerIdMatch = link.match(/offer\/(\d+)\.html/)
      const offerId = offerIdMatch ? offerIdMatch[1] : null

      if (!offerId) {
        throw new Error('Invalid offer URL format')
      }

      const response = await fetchLinkedOptions(offerId)  
      this.options = response.data || response || []
      this.filteredOptions = [...this.options]
      
      // 현재 값 설정
      this.setCurrentValue()
      this.isLoading = false
      
      // 데이터 로딩 완료 후 바로 드롭다운 표시
      this.showDropdown()
      
    } catch (error) {
      console.error('옵션 로딩 실패:', error)
      this.options = []
      this.filteredOptions = []
      this.isLoading = false
    }
  }

  setCurrentValue() {
    const currentValue = this.params.value
    
    // 값이 없거나 null인 경우 수동 연동으로 설정
    if (!currentValue || currentValue === '' || currentValue === 'null' || currentValue === null) {
      this.searchInput.value = '수동 연동'
      this.selectedOption = { linked_option: null }
      return
    }
    
    if (typeof currentValue === 'string') {
      // JSON 형태인지 확인 ('{' 로 시작하는지 체크)
      if (currentValue.trim().startsWith('{')) {
        try {
          const currentOption = JSON.parse(currentValue)
          // 수동 연동인 경우 처리
          if (currentOption.linked_option === null || currentOption.linked_option === '' || currentOption.linked_option === undefined) {
            this.searchInput.value = '수동 연동'
            this.selectedOption = { linked_option: null }
          } else {
            this.searchInput.value = currentOption.linked_option || ''
            this.selectedOption = currentOption
          }
        } catch (e) {
          console.warn('JSON 파싱 실패, 레거시 데이터로 처리:', e)
          // JSON 파싱 실패 시 레거시 데이터로 처리
          this.handleLegacyValue(currentValue)
        }
      } else {
        // JSON이 아닌 레거시 데이터로 처리
        this.handleLegacyValue(currentValue)
      }
    }
  }

  handleLegacyValue(currentValue) {
    // 레거시 데이터를 그대로 표시
    this.searchInput.value = currentValue
    
    // 옵션이 로딩되면 매칭 시도, 없으면 레거시 값 그대로 유지
    const matchedOption = this.options.find(opt => 
      opt.linked_option === currentValue || 
      opt.linked_option.includes(currentValue) ||
      currentValue.includes(opt.linked_option)
    )
    
    if (matchedOption) {
      this.selectedOption = matchedOption
      this.searchInput.value = matchedOption.linked_option
    } else {
      // 매칭되는 옵션이 없으면 레거시 값을 새 형태로 저장
      this.selectedOption = { linked_option: currentValue }
    }
  }

  filterOptions(searchText) {
    const search = searchText.toLowerCase()
    this.filteredOptions = this.options.filter(option => 
      option.linked_option.toLowerCase().includes(search)
    )
    this.renderOptions()
  }

  renderOptions() {
    this.optionsList.innerHTML = ''
    
    if (this.isLoading) {
      const loading = document.createElement('div')
      loading.textContent = '로딩 중...'
      loading.style.padding = '8px'
      loading.style.color = '#666'
      loading.style.fontStyle = 'italic'
      this.optionsList.appendChild(loading)
      return
    }
    
    if (this.filteredOptions.length === 0) {
      const noResult = document.createElement('div')
      noResult.textContent = '검색 결과가 없습니다'
      noResult.style.padding = '8px'
      noResult.style.color = '#666'
      noResult.style.fontStyle = 'italic'
      this.optionsList.appendChild(noResult)
      return
    }

    // 옵션이 있을 때만 "수동 연동" 옵션을 제일 상단에 추가
    if (this.filteredOptions.length > 0) {
      const manualOption = document.createElement('div')
      manualOption.textContent = '수동 연동'
      manualOption.style.padding = '6px 8px'
      manualOption.style.cursor = 'pointer'
      manualOption.style.borderBottom = '1px solid #eee'
      manualOption.style.fontWeight = 'bold'
      manualOption.style.color = '#2563eb'
      manualOption.dataset.index = -1
      
      // 현재 선택된 옵션이 수동 연동인지 확인
      const isManualSelected = !this.selectedOption || 
                              this.selectedOption.linked_option === null || 
                              this.selectedOption.linked_option === '' ||
                              this.selectedOption.linked_option === undefined
      if (isManualSelected) {
        manualOption.style.backgroundColor = '#e3f2fd'
      }

      // 호버 효과
      manualOption.addEventListener('mouseenter', () => {
        manualOption.style.backgroundColor = '#f5f5f5'
      })

      manualOption.addEventListener('mouseleave', () => {
        const isManualSelected = !this.selectedOption || 
                                this.selectedOption.linked_option === null || 
                                this.selectedOption.linked_option === '' ||
                                this.selectedOption.linked_option === undefined
        if (!isManualSelected) {
          manualOption.style.backgroundColor = 'white'
        } else {
          manualOption.style.backgroundColor = '#e3f2fd'
        }
      })

      // 클릭 이벤트 - 수동 연동 선택
      manualOption.addEventListener('click', (e) => {
        e.stopPropagation()
        this.selectManualOption()
      })

      this.optionsList.appendChild(manualOption)
    }

    this.filteredOptions.forEach((option, index) => {
      const optionElement = document.createElement('div')
      optionElement.textContent = option.linked_option
      optionElement.style.padding = '6px 8px'
      optionElement.style.cursor = 'pointer'
      optionElement.style.borderBottom = index < this.filteredOptions.length - 1 ? '1px solid #eee' : 'none'
      optionElement.dataset.index = index
      
      // 현재 선택된 옵션 하이라이트
      if (this.selectedOption && this.selectedOption.linked_option === option.linked_option) {
        optionElement.style.backgroundColor = '#e3f2fd'
      }

      // 호버 효과
      optionElement.addEventListener('mouseenter', () => {
        optionElement.style.backgroundColor = '#f5f5f5'
      })

      optionElement.addEventListener('mouseleave', () => {
        if (!this.selectedOption || this.selectedOption.linked_option !== option.linked_option) {
          optionElement.style.backgroundColor = 'white'
        } else {
          optionElement.style.backgroundColor = '#e3f2fd'
        }
      })

      // 클릭 이벤트
      optionElement.addEventListener('click', (e) => {
        e.stopPropagation()
        this.selectOption(option)
      })

      this.optionsList.appendChild(optionElement)
    })
  }

  selectOption(option) {
    this.selectedOption = option
    this.searchInput.value = option.linked_option
    this.hideDropdown()
    this.params.api.stopEditing()
  }

  selectManualOption() {
    // 수동 연동 선택 시 null 값으로 설정
    this.selectedOption = { linked_option: null }
    this.searchInput.value = '수동 연동'
    this.hideDropdown()
    this.params.api.stopEditing()
  }

  selectFirstOption() {
    // 수동 연동 옵션이 있는 경우 수동 연동을 선택, 없으면 첫 번째 옵션 선택
    if (this.filteredOptions.length > 0) {
      this.selectManualOption()
    }
  }

  focusNextOption() {
    const options = this.optionsList.querySelectorAll('div[data-index]')
    if (options.length === 0) return

    const focusedIndex = this.getFocusedOptionIndex()
    const nextIndex = Math.min(focusedIndex + 1, options.length - 1)
    this.focusOption(nextIndex)
  }

  focusPreviousOption() {
    const options = this.optionsList.querySelectorAll('div[data-index]')
    if (options.length === 0) return

    const focusedIndex = this.getFocusedOptionIndex()
    const prevIndex = Math.max(focusedIndex - 1, 0)
    this.focusOption(prevIndex)
  }

  getFocusedOptionIndex() {
    const options = this.optionsList.querySelectorAll('div[data-index]')
    for (let i = 0; i < options.length; i++) {
      if (options[i].style.backgroundColor === 'rgb(245, 245, 245)') {
        return i
      }
    }
    return -1
  }

  focusOption(index) {
    const options = this.optionsList.querySelectorAll('div[data-index]')
    options.forEach(opt => {
      const optIndex = parseInt(opt.dataset.index)
      let isSelected = false
      
      if (optIndex === -1) {
        // 수동 연동 옵션인 경우
        isSelected = !this.selectedOption || 
                    this.selectedOption.linked_option === null || 
                    this.selectedOption.linked_option === '' ||
                    this.selectedOption.linked_option === undefined
      } else {
        // 일반 옵션인 경우
        isSelected = this.selectedOption && 
                    this.selectedOption.linked_option === this.filteredOptions[optIndex]?.linked_option
      }
      
      opt.style.backgroundColor = isSelected ? '#e3f2fd' : 'white'
    })
    
    if (options[index]) {
      options[index].style.backgroundColor = '#f5f5f5'
      options[index].scrollIntoView({ block: 'nearest' })
    }
  }

  showDropdown() {
    // 데이터가 아직 로딩 중이면 로딩 상태 표시
    if (this.isLoading) {
      const rect = this.searchInput.getBoundingClientRect()
      this.optionsList.style.left = rect.left + 'px'
      this.optionsList.style.width = rect.width + 'px'
      this.optionsList.style.top = rect.bottom + 'px'
      this.optionsList.style.display = 'block'
      document.body.appendChild(this.optionsList)
      this.renderOptions() // 로딩 메시지 표시
      return
    }
    
    if (this.filteredOptions.length === 0 && !this.isLoading) return
    
    // input 요소의 위치 계산
    const rect = this.searchInput.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    
    // 드롭다운이 화면 하단을 넘어가는지 확인 (수동 연동 옵션 포함)
    const totalOptionsCount = this.filteredOptions.length > 0 ? this.filteredOptions.length + 1 : this.filteredOptions.length
    const dropdownHeight = Math.min(totalOptionsCount * 30 + 10, 200)
    const spaceBelow = viewportHeight - rect.bottom
    const shouldShowAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight
    
    // 위치 설정
    this.optionsList.style.left = rect.left + 'px'
    this.optionsList.style.width = rect.width + 'px'
    
    if (shouldShowAbove) {
      this.optionsList.style.top = (rect.top - dropdownHeight) + 'px'
      this.optionsList.style.bottom = 'auto'
    } else {
      this.optionsList.style.top = rect.bottom + 'px'
      this.optionsList.style.bottom = 'auto'
    }
    
    this.optionsList.style.display = 'block'
    this.renderOptions()
    
    // body에 추가하여 z-index 문제 해결
    if (this.optionsList.parentNode !== document.body) {
      document.body.appendChild(this.optionsList)
    }
  }

  hideDropdown() {
    this.optionsList.style.display = 'none'
    // body에서 제거
    if (this.optionsList.parentNode === document.body) {
      document.body.removeChild(this.optionsList)
    }
  }

  toggleDropdown() {
    if (this.optionsList.style.display === 'none') {
      this.showDropdown()
    } else {
      this.hideDropdown()
    }
  }
 
  getGui() {
    return this.eGui
  }
 
  getValue() {
    if (this.selectedOption) {
      return JSON.stringify(this.selectedOption)
    }
    return this.searchInput.value
  }
 
  afterGuiAttached() {
    this.searchInput.focus()
    this.searchInput.select() // 전체 텍스트 선택
    
    // 즉시 드롭다운 표시 (로딩 중이라도)
    this.showDropdown()
  }
 
  isPopup() {
    return false
  }

  // 컴포넌트 정리
  destroy() {
    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler)
    }
    // optionsList가 body에 있다면 제거
    if (this.optionsList && this.optionsList.parentNode === document.body) {
      document.body.removeChild(this.optionsList)
    }
  }
}

const searchDataByFilters = () => {
  currentPage.value = 1
  searchData()
}

// SKU ag-Grid 컬럼 정의
const colDefs = ref([
  // 기본 정보
  {
    headerName: '기본 정보',
    headerClass: 'ag-header-group-cell-center',
    children:[
      { 
        field: "company_name", 
        headerName: "회사명", 
        minWidth: 80,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-left',
        pinned: 'left',
        suppressSizeToFit: true
      },
      { 
        field: "sku_id", 
        headerName: "SKU ID", 
        minWidth: 50,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        pinned: 'left',
        cellClass: 'text-center',
        suppressSizeToFit: true
      },
      { 
        field: "bundle", 
        headerName: "묶음", 
        width: 80,
        sortable: true,
        filter: false,
        pinned: 'left',
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-center'
      },
      { 
        field: "sku_name", 
        headerName: "상품명", 
        width: 150,
        minWidth: 100,
        sortable: true,
        filter: false,
        pinned: 'left',
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-left',
        suppressSizeToFit: true,
        cellRenderer: (params) => {
          if (params.value && params.value.trim() !== '' && params.data.link && params.data.link.trim() !== '') {
            return `<a href="${params.data.link}" target="_blank" class="text-blue-600 hover:underline">${params.value}</a>`
          }
          return params.value || ''
        }
      },
      { 
        field: "barcode", 
        headerName: "바코드", 
        width: 150,
        sortable: true,
        filter: false,
        pinned: 'left',
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-center'
      },
      { 
        field: "exposure_id", 
        headerName: "노출 ID", 
        minWidth: 80,
        sortable: true,
        filter: false,
        pinned: 'left',
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-center'
      },
      { 
        field: "delivery_status_name", 
        headerName: "납품여부", 
        width: 100,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        pinned: 'left',
        cellClass: 'text-center'
      }
    ]
  },
  
  // 구매 정보
  {
    headerName: '구매 정보',
    headerClass: 'ag-header-group-cell-center',
    children:[
      { 
        field: "cn_name", 
        headerName: "중문명", 
        width: 150,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-left'
      },
      { 
        field: "option_value", 
        headerName: "옵션명", 
        minWidth: 200,
        flex: 1,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-left'
      },
      { 
        field: "linked_option", 
        headerName: "연동옵션", 
        minWidth: 250,
        flex: 1,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center editable-header',
        cellClass: (params) => {
          // 링크가 없으면 편집 불가능한 스타일 적용
          return params.data.link ? 'editable-cell' : 'disabled-cell'
        },
        editable: (params) => {
          // 링크가 있을 때만 편집 가능
          return params.data.link && params.data.link.trim() !== ''
        },
        singleClickEdit: true,
        cellEditor: LinkedOptionCellEditor,
        cellRenderer: (params) => {
          // 링크 없음 체크 개선
          if (!params.data.link || params.data.link.trim() === '') {
            return '<span style="color: #9ca3af; font-style: italic;">1688 링크 입력 후 사용가능</span>'
          }

          if (params.value && typeof params.value === 'string') {
            // JSON 형태인지 확인
            if (params.value.trim().startsWith('{')) {
              try {
                const option = JSON.parse(params.value)
                // null이거나 빈 값인 경우 "수동 연동"으로 표시
                if (option.linked_option === null || option.linked_option === '' || option.linked_option === undefined) {
                  return '<span style="color: #2563eb; font-weight: bold;">수동 연동</span>'
                }
                return option.linked_option || ''
              } catch (e) {
                console.warn('연동옵션 JSON 파싱 실패, 레거시 데이터로 처리:', e)
                // JSON 파싱 실패 시 레거시 데이터로 표시
                return params.value
              }
            } else {
              // 레거시 데이터인 경우 그대로 표시
              return params.value
            }
          }
          
          // 값이 없거나 빈 값인 경우도 "수동 연동"으로 표시
          if (!params.value || params.value === '' || params.value === 'null') {
            return '<span style="color: #2563eb; font-weight: bold;">수동 연동</span>'
          }
          
          return params.value || ''
        },
        onCellValueChanged: async (params) => {
          // 빈 값 체크 개선 - 취소나 ESC로 인한 빈 값은 무시
          if (!params.newValue || params.newValue.trim() === '') {
            return
          }

          // 이미 처리 중인 경우 무시 (무한 루프 방지)
          if (params.node._isProcessingValueChange) {
            return
          }

          let selectedOption = null
          
          // JSON 형태인지 확인하여 파싱
          if (typeof params.newValue === 'string' && params.newValue.trim().startsWith('{')) {
            try {
              selectedOption = JSON.parse(params.newValue)
            } catch (error) {
              console.error('JSON 파싱 오류:', error)
              // JSON 파싱 실패 시 레거시 데이터로 처리
              selectedOption = { linked_option: params.newValue }
            }
          } else {
            // JSON이 아닌 레거시 데이터
            selectedOption = { linked_option: params.newValue }
          }

          // 이전 값 추출 (레거시 데이터 고려)
          let oldValue = ''
          if (params.oldValue && typeof params.oldValue === 'string') {
            if (params.oldValue.trim().startsWith('{')) {
              try {
                const oldOption = JSON.parse(params.oldValue)
                oldValue = oldOption?.linked_option || ''
              } catch (e) {
                oldValue = params.oldValue || ''
              }
            } else {
              oldValue = params.oldValue || ''
            }
          }
          
          const newValue = selectedOption?.linked_option || ''
          
          // 값이 실제로 변경되지 않았으면 처리하지 않음
          if (newValue === oldValue) {
            return
          }

          // 수동 연동 옵션인지 확인하여 알람 메시지 설정
          const isManualOption = selectedOption?.linked_option === null || selectedOption?.linked_option === ''
          const optionName = isManualOption ? '수동 연동 옵션' : newValue
          
          // 연동옵션 변경 확인 알람
          const confirmed = await showConfirm(
            '연동옵션 변경', 
            `${optionName}으로 변경하시겠습니까?`, 
            '변경', 
            '취소'
          )
          
          if (!confirmed) {
            // 사용자가 취소한 경우 이전 값으로 되돌리기
            // 처리 중 플래그 설정하여 재귀 호출 방지
            params.node._isProcessingValueChange = true
            try {
              params.node.setDataValue(params.colDef.field, params.oldValue)
            } finally {
              // 짧은 지연 후 플래그 해제
              setTimeout(() => {
                delete params.node._isProcessingValueChange
              }, 10)
            }
            return
          }

          try {
            await saveLinkedOption(params.data.sku_no, selectedOption)
            
            showSuccess('저장 완료', '연동옵션이 성공적으로 변경되었습니다.')
            
            const currentRowIndex = params.node.rowIndex
            await searchData()
            
            setTimeout(() => {
              if (params.api && typeof params.api.ensureIndexVisible === 'function') {
                params.api.ensureIndexVisible(currentRowIndex, 'middle')
              }
            }, 100)
            
          } catch (error) {
            console.error('저장 실패:', error)
            params.node.setDataValue(params.colDef.field, params.oldValue)
          }
        }
      },
      { 
        field: "multiple_value", 
        headerName: "판매 구성 수량", 
        width: 80,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        type: 'numericColumn'
      }
    ]
  },

  // 포장 정보
  {
    headerName: '포장 정보',
    headerClass: 'ag-header-group-cell-center',
    children:[
      { 
        field: "package_unit_quantity", 
        headerName: "포장 개수", 
        width: 150,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-left',
      },
      { 
        field: "package_vinyl_spec_name", 
        headerName: "포장비닐 규격", 
        width: 120,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-left'
      }
    ]
  },
  // 상품 세부 정보
  {
    headerName: '상품 세부 정보',
    headerClass: 'ag-header-group-cell-center',
    children:[
      { 
        field: "material", 
        headerName: "재질", 
        width: 100,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-left'
      },
      { 
        field: "length_mm", 
        headerName: "길이(mm)", 
        width: 100,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        type: 'numericColumn'
      },
      { 
        field: "width_mm", 
        headerName: "넓이(mm)", 
        width: 100,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        type: 'numericColumn'
      },
      { 
        field: "height_mm", 
        headerName: "높이(mm)", 
        width: 100,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        type: 'numericColumn'
      },
      { 
        field: "weight_g", 
        headerName: "중량(g)", 
        width: 100,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        type: 'numericColumn'
      }
    ]
  },

  // 가격 정보
  {
    headerName: '가격 정보',
    headerClass: 'ag-header-group-cell-center',
    children:[
      { 
        field: "sale_price", 
        headerName: "판매가격", 
        width: 120,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        type: 'numericColumn',
        valueFormatter: (params) => {
          return params.value ? `₩${params.value.toLocaleString()}` : '';
        }
      },
      { 
        field: "cost_yuan", 
        headerName: "원가-위안화", 
        width: 120,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        type: 'numericColumn',
        valueFormatter: (params) => {
          return params.value ? `¥${params.value.toLocaleString()}` : '';
        }
      },
      { 
        field: "cost_krw", 
        headerName: "원가-원화", 
        width: 120,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        type: 'numericColumn',
        valueFormatter: (params) => {
          return params.value ? `₩${params.value.toLocaleString()}` : '';
        }
      },
      { 
        field: "supply_price", 
        headerName: "공급가", 
        width: 120,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        type: 'numericColumn',
        valueFormatter: (params) => {
          return params.value ? `₩${params.value.toLocaleString()}` : '';
        }
      },
      { 
        field: "margin", 
        headerName: "마진", 
        width: 100,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-right',
        type: 'numericColumn',
        valueFormatter: (params) => {
          return params.value ? `${params.value}%` : '';
        }
      }
    ]
  },

  // 통관 정보
  {
    headerName: '통관 정보',
    headerClass: 'ag-header-group-cell-center',
    children:[
      { 
        field: "en_name", 
        headerName: "영문명", 
        width: 150,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-left'
      },
      { 
        field: "hs_code", 
        headerName: "HS코드번호", 
        width: 120,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-left'
      },
      { 
        field: "en_name_for_cn", 
        headerName: "영문명(중국용)", 
        width: 150,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-left'
      },
      { 
        field: "hs_code_cn", 
        headerName: "HS코드번호(중국용)", 
        width: 170,
        sortable: true,
        filter: true,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-left'
      },
      { 
        field: "fta_name", 
        headerName: "FTA", 
        width: 80,
        sortable: true,
        filter: false,
        headerClass: 'ag-header-cell-center',
        cellClass: 'text-left'
      }
    ]
  },
  
  // 액션 컬럼
  {
    field: "actions",
    headerName: "Actions",
    width: 100,
    sortable: false,
    filter: false,
    headerClass: 'ag-header-cell-center',
    cellClass: 'text-center',
    pinned: 'right',
    cellRenderer: (params) => {
      const container = document.createElement('div')
      container.className = 'action-buttons'
            
      // 편집 버튼
      const editBtn = document.createElement('button')
      editBtn.innerHTML = `
        <span class="material-icons" style="font-size: 16px">edit</span>
      `
      editBtn.addEventListener('click', () => editItem(params.data.sku_no))
      
      // 이미지 버튼
      const imageBtn = document.createElement('button')
      const hasImage = params.data.image_path
      const iconName = hasImage ? 'image' : 'no_photography'
      const buttonClass = hasImage ? 'has-image' : 'no-image'

      imageBtn.innerHTML = `
        <span class="material-icons" style="font-size: 16px">${iconName}</span>
      `
      imageBtn.className = buttonClass
      imageBtn.addEventListener('click', () => openImageModal(params.data.sku_no, params.data.sku_id))
      
      // 삭제 버튼
      const deleteBtn = document.createElement('button')
      deleteBtn.innerHTML = `
        <span class="material-icons" style="font-size: 16px">delete</span>
      `
      deleteBtn.addEventListener('click', () => deleteItem(params.data.sku_no))
      
      container.appendChild(editBtn)
      container.appendChild(imageBtn)
      container.appendChild(deleteBtn)
      
      return container
    }
  }
]);

// 데이터 조회
const searchData = async () => {
  loading.value = true
  
  try {
    // SKU 데이터 조회
    const skuListData = await fetchSkuListData()
    dataList.value = skuListData
    
  } catch (error) {
    console.error('SKU 데이터 조회 실패:', error)
    // 에러 시 안전하게 빈 배열로 초기화
    dataList.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

// ==================== SKU 데이터 조회 ====================
const fetchSkuListData = async () => {
  try {
    // POST 방식으로 API 호출 (쿼리 파라미터 + body)
    const skuResponse = await fetchSkuList(queryParams.value, requestBody.value)
    
    // 서버 응답에서 totalItems 설정
    totalItems.value = skuResponse.data.page_info.total_elements
    
    // 서버에서 받은 페이지네이션된 데이터 반환
    return skuResponse.data.content || []
  } catch (error) {
    console.error('API 호출 오류:', error)
    // 에러 시 totalItems 초기화
    totalItems.value = 0
    return []
  }
}

// 드롭다운 버튼 클릭 핸들러
const handleDropdownClick = (value) => {
  switch (value) {
    case 'excelDownload':
      fetchSkuTemplateDownload()
      break
    case 'excelUpload':
      openUploadModal()
      break
    case 'hsCodeModal':
      openHsCodeModal()
      break
    default:
      console.log('알 수 없는 액션:', value)
  }
}

// 필터 초기화
const resetFilters = () => {
  filters.company_no = []
  filters.sku_id = ''
  filters.exposure_id = ''
  filters.sku_name = ''
  filters.barcode = ''
  
  // 회사 다중 선택 상태도 초기화
  selectedCompanies.value = []
  isCompanyDropdownOpen.value = false
  
  currentPage.value = 1 // 페이지를 첫 페이지로 초기화
  pageSize.value = 50 // 페이지당 개수를 기본값으로 초기화
  searchData()
}

const editItem = (skuId) => {
  openModal(skuId, 'edit')
}

const deleteItem = async (skuId) => {
  const confirmed = await confirmDelete('SKU 삭제')
  if (confirmed) {
    try {
      await deleteSku(skuId)
      showSuccess('삭제 완료', 'SKU가 성공적으로 삭제되었습니다.')
      searchData() // 데이터 새로고침
    } catch (error) {
      console.error('삭제 실패:', error)
      showError('삭제 실패', '삭제 중 오류가 발생했습니다.')
    }
  }
}

// 모달 관련 함수들
const openModal = (skuId, type) => {
  console.log('skuId', skuId)
  console.log('type', type)
  selectedSkuId.value = skuId
  modalMode.value = type
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedSkuId.value = null
  modalMode.value = 'register'
}

// 새로운 모달 핸들러들
const handleModalSaved = () => {
  searchData() // 데이터 새로고침
}

const handleModalDeleted = () => {
  searchData() // 데이터 새로고침
}

// HS코드 모달 관련 함수들
const openHsCodeModal = () => {
  isHsCodeModalOpen.value = true    
}

const closeHsCodeModal = () => {
  isHsCodeModalOpen.value = false
}

// 업로드 모달 관련 함수들
const openUploadModal = () => {
  isUploadModalOpen.value = true
}

const closeUploadModal = () => {
  isUploadModalOpen.value = false
}

const handleUploadSuccess = () => {
  showSuccess('업로드 완료', 'SKU 데이터가 성공적으로 업로드되었습니다.')
  searchData() // 데이터 새로고침
}

// 이미지 모달 관련 함수들
const openImageModal = (skuNo, skuId) => {
  selectedSkuNoForImage.value = skuNo
  selectedSkuIdForImage.value = skuId
  isImageModalOpen.value = true
}

const closeImageModal = () => {
  isImageModalOpen.value = false
  selectedSkuNoForImage.value = null
  selectedSkuIdForImage.value = null
}

const handleImageUploaded = () => {
  showSuccess('이미지 업로드 완료', '이미지가 성공적으로 업로드되었습니다.')
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
}

const onFirstDataRendered = (params) => {
  console.log('First data rendered')
}

// 컴포넌트 마운트 시 데이터 조회
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
