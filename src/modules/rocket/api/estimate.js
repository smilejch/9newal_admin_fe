// src/modules/rocket/api/estimate.js
import instance, { loginInstance } from '@/api/axios';

// 사용자 정보 조회
export function refreshTokenTest() {
  return instance.get('/rocket/estimate/refreshTokenTest');
}
