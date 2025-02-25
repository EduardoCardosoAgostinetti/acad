<template>
  <div v-if="visible" :class="['warning-container', bgColor]" :key="componentKey">
    <div class="warning-content">
      <p class="warning-message">{{ message }}</p>
    </div>
    <button @click="visible = false" class="close-button">✖</button>
  </div>
</template>

<script>
export default {
  name: 'WarningsComponent',
  props: {
    type: {
      type: String,
      default: 'success',
      validator: (value) => ['success', 'error'].includes(value),
    },
    message: {
      type: String,
      required: true,
    },
    componentKey: {
      type: [String, Number],
      required: false, // Torna a key obrigatória
    },
  },
  data() {
    return {
      visible: true,
    };
  },
  computed: {
    bgColor() {
      return this.type === 'success' ? 'bg-success' : 'bg-error';
    },
  },
};
</script>

<style scoped>
.warning-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-success {
  color: #047857;
}

.icon-error {
  color: #b91c1c;
}

.bg-success {
  background-color: #d1fae5;
  color: #047857;
}

.bg-error {
  background-color: #fee2e2;
  color: #b91c1c;
}

.warning-message {
  font-size: 1rem;
  font-weight: 500;
}

.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #6b7280;
}

.close-button:hover {
  color: #374151;
}
</style>
