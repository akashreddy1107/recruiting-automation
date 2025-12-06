import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, FileSpreadsheet } from 'lucide-react';

export default function History() {
    const [runs, setRuns] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/runs')
            .then(res => res.json())
            .then(data => setRuns(data));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Run History</h1>

            <div className="space-y-4">
                {runs.map((run) => (
                    <div key={run.id} className="glass-card p-6 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${run.status === 'Success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {run.status === 'Success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">
                                    {new Date(run.date).toLocaleDateString()} at {new Date(run.date).toLocaleTimeString()}
                                </h3>
                                <p className="text-slate-500 text-sm">Found {run.candidatesFound} candidates</p>
                            </div>
                        </div>

                        {run.sheetUrl && (
                            <a
                                href={run.sheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                                <FileSpreadsheet size={18} />
                                View Sheet
                            </a>
                        )}
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
