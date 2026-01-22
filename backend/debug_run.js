import { listUnreadMessages, getMessage, parseCandidateFromEmail } from './services/gmailService.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const EMAIL = "akashreddy1107@gmail.com"; // User's email

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected.");

        console.log("--- DEBUG START ---");
        // 1. Check Query matches
        // Pass null for startDate to search ALL time
        const messages = await listUnreadMessages(EMAIL, null, 50);
        console.log(`[Debug] listUnreadMessages found: ${messages.length} messages.`);

        if (messages.length > 0) {
            console.log("[Debug] Dumping first 3 message snippets:");
            for (let i = 0; i < Math.min(messages.length, 3); i++) {
                const msg = await getMessage(EMAIL, messages[i].id);
                console.log(`\nEmail ${i + 1}:`);
                console.log(`Subject: ${msg.payload.headers.find(h => h.name === 'Subject')?.value}`);
                console.log(`Snippet: ${msg.snippet}`);

                // Check if it parses
                const candidates = await parseCandidateFromEmail(EMAIL, msg, { skipUpload: true });
                console.log(`Candidates extracted: ${candidates.length}`);
                if (candidates.length === 0) {
                    // Check attachments
                    const parts = msg.payload.parts || [];
                    const attachments = parts.filter(p => p.filename && p.body.attachmentId);
                    console.log(`Attachments found: ${attachments.length} (${attachments.map(a => a.filename).join(', ')})`);
                }
            }
        } else {
            console.log("[Debug] No messages found. The query might be too restrictive.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

debug();
