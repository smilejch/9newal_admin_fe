// JWT 유틸리티 함수들
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * exp(초) 기준 만료 여부 확인
 * skewSec: 시계 오차/네트워크 지연 보정 (기본 60초)
 */
export function isTokenExpired(token, skewSec = 10) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true; // exp가 없으면 만료로 간주
  const now = Math.floor(Date.now() / 1000);
  console.log("payload.exp <= (now + skewSec) ---> ", payload.exp <= (now + skewSec))
  return payload.exp <= (now + skewSec);
}

/**
 * 토큰의 남은 시간을 초 단위로 반환
 */
export function getTokenTimeLeft(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return 0;
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
}

/**
 * 토큰이 곧 만료되는지 확인 (기본 5분 전)
 */
export function isTokenExpiringSoon(token, thresholdMinutes = 5) {
  const timeLeft = getTokenTimeLeft(token);
  return timeLeft <= (thresholdMinutes * 60);
}

/**
 * 토큰 유효성 검증
 */
export function validateToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token is required and must be a string' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Invalid token format' };
  }

  const payload = parseJwt(token);
  if (!payload) {
    return { valid: false, error: 'Failed to parse token payload' };
  }

  if (isTokenExpired(token)) {
    return { valid: false, error: 'Token has expired', payload };
  }

  return { valid: true, payload };
}

/**
 * 토큰에서 사용자 정보 추출
 */
export function getUserFromToken(token) {
  const payload = parseJwt(token);
  if (!payload) return null;

  return {
    id: payload.user_no || payload.sub || payload.id,
    user_no: payload.user_no,
    name: payload.user_name || payload.username || payload.name,
    username: payload.user_name || payload.username,
    email: payload.email,
    role: payload.role || 'admin',
    company_no: payload.company_no,
    company_name: payload.company_name,
    companies: payload.companies || [],
    coupang_vendor_id: payload.coupang_vendor_id,
    permissions: payload.permissions || [],
    exp: payload.exp,
    iat: payload.iat
  };
}
