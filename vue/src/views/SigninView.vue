<template>
  <WarningsComponent 
    v-if="message" 
    :message="message" 
    :type="messageType" 
    :key="componentKey" 
  />
  <main>
    <div class="form-container">
      <FormComponent 
        :inputs="formInputs" 
        :button-text="'Access'" 
        :button-class="'btn-primary'" 
        :title-text="'Sign In'" 
        @submit="handleFormSubmit" 
        v-model="formData" 
      />
      <p class="forgot-password">
        Forgot your password?
        <router-link to="/forgotPassword">Click here</router-link>
      </p>
    </div>
  </main>
</template>

<script>
import axios from 'axios';
import FormComponent from '@/components/FormComponent.vue';
import WarningsComponent from '@/components/WarningsComponent.vue';
import { authToken } from '@/js/auth.js';
import { config } from '@/js/auth.js';
export default {
  name: 'SigninView',
  components: {
    FormComponent,
    WarningsComponent,
  },
  data() {
    return {
      formInputs: [
        { type: 'text', name: 'username', label: 'Username', placeholder: 'Enter your username', required: true },
        { type: 'password', name: 'password', label: 'Password', placeholder: 'Enter your password', required: true },
      ],
      formData: {},
      messageType: '',
      message: '',
      componentKey: Date.now(),
      isSubmitting: false,
    };
  },
  methods: {
    async handleFormSubmit() {
      if (this.isSubmitting) return;

      this.isSubmitting = true;
      try {
        const response = await axios.post(`${config.apiUrl}/signin`, this.formData);

        if (response.data.success) {
          this.messageType = 'success';
          this.message = response.data.message;
          sessionStorage.setItem('token', response.data.token);
          authToken.value = response.data.token;

          this.$router.push({ name: 'profile' });
        } else {
          this.messageType = 'error';
          this.message = response.data.message;
        }
        this.componentKey = Date.now();
      } catch (error) {
        this.messageType = 'error';
        this.message = 'An error occurred. Please try again later.';
        this.componentKey = Date.now();
        console.error('Error during login:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
</script>

<style scoped>
main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  padding: 3.8rem 0;
}

.form-container {
  text-align: center;
}

.forgot-password {
  margin-top: 0.5rem;
}
</style>
