import express from 'express';
import * as candidateController from '../controllers/candidateController.js';

const router = express.Router();

router.get('/', candidateController.getAllCandidates);
router.get('/:id', candidateController.getCandidate);

export default router;
