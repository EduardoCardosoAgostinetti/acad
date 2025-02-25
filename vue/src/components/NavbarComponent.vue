<template>
  <div>
    <!-- Top Navigation Bar -->
    <nav class="navbar-top">
      <div class="logo">
        <router-link to="/" class="nav-link">
          <img src="../assets/white_logo.png" alt="">
        </router-link>
      </div>

      <div class="hamburger" @click="toggleMenu" v-if="isMobile">
        <i class="fas fa-bars"></i>
      </div>
      <div class="links-top" :class="{ 'active': isMenuOpen }">
        <!-- Links exibidos se não houver token -->
        <router-link v-if="!token" to="/signin" class="nav-link">
          <i class="fa-solid fa-right-to-bracket"></i> Sign In
        </router-link>
        <router-link v-if="!token" to="/signup" class="nav-link">
          <i class="fa-solid fa-user-plus"></i> Sign Up
        </router-link>

        <!-- Link de Logout se houver token -->
        <router-link v-if="token" to="/profile" class="nav-link">
          <i class="fa-solid fa-user"></i> Profile
        </router-link>

        <router-link v-if="token" @click.prevent="logout" to="" class="nav-link">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </router-link>

      </div>
    </nav>

    <!-- Bottom Navigation Bar -->
    <nav class="navbar-bottom">
      <router-link v-if="token" to="/exercises" class="nav-link">
        <i class="fa-solid fa-dumbbell"></i><span>Exercises</span>
      </router-link>
      <router-link v-if="token" to="/diet" class="nav-link">
        <i class="fa-solid fa-apple-whole"></i><span>Diet</span>
      </router-link>
      <router-link v-if="token" to="/progress" class="nav-link">
        <i class="fa-solid fa-signal"></i><span>Progress</span>
      </router-link>
      <router-link v-if="!token" to="/" class="nav-link">
        <i class="fas fa-home"></i> <span>Home</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
import { authToken } from '@/js/auth.js';

export default {
  name: "NavbarComponent",
  data() {
    return {
      isMenuOpen: false,
      isMobile: false,
    };
  },
  computed: {
    token() {
      return authToken.value;
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    updateLayout() {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.isMenuOpen = false;
      }
    },
    logout() {
      // Remove o token do sessionStorage e atualiza o authToken reativo
      sessionStorage.removeItem('token');
      authToken.value = null;
      // Redireciona para a página inicial
      this.$router.push('/signin');
    },
  },
  mounted() {
    this.updateLayout();
    window.addEventListener("resize", this.updateLayout);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateLayout);
  },
};
</script>

<style scoped>
/* Estilos da navbar */
.navbar-top {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  background-color: rgb(100, 58, 167);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  z-index: 50;
}

.logo {
  padding-left: 50px;
  font-size: 1.5rem;
  font-weight: bold;
}

.logo img {
  height: 45px;
  width: auto;
}

.hamburger {
  display: block;
  cursor: pointer;
  font-size: 1.5rem;
  padding-right: 20px;
}

.links-top {
  display: flex;
}

.nav-link {
  margin: 1rem;
  text-decoration: none;
  color: rgb(255, 255, 255);
  transition: color 0.3s;
}

.nav-link:hover {
  color: rgb(102, 102, 102);
}

.navbar-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgb(100, 58, 167);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem 0;
  z-index: 50;
}

.navbar-bottom .nav-link {
  flex: 1;
  text-align: center;
  text-decoration: none;
  color: rgb(255, 255, 255);
  transition: color 0.3s;
}

.navbar-bottom .nav-link span {
  margin-left: 0.5rem;
}

.navbar-bottom .nav-link:hover {
  color: rgb(102, 102, 102);
}

/* Media queries for responsiveness */

@media (max-width: 768px) {
  .navbar-top {
    padding: 0.8rem;
  }

  .logo {
    font-size: 1.2rem;
    padding-left: 30px;
  }

  .hamburger {
    color: rgb(255, 255, 255);
    display: block;
    font-size: 1.5rem;
    padding-right: 20px;
  }

  .nav-link {
    margin: 10px;
  }

  .links-top {
    display: none;
    flex-direction: column;
    width: 100%;
    background-color: rgb(100, 58, 167);
    position: absolute;
    top: 4rem;
    left: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 100;
    /* Certifique-se de que fique acima de outros conteúdos */
  }

  .links-top.active {
    display: flex;
    align-items: center;
  }

  .navbar-bottom .nav-link span {
    display: none;
  }

  .navbar-bottom .nav-link {
    font-size: 1.5rem;
  }
}

/* Estilos para a "caixinha" do menu abaixo do ícone de hambúrguer */
.links-top.active {
  display: flex;
  animation: slideDown 0.3s ease-out;
  /* Animação suave */
  background-color: rgb(100, 58, 167);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 4.7rem;
  left: 0;
  width: 100%;
  z-index: 100;
}

/* Animação de deslizamento do menu */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
