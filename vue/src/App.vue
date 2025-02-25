<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <NavbarComponent />
  <RouterView />
</template>

<script>
import NavbarComponent from '@/components/NavbarComponent.vue';

export default {
  name: 'HomeView',
  components: {
    NavbarComponent,
  },
};
</script>

<style>
body {
  margin: 0;
}
</style>