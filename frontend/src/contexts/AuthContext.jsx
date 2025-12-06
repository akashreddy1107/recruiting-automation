import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for user in localStorage or query params (for prototype)
        const params = new URLSearchParams(window.location.search);
        const email = params.get('email');

        if (email) {
            localStorage.setItem('user_email', email);
            setUser({ email });
        } else {
            const storedEmail = localStorage.getItem('user_email');
            if (storedEmail) {
                setUser({ email: storedEmail });
            }
        }
        setLoading(false);
    }, []);

    const login = () => {
        // Real Google Login
        window.location.href = 'http://localhost:5000/api/auth/google';

        // Mock Login (Commented out)
        // const mockEmail = 'test@example.com';
        // localStorage.setItem('user_email', mockEmail);
        // setUser({ email: mockEmail });
    };

    const logout = () => {
        localStorage.removeItem('user_email');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
