import * as gmailService from '../services/gmailService.js';

export const sendInterviewEmail = async (req, res) => {
    const { email, candidates, subject, body } = req.body;

    if (!email || !candidates || !Array.isArray(candidates) || candidates.length === 0) {
        return res.status(400).json({ error: 'Invalid request parameters' });
    }

    try {
        const results = [];
        for (const candidate of candidates) {
            try {
                // Personalize body if needed (simple replacement)
                const personalizedBody = body.replace('{{name}}', candidate.name);

                await gmailService.sendEmail(email, candidate.email, subject, personalizedBody);
                results.push({ email: candidate.email, status: 'Sent' });
            } catch (error) {
                console.error(`Failed to send email to ${candidate.email}:`, error);
                results.push({ email: candidate.email, status: 'Failed', error: error.message });
            }
        }

        res.json({ message: 'Email processing complete', results });
    } catch (error) {
        console.error('Email Controller Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getGroupedEmails = async (req, res) => {
    const { email } = req.query; // Usually expected as a query param or from auth context

    if (!email) {
        return res.status(400).json({ error: 'Email parameter is required' });
    }

    try {
        const grouped = await gmailService.getGroupedEmails(email);
        res.json(grouped);
    } catch (error) {
        console.error('Grouped Emails Controller Error:', error);
        res.status(500).json({ error: error.message });
    }
};
