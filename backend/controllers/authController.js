import * as authService from '../services/authService.js';
import db from '../data/db.js';

export const googleAuth = (req, res) => {
    const url = authService.getAuthUrl();
    res.redirect(url);
};

export const googleCallback = async (req, res) => {
    const { code } = req.query;
    try {
        const tokens = await authService.getTokens(code);
        const userInfo = await authService.getUserInfo(tokens);
        await authService.saveUser(userInfo, tokens);

        // Redirect to frontend with some session indicator (simplified for this prototype)
        // In a real app, we'd set a secure cookie or return a JWT
        res.redirect(`http://localhost:5173/dashboard?email=${userInfo.email}`);
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).send('Authentication failed');
    }
};

export const getMe = async (req, res) => {
    // Simplified: In a real app, verify session/JWT
    // For this prototype, we'll assume single user or pass email in query
    const { email } = req.query;
    if (!email) return res.status(401).json({ user: null });

    await db.read();
    const user = db.data.users.find(u => u.email === email);

    if (user) {
        const { tokens, ...safeUser } = user;
        res.json({ user: safeUser });
    } else {
        res.status(404).json({ user: null });
    }
};
