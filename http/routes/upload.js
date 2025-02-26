const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const ProfilePicture = require('../models/ProfilePicture');

const uploadProfilePiture = multer({ dest: 'uploads/profilePictures' });

// Upload profile picture
router.post('/profilePicture', uploadProfilePiture.single('file'), async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID not provided or invalid.' });
    }

    const timestamp = Date.now();
    const fileExtension = path.extname(req.file.originalname);
    let newFileName = `${userId}_${timestamp}${fileExtension}`.replace(/[^\w\s.-]/g, '_'); // Sanitize filename

    const newFilePath = path.join(req.file.destination, newFileName);

    try {
        const dirPath = path.dirname(newFilePath);

        // Ensure the directory exists
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.renameSync(req.file.path, newFilePath);

        let profilePicture = await ProfilePicture.findOne({ where: { userId } });

        if (profilePicture) {
            const oldFilePath = path.join(req.file.destination, profilePicture.fileName);

            // Delete old profile picture if it exists
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }

            // Update existing record
            profilePicture.fileName = newFileName;
            profilePicture.fileExtension = fileExtension;
            profilePicture.filePath = `./profilePicture/${newFileName}`;

            await profilePicture.save();
        } else {
            // Create new record
            profilePicture = await ProfilePicture.create({
                userId,
                fileName: newFileName,
                fileExtension,
                filePath: `./profilePicture/${newFileName}`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded and saved successfully!',
            filePath: profilePicture.filePath,
            fileName: newFileName,
            fileExtension
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ success: false, message: 'Failed to upload profile picture.', error: error.message });
    }
});

// Get profile picture by user ID
router.get('/profilePicture/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID not provided or invalid.' });
    }

    try {
        const profilePicture = await ProfilePicture.findOne({ where: { userId } });

        if (!profilePicture) {
            return res.status(404).json({ success: false, message: 'Profile picture not found.' });
        }

        res.status(200).json({
            success: true,
            fileName: profilePicture.fileName,
            filePath: profilePicture.filePath
        });
    } catch (error) {
        console.error('Error retrieving profile picture:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve profile picture.', error: error.message });
    }
});

module.exports = router;
