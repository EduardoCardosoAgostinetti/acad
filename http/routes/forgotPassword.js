const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');

const router = express.Router();

// Nodemailer configuration (using Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'duducom195@gmail.com',
    pass: 'qtxo mujt cvqa repp',
  },
});

// Route to request password reset
router.post('/', express.json(), async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(200).json({ success: false, message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({ success: false, message: 'User not found.' });
    }

    const resetCode = Math.floor(100000000 + Math.random() * 900000000).toString();
    const expiresAt = new Date(Date.now() + 25 * 60 * 1000);
    const existingReset = await PasswordReset.findOne({ where: { userId: user.id } });

    if (existingReset) {
      await existingReset.update({
        resetCode,
        expiresAt,
      });
    } else {
      await PasswordReset.create({
        userId: user.id,
        resetCode,
        expiresAt,
      });
    }

    // Send email with the reset code
    await transporter.sendMail({
      from: '"ACAD Support"',
      to: email,
      subject: 'Password Reset Code',
      html: `<p>Hello <strong>${user.name}</strong>,</p>
             <p>Your password reset code is:</p>
             <h2>${resetCode}</h2>
             <p>This code will expire in <strong>25 minutes</strong>.</p>
             <p>If you did not request this, please ignore this email.</p>`,
    });
    return res.status(200).json({
      success: true,
      message: 'Reset code sent to your email.',
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.post('/resetPassword', express.json(), async (req, res) => {
    const { email, resetCode, password, confirmPassword } = req.body;
  
    // Validação básica
    if (!email || !resetCode || !password || !confirmPassword) {
      return res.status(200).json({ success: false, message: 'All fields are required.' });
    }
  
    if (password !== confirmPassword) {
      return res.status(200).json({ success: false, message: 'Passwords do not match.' });
    }
  
    try {
      // Verificar se o usuário existe
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(200).json({ success: false, message: 'User not found.' });
      }
  
      // Verificar o código de redefinição
      const resetRequest = await PasswordReset.findOne({ where: { userId: user.id, resetCode } });
      if (!resetRequest) {
        return res.status(200).json({ success: false, message: 'Invalid reset code.' });
      }
  
      if (resetRequest.expiresAt < new Date()) {
        return res.status(200).json({ success: false, message: 'Reset code has expired.' });
      }
  
      // Criptografar nova senha
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();
  
      return res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
      console.error('Error resetting password:', error);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  });

module.exports = router;
