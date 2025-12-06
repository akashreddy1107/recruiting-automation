import express from 'express';
import * as runController from '../controllers/runController.js';

const router = express.Router();

router.post('/', runController.startRun);
router.get('/', runController.getRuns);

export default router;
