const express = require('express');
const User = require('../models/User');
const ProfilePicture = require('../models/ProfilePicture');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();
const JWT_SECRET = 'root';

router.post('/', express.json(), async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(200).json({ success: false, message: 'username and password are required.' });
    }

    try {
        // Find the user by username
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(200).json({ success: false, message: 'User not found.' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(200).json({ success: false, message: 'Invalid username or password.' });
        }

        // Generate a JWT
        const token = jwt.sign(
            {
                id: user.id,
                uuid: user.uuid,
                name: user.name,
                email: user.email,
                username: user.username,
                birthdate: user.birthdate,
            },
            JWT_SECRET, // Secret key
            { expiresIn: '48h' } // Token expiration
        );

        // Return the token
        return res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


module.exports = router;
