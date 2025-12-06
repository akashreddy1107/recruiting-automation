import db from '../data/db.js';

export const getAllCandidates = async (req, res) => {
    await db.read();
    res.json(db.data.candidates.sort((a, b) => new Date(b.date) - new Date(a.date)));
};

export const getCandidate = async (req, res) => {
    const { id } = req.params;
    await db.read();
    const candidate = db.data.candidates.find(c => c.id === id);
    if (candidate) {
        res.json(candidate);
    } else {
        res.status(404).json({ error: 'Candidate not found' });
    }
};
