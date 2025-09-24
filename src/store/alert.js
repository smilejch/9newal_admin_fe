import { ref } from 'vue'

// 전역 알림창 상태
const alertModal = ref({
  isOpen: false,
  type: 'error', // 'error', 'success', 'warning', 'info'
  title: '',
  message: '',
  details: [] // 문자열 배열 - 에러 상세 내역
})

// 전역 확인창 상태
const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  confirmText: '확인',
  cancelText: '취소',
  confirmType: 'default', // 'default', 'save', 'delete'
  resolve: null
})

// 알림창 표시 함수
export const showAlert = (type, title, message, details = []) => {
  alertModal.value = {
    isOpen: true,
    type,
    title,
    message,
    details
  }
}

// 확인창 표시 함수 (Promise 반환)
export const showConfirm = (title, message, confirmText = '확인', cancelText = '취소', confirmType = 'default') => {
  return new Promise((resolve) => {
    confirmModal.value = {
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      confirmType,
      resolve
    }
  })
}

// 알림창 닫기 함수
export const closeAlert = () => {
  alertModal.value.isOpen = false
}

// 확인창 닫기 함수
export const closeConfirm = (result) => {
  if (confirmModal.value.resolve) {
    confirmModal.value.resolve(result)
  }
  confirmModal.value.isOpen = false
  confirmModal.value.resolve = null
}

// 상태 export (컴포넌트에서 사용)
export { alertModal, confirmModal }
