import { useState, useEffect } from 'react';
import { Search, Filter, Mail, FileText, X, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Candidates() {
    const [candidates, setCandidates] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCandidates, setSelectedCandidates] = useState(new Set());
    const [isSending, setIsSending] = useState(false);
    const [emailStatus, setEmailStatus] = useState(null);
    const [sortBy, setSortBy] = useState('score');

    const [isComposing, setIsComposing] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [candidatesToEmail, setCandidatesToEmail] = useState([]);

    // Mock user email for now, in real app get from AuthContext
    const userEmail = "akashreddy1107@gmail.com";

    useEffect(() => {
        fetch('http://localhost:5000/api/candidates')
            .then(res => res.json())
            .then(data => setCandidates(data));
    }, []);

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
        if (sortBy === 'score') return b.score.total - a.score.total;
        if (sortBy === 'experience') return b.experience - a.experience;
        if (sortBy === 'skills') return b.skills.length - a.skills.length;
        return 0;
    });

    const toggleSelectAll = () => {
        if (selectedCandidates.size === filteredCandidates.length) {
            setSelectedCandidates(new Set());
        } else {
            setSelectedCandidates(new Set(filteredCandidates.map(c => c.id)));
        }
    };

    const toggleCandidate = (id) => {
        const newSelected = new Set(selectedCandidates);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedCandidates(newSelected);
    };

    const openComposeModal = (candidatesList = []) => {
        // If no list provided, use selected
        let targetCandidates = candidatesList;
        if (targetCandidates.length === 0) {
            targetCandidates = candidates.filter(c => selectedCandidates.has(c.id));
        }

        if (targetCandidates.length === 0) return;

        setCandidatesToEmail(targetCandidates);

        const isSingle = targetCandidates.length === 1;
        const name = isSingle ? targetCandidates[0].name : "Candidate";

        setEmailSubject('Interview Invitation - RecruitAI');
        setEmailBody(`Dear ${isSingle ? name : 'Candidate'},

I hope this email finds you well.

We have reviewed your application and were impressed by your background and skills. We would like to invite you for an interview to discuss your experience and how you can contribute to our team.

The interview will be conducted [Online/Offline]. Please let us know your availability for the coming week so we can schedule a convenient time.

We look forward to hearing from you.

Best regards,

Recruiting Team
RecruitAI`);

        setIsComposing(true);
        setEmailStatus(null);
    };

    const handleSendEmail = async () => {
        setSendingEmail(true);
        setEmailStatus(null);

        try {
            const response = await fetch('http://localhost:5000/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    candidates: candidatesToEmail,
                    subject: emailSubject,
                    body: emailBody
                })
            });

            if (!response.ok) throw new Error('Failed to send emails');

            setEmailStatus('success');
            setTimeout(() => {
                setIsComposing(false);
                setCandidatesToEmail([]);
                if (selectedCandidates.size > 0) setSelectedCandidates(new Set()); // Clear selection if bulk
            }, 2000);
        } catch (error) {
            console.error(error);
            setEmailStatus('error');
        } finally {
            setSendingEmail(false);
        }
    };

    // Group candidates by runId. If runId is "Unknown Run", we might want to group by Date instead if available.
    // Ensure runId is treated consistently.
    const groupedCandidates = filteredCandidates.reduce((groups, candidate) => {
        let runKey = candidate.runId;
        // If runId is numeric (timestamp) but slightly different for same-run candidates, this bug happens.
        // However, usually `runId` is set once per run.
        // If the user sees TWO sections with the SAME formatted date time, it means runIds are DIFFERENT but format to same string.
        // We will assume runId is unique per run. If it's splitting, maybe we should group by the *formatted date* string if runIds are close?
        // Actually, if they are different runIds, they ARE different runs.
        // But the user says "same run".
        // Let's group by a normalized 1-minute window if they are timestamps?
        // OR, just trust the header display needs to be unique.

        // If the user complaint is "two different headings", maybe the *text* is the same but they are separate groups.
        // Let's check if the previous runId is very close to this one? No, that's complex.

        // Let's assume the issue is that multiple candidates were processed in a "batch" but got slightly different `runId` timestamps.
        // FIX: Round the timestamp to the nearest minute/second?
        // Or better: In `gmailService`, we assign `runId`.

        // Front-end Fix: Group by formatted date string instead of raw runId if runId is a timestamp.
        if (runKey && !isNaN(runKey)) {
            // Round to nearest minute to merge slight diffs
            const date = new Date(parseInt(runKey));
            date.setSeconds(0, 0);
            runKey = date.getTime().toString();
        } else {
            runKey = runKey || 'Legacy';
        }

        if (!groups[runKey]) {
            groups[runKey] = [];
        }
        groups[runKey].push(candidate);
        return groups;
    }, {});

    const sortedRunIds = Object.keys(groupedCandidates).sort((a, b) => b - a);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-accent-blue/90 drop-shadow-lg">Candidates</h1>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={toggleSelectAll}
                        className="px-4 py-2 border border-border rounded-xl text-secondary hover:bg-primary/5 transition-colors"
                    >
                        {selectedCandidates.size > 0 && selectedCandidates.size === filteredCandidates.length ? 'Deselect All' : 'Select All'}
                    </button>

                    {selectedCandidates.size > 0 && (
                        <button
                            onClick={() => openComposeModal()}
                            className="px-4 py-2 bg-accent-blue text-white rounded-xl hover:bg-accent-blue/90 transition-colors flex items-center gap-2"
                        >
                            <Mail size={18} />
                            Email Selected ({selectedCandidates.size})
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={20} />
                    <input
                        type="text"
                        placeholder="Search candidates by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-charcoal border border-white/10 rounded-xl pl-10 pr-4 py-3 text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2 bg-charcoal border border-white/10 rounded-xl px-4">
                    <Filter size={20} className="text-secondary" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent border-none text-primary focus:outline-none py-3"
                    >
                        <option value="score">Sort by Score</option>
                        <option value="experience">Sort by Experience</option>
                        <option value="skills">Sort by Skills</option>
                    </select>
                </div>
            </div>

            {sortedRunIds.map(runId => {
                const runDate = isNaN(runId) ? runId : new Date(parseInt(runId)).toLocaleString(undefined, {
                    dateStyle: 'full',
                    timeStyle: 'medium'
                });

                return (
                    <div key={runId} className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-2 mb-4">
                            <div className="h-8 w-1 bg-accent-blue rounded-full"></div>
                            <h2 className="text-xl font-bold text-primary tracking-wide">
                                Run: <span className="text-accent-blue">{runDate}</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groupedCandidates[runId].map((candidate) => (
                                <div key={candidate.id} className={`glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 group relative ${selectedCandidates.has(candidate.id) ? 'ring-2 ring-blue-500' : ''}`}>
                                    <div className="absolute top-4 right-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedCandidates.has(candidate.id)}
                                            onChange={() => toggleCandidate(candidate.id)}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex justify-between items-start mb-4 pr-8">
                                        <div>
                                            <h3 className="font-bold text-lg text-primary">{candidate.name}</h3>
                                            <p className="text-secondary text-sm">{candidate.email}</p>
                                        </div>
                                        <div className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-sm font-bold border border-blue-500/30">
                                            {candidate.score.total}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex flex-wrap gap-2">
                                            {candidate.skills.slice(0, 3).map(skill => (
                                                <span key={skill} className="px-2 py-1 bg-primary/5 rounded-md text-xs font-medium text-secondary border border-border">
                                                    {skill}
                                                </span>
                                            ))}
                                            {candidate.skills.length > 3 && (
                                                <span className="px-2 py-1 bg-primary/5 rounded-md text-xs font-medium text-secondary border border-border">
                                                    +{candidate.skills.length - 3}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-secondary">
                                            <span>{candidate.experience} Years Exp</span>
                                            <span>{candidate.visaStatus}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => openComposeModal([candidate])}
                                            className="flex-1 py-2 flex items-center justify-center gap-2 border border-border rounded-xl text-secondary hover:bg-accent-blue/10 hover:text-accent-blue hover:border-accent-blue transition-colors"
                                        >
                                            <Send size={16} />
                                            Invite
                                        </button>
                                        <button
                                            onClick={() => toggleCandidate(candidate.id)}
                                            className={`px-4 py-2 flex items-center justify-center gap-2 border rounded-xl transition-colors ${selectedCandidates.has(candidate.id) ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-border text-secondary hover:bg-primary/5'}`}
                                        >
                                            {selectedCandidates.has(candidate.id) ? 'Selected' : 'Select'}
                                        </button>

                                        {candidate.resumeLink && candidate.resumeLink !== 'N/A' && (
                                            <a
                                                href={candidate.resumeLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-2 border border-border text-secondary rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-center"
                                                title="View Resume"
                                            >
                                                <FileText size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

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
                                    <div className="w-full bg-graphite border border-white/10 rounded-lg px-4 py-2 text-primary text-sm opacity-70">
                                        {candidatesToEmail.length === 1
                                            ? `${candidatesToEmail[0].name} <${candidatesToEmail[0].email}>`
                                            : `${candidatesToEmail.length} Candidates Selected`
                                        }
                                    </div>
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
        </div >
    );
}
