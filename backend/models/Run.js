import mongoose from 'mongoose';

const runSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    date: { type: Date, default: Date.now },
    status: String,
    stats: {
        total: Number,
        processed: Number,
        qualified: Number
    },
    candidatesFound: Number,
    sheetUrl: String,
    query: String, // The search query used
    candidates: [String] // Array of Candidate IDs
});

export default mongoose.model('Run', runSchema);
