import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    department: String,
    location: String,
    type: String, // Full-time, etc.
    description: String,
    requirements: [String],
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: 'Active' }
});

export default mongoose.model('Job', jobSchema);
