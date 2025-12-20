import { useState, useEffect } from 'react';
import { Mail, ChevronDown, ChevronRight, X, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Emails() {
    const { user } = useAuth();
    const [groupedEmails, setGroupedEmails] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState(new Set());
    const [selectedEmail, setSelectedEmail] = useState(null);

    // Mock user email if not logged in (for dev)
    const emailToUse = user?.email || "akashreddy1107@gmail.com";

    const CACHE_KEY = `cached_emails_${emailToUse}`;
    const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

    useEffect(() => {
        const checkCache = () => {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                const isValid = Date.now() - timestamp < CACHE_DURATION;

                if (isValid) {
                    setGroupedEmails(data);
                    expandSections(data);
                    setLoading(false);
                    return true;
                }
            }
            return false;
        };

        if (!checkCache()) {
            fetchEmails();
        }
    }, [emailToUse]);

    const fetchEmails = () => {
        setLoading(true);
        fetch(`http://localhost:5000/api/email/grouped?email=${emailToUse}`)
            .then(res => res.json())
            .then(data => {
                setGroupedEmails(data);
                expandSections(data);
                setLoading(false);
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            })
            .catch(err => {
                console.error("Failed to fetch emails", err);
                setLoading(false);
            });
    };

    const expandSections = (data) => {
        const initialExpanded = new Set();
        Object.entries(data).forEach(([skill, emails]) => {
            if (emails.length > 0) initialExpanded.add(skill);
        });
        setExpandedSections(initialExpanded);
    };

    const handleRefresh = () => {
        sessionStorage.removeItem(CACHE_KEY);
        fetchEmails();
    };

    const toggleSection = (skill) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(skill)) {
            newExpanded.delete(skill);
        } else {
            newExpanded.add(skill);
        }
        setExpandedSections(newExpanded);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    // Skills Icons Mapping (mock)
    const getSkillColor = (skill) => {
        const colors = {
            'Python': 'text-yellow-400 bg-yellow-400/10',
            'React': 'text-cyan-400 bg-cyan-400/10',
            'Node': 'text-green-500 bg-green-500/10',
            'Java': 'text-red-400 bg-red-400/10',
            'AWS': 'text-orange-400 bg-orange-400/10',
            'Docker': 'text-blue-400 bg-blue-400/10',
            'TypeScript': 'text-blue-500 bg-blue-500/10',
            'SQL': 'text-purple-400 bg-purple-400/10',
        };
        return colors[skill] || 'text-white bg-white/10';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Inbox Spaces</h1>
                    <p className="text-gray-400 mt-1">Emails categorized by detected skills.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
                    title="Refresh Emails"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-refresh-cw ${loading ? 'animate-spin' : ''}`}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
                </div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                    {Object.entries(groupedEmails).map(([skill, emails]) => (
                        emails.length > 0 && (
                            <motion.div key={skill} variants={item} className="gemini-card !p-0 overflow-hidden">
                                <button
                                    onClick={() => toggleSection(skill)}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {expandedSections.has(skill) ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                                        <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getSkillColor(skill)}`}>
                                            {skill}
                                        </div>
                                        <span className="text-gray-400 text-sm">({emails.length} emails)</span>
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {expandedSections.has(skill) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-white/5">
                                                {emails.map((email) => (
                                                    <div key={email.id} className="bg-charcoal/50 rounded-xl p-4 border border-white/5 hover:border-accent-blue/30 transition-all hover:shadow-lg group">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                                <User size={14} />
                                                                <span className="truncate max-w-[150px]">{email.from}</span>
                                                            </div>
                                                            <span className="text-xs text-gray-500">{new Date(email.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <h3 className="text-white font-medium mb-2 line-clamp-1" title={email.subject}>{email.subject}</h3>
                                                        <p className="text-gray-400 text-xs line-clamp-2 mb-4 h-8">{email.snippet}</p>

                                                        <button
                                                            onClick={() => setSelectedEmail(email)}
                                                            className="w-full py-2 rounded-lg bg-white/5 hover:bg-accent-blue/20 hover:text-accent-blue transition-colors text-xs font-medium border border-white/5"
                                                        >
                                                            Read Email
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    ))}

                    {Object.values(groupedEmails).every(arr => arr.length === 0) && (
                        <div className="text-center py-20 text-gray-400">
                            No emails found with relevant skills.
                        </div>
                    )}
                </motion.div>
            )}

            {/* Email Modal */}
            <AnimatePresence>
                {selectedEmail && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-charcoal border border-white/10 w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">{selectedEmail.subject}</h2>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1"><User size={14} /> {selectedEmail.from}</span>
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(selectedEmail.date).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedEmail(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto whitespace-pre-wrap text-gray-300 font-sans text-sm leading-relaxed">
                                {selectedEmail.body || selectedEmail.snippet}
                            </div>

                            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
                                <button onClick={() => setSelectedEmail(null)} className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors">
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
