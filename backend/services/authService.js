import { google } from 'googleapis';
import db from '../data/db.js';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
];

export const getAuthUrl = () => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent' // Force refresh token
    });
};

export const getTokens = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};

export const setCredentials = (tokens) => {
    oauth2Client.setCredentials(tokens);
};

export const getUserInfo = async (tokens) => {
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    return data;
};

export const saveUser = async (userInfo, tokens) => {
    await db.read();
    const existingUserIndex = db.data.users.findIndex(u => u.email === userInfo.email);

    const user = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        tokens: tokens, // In production, encrypt this!
        updatedAt: new Date().toISOString()
    };

    if (existingUserIndex >= 0) {
        db.data.users[existingUserIndex] = user;
    } else {
        db.data.users.push(user);
    }

    await db.write();
    return user;
};

export const getClient = () => oauth2Client;
