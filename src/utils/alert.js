import { showAlert, showConfirm } from '@/store/alert'

// 알림창 편의 함수들 - 각 타입별로 쉽게 사용할 수 있도록
export const showError = (title, message, details = []) => {
  showAlert('error', title, message, details)
}

export const showSuccess = (title, message, details = []) => {
  showAlert('success', title, message, details)
}

export const showWarning = (title, message, details = []) => {
  showAlert('warning', title, message, details)
}

export const showInfo = (title, message, details = []) => {
  showAlert('info', title, message, details)
}

// 확인창 편의 함수들
export const confirmAction = (title, message, actionText = '확인', cancelText = '취소', confirmType = 'default') => {
  return showConfirm(title, message, actionText, cancelText, confirmType)
}

// 특정 액션용 확인창들
export const confirmDelete = (itemName = '항목', confirmMessage = '삭제하시겠습니까?') => {
  return showConfirm(itemName, confirmMessage, '삭제', '취소', 'delete')
}

export const confirmSave = (itemName = '정보', confirmMessage = '저장하시겠습니까?', actionText = '저장', cancelText = '취소') => {
  return showConfirm(itemName, confirmMessage, actionText, cancelText, 'save')
}

export const confirmUpload = (fileName = '파일') => {
  return showConfirm(fileName, `업로드하시겠습니까?`, '업로드', '취소', 'upload')
}

// 기본 함수들도 export
export { showAlert, showConfirm }
