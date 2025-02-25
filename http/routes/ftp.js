const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const fs = require('fs');
const  ProfilePicture  = require('../models/ProfilePicture');
const  GalleryPicture  = require('../models/GalleryPicture');

const uploadProfilePicture = multer({ dest: 'uploads/profilePictures' });
const uploadGalleryPicture = multer({ dest: 'uploads/gallery' });

router.post('/profilePicture', uploadProfilePicture.single('file'), async (req, res) => {
    const userId = req.body.userId;

    if (!userId) {
        return res.status(400).json({ message: 'ID do usuário não fornecido ou inválido.' });
    }

    const timestamp = Date.now();
    const fileExtension = path.extname(req.file.originalname);
    let newFileName = `${userId}_${timestamp}${fileExtension}`;
    newFileName = newFileName.replace(/[^\w\s.-]/g, '_'); // Sanitizar o nome do arquivo

    const newFilePath = path.join(req.file.destination, newFileName);

    try {
        const dirPath = path.dirname(newFilePath);

        // Verifique se o diretório existe, se não, crie-o
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.renameSync(req.file.path, newFilePath);

        let profilePicture = await ProfilePicture.findOne({ where: { userId: userId } });

        if (profilePicture) {
            const oldFilePath = path.join(req.file.destination, profilePicture.fileName);

            // 🗑️ Excluir a foto antiga, se ela existir
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }

            // Atualizar o registro com a nova foto
            profilePicture.fileName = newFileName;
            profilePicture.fileExtension = fileExtension;
            profilePicture.filePath = './profilePicture/' + newFileName;

            await profilePicture.save();
        } else {
            // Criar novo registro
            profilePicture = await ProfilePicture.create({
                userId: userId,
                fileName: newFileName,
                fileExtension: fileExtension,
                filePath: './profilePicture/' + newFileName
            });

        }

        res.json({
            message: 'Arquivo enviado e foto de perfil salva com sucesso!',
            filePath: profilePicture.filePath,
            fileName: newFileName,
            fileExtension: fileExtension
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao enviar a imagem via FTP', error: error.message });
    } 
});

router.get('/profilePicture/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: 'ID do usuário não fornecido ou inválido.' });
    }

    try {
        const profilePicture = await ProfilePicture.findOne({ where: { userId: userId } });

        if (!profilePicture) {
            return res.status(404).json({ message: 'Foto de perfil não encontrada.' });
        }

        res.json({
            fileName: profilePicture.fileName,
            filePath: profilePicture.filePath
        });
    } catch (error) {
        console.error('Erro ao buscar a imagem de perfil:', error);
        res.status(500).json({ message: 'Erro ao buscar a imagem de perfil', error: error.message });
    }
});

router.post('/galleryPicture', uploadGalleryPicture.single('file'), async (req, res) => {
    const userId = req.body.userId;

    if (!userId) {
        return res.status(400).json({ message: 'ID do usuário não fornecido ou inválido.' });
    }

    const timestamp = Date.now();
    const fileExtension = path.extname(req.file.originalname);
    let newFileName = `${userId}_${timestamp}${fileExtension}`;
    newFileName = newFileName.replace(/[^\w\s.-]/g, '_');

    const newFilePath = path.join(req.file.destination, newFileName);

    try {
        const dirPath = path.dirname(newFilePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.renameSync(req.file.path, newFilePath);

        const galleryPicture = await GalleryPicture.create({
            userId: userId,
            fileName: newFileName,
            fileExtension: fileExtension,
            filePath: './galleryPicture/' + newFileName
        });

        res.json({
            message: 'Imagem da galeria enviada com sucesso!',
            filePath: galleryPicture.filePath,
            fileName: newFileName,
            fileExtension: fileExtension
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao enviar a imagem da galeria', error: error.message });
    }
});

router.get('/galleryPicture/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: 'ID do usuário não fornecido ou inválido.' });
    }

    try {
        const galleryPictures = await GalleryPicture.findAll({ where: { userId: userId } });

        if (!galleryPictures || galleryPictures.length === 0) {
            return res.status(404).json({ message: 'Nenhuma imagem da galeria encontrada.' });
        }

        res.json(galleryPictures);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar imagens da galeria', error: error.message });
    }
});

router.delete('/galleryPicture/:userId/:fileName', async (req, res) => {
    const { userId, fileName } = req.params;

    if (!userId || !fileName) {
        return res.status(400).json({ message: 'ID do usuário ou nome do arquivo não fornecido.' });
    }

    const filePath = path.join('uploads/gallery', fileName);

    try {
        // Remover o arquivo do sistema de arquivos
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            return res.status(404).json({ message: 'Arquivo não encontrado.' });
        }

        // Remover o registro do banco de dados
        const deleted = await GalleryPicture.destroy({
            where: { userId: userId, fileName: fileName }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Imagem da galeria não encontrada no banco de dados.' });
        }

        res.json({ message: 'Imagem removida com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover a imagem.', error: error.message });
    }
});


module.exports = router;
