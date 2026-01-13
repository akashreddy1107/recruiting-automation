import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
    id: { type: String, unique: true }, // Keeping 'id' for compatibility with existing uuid logic
    name: String,
    email: String,
    phone: String,
    skills: [String],
    experience: String,
    education: String,
    score: {
        total: Number,
        breakdown: [
            {
                label: String,
                score: Number,
                details: String
            }
        ]
    },
    status: { type: String, default: 'New' },
    resumeLink: String,
    linkedin: String, // In case we extract this
    summary: String,
    analysis: Object, // For rich AI analysis 
    runId: String, // To link to a specific automation run
    date: { type: Date, default: Date.now }
});

export default mongoose.model('Candidate', candidateSchema);
