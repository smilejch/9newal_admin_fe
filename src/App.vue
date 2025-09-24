<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <router-view /> <!-- 여기서 라우터에 따라 컴포넌트가 바뀜 -->
    
    <!-- 전역 알림 컴포넌트 -->
    <Notification
      :show="notificationStore.show"
      :title="notificationStore.title"
      :message="notificationStore.message"
      :type="notificationStore.type"
      :duration="notificationStore.duration"
      @close="notificationStore.hideNotification"
    />
    
    <!-- 전역 로딩 컴포넌트 -->
    <GlobalLoading />
    
    <!-- 전역 에러 컴포넌트 -->
    <GlobalError />
    
    <!-- 전역 알림창 컴포넌트 -->
    <AlertModal />
  </div>
</template>

<script setup>
import { useNotificationStore } from '@/store/notification';
import Notification from '@/components/Notification.vue';
import GlobalLoading from '@/components/GlobalLoading.vue';
import GlobalError from '@/components/GlobalError.vue';
import AlertModal from '@/components/AlertModal.vue';

const notificationStore = useNotificationStore();
</script>

<style scoped>
/* 전역 스타일이 필요한 경우 여기에 */
</style>
