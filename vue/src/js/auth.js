import { ref } from 'vue';

export const authToken = ref(sessionStorage.getItem('token'));
export const config = {apiUrl: 'http://localhost:3000',};