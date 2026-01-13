import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { Clock, CheckCircle, XCircle, FileSpreadsheet, Users } from 'lucide-react';

export default function History() {
    const [runs, setRuns] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/runs`)
            .then(res => res.json())
            .then(data => setRuns(data));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Run History</h1>

            <div className="space-y-4">
                {runs.map((run) => (
                    <div key={run.id} className="glass-card p-6 rounded-2xl flex items-center justify-between border border-white/5 hover:border-accent-blue/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${run.status === 'Success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {run.status === 'Success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-primary text-lg">
                                    {new Date(run.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    <span className="text-secondary mx-2">at</span>
                                    {new Date(run.date).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                                </h3>
                                <p className="text-secondary text-sm mt-1">Found <span className="text-accent-blue font-bold">{run.candidatesFound}</span> candidates</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <a
                                href="/candidates"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600 hover:text-white rounded-xl transition-all font-medium"
                            >
                                <Users size={18} />
                                View Candidates
                            </a>
                            {run.sheetUrl && (
                                <a
                                    href={run.sheetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 border border-green-500/50 hover:bg-green-600 hover:text-white rounded-xl transition-all font-medium"
                                >
                                    <FileSpreadsheet size={18} />
                                    View Sheet
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {runs.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <Clock size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No automation runs yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
