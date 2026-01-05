<template>
  <CommonModal
    :isOpen="isOpen"
    :title="modalTitle"
    :size="modalSize"
    :showSave="true"
    :showDelete="false"
    @close="handleClose"
    @save="handleSave"
  >
    <template #content>
      <div class="com-code-form">
        <div class="form-grid">
          <!-- 부모코드 (비활성화) -->
          <div class="form-group-full-width">
            <label class="form-label">부모코드</label>
            <input
              v-model="comCodeData.parent_com_code"
              type="text"
              class="form-input"
              disabled
              placeholder="부모코드"
            />
          </div>

          <!-- 코드 (수정 모드에서만 표시, 비활성화) -->
          <div v-if="modalMode === 'edit'" class="form-group-full-width">
            <label class="form-label">코드</label>
            <input
              v-model="comCodeData.com_code"
              type="text"
              class="form-input"
              disabled
              placeholder="코드"
            />
          </div>

          <!-- 코드명 -->
          <div class="form-group-full-width">
            <label class="form-label">코드명 <span class="text-red-500">*</span></label>
            <input
              v-model="comCodeData.code_name"
              type="text"
              class="form-input"
              placeholder="코드명을 입력하세요"
            />
          </div>

          <!-- 정렬순서 -->
          <div class="form-group">
            <label class="form-label">정렬순서</label>
            <input
              v-model.number="comCodeData.sort_order"
              type="number"
              class="form-input"
              placeholder="정렬순서를 입력하세요"
            />
          </div>

          <!-- 사용여부 -->
          <div class="form-group">
            <label class="form-label">사용여부</label>
            <select
              v-model="comCodeData.use_yn"
              class="form-input"
              :disabled="isParentCode"
            >
              <option :value="1">사용</option>
              <option :value="0">미사용</option>
            </select>
          </div>

          <!-- 키워드1 -->
          <div class="form-group">
            <label class="form-label">키워드1</label>
            <input
              v-model="comCodeData.keyword1"
              type="text"
              class="form-input"
              placeholder="키워드1을 입력하세요"
            />
          </div>

          <!-- 키워드2 -->
          <div class="form-group">
            <label class="form-label">키워드2</label>
            <input
              v-model="comCodeData.keyword2"
              type="text"
              class="form-input"
              placeholder="키워드2를 입력하세요"
            />
          </div>

          <!-- 키워드3 -->
          <div class="form-group">
            <label class="form-label">키워드3</label>
            <input
              v-model="comCodeData.keyword3"
              type="text"
              class="form-input"
              placeholder="키워드3을 입력하세요"
            />
          </div>

          <!-- 생성일자 (비활성화) -->
          <div class="form-group">
            <label class="form-label">생성일자</label>
            <input
              v-model="comCodeData.created_at"
              type="text"
              class="form-input"
              disabled
              placeholder="생성일자"
            />
          </div>

          <!-- 수정일자 (비활성화) -->
          <div class="form-group">
            <label class="form-label">수정일자</label>
            <input
              v-model="comCodeData.updated_at"
              type="text"
              class="form-input"
              disabled
              placeholder="수정일자"
            />
          </div>
        </div>
      </div>
    </template>
  </CommonModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import CommonModal from '@/components/CommonModal.vue'
import { updateComCode, fetchComCode } from '@/modules/setting/api/comCode'
import { showError, showSuccess, confirmSave } from '@/utils/alert'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'edit' // edit only
  },
  comCode: {
    type: [String, Number],
    default: null
  },
  parentComCode: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['close', 'saved'])

// 상태
const loading = ref(false)
const modalMode = ref(props.mode)
const modalSize = ref('big')

// 공통코드 데이터
const comCodeData = reactive({
  com_code: '',
  parent_com_code: '',
  code_name: '',
  sort_order: 0,
  keyword1: '',
  keyword2: '',
  keyword3: '',
  use_yn: 1,
  created_at: '',
  updated_at: ''
})

const modalTitle = computed(() => {
  return '공통코드 수정'
})

// 부모코드와 코드가 같은지 확인 (부모 코드 자체인 경우)
const isParentCode = computed(() => {
  return comCodeData.parent_com_code && 
         comCodeData.com_code && 
         comCodeData.parent_com_code === comCodeData.com_code
})

// 공통코드 데이터 로드
const loadComCodeData = async () => {
  if (!props.comCode || !props.parentComCode) {
    resetComCodeData()
    return
  }

  try {
    loading.value = true
    const response = await fetchComCode(props.parentComCode, props.comCode)
    const comCode = response.data
    
    // 공통코드 데이터 설정
    Object.keys(comCodeData).forEach(key => {
      if (comCode[key] !== undefined) {
        comCodeData[key] = comCode[key]
      }
    })
    
    // 날짜 포맷팅
    if (comCode.created_at) {
      const createdDate = new Date(comCode.created_at)
      comCodeData.created_at = createdDate.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\./g, '-').replace(/,/g, '')
    }
    
    if (comCode.updated_at) {
      const updatedDate = new Date(comCode.updated_at)
      comCodeData.updated_at = updatedDate.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\./g, '-').replace(/,/g, '')
    }
  } catch (error) {
    console.error('공통코드 데이터 로드 실패:', error)
    showError('데이터 로드 실패', '공통코드 정보를 불러오는 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

// 공통코드 데이터 초기화
const resetComCodeData = () => {
  Object.keys(comCodeData).forEach(key => {
    if (key === 'use_yn') {
      comCodeData[key] = 1
    } else if (key === 'sort_order') {
      comCodeData[key] = 0
    } else {
      comCodeData[key] = ''
    }
  })
}

// 유효성 검사
const validateComCodeData = () => {
  // 코드명 검증 (필수)
  if (!comCodeData.code_name || comCodeData.code_name.trim() === '') {
    return { isValid: false, message: '코드명은 필수 입력 항목입니다.' }
  }
  
  return { isValid: true, message: '' }
}

// 핸들러들
const handleClose = () => {
  // 모든 데이터 초기화
  resetComCodeData()
  emit('close')
}

const handleSave = async () => {
  const validation = validateComCodeData()
  if (!validation.isValid) {
    showError('입력 오류', validation.message)
    return
  }

  const confirmed = await confirmSave('공통코드 저장', '공통코드 정보를 저장하시겠습니까?')
  if (!confirmed) return

  try {
    loading.value = true
    
    // 저장할 데이터 준비 (수정 가능한 필드만)
    const saveData = {
      code_name: comCodeData.code_name,
      sort_order: comCodeData.sort_order || 0,
      keyword1: comCodeData.keyword1 || '',
      keyword2: comCodeData.keyword2 || '',
      keyword3: comCodeData.keyword3 || '',
      use_yn: comCodeData.use_yn
    }

    await updateComCode(props.parentComCode, props.comCode, saveData)
    showSuccess('수정 완료', '공통코드가 성공적으로 수정되었습니다.')
    
    emit('saved')
    handleClose()
  } catch (error) {
    console.error('공통코드 저장 실패:', error)
    showError('저장 실패', '공통코드 저장 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}


// 모달이 열릴 때마다 모드 업데이트 및 데이터 로드
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    modalMode.value = props.mode
    loadComCodeData()
  }
})

// 모드가 변경될 때마다 데이터 로드
watch(() => props.mode, (newVal) => {
  modalMode.value = newVal
  if (props.isOpen) {
    loadComCodeData()
  }
})
</script>

<style scoped>
.com-code-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group-full-width {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.form-input:disabled {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}
</style>

