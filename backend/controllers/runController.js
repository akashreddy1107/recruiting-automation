import * as gmailService from '../services/gmailService.js';
import * as scoringService from '../services/scoringService.js';
import * as sheetsService from '../services/sheetsService.js';
import * as driveService from '../services/driveService.js';
import db from '../data/db.js';
import { v4 as uuidv4 } from 'uuid';

export const startRun = async (req, res) => {
    // Get params from body (preferred) or query
    const email = req.body.email || req.query.email;
    const { startDate, skills, experience, visa } = req.body;

    if (!email) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // 1. Fetch Emails with Date Filter
        const messages = await gmailService.listUnreadMessages(email, startDate);
        console.log(`Found ${messages.length} unread messages since ${startDate || 'forever'}`);

        const newCandidates = [];

        // 2. Process Each Email
        // 2. Process Each Email in Parallel
        // Chunking promises to avoid hitting API rate limits if many emails
        const chunkSize = 5;
        for (let i = 0; i < messages.length; i += chunkSize) {
            const chunk = messages.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (msg) => {
                try {
                    const fullMsg = await gmailService.getMessage(email, msg.id);
                    const candidatesFromEmail = await gmailService.parseCandidateFromEmail(email, fullMsg);

                    if (!candidatesFromEmail || candidatesFromEmail.length === 0) {
                        return;
                    }

                    for (const candidateData of candidatesFromEmail) {
                        // 3. Score Candidate with Custom Criteria
                        const criteria = {
                            skills: skills ? (Array.isArray(skills) ? skills : skills.split(',')) : undefined,
                            experience: experience ? parseInt(experience) : undefined,
                            visa: visa ? (Array.isArray(visa) ? visa : visa.split(',')) : undefined
                        };

                        const score = scoringService.calculateScore(candidateData, criteria);

                        const candidate = {
                            id: uuidv4(),
                            ...candidateData,
                            score,
                            status: 'New',
                            // Normalize runId to current minute to prevent "double heading" bug
                            runId: new Date().setSeconds(0, 0).toString()
                        };

                        newCandidates.push(candidate);
                    }
                } catch (err) {
                    console.error(`Error processing msg ${msg.id}:`, err);
                }
            }));
        }

        // 4. Save to DB
        await db.read();
        db.data.candidates.push(...newCandidates);
        await db.write(); // Save candidates immediately

        // 5. Export to Sheets
        let sheetUrl = null;
        try {
            if (newCandidates.length > 0) {
                const sheetResult = await sheetsService.exportCandidates(email, newCandidates);
                sheetUrl = sheetResult.url;
            }
        } catch (error) {
            console.error('Sheets Error:', error);
        }

        // 6. Log Run
        await db.read(); // Read again to ensure we have latest state
        const runLog = {
            id: uuidv4(),
            date: new Date().toISOString(),
            candidatesFound: newCandidates.length,
            sheetUrl,
            status: 'Success'
        };
        db.data.runs.push(runLog);
        await db.write();

        res.json({
            message: 'Run completed successfully',
            run: runLog,
            candidates: newCandidates
        });

    } catch (error) {
        console.error('Run Error Details:', JSON.stringify(error, null, 2));
        console.error('Run Error Message:', error.message);
        res.status(500).json({ error: error.message, details: error.response?.data || error });
    }
};

export const getRuns = async (req, res) => {
    await db.read();
    res.json(db.data.runs.sort((a, b) => new Date(b.date) - new Date(a.date)));
};
