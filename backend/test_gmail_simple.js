import { listUnreadMessages, getMessage } from './services/gmailService.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const EMAIL = "akashreddy1107@gmail.com";

async function debug() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected.");

        console.log("--- DEBUGGER ---");
        // Test query with NO date filter to ensure we see everything
        const messages = await listUnreadMessages(EMAIL, null, 20);
        console.log(`Query found ${messages.length} messages.`);

        if (messages.length > 0) {
            for (let i = 0; i < Math.min(messages.length, 10); i++) {
                const msg = await getMessage(EMAIL, messages[i].id);
                const subject = msg.payload.headers.find(h => h.name === 'Subject')?.value;
                // Helper for this script
                const flatten = (p) => {
                    let f = [];
                    if (!p) return f;
                    for (const x of p) {
                        f.push(x);
                        if (x.parts) f = f.concat(flatten(x.parts));
                    }
                    return f;
                };

                const parts = flatten(msg.payload.parts);
                const hasAttachment = parts.some(p => p.filename && (p.filename.endsWith('.pdf') || p.filename.endsWith('.docx')));
                console.log(`[${i}] Subject: ${subject}`);
                console.log(`    Has Attachment: ${hasAttachment ? 'YES' : 'NO'}`);
                if (hasAttachment) {
                    const files = parts.filter(p => p.filename && (p.filename.endsWith('.pdf') || p.filename.endsWith('.docx'))).map(p => p.filename);
                    console.log(`    Files: ${files.join(', ')}`);
                }
            }
        }

    } catch (e) {
        console.error("ERROR:", e);
    } finally {
        await mongoose.disconnect();
    }
}

debug();
