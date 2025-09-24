<template>
  <div>
    <div
      @click="handleClick"
      class="relative flex items-center justify-between text-sm font-medium hover:bg-gray-700 px-2 py-2 rounded cursor-pointer transition"
      :class="[
        actualCollapsed ? 'justify-center' : '',
        isMobile ? 'py-3 px-3' : '',
        isActive ? (isRoot ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white') : 'text-white',
        !isRoot ? 'text-white hover:text-white' : ''
      ]"
      :aria-expanded="Boolean(open)"
      role="button"
    >
      <div
        class="flex items-center w-full"
        :class="[ actualCollapsed ? 'justify-center' : '' ]"
      >
        <!-- 루트: 아이콘 노출 -->
        <span
          v-if="isRoot"
          class="material-icons text-base mr-2 flex-shrink-0"
          style="font-size: 22px"
        >
          {{ item.icon || 'menu' }}
        </span>

        <!-- 하위: 들여쓰기 + 시각 표시(점/선) -->
        <template v-else>
          <div
            class="flex items-center flex-shrink-0 mr-2"
            :style="{ marginLeft: `${depth * 30}px` }"  
          >
            <!-- depth 1: 점 -->
            <div v-if="depth === 1" class="rounded-full bg-gray-200" style="width:6px;height:6px;"></div>

            <!-- depth 2: 짧은 선 + 작은 점 -->
            <div v-else-if="depth === 2" class="flex items-center">
              <div class="w-3 h-px bg-gray-300 mr-1"></div>
              <div class="rounded-full bg-gray-200" style="width:4px;height:4px;"></div>
            </div>

            <!-- depth 3+: 더 긴 선 + 더 작은 점 -->
            <div v-else class="flex items-center">
              <div class="w-4 h-px bg-gray-300 mr-1"></div>
              <div class="rounded-full bg-gray-200" style="width:3px;height:3px;"></div>
            </div>
          </div>
        </template>

        <!-- 텍스트 -->
        <span
          class="overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out"
          :class="actualCollapsed ? 'max-w-0 opacity-0' : 'opacity-100'"
          :style="{
            fontSize: isRoot ? '0.85rem' : (depth >= 2 ? '0.75rem' : '0.8125rem'),
            color: isActive ? '' : (isRoot ? '' : '#ffffff')
          }"
        >
          {{ item.menu_name }}
        </span>
      </div>

      <!-- 화살표: children 있을 때만 -->
      <span
        v-if="!actualCollapsed && item.children && item.children.length > 0"
        class="material-icons text-xs flex-shrink-0 ml-2 text-gray-400"
      >
        {{ open ? 'expand_less' : 'expand_more' }}
      </span>
    </div>

    <!-- 하위 펼침 -->
    <transition name="slide-fade">
      <div
        v-show="open && !actualCollapsed"
        v-if="item.children"
        class="overflow-hidden"
      >
        <MenuChildren
          v-for="(child, i) in item.children"
          :key="i"
          :item="child"
          :depth="depth + 1"
          :collapsed="collapsed"
          :is-hovered="isHovered"
          :is-mobile="isMobile"
          @close-sidebar="$emit('close-sidebar')"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MenuChildren from './MenuChildren.vue'
import { useUiStore } from '@/store/ui'

const props = defineProps({ 
  item: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  collapsed: { type: Boolean, default: false },
  isHovered: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false }
})
const emit = defineEmits(['close-sidebar'])
const router = useRouter()
const ui = useUiStore()

const isRoot = computed(() => props.depth === 0)

// 활성/오픈 상태
const isActive = computed(() => ui.activeMenuId === props.item.menu_no)
const open = computed({
  get: () => ui.isOpen(props.item.menu_no),
  set: (v) => {
    const has = ui.openMenuIds.includes(props.item.menu_no)
    if (v && !has) ui.toggleOpen(props.item.menu_no)
    if (!v && has) ui.toggleOpen(props.item.menu_no)
  }
})

// 실제 collapsed 계산
const actualCollapsed = computed(() => {
  if (props.isMobile) return false
  return props.collapsed && !props.isHovered
})

const handleClick = () => {
  if (props.item.children && props.item.children.length > 0) {
    ui.toggleOpen(props.item.menu_no)
  } else if (props.item.path) {
    const path = props.item.path.startsWith('/') ? props.item.path : `/${props.item.path}`
    ui.setActive(props.item.menu_no)
    router.push(path)
    if (props.isMobile) emit('close-sidebar')
  }
}
</script>

<style scoped>
/* 펼침 트랜지션 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all .2s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
