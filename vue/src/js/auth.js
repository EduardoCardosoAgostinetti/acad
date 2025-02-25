import { ref } from 'vue';

export const authToken = ref(sessionStorage.getItem('token'));
