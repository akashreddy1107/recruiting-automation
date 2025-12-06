import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import * as driveService from './driveService.js';

import { google } from 'googleapis';
import * as authService from './authService.js';
import db from '../data/db.js';

// ... existing imports ...

async function getGmailClient(email) {
    await db.read();
    const user = db.data.users.find(u => u.email === email);
    if (!user) throw new Error('User not found');

    const client = authService.getClient();
    client.setCredentials(user.tokens);
    return google.gmail({ version: 'v1', auth: client });
}

export const listUnreadMessages = async (email, startDate) => {
    const gmail = await getGmailClient(email);
    let q = ''; // Removed is:unread to allow re-processing

    if (startDate) {
        // Format date as YYYY/MM/DD for Gmail API
        const date = new Date(startDate);
        const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '/');
        q += ` after:${formattedDate}`;
    }

    // Add Job/Recruiting Keywords to filter out spam/promotions
    q += ' (subject:"application" OR subject:"resume" OR subject:"hiring" OR subject:"job" OR "apply" OR "candidate")';

    const res = await gmail.users.messages.list({
        userId: 'me',
        q: q,
        maxResults: 20 // Limit for prototype
    });
    return res.data.messages || [];
};

export const getMessage = async (email, messageId) => {
    const gmail = await getGmailClient(email);
    const res = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
    });
    return res.data;
};

// Helper to extract details from text
const extractDetails = (text) => {
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : 'N/A';

    const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+/);
    const linkedin = linkedinMatch ? `https://www.${linkedinMatch[0]}` : 'N/A';

    const githubMatch = text.match(/github\.com\/[a-zA-Z0-9-]+/);
    const github = githubMatch ? `https://www.${githubMatch[0]}` : 'N/A';

    // Basic Education Extraction (heuristic)
    const educationKeywords = ['Bachelor', 'Master', 'PhD', 'B.Sc', 'M.Sc', 'B.Tech', 'M.Tech', 'University', 'College'];
    const educationLines = text.split('\n').filter(line => educationKeywords.some(k => line.includes(k))).slice(0, 2); // Take top 2 matches
    const education = educationLines.length > 0 ? educationLines.join('; ').trim() : 'N/A';

    // Job Role (heuristic - look for common titles near top or in experience)
    const roles = ['Software Engineer', 'Developer', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data Scientist', 'Manager'];
    const jobRoleMatch = text.split('\n').find(line => roles.some(r => line.includes(r)));
    const jobRole = jobRoleMatch ? jobRoleMatch.trim() : 'N/A';

    // Certifications
    const certKeywords = ['Certified', 'Certificate', 'AWS', 'Azure', 'GCP', 'PMP'];
    const certLines = text.split('\n').filter(line => certKeywords.some(k => line.includes(k) && line.length < 100)).slice(0, 3);
    const certifications = certLines.length > 0 ? certLines.join('; ').trim() : 'N/A';

    return { phone, linkedin, github, education, jobRole, certifications };
};

export const parseCandidateFromEmail = async (email, message) => {
    const headers = message.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const date = new Date(parseInt(message.internalDate)).toISOString();

    const emailMatch = from.match(/<(.+)>/) || [null, from];
    const senderEmail = emailMatch[1];
    const senderName = from.split('<')[0].trim().replace(/"/g, '');

    // Filter blocklist
    const blocklist = ['no-reply', 'newsletter', 'notifications', 'update', 'promotions'];
    if (blocklist.some(term => senderEmail.includes(term) || senderName.toLowerCase().includes(term))) {
        return [];
    }

    let candidates = [];
    let hasAttachments = false;

    if (message.payload.parts) {
        for (const part of message.payload.parts) {
            if (part.filename && (part.filename.toLowerCase().endsWith('.pdf') || part.filename.toLowerCase().endsWith('.docx'))) {
                hasAttachments = true;
                const attachmentId = part.body.attachmentId;
                const buffer = await getAttachment(email, message.id, attachmentId);

                let text = '';
                let resumeType = '';

                if (part.filename.toLowerCase().endsWith('.pdf')) {
                    const data = await pdf(buffer);
                    text = data.text;
                    resumeType = 'PDF';
                } else if (part.filename.toLowerCase().endsWith('.docx')) {
                    const result = await mammoth.extractRawText({ buffer });
                    text = result.value;
                    resumeType = 'Word';
                }

                // Upload to Drive
                const resumeLink = await driveService.uploadResume(email, part.filename, part.mimeType, buffer);

                // Extract Details
                const details = extractDetails(text);

                // Skills & Experience (re-use existing logic but apply to resume text)
                const skillsList = ['React', 'Node', 'Python', 'Java', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'NoSQL', 'TypeScript'];
                const foundSkills = skillsList.filter(skill => new RegExp(`\\b${skill}\\b`, 'i').test(text));

                const experienceMatch = text.match(/(\d+)\+?\s*years?/i);
                const experience = experienceMatch ? parseInt(experienceMatch[1]) : 0;

                const visaKeywords = ['H1B', 'Green Card', 'Citizen', 'Visa', 'Sponsorship'];
                const visaStatus = visaKeywords.find(v => new RegExp(`\\b${v}\\b`, 'i').test(text)) || 'Unknown';

                candidates.push({
                    id: message.id + '_' + part.partId, // Unique ID per attachment
                    name: senderName, // Default to sender, could try to extract from resume
                    email: senderEmail,
                    phone: details.phone,
                    linkedin: details.linkedin,
                    github: details.github,
                    education: details.education,
                    jobRole: details.jobRole,
                    certifications: details.certifications,
                    skills: foundSkills,
                    experience,
                    visaStatus,
                    date,
                    resumeLink,
                    resumeType,
                    subject
                });
            }
        }
    }

    // Fallback if no attachments found
    if (!hasAttachments) {
        // Simple body extraction (text/plain)
        let body = '';
        if (message.payload.parts) {
            const part = message.payload.parts.find(p => p.mimeType === 'text/plain');
            if (part && part.body.data) {
                body = Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
        } else if (message.payload.body.data) {
            body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
        }

        if (body) {
            const details = extractDetails(body);
            const skillsList = ['React', 'Node', 'Python', 'Java', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'NoSQL', 'TypeScript'];
            const foundSkills = skillsList.filter(skill => new RegExp(`\\b${skill}\\b`, 'i').test(body));
            const experienceMatch = body.match(/(\d+)\+?\s*years?/i);
            const experience = experienceMatch ? parseInt(experienceMatch[1]) : 0;
            const visaKeywords = ['H1B', 'Green Card', 'Citizen', 'Visa', 'Sponsorship'];
            const visaStatus = visaKeywords.find(v => new RegExp(`\\b${v}\\b`, 'i').test(body)) || 'Unknown';

            candidates.push({
                id: message.id,
                name: senderName,
                email: senderEmail,
                phone: details.phone,
                linkedin: details.linkedin,
                github: details.github,
                education: details.education,
                jobRole: details.jobRole,
                certifications: details.certifications,
                skills: foundSkills,
                experience,
                visaStatus,
                date,
                resumeLink: 'N/A',
                resumeType: 'Email Body',
                subject
            });
        }
    }

    return candidates;
};

export const getAttachment = async (email, messageId, attachmentId) => {
    const gmail = await getGmailClient(email);
    const res = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId: messageId,
        id: attachmentId
    });
    return Buffer.from(res.data.data, 'base64');
};

export const sendEmail = async (email, to, subject, body) => {
    const gmail = await getGmailClient(email);

    const messageParts = [
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${subject}`,
        '',
        body
    ];
    const message = messageParts.join('\n');

    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage,
        },
    });
};
