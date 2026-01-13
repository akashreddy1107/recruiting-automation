import express from 'express';
import Job from '../models/Job.js';
import Candidate from '../models/Candidate.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new job
router.post('/', async (req, res) => {
    try {
        const newJob = await Job.create({
            ...req.body,
            createdAt: new Date()
        });
        res.status(201).json(newJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a job
router.put('/:id', async (req, res) => {
    try {
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedJob) return res.status(404).json({ message: 'Job not found' });
        res.json(updatedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a job
router.delete('/:id', async (req, res) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id);
        if (!deletedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get matches for a job
router.get('/:id/matches', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const candidates = await Candidate.find(); // Fetch all (optimize later with filtering if needed)

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
