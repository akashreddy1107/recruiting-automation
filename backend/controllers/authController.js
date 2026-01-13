import * as authService from '../services/authService.js';
import User from '../models/User.js';

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
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/dashboard?email=${userInfo.email}`);
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

    const user = await User.findOne({ email });

    if (user) {
        // Convert to object to inspect properties safely if needed, though usually fine
        const userData = user.toObject();
        const { tokens, ...safeUser } = userData;
        res.json({ user: safeUser });
    } else {
        res.status(404).json({ user: null });
    }
};
