const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Registration route
router.post('/', express.json(), async (req, res) => {
    const { name, email, username, password, confirmPassword, birthdate } = req.body;

    // Validate input
    if (!name || !email || !username || !password || !confirmPassword || !birthdate) {
        return res.status(200).json({ success: false, message: 'All fields are required.' });
    }

    if(password !== confirmPassword){
        return res.status(200).json({ success: false, message: 'Password`s do not match!' });
    }

    try {
        // Check if the username or email already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(200).json({ success: false, message: 'Username is already taken.' });
        }

        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(200).json({ success: false, message: 'Email is already registered.' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const newUser = await User.create({
            name,
            email,
            username,
            password: hashedPassword,
            birthdate,
        });

        // Respond with the created user's info (excluding password)
        return res.status(200).json({
            success: true,
            message: 'User registered successfully!',
            user: {
                uuid: newUser.uuid,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                birthdate: newUser.birthdate,
            },
        });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

module.exports = router;
