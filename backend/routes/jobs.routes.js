import express from 'express';
import db from '../data/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
    try {
        await db.read();
        const jobs = db.data.jobs || [];
        // Sort by createdAt desc
        jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new job
router.post('/', async (req, res) => {
    try {
        await db.read();
        const newJob = {
            _id: uuidv4(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        db.data.jobs.push(newJob);
        await db.write();
        res.status(201).json(newJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a job
router.put('/:id', async (req, res) => {
    try {
        await db.read();
        const index = db.data.jobs.findIndex(j => j._id === req.params.id);
        if (index === -1) return res.status(404).json({ message: 'Job not found' });

        db.data.jobs[index] = { ...db.data.jobs[index], ...req.body };
        await db.write();
        res.json(db.data.jobs[index]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a job
router.delete('/:id', async (req, res) => {
    try {
        await db.read();
        const initialLength = db.data.jobs.length;
        db.data.jobs = db.data.jobs.filter(j => j._id !== req.params.id);

        if (db.data.jobs.length === initialLength) {
            return res.status(404).json({ message: 'Job not found' });
        }

        await db.write();
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get matches for a job
router.get('/:id/matches', async (req, res) => {
    try {
        await db.read();
        const job = db.data.jobs.find(j => j._id === req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const candidates = db.data.candidates || [];

        // Normalize requirements (assume they are strings)
        const requirements = (job.requirements || []).map(r => r.toLowerCase().trim());

        if (requirements.length === 0) {
            return res.json([]); // No requirements, no matches (or all matches? Let's say none for now)
        }

        const matches = candidates.map(candidate => {
            const candidateSkills = (candidate.skills || []).map(s => s.toLowerCase().trim());

            // Find intersection
            const matchedSkills = candidateSkills.filter(skill =>
                requirements.some(req => req.includes(skill) || skill.includes(req))
            );

            const score = Math.round((matchedSkills.length / requirements.length) * 100);

            return {
                ...candidate,
                matchScore: score,
                matchedSkills: matchedSkills,
                missingSkills: requirements.filter(req => !matchedSkills.some(s => req.includes(s) || s.includes(req)))
            };
        });

        // Filter for relevant matches (e.g., > 0 score) and Sort by score
        const topMatches = matches
            .filter(m => m.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);

        res.json(topMatches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
