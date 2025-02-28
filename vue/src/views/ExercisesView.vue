<template>
    <div class="exercises-view">
        <h1 class="title">Cadastrar Ficha de Exercícios</h1>

        <div class="form-group">
            <label for="muscleGroup">Grupo Muscular</label>
            <input type="text" v-model="muscleGroup" placeholder="Ex: Peito, Costas, Pernas" />
        </div>

        <div class="exercise-list">
            <h2>Exercícios</h2>
            <div v-for="(exercise, index) in exercises" :key="index" class="exercise-item">
                <input type="text" v-model="exercise.name" placeholder="Nome do exercício" />
                <input type="number" v-model.number="exercise.sets" placeholder="Número de séries" />

                <div class="series-inputs">
                    <span v-for="(serie, sIndex) in exercise.sets" :key="sIndex">
                        <input type="number" v-model="exercise.series[sIndex]" placeholder="Reps da série" />
                    </span>
                </div>

                <button @click="removeExercise(index)">Remover</button>
            </div>
            <button @click="addExercise">Adicionar Exercício</button>
        </div>

        <button class="submit-btn" @click="submitWorkout">Salvar Ficha</button>
    </div>
</template>


<script>
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

export default {
    data() {
        return {
            user: {},
            muscleGroup: '',
            exercises: [],
            workoutSheets: []
        };
    },
    methods: {
        addExercise() {
            this.exercises.push({ name: '', sets: '', series: [] });
        },
        removeExercise(index) {
            this.exercises.splice(index, 1);
        },
        async submitWorkout() {

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

            if (!this.muscleGroup.trim() || this.exercises.length === 0) {
                alert("Preencha todos os campos antes de salvar!");
                return;
            }

            // Transformar os valores de séries em números
            const formattedExercises = this.exercises.map(exercise => ({
                name: exercise.name,
                sets: parseInt(exercise.sets, 10),
                series: exercise.series.map(s => parseInt(s, 10))
            }));

            const workoutData = {
                muscleGroup: this.muscleGroup,
                exercises: formattedExercises,
                userId: this.user.id  // Incluindo o userId aqui
            };

            try {
                const response = await axios.post('http://localhost:3000/exercise/workout_sheet', workoutData);
                alert("Ficha salva com sucesso!");

                // Adiciona a ficha recém-criada na lista local
                this.workoutSheets.push(response.data);

                // Limpa os campos após o envio
                this.muscleGroup = '';
                this.exercises = [];
            } catch (error) {
                console.error("Erro ao salvar a ficha:", error);
                alert("Erro ao salvar a ficha, tente novamente.");
            }
        }

    }
};
</script>


<style scoped>
main {
    flex-direction: column;
    align-items: center;
    min-height: 90vh;
    padding: 6rem 0;
}

.exercises-view {
    JUSTIFY-ITEMS: CENTER;
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
}

.form-group {
    margin-bottom: 15px;
}

input {
    width: 100%;
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

.set-item {
    display: flex;
    gap: 10px;
    align-items: center;
}

button {
    background: rgb(100, 58, 167);
    color: white;
    border: none;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background: #0056b3;
}

.submit-btn {
    width: 100%;
    margin-top: 20px;
}

.workout-sheets {
    margin-top: 30px;
    background: #fff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.workout-sheets h2 {
    text-align: center;
}

.workout-sheets ul {
    list-style-type: none;
    padding: 0;
}

.workout-sheets li {
    background: #e9ecef;
    padding: 10px;
    margin: 5px 0;
    border-radius: 5px;
}
</style>