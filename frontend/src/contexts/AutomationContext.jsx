import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AutomationContext = createContext();

export const useAutomation = () => useContext(AutomationContext);

export const AutomationProvider = ({ children }) => {
    const { user } = useAuth();
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(null); // 'Starting', 'Processing', 'Complete'
    const [lastResult, setLastResult] = useState(null);

    // Persist running state if page reloads (optional, simplified for now to just context memory across client nav)
    // If the user refreshes the page manually (F5), the state is lost. 
    // To fix that, we'd need localStorage or Server-Side Events.
    // For this request ("navigate to History"), client-side context is sufficient.

    const runAutomation = async (config) => {
        if (isRunning) return;
        setIsRunning(true);
        setProgress('Starting automation...');
        setLastResult(null);

        try {
            const res = await fetch('http://localhost:5000/api/runs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: user.email,
                    ...config
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Run failed');

            setLastResult({
                success: true,
                count: data.candidates.length,
                message: `Run Complete! Found ${data.candidates.length} candidates.`
            });

            // Show a simple browser notification or alert if supported/wanted?
            // For now, we rely on the UI components consuming this context to show a toast.
            alert(`Background Run Complete! Found ${data.candidates.length} candidates.`);

        } catch (error) {
            console.error('Run failed:', error);
            setLastResult({
                success: false,
                message: error.message || 'Run Failed'
            });
            alert(`Run Failed: ${error.message}`);
        } finally {
            setIsRunning(false);
            setProgress(null);
        }
    };

    const value = {
        isRunning,
        progress,
        lastResult,
        runAutomation
    };

    return (
        <AutomationContext.Provider value={value}>
            {children}
        </AutomationContext.Provider>
    );
};
