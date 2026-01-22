import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import * as driveService from './driveService.js';

import { google } from 'googleapis';
import * as authService from './authService.js';
import User from '../models/User.js';
import EmailCache from '../models/EmailCache.js';
import { ALL_SKILLS, VISA_KEYWORDS } from './skills.js';

// ... existing imports ...

async function getGmailClient(email) {
    const user = await User.findOne({ email });
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
        maxResults: 100 // Limit increased to capture more candidates
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

// Helper to validate if text is a resume
const isValidResume = (text) => {
    if (!text || text.length < 50) return false; // Too short
    const lower = text.toLowerCase();

    // 1. Reject Candidate Response Forms
    if (lower.includes('candidate response form') && lower.includes('task order')) return false;
    if (lower.includes('form 2') && lower.includes('candidate name')) return false;

    // 2. Reject ID Cards / Visas
    if (lower.includes('united states of america') && lower.includes('employment authorization')) return false;
    if (lower.includes('permanent resident card') && lower.includes('uscis')) return false;

    return true;
};

// Helper to extract details from text
const extractDetails = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // 1. Phone
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : 'N/A';

    // 2. Links
    const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/);
    const linkedin = linkedinMatch ? `https://www.linkedin.com/in/${linkedinMatch[1]}` : 'N/A';

    const githubMatch = text.match(/github\.com\/([a-zA-Z0-9-]+)/);
    const github = githubMatch ? `https://www.github.com/${githubMatch[1]}` : 'N/A';

    // 3. Smart Education Extraction
    let education = 'N/A';
    const degrees = [
        { type: 'PhD', regex: /\b(PhD|Doctor of Philosophy|D\.Phil)\b/i, rank: 3 },
        { type: 'MASTER', regex: /\b(Master|M\.S|M\.Sc|M\.Tech|MBA|M\.E|Post Graduate)\b/i, rank: 2 },
        { type: 'BACHELOR', regex: /\b(Bachelor|B\.S|B\.Sc|B\.Tech|B\.E|B\.A)\b/i, rank: 1 }
    ];

    let foundDegree = null;
    let foundYear = '';

    for (const line of lines) {
        if (foundDegree && foundDegree.rank === 3) break;

        for (const deg of degrees) {
            if (deg.regex.test(line)) {
                if (!foundDegree || deg.rank > foundDegree.rank) {
                    foundDegree = deg;
                    const yearMatch = line.match(/(20\d{2}|19\d{2})/);
                    foundYear = yearMatch ? `(${yearMatch[0]})` : '';
                }
            }
        }
    }

    if (foundDegree) {
        education = `${foundDegree.type} ${foundYear}`.trim();
    }

    // 4. Job Role (Current Role Extraction)
    const roles = ['Software Engineer', 'Developer', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data Scientist', 'Manager', 'Analyst', 'Architect', 'Administrator', 'Consultant', 'Specialist', 'Technician', 'Director', 'Lead', 'Associate', 'Intern', 'Scientist', 'Coordinator'];
    let jobRole = 'N/A';
    const roleRegex = new RegExp(`\\b(${roles.join('|')})\\b`, 'i');

    for (let i = 0; i < Math.min(lines.length, 60); i++) {
        const line = lines[i];
        if (line.length > 80) continue;

        const match = line.match(roleRegex);
        if (match) {
            const modifierRegex = /\b(Senior|Lead|Principal|Junior|Staff|Chief|Head|Assistant|Associate)\b/i;
            const modMatch = line.match(modifierRegex);
            const roleName = match[0];
            const modifier = modMatch ? modMatch[0] : '';
            jobRole = modifier ? `${modifier} ${roleName}` : roleName;
            jobRole = jobRole.replace(/\b\w/g, c => c.toUpperCase()); // Title Case
            break;
        }
    }

    // 5. Certifications
    const certKeywords = ['Certified', 'Certificate', 'AWS', 'Azure', 'GCP', 'PMP', 'Scrum', 'CISSP', 'Google'];
    const certLines = lines.filter(line => certKeywords.some(k => line.includes(k) && line.length < 100)).slice(0, 3);
    const certifications = certLines.length > 0 ? certLines.map(l => l.replace(/[^a-zA-Z0-9\s,]/g, '').trim()).join('; ') : 'N/A';

    // --- SCORED NAME EXTRACTION LOGIC ---
    let candidateName = null;
    let maxScore = 0;

    const blockedTerms = [
        'resume', 'curriculum', 'vitae', 'cv', 'profile', 'summary', 'about', 'contact', 'mobile', 'phone', 'email', 'address', 'linkedin', 'github',
        'education', 'skills', 'experience', 'projects', 'certifications', 'languages', 'references', 'page', 'task order', 'job description',
        'citizen', 'visa', 'passport', 'nationality', 'date', 'birth', 'gender', 'marital', 'status', 'work', 'permit',
        'expertise', 'proficient', 'competent', 'declaration', 'objective', 'professional', 'certification', 'qualification', 'summary',
        'overview', 'background', 'history', 'employment', 'career', 'goal', 'target', 'role', 'responsibilities',
        'contractor', 'consultant', 'employee', 'employer', 'client', 'project', 'team', 'member',
        'operating', 'system', 'linux', 'windows', 'macos', 'database', 'server', 'application', 'software', 'technology',
        'narrative', 'description', 'details', 'info', 'information', 'personal', 'statement', 'tools', 'etl', 'dashboard', 'created',
        'managed', 'developed', 'designed', 'implemented', 'orchestrated', 'holder', 'studio', 'intelligence', 'development', 'business',
        'installation', 'installed', 'install', 'hands', 'access', 'accesss', 'microsoft', 'page'
    ];

    const companySuffixes = ['limited', 'ltd', 'inc', 'corp', 'corporation', 'llc', 'pvt', 'group', 'services', 'solutions', 'systems', 'technologies', 'consulting'];

    // Scan top 50 lines (slightly deeper to find name if top is junk)
    for (let i = 0; i < Math.min(lines.length, 50); i++) {
        let line = lines[i];

        // 1. Clean Pre-processing
        const namePrefixValues = ['name', 'candidate name', 'contractor name', 'consultant name', 'full name'];
        const lowerLine = line.toLowerCase();

        for (const prefix of namePrefixValues) {
            if (lowerLine.startsWith(prefix + ':') || lowerLine.startsWith(prefix)) {
                // Extract everything after the prefix/colon
                const parts = line.split(/[:\t]/);
                if (parts.length > 1) {
                    const potentialName = parts[1].trim();
                    if (potentialName.length > 2) {
                        line = potentialName;
                    }
                }
            }
        }

        const splitMatch = line.match(/\s+[|–\-(]\s+|[|–\-(]/);
        if (splitMatch) line = line.substring(0, splitMatch.index).trim();
        if (line.includes(',')) line = line.split(',')[0].trim();

        if (line.length < 3 || line.length > 35) continue;

        const lower = line.toLowerCase();

        // 2. Fatal Checks (Immediate Disqualifiers)
        if (/\d/.test(line)) continue;
        if (line.includes('@') || lower.includes('www.') || lower.includes('http')) continue;
        if (blockedTerms.some(t => lower.includes(t))) continue;
        if (roles.some(r => lower.includes(r.toLowerCase()))) continue;
        if (companySuffixes.some(s => lower.endsWith(' ' + s) || lower.includes(' ' + s + ' '))) continue;

        if (['green card', 'visa', 'h1b', 'citizen', 'permanent resident'].some(v => lower.includes(v))) continue;
        if (lower.startsWith('certified') || lower.includes('certification')) continue;
        if (ALL_SKILLS.some(skill => lower === skill.toLowerCase())) continue;
        if (line.includes(':')) continue;

        const words = line.split(/\s+/);
        // Allow single-word names if they are robust (Sulabh)
        if (words.length < 1 || words.length > 4) continue;
        if (words.length === 1 && line.length < 4) continue;

        const stopWords = ['the', 'and', 'for', 'with', 'via', 'from', 'in', 'at', 'to', 'of', 'on', 'by', 'is', 'as', 'my', 'i', 'an', 'or', 'be', 'excellent', 'good', 'proficient'];
        if (words.some(w => stopWords.includes(w.toLowerCase()))) continue;

        // 4. Scoring
        let score = 0;
        score += Math.max(0, (40 - i) * 2);

        const isTitleCase = words.every(w => /^[A-Z]/.test(w));
        const isAllCaps = line === line.toUpperCase() && /[A-Z]/.test(line);

        if (isTitleCase) score += 40;
        else if (isAllCaps) score += 20;
        else continue;

        if (line.length < 5) score -= 10;
        if (words.length === 2) score += 15;
        if (words.length === 1 && isTitleCase) score += 10;

        if (['senior', 'junior', 'lead', 'principal', 'staff', 'architect'].some(t => lower.includes(t))) score -= 30;

        if (score > maxScore) {
            maxScore = score;
            candidateName = line;
        }
    }

    // 6. Email (Regex)
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const candidateEmail = emailMatch ? emailMatch[0] : null;

    return { phone, linkedin, github, education, jobRole, certifications, candidateEmail, candidateName };
};

export const parseCandidateFromEmail = async (email, message, options = {}) => {
    const headers = message.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const date = new Date(parseInt(message.internalDate)).toISOString();

    const emailMatch = from.match(/<(.+)>/) || [null, from];
    const senderEmail = emailMatch[1];
    const senderName = from.split('<')[0].trim().replace(/"/g, '');

    // Filter blocklist
    // Use options.blocklist if provided, otherwise default
    const defaultBlocklist = ['no-reply', 'newsletter', 'notifications', 'update', 'promotions', 'coursera', 'freecodecamp', 'udemy', 'kittl'];
    const blocklist = options.blocklist ? options.blocklist : defaultBlocklist;

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

                // VALIDATE RESUME CONTENT
                if (!isValidResume(text)) {
                    console.log(`[Validation] Skipped non-resume file: ${part.filename}`);
                    continue;
                }

                // Upload to Drive (Skip if requested for speed/preview)
                let resumeLink = 'N/A';
                if (!options.skipUpload) {
                    resumeLink = await driveService.uploadResume(email, part.filename, part.mimeType, buffer);
                }

                // Extract Details
                const details = extractDetails(text);

                // Skills & Experience (Comprehensive)
                const foundSkills = new Set();
                ALL_SKILLS.forEach(skill => {
                    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    // Word boundary check
                    if (new RegExp(`(\\b|^)${escapedSkill}(\\b|$)`, 'i').test(text)) {
                        foundSkills.add(skill);
                    }
                });

                const experienceMatch = text.match(/(\d+)\+?\s*years?/i);
                const experience = experienceMatch ? parseInt(experienceMatch[1]) : 0;

                const visaStatus = VISA_KEYWORDS.find(v => new RegExp(`\\b${v}\\b`, 'i').test(text)) || 'Unknown';

                candidates.push({
                    id: message.id + '_' + part.partId, // Unique ID per attachment
                    name: details.candidateName || senderName || senderEmail || "N/A", // ONLY extracted name, fallback to senderName or email
                    email: details.candidateEmail || "N/A", // ONLY extracted email
                    phone: details.phone,
                    linkedin: details.linkedin,
                    github: details.github,
                    education: details.education,
                    jobRole: details.jobRole,
                    certifications: details.certifications,
                    skills: Array.from(foundSkills),
                    experience,
                    visaStatus,
                    date,
                    resumeLink,
                    resumeType,
                    subject,
                    originalText: text // Include text for reading
                });
            }
        }
    }

    // Fallback if no attachments found: REMOVED as per user request (only resume attachments allowed)
    // Fallback if no attachments found: Strict Skip (Restored)
    if (!hasAttachments) {
        console.log(`Skipping message ${message.id} - No resume attachment found.`);
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

export const getGroupedEmails = async (email) => {

    try {
        // 1. Fetch recent job-related emails
        const messages = await listUnreadMessages(email);

        // 2. Parse details from each email
        const grouped = {};

        // Use ALL_SKILLS for comprehensive grouping instead of a limited set
        // We do NOT pre-initialize keys to avoid empty groups for all 100+ skills

        const promises = messages.map(async (msg) => {
            try {
                const rawMsg = await getMessage(email, msg.id);
                const candidates = await parseCandidateFromEmail(email, rawMsg, { skipUpload: true });

                if (candidates.length > 0) {
                    const skillsInEmail = new Set();
                    candidates.forEach(c => c.skills.forEach(s => skillsInEmail.add(s)));

                    const emailData = {
                        id: msg.id,
                        snippet: rawMsg.snippet,
                        subject: candidates[0].subject,
                        from: candidates[0].name,
                        date: candidates[0].date,
                        messageId: msg.id,
                        body: candidates[0].originalText || rawMsg.snippet
                    };

                    skillsInEmail.forEach(skill => {
                        // All skills in candidates are already from ALL_SKILLS (canonical)
                        // But we verify against ALL_SKILLS just in case custom skills are added later
                        const key = ALL_SKILLS.find(s => s.toLowerCase() === skill.toLowerCase());

                        if (key) {
                            if (!grouped[key]) {
                                grouped[key] = [];
                            }
                            grouped[key].push(emailData);
                        }
                    });
                }
            } catch (err) {
                console.error(`Error processing message ${msg.id} for grouping:`, err);
            }
        });

        await Promise.all(promises);

        // Save to Cache
        await EmailCache.findOneAndUpdate(
            { email },
            {
                data: grouped,
                timestamp: new Date()
            },
            { upsert: true }
        );

        return grouped;

    } catch (error) {
        console.error("Failed to fetch live emails:", error);

        // Return cached data if available
        const cached = await EmailCache.findOne({ email });
        if (cached) {
            console.log("Returning cached emails for", email);
            return {
                ...cached.data,
                _isCached: true,
                _timestamp: cached.timestamp
            };
        }

        throw error;
    }
};
