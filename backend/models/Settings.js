import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'default' or userId
    theme: { type: String, default: 'dark' },
    jobDefaults: {
        skills: String,
        experience: Number,
        visa: String
    },
    scoring: {
        skillsWeight: Number,
        experienceWeight: Number,
        visaWeight: Number
    },
    email: {
        blocklist: String,
        keywords: String
    },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Settings', settingsSchema);
