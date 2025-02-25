<template>
    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="form">
        <h2 class="form-title">{{ titleText }}</h2>
        
        <div v-for="(input, index) in inputs" :key="index" class="form-group">
          <div v-if="input.type === 'checkbox'" class="form-checkbox-group">
            <input 
              :name="input.name" 
              type="checkbox" 
              :id="input.name" 
              :checked="formData[input.name]" 
              @change="handleCheckboxChange(input.name, $event)" 
              class="form-checkbox" 
            />
            <label :for="input.name" class="form-checkbox-label">{{ input.label }}</label>
          </div>
  
          <div v-else-if="input.type === 'textarea'">
            <label :for="input.name" class="form-label">{{ input.label }}</label>
            <textarea 
              :name="input.name" 
              :id="input.name" 
              :placeholder="input.placeholder" 
              :required="input.required" 
              v-model="formData[input.name]" 
              class="form-control form-textarea"
            ></textarea>
          </div>
  
          <div v-else-if="input.type === 'select'">
            <label :for="input.name" class="form-label">{{ input.label }}</label>
            <select 
              :name="input.name" 
              :id="input.name" 
              v-model="formData[input.name]" 
              :required="input.required" 
              @change="handleInputChange(input.name, $event)" 
              class="form-control"
            >
              <option v-for="option in input.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
  
          <div v-else>
            <label :for="input.name" class="form-label">{{ input.label }}</label>
            <input 
              :type="input.type" 
              :name="input.name" 
              :id="input.name" 
              :placeholder="input.placeholder" 
              :required="input.required" 
              :value="formData[input.name]" 
              @input="handleInputChange(input.name, $event)" 
              class="form-control" 
            />
          </div>
        </div>
        
        <button type="submit" class="btn" :class="buttonClass">{{ buttonText }}</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: "FormComponent",
    props: {
      inputs: {
        type: Array,
        required: true,
        default: () => [],
      },
      buttonText: {
        type: String,
        default: "Enviar",
      },
      buttonClass: {
        type: String,
        default: "btn-primary",
      },
      titleText: {
        type: String,
        default: "Formulário",
      },
      modelValue: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
      return {
        formData: { ...this.modelValue },
      };
    },
    watch: {
      modelValue(newValue) {
        this.formData = { ...newValue };
      },
    },
    methods: {
      handleInputChange(name, event) {
        this.formData[name] = event.target.value;
        this.$emit("update:modelValue", this.formData);
      },
      handleCheckboxChange(name, event) {
        this.formData[name] = event.target.checked;
        this.$emit("update:modelValue", this.formData);
      },
      handleSubmit() {
        this.$emit("submit", this.formData);
      },
    },
  };
  </script>
  
  <style scoped>
  .form-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }
  
  .form {
    background-color: #9468c7;
    padding: 2rem 2.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
  }
  
  .form-title {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    color: #ffffff;
    font-weight: bold;
  }
  
  .form-label {
    text-align: left;
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #ffffff;
  }
  
  textarea.form-control {
    min-height: 120px;
    resize: vertical;
  }
  
  .form-checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .form-checkbox {
    width: 20px;
    height: 20px;
  }
  
  .form-checkbox-label {
    font-size: 14px;
    font-weight: 500;
    color: #ffffff;
  }
  
  .form-control {
    width: 90%;
    padding: 0.8rem;
    font-size: 1rem;
    border: 1px solid #ffffff;
    border-radius: 5px;
    margin-bottom: 1rem;
    transition: border-color 0.3s;
  }
  
  .form-control:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
  
  .btn {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    font-weight: bold;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
  }
  
  .btn-primary {
    background-color: #6c35aa;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }
  </style>
  