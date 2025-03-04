const express = require('express');
const WorkoutSheet = require('../models/WorkoutSheet');
const User = require('../models/User');
const router = express.Router();

router.post('/workout_sheet', async (req, res) => {
    try {
        const { muscleGroup, exercises, userId, comment } = req.body;

        if (!muscleGroup || exercises.length === 0 || !userId) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
        }

        // Formatar os exercícios para salvar no banco
        const exercisesString = exercises.map(exercise =>
            `${exercise.name}|${exercise.sets}|${exercise.series.join('-')}`
        ).join('; ');

        const newWorkout = await WorkoutSheet.create({ muscleGroup, exercises: exercisesString, userId, comment });

        res.status(201).json(newWorkout);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar a ficha', details: error.message });
    }
});

router.get('/workout_sheets/:userId', async (req, res) => {
    try {
      const { userId } = req.params; // Obtendo o userId da URL
  
      // Verifica se o userId foi fornecido
      if (!userId) {
        return res.status(400).json({ success: false, error: 'O userId é obrigatório!' });
      }
  
      // Recuperar as fichas de treino relacionadas ao userId
      const workoutSheets = await WorkoutSheet.findAll({
        where: { userId },  // Filtra as fichas de treino pelo userId
      });
  
      if (workoutSheets.length === 0) {
        return res.status(404).json({ success: false, error: 'Nenhuma ficha de treino encontrada para este usuário!' });
      }
      res.status(200).json({ success: true, workoutSheets: workoutSheets });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao buscar as fichas de treino', details: error.message });
    }
  });
  
  router.put('/workout_sheet/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { muscleGroup, exercises, comment } = req.body;

        if (!muscleGroup || exercises.length === 0) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
        }

        // Formatar os exercícios para salvar no banco
        const exercisesString = exercises.map(exercise =>
            `${exercise.name}|${exercise.sets}|${exercise.series.join('-')}`
        ).join('; ');

        const workoutSheet = await WorkoutSheet.findByPk(id);

        if (!workoutSheet) {
            return res.status(404).json({ error: 'Ficha de treino não encontrada!' });
        }

        workoutSheet.muscleGroup = muscleGroup;
        workoutSheet.exercises = exercisesString;
        workoutSheet.comment = comment;

        await workoutSheet.save();

        res.status(200).json({ success: true, message: 'Ficha de treino atualizada com sucesso!', workoutSheet });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar a ficha de treino', details: error.message });
    }
});


module.exports = router;
