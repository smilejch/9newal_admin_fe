// src/store/notification.js
import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    show: false,
    title: '',
    message: '',
    type: 'warning', // warning, error, success, info
    duration: 5000
  }),
  
  actions: {
    showNotification({ title, message, type = 'warning', duration = 5000 }) {
      this.title = title;
      this.message = message;
      this.type = type;
      this.duration = duration;
      this.show = true;
    },
    
    hideNotification() {
      this.show = false;
    },
    
    // 토큰 만료 알림을 위한 편의 메서드
    showTokenExpiredNotification() {
      this.showNotification({
        title: '세션이 만료되었습니다',
        message: '보안을 위해 다시 로그인해 주세요.',
        type: 'warning',
        duration: 6000 // 6초 후 자동으로 사라짐
      });
    }
  }
}); 