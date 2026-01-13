import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Calendar, Briefcase, Award, Globe } from 'lucide-react';
import clsx from 'clsx';

export default function RunConfigurationModal({ isOpen, onClose, onRun }) {
    const [config, setConfig] = useState({
        startDate: '2024-01-01',
        skills: 'React, Node, JavaScript',
        experience: 2,
        visa: 'Citizen, Green Card'
    });

    // Fetch defaults when modal opens
    useEffect(() => {
        if (isOpen) {
            fetch(`${API_BASE_URL}/api/settings`)
                .then(res => res.json())
                .then(data => {
                    if (data.jobDefaults) {
                        setConfig(prev => ({
                            ...prev,
                            skills: data.jobDefaults.skills,
                            experience: data.jobDefaults.experience,
                            visa: data.jobDefaults.visa
                        }));
                    }
                })
                .catch(err => console.error('Failed to load defaults', err));
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onRun({
            ...config,
            skills: (config.skills || '').split(',').map(s => s.trim()).filter(Boolean),
            visa: (config.visa || '').split(',').map(v => v.trim()).filter(Boolean)
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                        <div className="gemini-card w-full max-w-lg pointer-events-auto bg-charcoal border border-white/10 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-primary">Configure Run</h2>
                                <button onClick={onClose} className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-secondary hover:text-primary">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Start Date */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                        <Calendar size={16} className="text-accent-blue" />
                                        Read Emails From
                                    </label>
                                    <input
                                        type="date"
                                        value={config.startDate}
                                        onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                                        className="gemini-input"
                                        required
                                    />
                                </div>

                                {/* Skills */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                        <Award size={16} className="text-accent-purple" />
                                        Required Skills (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={config.skills}
                                        onChange={(e) => setConfig({ ...config, skills: e.target.value })}
                                        className="gemini-input"
                                        placeholder="e.g. React, Python, AWS"
                                    />
                                </div>

                                {/* Experience */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                        <Briefcase size={16} className="text-green-400" />
                                        Minimum Experience (Years)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={config.experience}
                                        onChange={(e) => setConfig({ ...config, experience: e.target.value })}
                                        className="gemini-input"
                                    />
                                </div>

                                {/* Visa */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                        <Globe size={16} className="text-orange-400" />
                                        Accepted Visa Status (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={config.visa}
                                        onChange={(e) => setConfig({ ...config, visa: e.target.value })}
                                        className="gemini-input"
                                        placeholder="e.g. Citizen, Green Card, H1B"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full gemini-button gemini-button-primary"
                                    >
                                        <Play size={20} fill="currentColor" />
                                        Start Automation
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
