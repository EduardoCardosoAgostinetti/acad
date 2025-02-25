<template>
    <WarningsComponent v-if="message" :message="message" :type="messageType" :key="componentKey" />
    <main>
        <FormComponent :inputs="formInputs" :button-text="'Sign Up'" :button-class="'btn-primary'"
            :title-text="'Sign Up'" @submit="handleFormSubmit" v-model="formData" />
    </main>
</template>

<script>
import axios from 'axios';
import FormComponent from '@/components/FormComponent.vue';
import WarningsComponent from '@/components/WarningsComponent.vue'

export default {
    name: 'SignupView',
    components: {
        FormComponent,
        WarningsComponent,
    },
    data() {
        return {
            formInputs: [
                { type: 'text', name: 'name', label: 'Full Name', placeholder: 'Enter your full name', required: true },
                { type: 'email', name: 'email', label: 'Email', placeholder: 'Enter your email', required: true },
                { type: 'text', name: 'username', label: 'Username', placeholder: 'Enter your username', required: true },
                { type: 'password', name: 'password', label: 'Password', placeholder: 'Enter your password', required: true },
                { type: 'password', name: 'confirmPassword', label: 'Confirm Password', placeholder: 'Confirm your password', required: true },
                { type: 'date', name: 'birthdate', label: 'Date of Birth', required: true },
            ],
            formData: {},
            messageType: '',
            message: '',
            componentKey: Date.now(),
        };
    },
    methods: {
        async handleFormSubmit() {
            if (this.isSubmitting) return;

            this.isSubmitting = true;
            try {

                const response = await axios.post('http://localhost:3000/signup', this.formData);


                if (response.data.success) {
                    this.messageType = 'success';
                    this.message = response.data.message + ' Redirecting to Login in 5 seconds';

                    let countdown = 5; // Start countdown from 5
                    const interval = setInterval(() => {
                        countdown--;
                        this.message = response.data.message + ` Redirecting to Login in ${countdown} seconds`;

                        if (countdown === 0) {
                            clearInterval(interval);
                            this.$router.push({ name: 'signin' });
                        }
                    }, 1000); // Update every second
                } else {
                    this.messageType = 'error';
                    this.message = response.data.message;
                }
                this.componentKey = Date.now();
            } catch (error) {
                this.messageType = 'error';
                this.message = 'An error occurred. Please try again later.';
                this.componentKey = Date.now();
                console.error('Error during signup:', error);
            } finally {
                this.isSubmitting = false;
            }
        }
    }
}
</script>

<style scoped>
main {
    align-content: center;
    min-height: 90vh;
    padding-top: 3.8rem;
    padding-bottom: 3.8rem;
}
</style>
