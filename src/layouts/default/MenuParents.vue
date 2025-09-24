<template>
  <div>
    <MenuChildren
      v-for="(item, index) in menus"
      :key="index"
      :item="item"
      :depth="0"
      :collapsed="collapsed"
      :is-hovered="isHovered"
      :is-mobile="isMobile"
      @close-sidebar="$emit('close-sidebar')"
    />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import MenuChildren from './MenuChildren.vue'

const props = defineProps({ 
  menus: Array, 
  collapsed: Boolean, 
  isHovered: Boolean,
  isMobile: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close-sidebar'])

// 전역 활성 메뉴 상태
const activeMenuId = ref(null)
provide('activeMenuId', activeMenuId)
</script>