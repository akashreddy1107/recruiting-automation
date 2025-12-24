import { X, User, CheckCircle, XCircle, Send, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JobMatchesModal({ isOpen, onClose, job, matches, onInvite }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-charcoal border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                            <Star className="text-yellow-400 fill-yellow-400" size={24} />
                            Top Matches
                        </h2>
                        <p className="text-secondary text-sm mt-1">For: <span className="text-accent-blue font-medium">{job?.title}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {matches.length === 0 ? (
                        <div className="text-center py-20 text-secondary">
                            No matching candidates found for these requirements.
                        </div>
                    ) : (
                        matches.map((candidate, index) => (
                            <div key={candidate.id} className="bg-graphite border border-white/5 rounded-xl p-5 flex flex-col md:flex-row gap-6 hover:border-accent-blue/30 transition-all">
                                {/* Score Section */}
                                <div className="flex flex-col items-center justify-center min-w-[100px]">
                                    <div className="relative w-20 h-20 flex items-center justify-center">
                                        <svg className="w-full h-full" viewBox="0 0 36 36">
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#333"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke={candidate.matchScore > 75 ? '#4ade80' : candidate.matchScore > 50 ? '#facc15' : '#f87171'}
                                                strokeWidth="3"
                                                strokeDasharray={`${candidate.matchScore}, 100`}
                                            />
                                        </svg>
                                        <div className="absolute text-xl font-bold text-primary">{candidate.matchScore}%</div>
                                    </div>
                                    <span className="text-xs text-secondary mt-2 font-medium">Match Score</span>
                                </div>

                                {/* Details Section */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                                {candidate.name}
                                                {index === 0 && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">Top Pick</span>}
                                            </h3>
                                            <p className="text-secondary text-sm">{candidate.email}</p>
                                        </div>
                                        <button
                                            onClick={() => onInvite(candidate)}
                                            className="px-4 py-2 bg-accent-blue/10 text-accent-blue border border-accent-blue/50 rounded-lg hover:bg-accent-blue hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
                                        >
                                            <Send size={16} />
                                            Invite
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <h4 className="text-green-400 font-medium mb-2 flex items-center gap-1">
                                                <CheckCircle size={14} /> Matched Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {candidate.matchedSkills.length > 0 ? candidate.matchedSkills.map(skill => (
                                                    <span key={skill} className="px-2 py-1 bg-green-500/10 text-green-300 rounded text-xs border border-green-500/20">
                                                        {skill}
                                                    </span>
                                                )) : <span className="text-secondary italic">None</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-red-400 font-medium mb-2 flex items-center gap-1">
                                                <XCircle size={14} /> Missing Requirements
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {candidate.missingSkills.length > 0 ? candidate.missingSkills.map(skill => (
                                                    <span key={skill} className="px-2 py-1 bg-red-500/10 text-red-300 rounded text-xs border border-red-500/20">
                                                        {skill}
                                                    </span>
                                                )) : <span className="text-green-400 text-xs">All requirements met!</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}
