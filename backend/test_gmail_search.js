
import { google } from 'googleapis';
import mongoose from 'mongoose';
import User from './models/User.js';
import * as authService from './services/authService.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log("Connecting to Mongo:", process.env.MONGODB_URI);
await mongoose.connect(process.env.MONGODB_URI);
console.log("Connected to DB.");

async function testSearch() {
    try {
        const user = await User.findOne({});
        if (!user) {
            console.error("No user found in DB. Please login first.");
            process.exit(1);
        }
        console.log("Using User:", user.email);

        const client = authService.getClient();
        client.setCredentials(user.tokens);
        const gmail = google.gmail({ version: 'v1', auth: client });

        // Criteria 1: Broad Search (Everything)
        console.log("\n--- TEST 1: Broad Search (No filters) ---");
        const res1 = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10
        });
        console.log(`Found ${res1.data.resultSizeEstimate} messages.`);
        if (res1.data.messages) {
            res1.data.messages.forEach(m => console.log(` - ID: ${m.id}`));
        } else {
            console.log("No messages found.");
        }

        // Criteria 2: With original keywords
        console.log("\n--- TEST 2: Original Keyword Filter ---");
        const q = '(subject:"application" OR subject:"resume" OR subject:"hiring" OR subject:"job" OR "apply" OR "candidate")';
        const res2 = await gmail.users.messages.list({
            userId: 'me',
            q: q,
            maxResults: 10
        });
        console.log(`Query: ${q}`);
        console.log(`Found ${res2.data.resultSizeEstimate} matches.`);

    } catch (error) {
        console.error("Search Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

testSearch();
