// src/store/error.js
import { defineStore } from 'pinia'

export const useErrorStore = defineStore('error', {
  state: () => ({
    errors: [], // 에러 목록
    showGlobalError: false,
    currentError: null,
  }),
  
  getters: {
    hasErrors: (state) => state.errors.length > 0,
    latestError: (state) => state.errors[state.errors.length - 1] || null,
  },
  
  actions: {
    // 에러 추가
    addError(error) {
      const errorItem = {
        id: Date.now() + Math.random(),
        message: this.getErrorMessage(error),
        type: this.getErrorType(error),
        code: error.code || error.status || 'UNKNOWN',
        timestamp: new Date().toISOString(),
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        details: error.response?.data || error.details || null,
      }
      
      this.errors.push(errorItem)
      
      // 자동으로 최신 에러를 현재 에러로 설정
      this.showError(errorItem)
      
      // 최대 50개까지만 보관 (메모리 관리)
      if (this.errors.length > 50) {
        this.errors.shift()
      }
      
      // 개발 환경에서는 콘솔에 로그
      if (import.meta.env.DEV) {
        console.error('[Global Error Handler]', errorItem)
      }
    },
    
    // 에러 표시
    showError(error) {
      this.currentError = error
      this.showGlobalError = true
    },
    
    // 에러 숨기기
    hideError() {
      this.showGlobalError = false
      this.currentError = null
    },
    
    // 특정 에러 제거
    removeError(errorId) {
      this.errors = this.errors.filter(error => error.id !== errorId)
      
      // 현재 표시 중인 에러가 제거된 경우
      if (this.currentError?.id === errorId) {
        this.hideError()
      }
    },
    
    // 모든 에러 제거
    clearErrors() {
      this.errors = []
      this.hideError()
    },
    
    // 에러 메시지 추출
    getErrorMessage(error) {
      if (typeof error === 'string') return error
      
      // API 에러 응답에서 메시지 추출
      if (error.response?.data?.message) return error.response.data.message
      if (error.response?.data?.error) return error.response.data.error
      if (error.response?.data?.detail) return error.response.data.detail
      
      // 일반적인 에러 메시지
      if (error.message) return error.message
      
      // HTTP 상태 코드 기반 메시지
      if (error.response?.status) {
        const status = error.response.status
        switch (status) {
          case 400: return '잘못된 요청입니다.'
          case 401: return '인증이 필요합니다.'
          case 403: return '접근 권한이 없습니다.'
          case 404: return '요청한 리소스를 찾을 수 없습니다.'
          case 408: return '요청 시간이 초과되었습니다.'
          case 409: return '리소스 충돌이 발생했습니다.'
          case 422: return '입력값을 확인해주세요.'
          case 429: return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
          case 500: return '서버 내부 오류가 발생했습니다.'
          case 502: return '서버에 연결할 수 없습니다.'
          case 503: return '서비스를 일시적으로 사용할 수 없습니다.'
          case 504: return '서버 응답 시간이 초과되었습니다.'
          default: return `HTTP 오류 (${status})`
        }
      }
      
      // 네트워크 에러
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        return '네트워크 연결을 확인해주세요.'
      }
      
      return '알 수 없는 오류가 발생했습니다.'
    },
    
    // 에러 타입 분류
    getErrorType(error) {
      if (error.response?.status) {
        const status = error.response.status
        if (status >= 400 && status < 500) return 'CLIENT_ERROR'
        if (status >= 500) return 'SERVER_ERROR'
      }
      
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        return 'NETWORK_ERROR'
      }
      
      if (error.name === 'TypeError' || error.name === 'ReferenceError') {
        return 'JAVASCRIPT_ERROR'
      }
      
      return 'UNKNOWN_ERROR'
    },
    
    // 에러 보고 (향후 로그 서버로 전송 등)
    reportError(error) {
      // TODO: 에러 로깅 서비스로 전송
      // 예: Sentry, LogRocket, 자체 로그 서버 등
      console.warn('[Error Report]', error)
    }
  }
}) 