<template>
    <LoadingComponent :loading="isLoading" />
    <WarningsComponent v-if="message" :message="message" :type="messageType" :key="componentKey" />
    <main>
        <div class="exercises-view">
            <h1 class="title">{{ isEditing ? 'Edit Workout Sheet' : 'Create Workout Sheet' }}</h1>

            <div class="form-group">
                <label for="muscleGroup">Muscle Group</label>
                <input type="text" v-model="muscleGroup" placeholder="e.g., Chest, Back, Legs" />
            </div>

            <div class="exercise-list">
                <h2>Exercises</h2>
                <div v-for="(exercise, index) in exercises" :key="index" class="exercise-item">
                    <input type="text" v-model="exercise.name" placeholder="Exercise name" />
                    <input type="number" v-model.number="exercise.sets" placeholder="Number of sets" />

                    <div class="series-inputs">
                        <span v-for="(serie, sIndex) in exercise.sets" :key="sIndex">
                            <input type="number" v-model="exercise.series[sIndex]" placeholder="Reps per set" />
                        </span>
                    </div>

                    <button @click="removeExercise(index)">Remove</button>
                </div>
                <button @click="addExercise" class="add-btn">Add Exercise</button>
            </div>

            <textarea v-model="comment" placeholder="Comment (optional)"></textarea>

            <button class="submit-btn" @click="isEditing ? updateWorkout() : submitWorkout()">
                {{ isEditing ? "Update Workout" : "Save Workout" }}
            </button>

            <div class="workout-sheets">
                <h2>Saved Workouts</h2>
                <ul>
                    <li v-for="sheet in workoutSheets" :key="sheet.id">
                    <strong> {{ sheet.formattedDate }}</strong>
                    <br><br>
                    <strong>{{ sheet.muscleGroup }}</strong>
                        <ul>
                            <li v-for="exercise in sheet.formattedExercises" :key="exercise.name">
                                
                               
                                <strong>{{ exercise.name }}</strong> -
                                {{ exercise.sets }} sets of {{ exercise.reps }}
                                reps
                            </li>
                        </ul>
                        <p v-if="sheet.comment" class="workout-comment"><strong>Comment:</strong> {{ sheet.comment }}
                        </p>

                        <button class="edit-btn" @click="editWorkout(sheet)">Edit</button>
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
            user: {},
            muscleGroup: '',
            exercises: [],
            workoutSheets: [],
            comment: '',
            isEditing: false,
            editingId: null,
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
                    birthdate: payload.birthdate || null,
                    username: payload.username || null,
                };
            }
        },

        addExercise() {
            this.exercises.push({ name: '', sets: '', series: [] });
        },
        removeExercise(index) {
            this.exercises.splice(index, 1);
        },

        async submitWorkout() {

            if (!this.muscleGroup.trim() || this.exercises.length === 0) {
                alert("Please fill in all fields before saving!");
                return;
            }
            this.isLoading = true;
            const formattedExercises = this.exercises.map(exercise => ({
                name: exercise.name,
                sets: parseInt(exercise.sets, 10),
                series: exercise.series.map(s => parseInt(s, 10)),
            }));

            const workoutData = {
                muscleGroup: this.muscleGroup,
                exercises: formattedExercises,
                userId: this.user.id,
                comment: this.comment,
            };

            try {
                await axios.post(`${config.apiUrl}/exercise/workout_sheet`, workoutData);
                this.messageType = 'success';
                this.message = "Workout sheet saved!";
                this.fetchWorkoutSheet();
                this.clearForm();
            } catch (error) {
                this.messageType = 'error';
                this.message = "Error saving the workout!";
            } finally {
                this.isLoading = false;
            }
        },

        async updateWorkout() {
            this.isLoading = true;
            if (!this.muscleGroup.trim() || this.exercises.length === 0) {
                alert("Please fill in all fields before updating!");
                this.isLoading = false;
                return;
            }

            const formattedExercises = this.exercises.map(exercise => ({
                name: exercise.name,
                sets: parseInt(exercise.sets, 10),
                series: exercise.series.map(s => parseInt(s, 10)),
            }));

            const workoutData = {
                muscleGroup: this.muscleGroup,
                exercises: formattedExercises,
                comment: this.comment,
            };

            try {
                await axios.put(`${config.apiUrl}/exercise/workout_sheet/${this.editingId}`, workoutData);
                this.messageType = 'success';
                this.message = "Workout sheet updated!";
                this.fetchWorkoutSheet();
                this.clearForm();
            } catch (error) {
                this.messageType = 'error';
                this.message = "Error updating the workout!";
            } finally {
                this.isLoading = false;
            }
        },

        async fetchWorkoutSheet() {
            this.isLoading = true;
            try {
                const response = await axios.get(`${config.apiUrl}/exercise/workout_sheets/${this.user.id}`);
                const result = response.data;

                if (result.success) {
                    this.workoutSheets = result.workoutSheets.map(sheet => ({
                        ...sheet,
                        formattedDate: new Date(sheet.createdAt).toLocaleDateString("en-US", {
                            weekday: 'long', // Exibe o dia da semana
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }),
                        formattedExercises: sheet.exercises.split("; ").map(exercise => {
                            const [name, sets, reps] = exercise.split("|");
                            return {
                                name,
                                sets,
                                reps: reps.split("-").join(", "),
                            };
                        }),
                        comment: sheet.comment ?? ""
                    }));

                    // Ordena os workoutSheets por data (decrescente)
                    this.workoutSheets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                }
            } catch (error) {
                console.error('Error fetching workout sheets:', error);
            } finally {
                this.isLoading = false;
            }

        },


        editWorkout(sheet) {
            this.isEditing = true;
            this.editingId = sheet.id;
            this.muscleGroup = sheet.muscleGroup;
            this.comment = sheet.comment;
            this.exercises = sheet.formattedExercises.map(exercise => ({
                name: exercise.name,
                sets: parseInt(exercise.sets, 10),
                series: exercise.reps.split(", ").map(rep => parseInt(rep, 10)),
            }));
        },

        clearForm() {
            this.isEditing = false;
            this.editingId = null;
            this.muscleGroup = '';
            this.exercises = [];
            this.comment = '';
        }
    },

    created() {
        const token = sessionStorage.getItem("token");
        if (!token) {
            this.$router.push('/signin');
            return;
        }
        this.loadUserFromToken();
        this.fetchWorkoutSheet();
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

.exercises-view {
    display: flex;
    flex-direction: column;
    justify-content: center;
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
    text-align: center;
    display: contents;
    margin-bottom: 15px;
}

input,
textarea {
    padding: 8px;
    margin-top: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.exercise-list {
    margin-top: 20px;
}

.exercise-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
}

.series-inputs {
    text-align: center;
    display: inline-block;
    gap: 10px;
}

button {
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

.add-btn {
    width: 100%;
    margin-top: 15px;
    background-color: rgb(100, 58, 167);
}

.submit-btn {
    width: 100%;
    margin-top: 20px;
}

.workout-sheets {
    margin-top: 30px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.workout-sheets h2 {
    text-align: center;
}

.workout-sheets ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    max-height: 300px;
    /* Defina o valor máximo que você deseja */
    overflow-y: auto;
    /* Permite a rolagem vertical */
}


.workout-sheets li {
    background: #e9ecef;
    padding: 10px;
    margin: 15px;
    border-radius: 5px;
}

@media (max-width: 768px) {
    .exercises-view {
        max-width: 90%;
        padding: 15px;
    }

    .title {
        font-size: 1.6rem;
    }

    .form-group input,
    .exercise-item input,
    .add-btn,
    .submit-btn {
        font-size: 0.9rem;
    }

    .exercise-item {
        gap: 5px;
    }

    .series-inputs input {
        width: 30%;
    }
}

@media (max-width: 480px) {

    .form-group input,
    .exercise-item input,
    .add-btn,
    .submit-btn {
        font-size: 0.8rem;
    }

    .series-inputs input {
        width: 50%;
    }
}
</style>