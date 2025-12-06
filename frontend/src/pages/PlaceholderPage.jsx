import { useLocation } from 'react-router-dom';

export default function PlaceholderPage() {
    const location = useLocation();
    const pageName = location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.slice(2);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{pageName}</h1>
            <div className="glass-card p-12 rounded-2xl text-center">
                <p className="text-slate-500 text-lg">This feature is coming soon in the next update.</p>
            </div>
        </div>
    );
}
