<template>
  <div class="not-found">
    <h1>404</h1>
    <p>요청하신 페이지를 찾을 수 없습니다.</p>
    <router-link to="/" class="home-link">홈으로 돌아가기</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
}
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background-color: #f5f5f5;
  color: #333;
}

.not-found h1 {
  font-size: 6rem;
  margin-bottom: 1rem;
}

.not-found p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.home-link {
  padding: 0.6rem 1.2rem;
  background-color: #42b983;
  color: #fff;
  border-radius: 4px;
  text-decoration: none;
}

.home-link:hover {
  background-color: #369870;
}
</style>
