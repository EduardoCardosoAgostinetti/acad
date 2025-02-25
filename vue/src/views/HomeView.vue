<template>
  <main>
    <div class="container">
      <div class="header-content">
        <header class="text-center">
          <h1>Bem-vindo ao ACAD</h1>
          <p>Acompanhe seus exercícios, dietas e progresso de forma fácil e intuitiva.</p>

        </header>
      </div>

      <div class="card-container">
        <div class="card">
          <img src="../assets/exercise.webp" alt="Imagem representando academia" />
          <h2>Exercícios</h2>
          <p>Crie e gerencie planos de treino personalizados.</p>
        </div>

        <div class="card">
          <h2>Dietas</h2>
          <p>Monitore e planeje suas refeições e nutrição.</p>
          <img src="../assets/Diet.png" alt="Imagem representando academia" />
        </div>

        <div class="card">
          <img src="../assets/progress.jpg" alt="Imagem representando academia" />
          <h2>Progresso</h2>
          <p>Acompanhe suas metas e evolução física.</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goTo(page) {
  router.push({ name: page });
}
</script>

<style scoped>
main {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 0;
}

.container {
  text-align-last: auto;
  max-width: 1200px;
  padding: 0 2rem;
}

.header-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2rem;
  align-items: center;
}

header {
  text-align: left;
  flex: 1 1 300px;
}

h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #9468c7;
}

h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #9468c7;
}

p {
  font-size: 1.125rem;
  font-weight: normal;
  color: #718096;
}

img {
  max-width: 30%;
  height: auto;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 1.5rem;
}

.card-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.card {
  text-align: center;
  padding: 1.5rem;
  background-color: white;
  border: 1px solid #edf2f7;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.card h2 {
  margin-bottom: 0.75rem;
}

.card p {
  color: #4a5568;
}

/* Responsividade */
@media (min-width: 768px) {
  .container {
    text-align-last: center;
    max-width: 1200px;
    padding: 0 2rem;
  }

  .header-content {
    flex-wrap: nowrap;
  }

  .card-container {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>
