import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import History from './pages/History';
import Settings from './pages/Settings';
import PlaceholderPage from './pages/PlaceholderPage';
import Emails from './pages/Emails';

// Placeholder Pages
const Login = () => {
    const { login } = useAuth();
    return (
        <div className="min-h-screen flex items-center justify-center bg-obsidian relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-blue/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-purple/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-8 p-10 gemini-card max-w-md w-full relative z-10"
            >
                <div className="space-y-2">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent tracking-tight">
                        RecruitAI
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Next-gen recruiting automation.
                    </p>
                </div>

                <button
                    onClick={login}
                    className="w-full gemini-button gemini-button-primary text-lg group"
                >
                    <span className="group-hover:scale-105 transition-transform duration-200">Sign in with Google</span>
                </button>
            </motion.div>
        </div>
    );
};

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                        <Route index element={<Navigate to="/dashboard" />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="candidates" element={<Candidates />} />
                        <Route path="jobs" element={<PlaceholderPage />} />
                        <Route path="matching" element={<PlaceholderPage />} />
                        <Route path="emails" element={<Emails />} />
                        <Route path="history" element={<History />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="*" element={<div>Page Not Found</div>} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
