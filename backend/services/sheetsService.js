import { google } from 'googleapis';
import * as authService from './authService.js';
import db from '../data/db.js';

async function getSheetsClient(email) {
    await db.read();
    const user = db.data.users.find(u => u.email === email);
    if (!user) throw new Error('User not found');

    const client = authService.getClient();
    client.setCredentials(user.tokens);
    return google.sheets({ version: 'v4', auth: client });
}

export const exportCandidates = async (email, candidates) => {
    const sheets = await getSheetsClient(email);
    const title = `RecruitAI_${new Date().toISOString().split('T')[0]}`;

    // 1. Create Sheet
    const createRes = await sheets.spreadsheets.create({
        resource: {
            properties: { title },
        },
    });
    const spreadsheetId = createRes.data.spreadsheetId;

    // 2. Add Header
    const headers = [
        'Resume Link', 'Resume Type', 'Name', 'Email', 'Phone Number', 'LinkedIn', 'Github',
        'Skills', 'Job Role', 'Education', 'Experience', 'Certifications', 'Visa', 'Date'
    ];
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        resource: { values: [headers] },
    });

    // 3. Add Rows
    const rows = candidates.map(c => [
        c.resumeLink,
        c.resumeType,
        c.name,
        c.email,
        c.phone,
        c.linkedin,
        c.github,
        c.skills.join(', '),
        c.jobRole,
        c.education,
        c.experience,
        c.certifications,
        c.visaStatus,
        c.date
    ]);

    if (rows.length > 0) {
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A2',
            valueInputOption: 'RAW',
            resource: { values: rows },
        });
    }

    return { spreadsheetId, url: createRes.data.spreadsheetUrl };
};
