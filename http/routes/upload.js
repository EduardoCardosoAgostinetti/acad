const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const ProfilePicture = require('../models/ProfilePicture');
const GalleryPicture = require('../models/GalleryPicture');

// Middleware para cada galeria
const uploadGallery = (folder) => multer({ storage: storage(folder) });
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


// Função para configurar o storage dinamicamente
const storage = (galleryFolder) => multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, `../uploads/gallery/${galleryFolder}`);
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const sanitizedFilename = `${req.body.userId}_${timestamp}${ext}`.replace(/[^\w\s.-]/g, '_');
        cb(null, sanitizedFilename);
    }
});

// Endpoint genérico para upload nas galerias
router.post('/gallery/:galleryId', async (req, res, next) => {
    const galleryId = req.params.galleryId;
    const validGalleries = ['1', '2', '3', '4', '5', '6', '7'];

    if (!validGalleries.includes(galleryId)) {
        return res.status(400).json({ success: false, message: 'Invalid gallery ID.' });
    }

    uploadGallery(galleryId).single('file')(req, res, async (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Upload failed.', error: err.message });

        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

        try {
            const userId = req.body.userId; // Agora pega do corpo da requisição

            if (!userId) {
                return res.status(401).json({ success: false, message: 'User not authenticated.' });
            }

            // Gerando novo nome baseado no userId e timestamp
            const timestamp = Date.now();
            const fileExtension = path.extname(req.file.originalname);
            const newFileName = `${userId}_${timestamp}${fileExtension}`.replace(/[^\w\s.-]/g, '_');
            const newFilePath = path.join(__dirname, `../uploads/gallery/${galleryId}`, newFileName);

            // Renomeia o arquivo para o novo padrão
            fs.renameSync(req.file.path, newFilePath);

            // Criando o registro no banco
            const newPicture = await GalleryPicture.create({
                userId,
                galleryId: validGalleries.indexOf(galleryId) + 1,
                fileName: newFileName,
                fileExtension,
                imageId: uuidv4(),
                filePath: `/uploads/gallery/${galleryId}/${newFileName}`,
            });

            res.status(200).json({
                success: true,
                message: `Image uploaded to ${galleryId} successfully!`,
                filePath: newPicture.filePath,
                fileName: newPicture.fileName,
                id: newPicture.id
            });
        } catch (dbError) {
            return res.status(500).json({ success: false, message: 'Database error.', error: dbError.message });
        }
    });
});

router.get('/gallery/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Buscar todas as imagens das galerias do usuário
        const images = await GalleryPicture.findAll({
            where: { userId },
            attributes: ['filePath', 'galleryId'], // Pegamos apenas os dados necessários
        });

        return res.json({ success: true, images });
    } catch (error) {
        console.error('Erro ao buscar imagens da galeria:', error);
        return res.status(500).json({ success: false, message: 'Erro ao buscar imagens' });
    }
});

module.exports = router;
