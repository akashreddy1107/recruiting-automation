import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { Users, FileText, CheckCircle, Clock, Play } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import RunConfigurationModal from '../components/RunConfigurationModal';
import { useAuth } from '../contexts/AuthContext';
import { useAutomation } from '../contexts/AutomationContext';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { user } = useAuth();
    const { runAutomation, isRunning } = useAutomation();
    const [stats, setStats] = useState({
        totalCandidates: 0,
        totalRuns: 0,
        avgScore: 0,
        lastRun: null
    });
    // Removed local 'loading' state for run, but kept for stats if needed? 
    // Actually we can use isRunning to disable button.
    const [isRunModalOpen, setIsRunModalOpen] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/runs`);
            const runs = await res.json();
            const resCandidates = await fetch(`${API_BASE_URL}/api/candidates`);
            const candidates = await resCandidates.json();

            const totalCandidates = candidates.length;
            const totalRuns = runs.length;
            const avgScore = totalCandidates > 0
                ? Math.round(candidates.reduce((acc, c) => acc + c.score.total, 0) / totalCandidates)
                : 0;

            setStats({
                totalCandidates,
                totalRuns,
                avgScore,
                lastRun: runs[0],
                topCandidates: candidates.sort((a, b) => b.score.total - a.score.total).slice(0, 3)
            });
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [isRunning]); // Re-fetch stats when isRunning changes (e.g. finishes)

    const handleRunAutomation = async (config) => {
        setIsRunModalOpen(false);
        // Call global automation
        await runAutomation(config);
        // Stats will refresh automatically due to useEffect dependency or we can call it here
        fetchStats();
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <div className="flex items-center justify-between">
                <motion.div variants={item}>
                    <h1 className="text-4xl font-bold text-primary tracking-tight">Dashboard</h1>
                    <p className="text-secondary mt-2 text-lg">Welcome back, here's what's happening.</p>
                </motion.div>
                <motion.button
                    variants={item}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsRunModalOpen(true)}
                    disabled={isRunning}
                    className="gemini-button gemini-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRunning ? <Clock className="animate-spin" /> : <Play size={20} fill="currentColor" />}
                    {isRunning ? 'Running...' : 'Run Automation'}
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Candidates" value={stats.totalCandidates} icon={Users} color="text-accent-blue" delay={0.1} />
                <StatsCard title="Average Score" value={stats.avgScore} icon={CheckCircle} color="text-green-400" delay={0.2} />
                <StatsCard title="Total Runs" value={stats.totalRuns} icon={FileText} color="text-accent-purple" delay={0.3} />
                <StatsCard title="Last Run" value={stats.lastRun ? new Date(stats.lastRun.date).toLocaleDateString() : 'N/A'} icon={Clock} color="text-orange-400" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Emails Sent Widget */}
                <motion.div
                    variants={item}
                    className="gemini-card relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-accent-blue/20" />
                    <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                        <span className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue"><Clock size={20} /></span>
                        Recent Emails
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold">
                                        JD
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-primary">John Doe</p>
                                        <p className="text-xs text-secondary">Interview Invitation</p>
                                    </div>
                                </div>
                                <span className="text-xs text-secondary">2h ago</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Selected Candidates Widget */}
                <motion.div
                    variants={item}
                    className="gemini-card relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-accent-purple/20" />
                    <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                        <span className="p-2 rounded-lg bg-accent-purple/10 text-accent-purple"><CheckCircle size={20} /></span>
                        Top Candidates
                    </h3>
                    <div className="space-y-4">
                        {stats.topCandidates && stats.topCandidates.map((candidate, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-xs font-bold">
                                        {candidate.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-primary">{candidate.name}</p>
                                        <p className="text-xs text-secondary">Score: {candidate.score.total}/100</p>
                                    </div>
                                </div>
                                <button className="px-3 py-1 rounded-full bg-accent-purple/10 text-accent-purple text-xs font-medium hover:bg-accent-purple/20 transition-colors">
                                    View
                                </button>
                            </div>
                        ))}
                        {(!stats.topCandidates || stats.topCandidates.length === 0) && (
                            <p className="text-secondary text-sm">No candidates found yet.</p>
                        )}
                    </div>
                </motion.div>
            </div>

            <RunConfigurationModal
                isOpen={isRunModalOpen}
                onClose={() => setIsRunModalOpen(false)}
                onRun={handleRunAutomation}
            />
        </motion.div>
    );
}
