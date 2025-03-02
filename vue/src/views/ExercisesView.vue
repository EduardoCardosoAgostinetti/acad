<template>
    <main>
        <div class="exercises-view">
            <h1 class="title">Create Workout Sheet</h1>

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

            <button class="submit-btn" @click="submitWorkout">Save Workout</button>

            <div class="workout-sheets">
                <h2>Saved Workouts</h2>
                <ul>
                    <li v-for="sheet in workoutSheets" :key="sheet.id">
                        <strong>{{ sheet.muscleGroup }}</strong> - {{ sheet.formattedDate }}

                        <ul>
                            <li v-for="exercise in sheet.formattedExercises" :key="exercise.name">
                                <strong>{{ exercise.name }}</strong> - {{ exercise.sets }} sets of {{ exercise.reps }}
                                reps
                            </li>
                        </ul>
                        <p v-if="sheet.comment" class="workout-comment"><strong>Comment:</strong>{{ sheet.comment }}</p>
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
export default {
    data() {
        return {
            user: {},
            muscleGroup: '',
            exercises: [],
            workoutSheets: [],
            comment: '',
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

            // Format the exercises and include the comment
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
                const response = await axios.post(`${config.apiUrl}/exercise/workout_sheet`, workoutData);
                alert("Workout saved successfully!");
                this.fetchWorkoutSheet()
                // Clear fields after submission
                this.muscleGroup = '';
                this.exercises = [];
            } catch (error) {
                console.error("Error saving the workout:", error);
                alert("Error saving the workout, please try again.");
            }
        },

        async fetchWorkoutSheet() {
            try {
                const response = await axios.get(`${config.apiUrl}/exercise/workout_sheets/${this.user.id}`);
                const result = response.data;
                console.log(result);

                if (result.success) {
                    this.workoutSheets = result.workoutSheets
                        .map(sheet => ({
                            ...sheet,
                            formattedDate: new Date(sheet.createdAt).toLocaleDateString("en-US"),
                            formattedExercises: sheet.exercises.split("; ").map(exercise => {
                                const [name, sets, reps] = exercise.split("|");
                                return {
                                    name,
                                    sets,
                                    reps: reps.split("-").join(", "), // Format reps correctly
                                };
                            }),
                            comment: sheet.comment ?? "" // Ensure the comment is included
                        }))
                        .sort((a, b) => b.id - a.id); // Sort sheets by ID in descending order
                } else {
                    console.log("Error loading workout sheets:", result);
                }
            } catch (error) {
                console.error('Error fetching workout sheets:', error);
            }
        }

    },
    mounted() {

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
    max-height: 90vh;
    padding: 3.8rem 0;
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
    background-color: #28a745;
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
    max-height: 300px; /* Defina o valor máximo que você deseja */
    overflow-y: auto; /* Permite a rolagem vertical */
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