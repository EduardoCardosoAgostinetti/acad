import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component:  () => import('../views/HomeView.vue'),
    },
    {
      path: '/signin',
      name: 'signin',
      component: () => import('../views/SigninView.vue'),
    },
    {
      path: '/forgotPassword',
      name: 'forgotPassword',
      component: () => import('../views/ForgotPasswordView.vue'),
    },
    {
      path: '/resetPassword',
      name: 'resetPassword',
      component: () => import('../views/ResetPasswordView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/exercises',
      name: 'exercises',
      component: () => import('../views/ExercisesView.vue'),
    },
    {
      path: '/diet',
      name: 'diet',
      component: () => import('../views/DietView.vue'),
    },
    {
      path: '/progress',
      name: 'progress',
      component: () => import('../views/ProgressView.vue'),
    },
  ],
})

export default router
