import mongoose from 'mongoose';

const emailCacheSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    data: Object, // The grouped email data
    timestamp: { type: Date, default: Date.now },
    expireAt: { type: Date, default: Date.now, expires: 3600 } // Auto-delete after 1 hour (optional, but good for cache)
});

export default mongoose.model('EmailCache', emailCacheSchema);
