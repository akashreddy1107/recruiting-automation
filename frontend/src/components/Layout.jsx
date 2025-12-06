import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Mail, History, Settings, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Candidates', path: '/candidates' },
        { icon: Briefcase, label: 'Jobs', path: '/jobs' },
        { icon: Mail, label: 'Emails', path: '/emails' },
        { icon: History, label: 'History', path: '/history' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-obsidian text-white flex overflow-hidden font-sans">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="bg-charcoal/50 backdrop-blur-xl border-r border-white/5 flex-shrink-0 z-20 hidden md:flex flex-col relative"
            >
                <div className="p-6 flex items-center justify-between">
                    <AnimatePresence mode='wait'>
                        {isSidebarOpen && (
                            <motion.h1
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent"
                            >
                                RecruitAI
                            </motion.h1>
                        )}
                    </AnimatePresence>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                    isActive ? "text-white bg-white/10 shadow-lg shadow-accent-blue/5" : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Icon size={22} className={clsx("relative z-10", isActive ? "text-accent-blue" : "group-hover:text-white transition-colors")} />
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="font-medium relative z-10"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className={clsx("flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5", !isSidebarOpen && "justify-center")}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-xs font-bold">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.email}</p>
                                <button onClick={logout} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mt-0.5">
                                    <LogOut size={12} /> Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative">
                {/* Background Gradients */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-blue/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-purple/5 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
