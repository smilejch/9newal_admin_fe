# API 설정 가이드

이 문서는 9NEWALL 관리자 시스템의 API 설정 방법을 안내합니다.

## 환경 변수 설정

`.env` 파일을 생성하고 다음과 같이 설정하세요:

```env
ADMIN_9NEWALL_BASE_URL=http://localhost:8000
```

## API 엔드포인트 명세

### 1. 로그인 API

```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "user_id": "admin@example.com",
  "user_password": "password123"
}

Success Response (200):
{
  "success": true,
  "data": {
    "access_token": "your_jwt_access_token",
    "refresh_token": "your_jwt_refresh_token",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@9newall.com",
      "name": "관리자",
      "role": "admin"
    },
    "companies": [
      {
        "id": 1,
        "name": "9NEWALL",
        "code": "9NW"
      }
    ],
    "menu": [
      {
        "menu_no": 1,
        "menu_name": "대시보드",
        "path": "/dashboard",
        "icon": "dashboard",
        "parent_no": null,
        "is_visible": true,
        "children": []
      }
    ]
  }
}

Error Response (401):
{
  "success": false,
  "message": "아이디 또는 비밀번호가 올바르지 않습니다."
}
```

### 2. 토큰 갱신 API

```
POST /api/auth/refresh
Content-Type: application/json

Request Body:
{
  "refresh_token": "your_refresh_token"
}

Success Response (200):
{
  "success": true,
  "data": {
    "access_token": "new_access_token",
    "refresh_token": "new_refresh_token",
    "expires_in": 3600
  }
}

Error Response (401):
{
  "success": false,
  "message": "유효하지 않은 refresh token입니다."
}
```

### 3. 사용자 정보 조회 API

```
GET /api/auth/me
Authorization: Bearer {access_token}

Success Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@9newall.com",
    "name": "관리자",
    "role": "admin",
    "company": {
      "id": 1,
      "name": "9NEWALL"
    }
  }
}
```

### 4. 로그아웃 API

```
POST /api/auth/logout
Authorization: Bearer {access_token}

Success Response (200):
{
  "success": true,
  "message": "로그아웃되었습니다."
}
```

### 5. 비밀번호 변경 API

```
POST /api/auth/change-password
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "current_password": "current_password",
  "new_password": "new_password",
  "new_password_confirm": "new_password"
}

Success Response (200):
{
  "success": true,
  "message": "비밀번호가 변경되었습니다."
}

Error Response (400):
{
  "success": false,
  "message": "현재 비밀번호가 올바르지 않습니다."
}
```

### 6. 토큰 검증 API (선택사항)

```
GET /api/auth/verify
Authorization: Bearer {access_token}

Success Response (200):
{
  "success": true,
  "data": {
    "valid": true,
    "expires_at": "2023-12-31T23:59:59Z"
  }
}
```

## Mock API 서버 설정

테스트용 Mock API 서버를 설정하려면 다음 단계를 따르세요:

### 1. Node.js 프로젝트 초기화

```bash
mkdir 9newall-mock-api
cd 9newall-mock-api
npm init -y
npm install express cors jsonwebtoken bcryptjs
```

### 2. Mock 서버 코드 (server.js)

```javascript
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

// 설정
const JWT_SECRET = 'your-secret-key';
const JWT_REFRESH_SECRET = 'your-refresh-secret-key';
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

app.use(cors({
  origin: 'http://localhost:5173', // Vite 개발 서버
  credentials: true
}));
app.use(express.json());

// Mock 데이터
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@9newall.com',
    name: '관리자',
    role: 'admin',
    password: bcrypt.hashSync('admin123', 10)
  }
];

const refreshTokens = new Set();

// JWT 토큰 생성
function generateTokens(user) {
  const payload = {
    user_no: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: ACCESS_TOKEN_EXPIRES_IN 
  });
  
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { 
    expiresIn: REFRESH_TOKEN_EXPIRES_IN 
  });

  refreshTokens.add(refreshToken);
  
  return { accessToken, refreshToken };
}

// 로그인 API
app.post('/api/auth/login', (req, res) => {
  const { user_id, user_password } = req.body;

  const user = users.find(u => u.email === user_id || u.username === user_id);
  
  if (!user || !bcrypt.compareSync(user_password, user.password)) {
    return res.status(401).json({
      success: false,
      message: '아이디 또는 비밀번호가 올바르지 않습니다.'
    });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  res.json({
    success: true,
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      },
      companies: [
        { id: 1, name: '9NEWALL', code: '9NW' }
      ],
      menu: [
        {
          menu_no: 1,
          menu_name: '대시보드',
          path: '/dashboard',
          icon: 'dashboard',
          parent_no: null,
          is_visible: true,
          children: []
        },
        {
          menu_no: 2,
          menu_name: '사용자 관리',
          path: '/users',
          icon: 'people',
          parent_no: null,
          is_visible: true,
          children: []
        },
        {
          menu_no: 3,
          menu_name: '설정',
          path: '/settings',
          icon: 'settings',
          parent_no: null,
          is_visible: true,
          children: []
        }
      ]
    }
  });
});

// 토큰 갱신 API
app.post('/api/auth/refresh', (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token || !refreshTokens.has(refresh_token)) {
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 refresh token입니다.'
    });
  }

  try {
    const decoded = jwt.verify(refresh_token, JWT_REFRESH_SECRET);
    const user = users.find(u => u.id === decoded.user_no);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // 기존 refresh token 제거
    refreshTokens.delete(refresh_token);
    
    // 새 토큰 생성
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: newRefreshToken,
        expires_in: 900 // 15분
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '토큰이 만료되었거나 유효하지 않습니다.'
    });
  }
});

// 사용자 정보 조회 API
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.user_no);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        company: {
          id: 1,
          name: '9NEWALL'
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }
});

// 로그아웃 API
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // 실제로는 토큰을 블랙리스트에 추가하거나 DB에서 제거
      console.log('로그아웃:', decoded.username);
    } catch (error) {
      // 이미 만료된 토큰일 수도 있음
    }
  }

  res.json({
    success: true,
    message: '로그아웃되었습니다.'
  });
});

// 비밀번호 변경 API
app.post('/api/auth/change-password', (req, res) => {
  const authHeader = req.headers.authorization;
  const { current_password, new_password, new_password_confirm } = req.body;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  if (new_password !== new_password_confirm) {
    return res.status(400).json({
      success: false,
      message: '새 비밀번호가 일치하지 않습니다.'
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userIndex = users.findIndex(u => u.id === decoded.user_no);
    
    if (userIndex === -1) {
      return res.status(401).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    const user = users[userIndex];

    if (!bcrypt.compareSync(current_password, user.password)) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다.'
      });
    }

    // 비밀번호 업데이트
    users[userIndex].password = bcrypt.hashSync(new_password, 10);

    res.json({
      success: true,
      message: '비밀번호가 변경되었습니다.'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Mock API 서버가 http://localhost:${PORT} 에서 실행중입니다.`);
  console.log('테스트 계정:');
  console.log('- ID: admin@9newall.com');
  console.log('- PW: admin123');
});
```

### 3. 서버 실행

```bash
node server.js
```

### 4. package.json 스크립트 추가

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## 기능 특징

### 🔐 강화된 인증 시스템
- **JWT 이중 토큰**: Access Token (15분) + Refresh Token (7일)
- **자동 토큰 갱신**: axios 인터셉터에서 자동 처리
- **중복 요청 방지**: 토큰 갱신 중 큐 시스템
- **토큰 유효성 검증**: 클라이언트 측 토큰 검증 유틸리티

### 🚨 포괄적 에러 핸들링
- **글로벌 에러 스토어**: 모든 에러 중앙 관리
- **다층 에러 캐칭**: Vue, Promise, JavaScript 런타임 에러
- **자동 복구 전략**: 재시도, 폴백 메커니즘
- **상세 에러 분류**: 네트워크, API, 인증, 검증 에러 구분

### 🛡️ 보안 기능
- **토큰 만료 임박 알림**: 5분 전 사용자 알림
- **자동 로그아웃**: 토큰 무효화 시 안전한 세션 정리
- **라우터 가드**: 페이지 접근 전 인증 상태 확인
- **민감 정보 보호**: localStorage 안전한 토큰 관리

이제 프론트엔드가 9newall-user 프로젝트 수준의 강력한 인증 및 에러 핸들링 시스템을 갖추었습니다!