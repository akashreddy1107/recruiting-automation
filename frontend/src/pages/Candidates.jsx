import { useState, useEffect } from 'react';
import { Search, Filter, Mail, FileText } from 'lucide-react';

export default function Candidates() {
    const [candidates, setCandidates] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCandidates, setSelectedCandidates] = useState(new Set());
    const [isSending, setIsSending] = useState(false);
    const [emailStatus, setEmailStatus] = useState(null);
    const [sortBy, setSortBy] = useState('score');

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

    const handleSendEmail = async () => {
        if (selectedCandidates.size === 0) return;
        setIsSending(true);
        setEmailStatus('Sending...');

        const selectedData = candidates.filter(c => selectedCandidates.has(c.id));

        try {
            const response = await fetch('http://localhost:5000/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    candidates: selectedData,
                    subject: 'Interview Invitation - RecruitAI',
                    body: '<p>Hi {{name}},</p><p>We were impressed by your profile and would like to invite you for an interview.</p><p>Best,<br>Recruiting Team</p>'
                })
            });

            if (!response.ok) throw new Error('Failed to send emails');

            setEmailStatus(`Successfully sent ${selectedCandidates.size} emails!`);
            setSelectedCandidates(new Set());
            setTimeout(() => setEmailStatus(null), 3000);
        } catch (error) {
            console.error(error);
            setEmailStatus('Failed to send emails.');
        } finally {
            setIsSending(false);
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
                    {/* ... */}
                </div>
            </div>

            {/* ... */}

            {sortedRunIds.map(runId => {
                const runDate = isNaN(runId) ? runId : new Date(parseInt(runId)).toLocaleString(undefined, {
                    dateStyle: 'full',
                    timeStyle: 'medium'
                });

                return (
                    <div key={runId} className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-2 mb-4">
                            <div className="h-8 w-1 bg-accent-blue rounded-full"></div>
                            <h2 className="text-xl font-bold text-white tracking-wide">
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
                                            <h3 className="font-bold text-lg text-white">{candidate.name}</h3>
                                            <p className="text-slate-400 text-sm">{candidate.email}</p>
                                        </div>
                                        <div className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-sm font-bold border border-blue-500/30">
                                            {candidate.score.total}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex flex-wrap gap-2">
                                            {candidate.skills.slice(0, 3).map(skill => (
                                                <span key={skill} className="px-2 py-1 bg-slate-700/50 rounded-md text-xs font-medium text-slate-300 border border-slate-600">
                                                    {skill}
                                                </span>
                                            ))}
                                            {candidate.skills.length > 3 && (
                                                <span className="px-2 py-1 bg-slate-700/50 rounded-md text-xs font-medium text-slate-300 border border-slate-600">
                                                    +{candidate.skills.length - 3}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-slate-400">
                                            <span>{candidate.experience} Years Exp</span>
                                            <span>{candidate.visaStatus}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => toggleCandidate(candidate.id)}
                                            className={`flex-1 py-2 flex items-center justify-center gap-2 border rounded-xl transition-colors ${selectedCandidates.has(candidate.id) ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-slate-600 text-slate-400 hover:bg-slate-700/50'}`}
                                        >
                                            <Mail size={18} />
                                            {selectedCandidates.has(candidate.id) ? 'Selected' : 'Select'}
                                        </button>

                                        {candidate.resumeLink && candidate.resumeLink !== 'N/A' && (
                                            <a
                                                href={candidate.resumeLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-2 border border-slate-600 text-slate-400 rounded-xl hover:bg-slate-700/50 transition-colors flex items-center justify-center"
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
        </div>
    );
}
