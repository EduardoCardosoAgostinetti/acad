<template>
    <WarningsComponent v-if="message" :message="message" :type="messageType" :key="componentKey" />
    <main>
        <div class="form-container">
            <FormComponent :inputs="formInputs" :button-text="isSubmitting ? 'Sending...' : 'Send Code'"
                :button-class="'btn-primary'" :title-text="'Forgot Your Password?'" @submit="handleFormSubmit"
                v-model="formData" :disabled="isSubmitting" />

            <p class="back-to-login">
                Remembered your password? <router-link to="/signin">Click here</router-link>
            </p>

            <div v-if="isSubmitting" class="loading-container">
                <div class="spinner"></div>
                <p>Sending reset code, please wait...</p>
            </div>
        </div>
    </main>
</template>

<script>
import axios from 'axios';
import FormComponent from '@/components/FormComponent.vue';
import WarningsComponent from '@/components/WarningsComponent.vue';

export default {
    name: 'ForgotPasswordView',
    components: {
        FormComponent,
        WarningsComponent,
    },
    data() {
        return {
            formInputs: [
                {
                    type: 'email',
                    name: 'email',
                    label: 'Email',
                    placeholder: 'Enter your email',
                    required: true
                },
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
                const response = await axios.post('http://localhost:3000/forgotPassword', this.formData);
                if (response.data.success) {
                    this.messageType = 'success';
                    this.message = 'Code sent. Redirecting to password reset in 5 seconds';

                    let countdown = 5; // Start countdown from 5
                    const interval = setInterval(() => {
                        countdown--;
                        this.message = `Code sent. Redirecting to password reset in ${countdown} seconds`;

                        if (countdown === 0) {
                            clearInterval(interval);
                            this.$router.push({ name: 'resetPassword' });
                        }
                    }, 1000);
                } else {
                    this.messageType = 'error';
                    this.message = response.data.message;
                }
                this.componentKey = Date.now();
            } catch (error) {
                this.messageType = 'error';
                this.message = 'An error occurred. Please try again later.';
                console.error('Error while requesting code:', error);
            } finally {
                this.isSubmitting = false;
            }
        }
    }
};
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

.back-to-login {
    margin-top: 0.5rem;
}

/* Spinner styles */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1rem;
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border-left-color: #09f;
    animation: spin 1s linear infinite;
    margin-bottom: 0.5rem;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>