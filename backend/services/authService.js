import { google } from 'googleapis';
import User from '../models/User.js';

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
    // Determine the unique key (email)
    const { email } = userInfo;

    // Use findOneAndUpdate with upsert: true to create or update
    const user = await User.findOneAndUpdate(
        { email },
        {
            email,
            name: userInfo.name,
            picture: userInfo.picture,
            tokens, // In production, consider encrypting this
            updatedAt: new Date()
        },
        { new: true, upsert: true }
    );
    return user;
};

export const getClient = () => oauth2Client;
