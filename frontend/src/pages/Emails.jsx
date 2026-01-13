import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { Mail, ChevronDown, ChevronRight, X, User, Calendar, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Emails() {
    const { user } = useAuth();
    const [groupedEmails, setGroupedEmails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSections, setExpandedSections] = useState(new Set());
    const [selectedEmail, setSelectedEmail] = useState(null);

    // Email Sending State
    const [isComposing, setIsComposing] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailStatus, setEmailStatus] = useState(null); // 'success' | 'error'
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    // Mock user email if not logged in (for dev)
    const emailToUse = user?.email || "akashreddy1107@gmail.com";

    const CACHE_KEY = `cached_emails_${emailToUse}`;
    const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

    useEffect(() => {
        const checkCache = () => {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const { data, timestamp } = JSON.parse(cached);
                    const isValid = Date.now() - timestamp < CACHE_DURATION;

                    if (isValid && data && typeof data === 'object') {
                        setGroupedEmails(data);
                        expandSections(data);
                        setLoading(false);
                        return true;
                    }
                } catch (e) {
                    console.error("Cache parse error", e);
                    sessionStorage.removeItem(CACHE_KEY);
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
        setError(null);
        fetch(`${API_BASE_URL}/api/email/grouped?email=${emailToUse}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch emails');
                return res.json();
            })
            .then(data => {
                if (data && typeof data === 'object' && !Array.isArray(data)) {
                    setGroupedEmails(data);
                    expandSections(data);

                    if (data._isCached) {
                        setError(`Showing cached data from ${new Date(data._timestamp).toLocaleString()}. Live fetch failed.`);
                    } else {
                        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                            data,
                            timestamp: Date.now()
                        }));
                    }
                } else {
                    console.error("Invalid data format received:", data);
                    setGroupedEmails({});
                    setError("Received invalid data from server.");
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch emails", err);
                setError(err.message);
                setLoading(false);
                setGroupedEmails({});
            });
    };

    const expandSections = (data) => {
        const initialExpanded = new Set();
        if (data) {
            Object.entries(data).forEach(([skill, emails]) => {
                if (Array.isArray(emails) && emails.length > 0) initialExpanded.add(skill);
            });
        }
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

    const openComposeModal = () => {
        if (!selectedEmail) return;

        const candidateName = selectedEmail.from || "Candidate";
        const role = "Software Engineer"; // Default or could be inferred

        setEmailSubject(`Interview Invitation: ${role} Position at RecruitAI`);
        setEmailBody(`Dear ${candidateName},

I hope this email finds you well.

We have reviewed your application for the ${role} position and were impressed by your background and skills. We would like to invite you for an interview to discuss your experience and how you can contribute to our team.

The interview will be conducted [Online/Offline]. Please let us know your availability for the coming week so we can schedule a convenient time.

We look forward to hearing from you.

Best regards,

Recruiting Team
RecruitAI`);
        setIsComposing(true);
        setEmailStatus(null);
    };

    const handleSendEmail = () => {
        setSendingEmail(true);
        setEmailStatus(null);

        fetch(`${API_BASE_URL}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: emailToUse,
                candidates: [{
                    name: selectedEmail.from,
                    email: selectedEmail.from // Assuming 'from' contains the email or name, ideally we need the actual email address. 
                    // In the current backend logic, 'from' might be just the name. 
                    // We need to ensure we have the email address. 
                    // For now, using 'from' as placeholder, but in real app, 'selectedEmail' should have 'senderEmail'.
                }],
                subject: emailSubject,
                body: emailBody
            })
        })
            .then(res => res.json())
            .then(data => {
                setSendingEmail(false);
                if (data.results && data.results[0]?.status === 'Sent') {
                    setEmailStatus('success');
                    setTimeout(() => {
                        setIsComposing(false);
                        setSelectedEmail(null); // Close main modal too? Optional.
                    }, 2000);
                } else {
                    setEmailStatus('error');
                }
            })
            .catch(err => {
                console.error("Failed to send email", err);
                setSendingEmail(false);
                setEmailStatus('error');
            });
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
        return colors[skill] || 'text-primary bg-primary/10';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Inbox Spaces</h1>
                    <p className="text-secondary mt-1">Emails categorized by detected skills.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-2 bg-primary/5 hover:bg-primary/10 rounded-lg text-secondary hover:text-primary transition-colors"
                    title="Refresh Emails"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-refresh-cw ${loading ? 'animate-spin' : ''}`}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
                </div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                    {Object.keys(groupedEmails).length > 0 ? (
                        Object.entries(groupedEmails).map(([skill, emails]) => (
                            Array.isArray(emails) && emails.length > 0 && (
                                <motion.div key={skill} variants={item} className="gemini-card !p-0 overflow-hidden">
                                    <button
                                        onClick={() => toggleSection(skill)}
                                        className="w-full flex items-center justify-between p-4 bg-charcoal hover:bg-graphite transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {expandedSections.has(skill) ? <ChevronDown size={20} className="text-secondary" /> : <ChevronRight size={20} className="text-secondary" />}
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getSkillColor(skill)}`}>
                                                {skill}
                                            </div>
                                            <span className="text-secondary text-sm">({emails.length} emails)</span>
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
                                                        <div key={email.id} className="bg-charcoal rounded-xl p-4 border border-border hover:border-accent-blue/50 transition-all hover:shadow-lg group">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex items-center gap-2 text-sm text-secondary">
                                                                    <User size={14} />
                                                                    <span className="truncate max-w-[150px]">{email.from}</span>
                                                                </div>
                                                                <span className="text-xs text-secondary">{new Date(email.date).toLocaleDateString()}</span>
                                                            </div>
                                                            <h3 className="text-primary font-medium mb-2 line-clamp-1" title={email.subject}>{email.subject}</h3>
                                                            <p className="text-secondary text-xs line-clamp-2 mb-4 h-8">{email.snippet}</p>

                                                            <button
                                                                onClick={() => setSelectedEmail(email)}
                                                                className="w-full py-2 rounded-lg bg-graphite hover:bg-accent-blue/10 hover:text-accent-blue transition-colors text-xs font-medium border border-border"
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
                        ))
                    ) : (
                        !error && (
                            <div className="text-center py-20 text-secondary">
                                No emails found with relevant skills.
                            </div>
                        )
                    )}
                </motion.div>
            )}

            {/* Read Email Modal */}
            <AnimatePresence>
                {selectedEmail && !isComposing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-charcoal border border-white/10 w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <div>
                                    <h2 className="text-xl font-bold text-primary mb-1">{selectedEmail.subject}</h2>
                                    <div className="flex items-center gap-4 text-sm text-secondary">
                                        <span className="flex items-center gap-1"><User size={14} /> {selectedEmail.from}</span>
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(selectedEmail.date).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedEmail(null)} className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto whitespace-pre-wrap text-secondary font-sans text-sm leading-relaxed">
                                {selectedEmail.body || selectedEmail.snippet}
                            </div>

                            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                                <button onClick={() => setSelectedEmail(null)} className="px-6 py-2 bg-transparent text-secondary hover:text-primary rounded-full font-medium transition-colors">
                                    Close
                                </button>
                                <button
                                    onClick={openComposeModal}
                                    className="px-6 py-2 bg-accent-blue text-white rounded-full font-medium hover:bg-accent-blue/90 transition-colors flex items-center gap-2"
                                >
                                    <Send size={16} />
                                    Send Interview Invite
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Compose Email Modal */}
            <AnimatePresence>
                {isComposing && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-charcoal border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <h2 className="text-xl font-bold text-primary">Compose Interview Invitation</h2>
                                <button onClick={() => setIsComposing(false)} className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1">To</label>
                                    <input
                                        type="text"
                                        value={selectedEmail?.from || ''}
                                        disabled
                                        className="w-full bg-graphite border border-white/10 rounded-lg px-4 py-2 text-primary text-sm opacity-70"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1">Subject</label>
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        className="w-full bg-graphite border border-white/10 rounded-lg px-4 py-2 text-primary text-sm focus:outline-none focus:border-accent-blue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1">Message</label>
                                    <textarea
                                        value={emailBody}
                                        onChange={(e) => setEmailBody(e.target.value)}
                                        rows={10}
                                        className="w-full bg-graphite border border-white/10 rounded-lg px-4 py-2 text-primary text-sm focus:outline-none focus:border-accent-blue resize-none font-sans"
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between items-center">
                                <div className="text-sm">
                                    {emailStatus === 'success' && <span className="text-green-400 flex items-center gap-2"><CheckCircle size={16} /> Sent Successfully!</span>}
                                    {emailStatus === 'error' && <span className="text-red-400 flex items-center gap-2"><AlertCircle size={16} /> Failed to send.</span>}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setIsComposing(false)} className="px-6 py-2 bg-transparent text-secondary hover:text-primary rounded-full font-medium transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendEmail}
                                        disabled={sendingEmail}
                                        className="px-6 py-2 bg-accent-blue text-white rounded-full font-medium hover:bg-accent-blue/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sendingEmail ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                Send Email
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
