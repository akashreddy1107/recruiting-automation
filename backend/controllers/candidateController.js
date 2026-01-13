import Candidate from '../models/Candidate.js';

export const getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ date: -1 });
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCandidate = async (req, res) => {
    const { id } = req.params;
    try {
        const candidate = await Candidate.findOne({ id }); // assuming 'id' field, not _id
        if (candidate) {
            res.json(candidate);
        } else {
            res.status(404).json({ error: 'Candidate not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
