const express = require('express');
const DietEntry = require('../models/DietEntry');
const User = require('../models/User');
const router = express.Router();

// Criar uma nova entrada de dieta
// Criar uma nova entrada de dieta
router.post('/entry', async (req, res) => {
    try {
        const { mealType, foods, userId } = req.body;

        if (!mealType || !foods || !userId) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos!' });
        }

        // Valida que o campo 'foods' é um array e contém pelo menos um item
        if (!Array.isArray(foods) || foods.length === 0) {
            return res.status(400).json({ error: 'O campo foods deve ser um array com pelo menos um item!' });
        }

        // Criar a entrada de dieta com um campo foods (JSON)
        const newDietEntry = await DietEntry.create({
            mealType,
            foods: JSON.stringify(foods),  // Armazenar como JSON
            userId
        });

        res.status(201).json(newDietEntry);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar a entrada de dieta', details: error.message });
    }
});


// Obter todas as entradas de dieta de um usuário
// Obter todas as entradas de dieta de um usuário
router.get('/entries/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'O userId é obrigatório!' });
        }

        const dietEntries = await DietEntry.findAll({ where: { userId } });

        if (dietEntries.length === 0) {
            return res.status(404).json({ error: 'Nenhuma entrada de dieta encontrada para este usuário!' });
        }

        // Processar cada entrada de dieta, convertendo o campo foods de JSON para objeto
        const processedEntries = dietEntries.map(entry => {
            return {
                ...entry.toJSON(),
                foods: JSON.parse(entry.foods)  // Converter o campo foods de string JSON para objeto
            };
        });

        res.status(200).json({ success: true, dietEntries: processedEntries });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar entradas de dieta', details: error.message });
    }
});


// Atualizar uma entrada de dieta
// Atualizar uma entrada de dieta
router.put('/entry/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mealType, foods } = req.body;

        if (!mealType || !foods) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos!' });
        }

        if (!Array.isArray(foods) || foods.length === 0) {
            return res.status(400).json({ error: 'O campo foods deve ser um array com pelo menos um item!' });
        }

        const dietEntry = await DietEntry.findByPk(id);

        if (!dietEntry) {
            return res.status(404).json({ error: 'Entrada de dieta não encontrada!' });
        }

        dietEntry.mealType = mealType;
        dietEntry.foods = JSON.stringify(foods);  // Atualizar o campo foods com novo JSON

        await dietEntry.save();

        res.status(200).json({ success: true, message: 'Entrada de dieta atualizada com sucesso!', dietEntry });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar a entrada de dieta', details: error.message });
    }
});


module.exports = router;
