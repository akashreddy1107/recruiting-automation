import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { Save, RefreshCw, Moon, Sun, Briefcase, Award, Mail, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        theme: 'dark',
        jobDefaults: {
            skills: '',
            experience: 2,
            visa: ''
        },
        scoring: {
            skillsWeight: 50,
            experienceWeight: 30,
            visaWeight: 20
        },
        email: {
            blocklist: '',
            keywords: ''
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/settings`);
            const data = await res.json();

            // Ensure arrays are converted to strings for inputs if needed, 
            // but backend sends strings for these specific fields based on my controller default.
            // Wait, controller defaults were strings. Good.
            setSettings(data);

            // Apply theme immediately
            if (data.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`${API_BASE_URL}/api/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            // Apply theme
            if (settings.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleThemeChange = (theme) => {
        setSettings(prev => ({ ...prev, theme }));
    };

    if (loading) return <div className="p-8 text-primary">Loading settings...</div>;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-primary">Settings</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="gemini-button gemini-button-primary flex items-center gap-2"
                >
                    {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Changes
                </button>
            </div>

            <div className="flex gap-4 border-b border-gray-700 pb-1">
                {['general', 'jobDefaults', 'scoring', 'email'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab
                            ? 'bg-accent-blue/10 text-accent-blue border-b-2 border-accent-blue'
                            : 'text-secondary hover:text-primary'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                ))}
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-8 rounded-2xl space-y-8"
            >
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                            <SettingsIcon size={20} className="text-secondary" />
                            Appearance
                        </h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 w-32 transition-all ${settings.theme === 'light'
                                    ? 'border-accent-blue bg-accent-blue/10 text-white'
                                    : 'border-border text-secondary hover:border-secondary'
                                    }`}
                            >
                                <Sun size={24} />
                                Light
                            </button>
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 w-32 transition-all ${settings.theme === 'dark'
                                    ? 'border-accent-blue bg-accent-blue/10 text-white'
                                    : 'border-border text-secondary hover:border-secondary'
                                    }`}
                            >
                                <Moon size={24} />
                                Dark
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'jobDefaults' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                            <Briefcase size={20} className="text-accent-blue" />
                            Default Job Requirements
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary">Required Skills (comma separated)</label>
                                <input
                                    type="text"
                                    value={settings.jobDefaults.skills}
                                    onChange={(e) => handleChange('jobDefaults', 'skills', e.target.value)}
                                    className="gemini-input"
                                    placeholder="React, Node, JavaScript"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary">Minimum Experience (Years)</label>
                                <input
                                    type="number"
                                    value={settings.jobDefaults.experience}
                                    onChange={(e) => handleChange('jobDefaults', 'experience', parseInt(e.target.value) || 0)}
                                    className="gemini-input"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-secondary">Accepted Visa Status (comma separated)</label>
                                <input
                                    type="text"
                                    value={settings.jobDefaults.visa}
                                    onChange={(e) => handleChange('jobDefaults', 'visa', e.target.value)}
                                    className="gemini-input"
                                    placeholder="Citizen, Green Card"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'scoring' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                            <Award size={20} className="text-accent-purple" />
                            Scoring Weights (Total: {parseInt(settings.scoring.skillsWeight) + parseInt(settings.scoring.experienceWeight) + parseInt(settings.scoring.visaWeight)})
                        </h2>
                        <p className="text-sm text-secondary">Adjust how much each factor contributes to the total score (0-100).</p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="text-secondary">Skills Match</label>
                                    <span className="text-accent-purple font-bold">{settings.scoring.skillsWeight} pts</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.scoring.skillsWeight}
                                    onChange={(e) => handleChange('scoring', 'skillsWeight', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-purple"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="text-secondary">Experience</label>
                                    <span className="text-green-400 font-bold">{settings.scoring.experienceWeight} pts</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.scoring.experienceWeight}
                                    onChange={(e) => handleChange('scoring', 'experienceWeight', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="text-secondary">Visa Status</label>
                                    <span className="text-orange-400 font-bold">{settings.scoring.visaWeight} pts</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.scoring.visaWeight}
                                    onChange={(e) => handleChange('scoring', 'visaWeight', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-400"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'email' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                            <Mail size={20} className="text-pink-400" />
                            Email Automation Rules
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary">Blocklist (Sender Names/Emails to Ignore)</label>
                                <textarea
                                    value={settings.email.blocklist}
                                    onChange={(e) => handleChange('email', 'blocklist', e.target.value)}
                                    className="gemini-input h-24"
                                    placeholder="no-reply, newsletter, spam@recruiter.com"
                                />
                                <p className="text-xs text-secondary">Comma separated values.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary">Keywords to Search (Subject Line)</label>
                                <textarea
                                    value={settings.email.keywords}
                                    onChange={(e) => handleChange('email', 'keywords', e.target.value)}
                                    className="gemini-input h-24"
                                    placeholder="application, resume, hiring, job"
                                />
                                <p className="text-xs text-secondary">Comma separated values.</p>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
