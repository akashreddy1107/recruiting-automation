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

    // Group candidates by runId
    const groupedCandidates = filteredCandidates.reduce((groups, candidate) => {
        const runId = candidate.runId || 'Unknown Run';
        if (!groups[runId]) {
            groups[runId] = [];
        }
        groups[runId].push(candidate);
        return groups;
    }, {});

    // Sort runs by date (newest first) - assuming runId is timestamp
    const sortedRunIds = Object.keys(groupedCandidates).sort((a, b) => b - a);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Candidates</h1>
                <div className="flex gap-4 items-center">
                    {/* Sort Dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white/10 text-white border border-white/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="score" className="bg-slate-800">Sort by Score</option>
                        <option value="experience" className="bg-slate-800">Sort by Experience</option>
                        <option value="skills" className="bg-slate-800">Sort by Skills</option>
                    </select>

                    {selectedCandidates.size > 0 && (
                        <button
                            onClick={handleSendEmail}
                            disabled={isSending}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Mail size={18} />
                            {isSending ? 'Sending...' : `Send Invite (${selectedCandidates.size})`}
                        </button>
                    )}
                    {emailStatus && <span className="text-sm font-medium text-green-400">{emailStatus}</span>}

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search candidates..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 placeholder-slate-400"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <input
                    type="checkbox"
                    checked={filteredCandidates.length > 0 && selectedCandidates.size === filteredCandidates.length}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">Select All</span>
            </div>

            {sortedRunIds.map(runId => {
                const runDate = new Date(parseInt(runId)).toLocaleString();
                return (
                    <div key={runId} className="space-y-4">
                        <h2 className="text-xl font-semibold text-blue-400 border-b border-white/10 pb-2">
                            Run: {runDate}
                        </h2>
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
