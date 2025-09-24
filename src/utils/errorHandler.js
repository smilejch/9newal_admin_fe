// src/utils/errorHandler.js
import { useErrorStore } from '@/store/error'

// 글로벌 에러 핸들러 초기화
export function initializeGlobalErrorHandling(app) {
  // Vue.js 글로벌 에러 핸들러
  app.config.errorHandler = (error, instance, info) => {
    console.error('[Vue Error Handler]', { error, instance, info })
    
    const errorStore = useErrorStore()
    errorStore.addError({
      ...error,
      context: 'Vue Component',
      info,
      componentName: instance?.$options.name || 'Unknown Component'
    })
  }

  // 처리되지 않은 Promise rejection 핸들러
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason)
    
    const errorStore = useErrorStore()
    errorStore.addError({
      message: event.reason?.message || '처리되지 않은 Promise 오류가 발생했습니다.',
      stack: event.reason?.stack,
      context: 'Unhandled Promise Rejection',
      originalError: event.reason
    })
    
    // 기본 동작 방지 (콘솔에 오류 로그가 찍히는 것을 방지)
    event.preventDefault()
  })

  // JavaScript 런타임 에러 핸들러
  window.addEventListener('error', (event) => {
    console.error('[JavaScript Error]', event.error)
    
    const errorStore = useErrorStore()
    errorStore.addError({
      message: event.message || 'JavaScript 런타임 오류가 발생했습니다.',
      stack: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      context: 'JavaScript Runtime',
      originalError: event.error
    })
  })
}

// 에러 래퍼 함수 - try-catch를 자동으로 처리
export function withErrorHandling(fn, context = 'Unknown') {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      const errorStore = useErrorStore()
      errorStore.addError({
        ...error,
        context,
        wrappedFunction: fn.name || 'Anonymous Function'
      })
      throw error // 에러를 다시 던져서 호출자가 처리할 수 있도록
    }
  }
}

// 특정 컴포넌트에서 사용할 수 있는 에러 처리 컴포저블
export function useErrorHandler(context = 'Component') {
  const errorStore = useErrorStore()
  
  const handleError = (error, additionalInfo = {}) => {
    errorStore.addError({
      ...error,
      context,
      ...additionalInfo
    })
  }
  
  const handleAsyncError = async (asyncFn, errorContext = {}) => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, errorContext)
      throw error
    }
  }
  
  return {
    handleError,
    handleAsyncError,
    errorStore
  }
}

// 특정 에러 타입별 처리 함수들
export const ErrorHandlers = {
  // API 에러 처리
  handleApiError(error, options = {}) {
    const errorStore = useErrorStore()
    
    // 이미 axios 인터셉터에서 처리된 401 에러는 무시
    if (error.response?.status === 401 && options.ignoreAuth) {
      console.log('401 에러 무시 - 인터셉터에서 처리됨')
      return
    }
    
    errorStore.addError({
      ...error,
      context: 'API Call',
      endpoint: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      ...options
    })
  },
  
  // 네트워크 에러 처리
  handleNetworkError(error, options = {}) {
    const errorStore = useErrorStore()
    errorStore.addError({
      ...error,
      context: 'Network',
      message: '네트워크 연결을 확인해주세요.',
      ...options
    })
  },
  
  // 폼 유효성 검사 에러 처리
  handleValidationError(errors, formName = 'Form') {
    const errorStore = useErrorStore()
    errorStore.addError({
      message: '입력값을 확인해주세요.',
      context: 'Form Validation',
      formName,
      validationErrors: errors
    })
  },
  
  // 파일 업로드 에러 처리
  handleFileUploadError(error, fileName = '') {
    const errorStore = useErrorStore()
    errorStore.addError({
      ...error,
      context: 'File Upload',
      fileName,
      message: error.message || `파일 업로드 중 오류가 발생했습니다. ${fileName ? `(${fileName})` : ''}`
    })
  },
  
  // 토큰 관련 에러 처리
  handleTokenError(error, options = {}) {
    const errorStore = useErrorStore()
    errorStore.addError({
      ...error,
      context: 'Authentication',
      message: error.message || '인증 오류가 발생했습니다.',
      ...options
    })
  }
}

// 에러 복구 전략
export const ErrorRecovery = {
  // 자동 재시도
  async withRetry(fn, maxRetries = 3, delay = 1000) {
    let lastError
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        
        if (attempt === maxRetries) {
          const errorStore = useErrorStore()
          errorStore.addError({
            ...error,
            context: 'Retry Failed',
            attempts: attempt,
            message: `${maxRetries}번 재시도 후에도 실패했습니다: ${error.message}`
          })
          break
        }
        
        // 지수 백오프로 대기
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
    
    throw lastError
  },
  
  // 폴백 실행
  async withFallback(primaryFn, fallbackFn, context = 'Fallback') {
    try {
      return await primaryFn()
    } catch (error) {
      console.warn(`[${context}] Primary function failed, using fallback`, error)
      
      try {
        return await fallbackFn()
      } catch (fallbackError) {
        const errorStore = useErrorStore()
        errorStore.addError({
          message: '기본 기능과 대체 기능 모두 실패했습니다.',
          context,
          primaryError: error,
          fallbackError: fallbackError
        })
        throw fallbackError
      }
    }
  }
}
