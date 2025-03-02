import { ref } from 'vue';

export const authToken = ref(sessionStorage.getItem('token'));
export const config = {apiUrl: 'http://191.252.196.90:3000',};