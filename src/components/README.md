# 컴포넌트 사용법

## 개요
이 폴더에는 프로젝트에서 사용하는 공통 컴포넌트들이 포함되어 있습니다.

## 액션 버튼 사용법

ag-Grid에서 액션 버튼을 사용하려면 직접 HTML로 구현하세요.

### 기본 사용 예시
```javascript
const colDefs = ref([
  // ... 다른 컬럼들
  
  // 액션 컬럼을 직접 HTML로 설정
  {
    field: "actions",
    headerName: "액션",
    width: 150,
    sortable: false,
    filter: false,
    cellRenderer: (params) => {
      return `
        <div class="action-buttons">
          <button 
            class="btn-view" 
            onclick="window.pageActions.viewItem(${params.data.id})"
            title="보기"
          >
            보기
          </button>
          <button 
            class="btn-edit" 
            onclick="window.pageActions.editItem(${params.data.id})"
            title="편집"
          >
            편집
          </button>
          <button 
            class="btn-delete" 
            onclick="window.pageActions.deleteItem(${params.data.id})"
            title="삭제"
          >
            삭제
          </button>
        </div>
      `;
    }
  }
])
```

### 글로벌 액션 함수 설정
```javascript
// 액션 버튼 클릭을 위한 글로벌 함수 설정
const setupGlobalActions = () => {
  window.pageActions = {
    viewItem,
    editItem,
    deleteItem
  }
}

// 컴포넌트 마운트 시 글로벌 액션 설정
onMounted(() => {
  setupGlobalActions()
})
```

### CSS 스타일
```css
/* 액션 버튼 스타일 */
:global(.action-buttons) {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
}

:global(.action-buttons button) {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

:global(.action-buttons .btn-view) {
  border-color: #3b82f6;
  color: #3b82f6;
}

:global(.action-buttons .btn-view:hover) {
  background: #3b82f6;
  color: white;
}

:global(.action-buttons .btn-edit) {
  border-color: #10b981;
  color: #10b981;
}

:global(.action-buttons .btn-edit:hover) {
  background: #10b981;
  color: white;
}

:global(.action-buttons .btn-delete) {
  border-color: #ef4444;
  color: #ef4444;
}

:global(.action-buttons .btn-delete:hover) {
  background: #ef4444;
  color: white;
}
```
