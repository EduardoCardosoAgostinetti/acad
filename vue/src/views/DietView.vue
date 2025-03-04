<template>
    <LoadingComponent :loading="isLoading" />
    <WarningsComponent v-if="message" :message="message" :type="messageType" :key="componentKey" />
    <main>
        <div class="diet-entries-view">
            <h1 class="title">{{ isEditing ? 'Edit Diet Entry' : 'Add Diet Entry' }}</h1>

            <div class="form-group">
                <label for="mealType">Meal Type</label>
                <select v-model="mealType">
                    <option value="" disabled>Select a meal</option>
                    <option v-for="type in mealTypes" :key="type" :value="type">{{ type }}</option>
                </select>
            </div>

            <div class="form-group" v-for="(food, index) in foodItems" :key="index">
                <label>Food Item {{ index + 1 }}</label>
                <input v-model="food.foodItem" placeholder="e.g., Chicken, Rice, Banana" />
                <input v-model="food.quantity" type="number" placeholder="Quantity" />
                <select v-model="food.unit">
                    <option value="" disabled>Select a unit</option>
                    <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                </select>
                <br>
                <button @click="removeFood(index)">Remove Food</button>
            </div>

            <button @click="addFood">Add Another Food Item</button>

            <div class="form-group">
                <label for="calories">Calories (optional)</label>
                <input type="number" v-model.number="calories" placeholder="Calories" />
            </div>

            <button class="submit-btn" @click="isEditing ? updateDietEntry() : submitDietEntry()">
                {{ isEditing ? "Update Entry" : "Save Entry" }}
            </button>

            <div class="diet-entries-list">
                <h2>Saved Entries</h2>
                <ul>
                    <li v-for="entry in dietEntries" :key="entry.id" class="diet-entry-item">
                        <strong>{{ entry.formattedDate }}</strong> <!-- Exibe a data formatada -->
                        <br>
                        <br>
                        <strong>{{ entry.mealType }}</strong> -
                        <span v-for="(food, index) in entry.foods" :key="index">
                            {{ food.foodItem }} ({{ food.quantity }} {{ food.unit }})<span
                                v-if="index < entry.foods.length - 1">, </span>
                        </span>
                        <span v-if="entry.calories"> {{ entry.calories }} kcal</span>
                        <br>
                        <br>
                        <button class="edit-btn" @click="editDietEntry(entry)">Edit</button>
                    </li>
                </ul>
            </div>

        </div>
    </main>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { config } from '@/js/auth.js';
import LoadingComponent from '@/components/LoadingComponent.vue';
import WarningsComponent from '@/components/WarningsComponent.vue';

export default {
    components: {
        LoadingComponent,
        WarningsComponent,
    },
    data() {
        return {
            isLoading: false,
            messageType: '',
            message: '',
            componentKey: Date.now(),
            isEditing: false,
            editingId: null,
            mealType: '',
            foodItems: [{ foodItem: '', quantity: '', unit: '' }],
            calories: '',
            dietEntries: [],
            mealTypes: ['Café da Manhã', 'Almoço', 'Jantar', 'Lanche', 'Pré-Treino', 'Pós-Treino'],
            units: ['g', 'kg', 'ml', 'l', 'unidade'],
            user: {},
        };
    },
    methods: {
        loadUserFromToken() {
            const token = sessionStorage.getItem("token");
            if (token) {
                const payload = jwtDecode(token);
                this.user = {
                    id: payload.id || "",
                    name: payload.name || "",
                    email: payload.email || "",
                };
            }
        },

        addFood() {
            this.foodItems.push({ foodItem: '', quantity: '', unit: '' });
        },

        removeFood(index) {
            this.foodItems.splice(index, 1);
        },

        async submitDietEntry() {
            this.isLoading = true; // Inicia o loading
            const calories = this.calories !== null ? this.calories : 0;
            const foodItems = this.foodItems.map(item => ({
                foodItem: item.foodItem.trim(),
                quantity: !isNaN(item.quantity) ? parseFloat(item.quantity) : 0,
                unit: item.unit ? item.unit.trim() : "",
            }));

            const dietEntryData = {
                mealType: this.mealType,
                foods: foodItems,
                calories: calories,
                userId: this.user.id,
            };

            try {
                await axios.post('http://localhost:3000/diet/entry', dietEntryData);
                this.fetchDietEntries(); // Atualiza a lista de entradas
                this.messageType = 'success';
                this.message = "Diet entry saved!";
                this.clearForm();
            } catch (error) {
                this.messageType = 'error';
                this.message = "Error saving diet entry!";
                console.error('Error saving diet entry:', error);
            } finally {
                this.isLoading = false; // Finaliza o loading
            }
        },

        async updateDietEntry() {
            this.isLoading = true; // Inicia o loading
            if (!this.mealType || this.foodItems.some(food => !food.foodItem.trim() || !food.quantity || !food.unit)) {
                this.messageType = 'error';
                this.message = "Please fill in all required fields!";
                this.isLoading = false;
                return;
            }

            const foodItems = this.foodItems.map(item => ({
                foodItem: item.foodItem.trim(),
                quantity: !isNaN(item.quantity) ? parseFloat(item.quantity) : 0,
                unit: item.unit ? item.unit.trim() : "",
            }));

            const calories = this.calories !== null ? this.calories : 0;

            const dietEntryData = {
                mealType: this.mealType,
                foods: foodItems,
                calories: calories,
                userId: this.user.id,
            };

            try {
                await axios.put(`http://localhost:3000/diet/entry/${this.editingId}`, dietEntryData);
                this.fetchDietEntries(); // Atualiza a lista de entradas
                this.messageType = 'success';
                this.message = "Diet entry updated!";
                this.clearForm();
            } catch (error) {
                this.messageType = 'error';
                this.message = "Error updating diet entry!";
                console.error('Error updating diet entry:', error);
            } finally {
                this.isLoading = false; // Finaliza o loading
            }
        },

        async fetchDietEntries() {
            this.isLoading = true; // Inicia o loading
            try {
                const response = await axios.get(`${config.apiUrl}/diet/entries/${this.user.id}`);
                console.log(response.data);
                this.dietEntries = response.data.dietEntries;

                // Ordena as entradas por data (decrescente)
                this.dietEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // Formata a data de cada entrada
                this.dietEntries = this.dietEntries.map(entry => ({
                    ...entry,
                    formattedDate: new Date(entry.createdAt).toLocaleDateString("en-US", {
                        weekday: 'long', // Exibe o dia da semana
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })
                }));

            } catch (error) {
                console.error('Error fetching diet entries:', error);
            } finally {
                this.isLoading = false; // Finaliza o loading
            }
        },



        editDietEntry(entry) {
            this.isEditing = true;
            this.editingId = entry.id;
            this.mealType = entry.mealType;
            this.foodItems = entry.foods.map(food => ({
                foodItem: food.foodItem,
                quantity: food.quantity,
                unit: food.unit,
            }));
            this.calories = entry.calories;
        },

        clearForm() {
            this.isEditing = false;
            this.editingId = null;
            this.mealType = '';
            this.foodItems = [{ foodItem: '', quantity: '', unit: '' }];
            this.calories = '';
        }
    },

    created() {
        const token = sessionStorage.getItem("token");
        if (!token) {
            this.$router.push('/signin');
            return;
        }
        this.loadUserFromToken();
        this.fetchDietEntries();
    },
};
</script>



<style scoped>
main {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 6rem 0;
}

.diet-entries-view {
    display: flex;
    flex-direction: column;
    max-width: 80%;
    margin: auto;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.title {
    text-align: center;
    margin-bottom: 20px;
    font-size: 1.8rem;
}

.form-group {
    margin-bottom: 15px;
    text-align: center;
}

label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
}

input{
    margin: 10px;
    width: 90%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;

}
select {
    width: 60%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    margin: 10px;
    background: rgb(100, 58, 167);
    color: white;
    border: none;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s ease;
}

button:hover {
    background: #0056b3;
}

.submit-btn {
    width: 100%;
    margin-top: 20px;
}

.diet-entries-list {
    margin-top: 30px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.diet-entries-list h2 {
    text-align: center;
}

.diet-entries-list ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    max-height: 300px;
    overflow-y: auto;
}

.diet-entry-item {
    background: #e9ecef;
    padding: 10px;
    margin: 15px;
    border-radius: 5px;
}

.diet-entry-item button {
    background: rgb(100, 58, 167);
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.diet-entry-item button:hover {
    background: #0056b3;
}

.diet-entry-item span {
    margin-right: 10px;
}

@media (max-width: 768px) {
    .diet-entries-list {
        max-width: 90%;
        padding: 15px;
    }

    .diet-entry-item {
        font-size: 0.9rem;
    }
}

@media (max-width: 480px) {
    .diet-entry-item {
        font-size: 0.8rem;
    }
}
</style>
