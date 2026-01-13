
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as runController from './controllers/runController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

console.log("Starting Test Run Simulation...");

async function testRun() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected.");

        // Mock Request and Response
        const req = {
            body: {
                email: "akashreddy1107@gmail.com", // Hardcoded for test
                startDate: "2020-01-01",
                skills: "React, Node",
                experience: 0,
                visa: "Citizen"
            },
            query: {}
        };

        const res = {
            status: (code) => ({
                json: (data) => {
                    console.log(`[Response ${code}]:`, JSON.stringify(data, null, 2));
                }
            }),
            json: (data) => {
                console.log("[Response 200]: Run Completed Successfully");
                console.log("Found Candidates:", data.candidates.length);
                if (data.candidates.length > 0) {
                    console.log("Sample Candidate:", data.candidates[0].name);
                }
            }
        };

        console.log("Invoking Controller...");
        await runController.startRun(req, res);

    } catch (error) {
        console.error("FATAL TEST ERROR:", error);
    } finally {
        await mongoose.disconnect();
    }
}

testRun();
