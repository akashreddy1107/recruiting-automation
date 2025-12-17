
import { parseCandidateFromEmail } from './gmailService.js';

const mockMessage = {
    id: '123',
    internalDate: '1600000000000',
    payload: {
        headers: [
            { name: 'Subject', value: 'Test Resume' },
            { name: 'From', value: 'Test User <test@example.com>' }
        ],
        body: {
            data: Buffer.from('I am a Software Engineer with skills in React, Node, and Python.').toString('base64')
        }
    }
};

const runTest = async () => {
    try {
        console.log("Testing parseCandidateFromEmail...");
        const candidates = await parseCandidateFromEmail('input@test.com', mockMessage);

        if (candidates.length === 0) {
            console.error("FAIL: No candidates extracted.");
            return;
        }

        const candidate = candidates[0];
        console.log("Extracted Skills:", candidate.skills);

        if (Array.isArray(candidate.skills)) {
            console.log("PASS: Skills is an Array.");

            // Simulate the failing line
            const filtered = candidate.skills.filter(s => s === 'React');
            console.log("Filter check passed. Result:", filtered);
        } else {
            console.error("FAIL: Skills is NOT an Array. Type:", typeof candidate.skills);
            console.error("Value:", candidate.skills);
        }

    } catch (err) {
        console.error("Error during test:", err);
    }
};

runTest();
