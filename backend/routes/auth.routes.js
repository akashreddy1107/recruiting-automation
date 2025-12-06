import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);
router.get('/me', authController.getMe);

export default router;
