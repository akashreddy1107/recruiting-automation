import { useState, useEffect } from 'react';
import { Plus, Search, Briefcase, MapPin, DollarSign, MoreVertical, Trash2, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JobModal from '../components/JobModal';
import JobMatchesModal from '../components/JobMatchesModal';

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Matching State
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
    const [selectedJobForMatch, setSelectedJobForMatch] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = () => {
        setLoading(true);
        fetch('http://localhost:5000/api/jobs')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setJobs(data);
                } else {
                    console.error("Invalid jobs data:", data);
                    setJobs([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch jobs", err);
                setJobs([]);
                setLoading(false);
            });
    };

    const handleViewMatches = (job) => {
        setSelectedJobForMatch(job);
        setLoadingMatches(true);
        setIsMatchModalOpen(true);
        setMatches([]); // Clear previous

        fetch(`http://localhost:5000/api/jobs/${job._id}/matches`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMatches(data);
                } else {
                    console.error("Invalid matches data:", data);
                    setMatches([]);
                }
                setLoadingMatches(false);
            })
            .catch(err => {
                console.error("Failed to fetch matches", err);
                setMatches([]);
                setLoadingMatches(false);
            });
    };

    const handleInviteCandidate = (candidate) => {
        // For now, just alert or log. Ideally, open the Compose Modal from Candidates page.
        // Since we don't have the Compose Modal here, we can just show a success message or redirect.
        // Let's just alert for now as a placeholder for the "Integration" step.
        alert(`Invite feature coming soon! Would invite ${candidate.name} to ${selectedJobForMatch.title}`);
    };

    const handleSaveJob = (jobData) => {
        const method = editingJob ? 'PUT' : 'POST';
        const url = editingJob
            ? `http://localhost:5000/api/jobs/${editingJob._id}`
            : 'http://localhost:5000/api/jobs';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        })
            .then(res => res.json())
            .then(() => {
                fetchJobs();
                setIsModalOpen(false);
                setEditingJob(null);
            })
            .catch(err => console.error("Failed to save job", err));
    };

    const handleDeleteJob = (id) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            fetch(`http://localhost:5000/api/jobs/${id}`, { method: 'DELETE' })
                .then(() => fetchJobs())
                .catch(err => console.error("Failed to delete job", err));
        }
    };

    const openEditModal = (job) => {
        setEditingJob(job);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingJob(null);
        setIsModalOpen(true);
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Jobs</h1>
                    <p className="text-secondary mt-1">Manage your open positions and hiring pipeline.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="gemini-button gemini-button-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    Create Job
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-charcoal p-4 rounded-xl border border-white/5 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                    <input
                        type="text"
                        placeholder="Search jobs by title or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-graphite border border-white/10 rounded-lg pl-10 pr-4 py-2 text-primary focus:border-accent-blue focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredJobs.map(job => (
                        <motion.div
                            key={job._id}
                            variants={item}
                            className="gemini-card group relative hover:border-accent-blue/50 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${job.status === 'Active' ? 'bg-green-500/10 text-green-400' :
                                    job.status === 'Closed' ? 'bg-red-500/10 text-red-400' :
                                        'bg-yellow-500/10 text-yellow-400'
                                    }`}>
                                    {job.status}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(job)}
                                        className="p-1.5 hover:bg-white/10 rounded-lg text-secondary hover:text-accent-blue transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteJob(job._id)}
                                        className="p-1.5 hover:bg-white/10 rounded-lg text-secondary hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-primary mb-1">{job.title}</h3>
                            <p className="text-secondary text-sm mb-4">{job.department}</p>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-secondary">
                                    <MapPin size={16} className="text-accent-purple" />
                                    {job.location}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-secondary">
                                    <Briefcase size={16} className="text-accent-blue" />
                                    {job.type}
                                </div>
                                {job.salaryRange && (
                                    <div className="flex items-center gap-2 text-sm text-secondary">
                                        <DollarSign size={16} className="text-green-400" />
                                        {job.salaryRange.min?.toLocaleString()} - {job.salaryRange.max?.toLocaleString()} {job.salaryRange.currency}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs text-secondary">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                <button
                                    onClick={() => handleViewMatches(job)}
                                    className="text-sm font-bold text-accent-blue hover:text-white px-3 py-1.5 rounded-lg hover:bg-accent-blue transition-colors"
                                >
                                    View Matches
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {filteredJobs.length === 0 && (
                        <div className="col-span-full text-center py-20 text-secondary">
                            No jobs found. Create one to get started!
                        </div>
                    )}
                </motion.div>
            )}

            <JobModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveJob}
                job={editingJob}
            />

            <JobMatchesModal
                isOpen={isMatchModalOpen}
                onClose={() => setIsMatchModalOpen(false)}
                job={selectedJobForMatch}
                matches={matches}
                onInvite={handleInviteCandidate}
            />
        </div>
    );
}
