const express = require('express');
const DietEntry = require('../models/DietEntry');
const User = require('../models/User');
const router = express.Router();

// Create a new diet entry
router.post('/entry', async (req, res) => {
    try {
        const { mealType, foods, userId } = req.body;

        if (!mealType || !foods || !userId) {
            return res.status(400).json({ error: 'All required fields must be filled!' });
        }

        // Validate that the 'foods' field is an array and contains at least one item
        if (!Array.isArray(foods) || foods.length === 0) {
            return res.status(400).json({ error: 'The foods field must be an array with at least one item!' });
        }

        // Create the diet entry with a foods field (JSON)
        const newDietEntry = await DietEntry.create({
            mealType,
            foods: JSON.stringify(foods),  // Store as JSON
            userId
        });

        res.status(201).json(newDietEntry);
    } catch (error) {
        res.status(500).json({ error: 'Error saving the diet entry', details: error.message });
    }
});

// Get all diet entries for a user
router.get('/entries/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'The userId is required!' });
        }

        const dietEntries = await DietEntry.findAll({ where: { userId } });

        if (dietEntries.length === 0) {
            return res.status(404).json({ error: 'No diet entries found for this user!' });
        }

        // Process each diet entry, converting the foods field from JSON string to object
        const processedEntries = dietEntries.map(entry => {
            return {
                ...entry.toJSON(),
                foods: JSON.parse(entry.foods)  // Convert the foods field from JSON string to object
            };
        });

        res.status(200).json({ success: true, dietEntries: processedEntries });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching diet entries', details: error.message });
    }
});

// Update a diet entry
router.put('/entry/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mealType, foods } = req.body;

        if (!mealType || !foods) {
            return res.status(400).json({ error: 'All required fields must be filled!' });
        }

        if (!Array.isArray(foods) || foods.length === 0) {
            return res.status(400).json({ error: 'The foods field must be an array with at least one item!' });
        }

        const dietEntry = await DietEntry.findByPk(id);

        if (!dietEntry) {
            return res.status(404).json({ error: 'Diet entry not found!' });
        }

        dietEntry.mealType = mealType;
        dietEntry.foods = JSON.stringify(foods);  // Update the foods field with new JSON

        await dietEntry.save();

        res.status(200).json({ success: true, message: 'Diet entry updated successfully!', dietEntry });
    } catch (error) {
        res.status(500).json({ error: 'Error updating the diet entry', details: error.message });
    }
});

module.exports = router;
