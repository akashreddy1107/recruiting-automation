
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { listUnreadMessages, getMessage, parseCandidateFromEmail } from './services/gmailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const EMAIL = "akashreddy1107@gmail.com";

async function testParsing() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected.");

        // 1. Find the Fwd message
        console.log("Searching for 'Fwd:' emails...");
        const messages = await listUnreadMessages(EMAIL, null, 50); // Fetch 50 to be safe

        let targetMsg = null;
        for (const msg of messages) {
            const fullMsg = await getMessage(EMAIL, msg.id);
            const subject = fullMsg.payload.headers.find(h => h.name === 'Subject')?.value || '';
            if (subject.includes('Fwd:')) {
                console.log(`Found target email: ${subject}`);
                targetMsg = fullMsg;
                break;
            }
        }

        if (!targetMsg) {
            console.log("Could not find any 'Fwd:' email to test.");
            return;
        }

        // 2. Test Parsing
        console.log("Testing parseCandidateFromEmail on this message...");
        const candidates = await parseCandidateFromEmail(EMAIL, targetMsg);

        console.log("--- PARSE RESULT ---");
        console.log(JSON.stringify(candidates, null, 2));

        if (candidates.length > 0) {
            console.log("SUCCESS: Candidate parsed.");
        } else {
            console.log("FAILURE: No candidates parsed from this email.");
        }

    } catch (e) {
        console.error("ERROR MESSAGE:", e.message);
        if (e.response) {
            console.error("API ERROR DATA:", JSON.stringify(e.response.data, null, 2));
        }
    } finally {
        await mongoose.disconnect();
    }
}

testParsing();
