<template>
  <CommonModal
    :isOpen="isOpen"
    :title="modalTitle"
    :size="modalSize"
    :showSave="modalMode !== 'view'"
    :showDelete="modalMode === 'edit'"
    @close="handleClose"
    @save="handleSave"
    @delete="handleDelete"
  >
    <template #content>
      <div class="user-form">
        <div class="form-grid">
          <!-- 회사 선택 -->
          <div class="form-group-full-width">
            <label class="form-label">회사 선택 <span class="text-red-500">*</span></label>
            <select
              v-model="userData.company_no"
              class="form-input"
              :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
              :disabled="isFormReadonly"
            >
              <option value="">회사를 선택하세요</option>
              <option 
                v-for="company in companyOptions" 
                :key="company.company_no" 
                :value="company.company_no"
              >
                {{ company.company_name }}
              </option>
            </select>
          </div>

          <!-- 사용자 ID -->
          <div class="form-group">
            <label class="form-label">사용자 ID <span class="text-red-500">*</span></label>
            <input
              v-model="userData.user_id"
              type="text"
              class="form-input"
              :class="{ 'bg-gray-100 cursor-not-allowed': isFirstRegisterReadonly }"
              :readonly="isFirstRegisterReadonly"
              placeholder="사용자 ID를 입력하세요"
            />
          </div>

          <!-- 사용자명 -->
          <div class="form-group">
            <label class="form-label">사용자명 <span class="text-red-500">*</span></label>
            <input
              v-model="userData.user_name"
              type="text"
              class="form-input"
              :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
              :readonly="isFormReadonly"
              placeholder="사용자명을 입력하세요"
            />
          </div>

          <!-- 이메일 -->
          <div class="form-group">
            <label class="form-label">이메일 <span class="text-red-500">*</span></label>
            <input
              v-model="userData.user_email"
              type="email"
              class="form-input"
              :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
              :readonly="isFormReadonly"
              placeholder="이메일을 입력하세요"
            />
          </div>

          <!-- 연락처 -->
          <div class="form-group">
            <label class="form-label">연락처</label>
            <input
              v-model="userData.contact"
              type="text"
              class="form-input"
              :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
              :readonly="isFormReadonly"
              placeholder="연락처를 입력하세요 (예: 010-1234-5678)"
              @keyup="formatContact"
              maxlength="13"
            />
          </div>

          <!-- 사용자 타입 -->
          <div class="form-group">
            <label class="form-label">사용자 타입</label>
            <select
              v-model="userData.user_type_cd"
              class="form-input"
              :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
              :disabled="isFormReadonly"
            >
              <option value="">사용자 타입을 선택하세요</option>
              <option 
                v-for="option in userTypeOptions" 
                :key="option.com_code" 
                :value="option.com_code"
              >
                {{ option.code_name }}
              </option>
            </select>
          </div>

          <!-- 사용자 상태 -->
          <div class="form-group">
            <label class="form-label">사용자 상태</label>
            <select
              v-model="userData.user_status_cd"
              class="form-input"
              :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
              :disabled="isFormReadonly"
            >
              <option value="">사용자 상태를 선택하세요</option>
              <option 
                v-for="option in userStatusOptions" 
                :key="option.com_code" 
                :value="option.com_code"
              >
                {{ option.code_name }}
              </option>
            </select>
          </div>

          <!-- 비밀번호 (등록/수정 시에만 표시) -->
          <div v-if="modalMode !== 'view'" class="form-group">
            <label class="form-label">
              비밀번호 
              <span v-if="modalMode === 'register'" class="text-red-500">*</span>
              <span v-else class="text-gray-500">(변경 시에만 입력)</span>
            </label>
            <input
              v-model="userData.user_password"
              type="password"
              class="form-input"
              :placeholder="modalMode === 'register' ? '비밀번호를 입력하세요' : '변경할 비밀번호를 입력하세요'"
            />
          </div>

          <!-- 비밀번호 확인 (등록/수정 시에만 표시) -->
          <div v-if="modalMode !== 'view'" class="form-group">
            <label class="form-label">
              비밀번호 확인 
              <span v-if="modalMode === 'register'" class="text-red-500">*</span>
            </label>
            <input
              v-model="passwordConfirm"
              type="password"
              class="form-input"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>
        </div>
      </div>
    </template>
  </CommonModal>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import CommonModal from '@/components/CommonModal.vue'
import { createUser, updateUser, deleteUser, fetchUser } from '@/modules/setting/api/user'
import { showError, showSuccess, confirmDelete, confirmSave } from '@/utils/alert'
import { commonCodeList, fetchCompanyList } from '@/modules/common/api/common'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'register' // register, edit, view
  },
  userId: {
    type: [String, Number],
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'saved', 'deleted'])

const userTypeOptions = ref([])
const userStatusOptions = ref([])
const companyOptions = ref([])
const passwordConfirm = ref('')

// 상태
const loading = ref(false)
const modalMode = ref(props.mode)
const modalSize = ref('big')

const fetchAllOptions = async () => {
  try {
    const responseUserType = await commonCodeList('USER_TYPE_CD')
    const responseUserStatus = await commonCodeList('USER_STATUS_CD')
    const responseCompanies = await fetchCompanyList()
    
    userTypeOptions.value = responseUserType.data
    userStatusOptions.value = responseUserStatus.data
    companyOptions.value = responseCompanies.data || []
  } catch (error) {
    console.error('옵션 데이터 로드 실패:', error)
  }
}

onMounted(() => {
  fetchAllOptions()
})

// 사용자 데이터
const userData = reactive({
  user_no: '',
  user_id: '',
  user_name: '',
  user_email: '',
  user_password: '',
  contact: '',
  company_no: '',
  user_type_cd: '',
  user_status_cd: ''
})

const isFormReadonly = computed(() => modalMode.value === 'view')
const isFirstRegisterReadonly = computed(() => modalMode.value === 'edit' || modalMode.value === 'view')

const modalTitle = computed(() => {
  switch (modalMode.value) {
    case 'register':
      return '사용자 등록'
    case 'edit':
      return '사용자 수정'
    case 'view':
      return '사용자 정보'
    default:
      return '사용자'
  }
})

// 사용자 데이터 로드
const loadUserData = async () => {
  if (!props.userId || modalMode.value === 'register') {
    resetUserData()
    return
  }

  try {
    loading.value = true
    const response = await fetchUser(props.userId)
    const user = response.data
    
    // 사용자 데이터 설정
    Object.keys(userData).forEach(key => {
      if (user[key] !== undefined) {
        userData[key] = user[key]
      }
    })
  } catch (error) {
    console.error('사용자 데이터 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 사용자 데이터 초기화
const resetUserData = () => {
  Object.keys(userData).forEach(key => {
    userData[key] = ''
  })
  passwordConfirm.value = ''
}

// 연락처 자동 포맷팅
const formatContact = (event) => {
  let value = event.target.value.replace(/[^0-9]/g, '') // 숫자만 추출
  
  if (value.length >= 11) {
    // 11자리 이상이면 11자리까지만
    value = value.substring(0, 11)
  }
  
  if (value.length >= 7) {
    // 010-1234-5678 형식
    value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  } else if (value.length >= 3) {
    // 010-1234 형식
    value = value.replace(/(\d{3})(\d{4})/, '$1-$2')
  }
  
  userData.contact = value
}

// 유효성 검사
const validateUserData = () => {
  // 회사 선택 검증 (필수)
  if (!userData.company_no) {
    return { isValid: false, message: '회사를 선택해주세요.' }
  }
  
  // 사용자 ID 검증 (필수)
  if (!userData.user_id || userData.user_id.trim() === '') {
    return { isValid: false, message: '사용자 ID는 필수 입력 항목입니다.' }
  }
  
  // 사용자명 검증 (필수)
  if (!userData.user_name || userData.user_name.trim() === '') {
    return { isValid: false, message: '사용자명은 필수 입력 항목입니다.' }
  }
  
  // 이메일 검증 (필수)
  if (!userData.user_email || userData.user_email.trim() === '') {
    return { isValid: false, message: '이메일은 필수 입력 항목입니다.' }
  }
  
  // 이메일 형식 검증
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(userData.user_email)) {
    return { isValid: false, message: '올바른 이메일 형식을 입력해주세요.' }
  }
  
  // 비밀번호 검증 (등록 시에만 필수)
  if (modalMode.value === 'register') {
    if (!userData.user_password || userData.user_password.trim() === '') {
      return { isValid: false, message: '비밀번호는 필수 입력 항목입니다.' }
    }
    
    if (userData.user_password.length < 8) {
      return { isValid: false, message: '비밀번호는 8자 이상이어야 합니다.' }
    }
    
    if (userData.user_password !== passwordConfirm.value) {
      return { isValid: false, message: '비밀번호가 일치하지 않습니다.' }
    }
  } else if (modalMode.value === 'edit' && userData.user_password) {
    // 수정 시 비밀번호를 입력한 경우에만 검증
    if (userData.user_password.length < 8) {
      return { isValid: false, message: '비밀번호는 8자 이상이어야 합니다.' }
    }
    
    if (userData.user_password !== passwordConfirm.value) {
      return { isValid: false, message: '비밀번호가 일치하지 않습니다.' }
    }
  }
  
  return { isValid: true, message: '' }
}

// 핸들러들
const handleClose = () => {
  // 모든 데이터 초기화
  resetUserData()
  emit('close')
}

const handleSave = async () => {
  const validation = validateUserData()
  if (!validation.isValid) {
    showError('입력 오류', validation.message)
    return
  }

  const confirmed = await confirmSave('사용자 저장', '사용자 정보를 저장하시겠습니까?')
  if (!confirmed) return

  try {
    loading.value = true
    
    // 저장할 데이터 준비
    const saveData = { ...userData }
    
    // 수정 시 비밀번호가 비어있으면 제거
    if (modalMode.value === 'edit' && !saveData.user_password) {
      delete saveData.user_password
    }

    if (modalMode.value === 'register') {
      await createUser(saveData)
      showSuccess('등록 완료', '사용자가 성공적으로 등록되었습니다.')
    } else if (modalMode.value === 'edit') {
      await updateUser(props.userId, saveData)
      showSuccess('수정 완료', '사용자가 성공적으로 수정되었습니다.')
    }
    
    emit('saved')
    handleClose()
  } catch (error) {
    console.error('사용자 저장 실패:', error)
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  const confirmed = await confirmDelete('사용자 삭제', '정말로 이 사용자를 삭제하시겠습니까?')
  if (!confirmed) return

  try {
    loading.value = true
    await deleteUser(props.userId)
    showSuccess('삭제 완료', '사용자가 성공적으로 삭제되었습니다.')
    emit('deleted')
    handleClose()
  } catch (error) {
    console.error('사용자 삭제 실패:', error)
  } finally {
    loading.value = false
  }
}

// 모달이 열릴 때마다 모드 업데이트 및 데이터 로드
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    modalMode.value = props.mode
    loadUserData()
  }
})

// 모드가 변경될 때마다 데이터 로드
watch(() => props.mode, (newVal) => {
  modalMode.value = newVal
  if (props.isOpen) {
    loadUserData()
  }
})
</script>
