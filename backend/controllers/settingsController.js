import db from '../data/db.js';

export const getSettings = async (req, res) => {
    try {
        await db.read();
        const defaults = {
            theme: 'dark',
            jobDefaults: {
                skills: 'React, Node, JavaScript',
                experience: 2,
                visa: 'Citizen, Green Card'
            },
            scoring: {
                skillsWeight: 50,
                experienceWeight: 30,
                visaWeight: 20
            },
            email: {
                blocklist: 'no-reply, newsletter, notifications',
                keywords: 'application, resume, hiring, job'
            }
        };

        // Merge saved settings with defaults to ensure all keys exist
        const settings = { ...defaults, ...db.data.settings };

        // If DB was empty/partial, save the merged full object back
        if (!db.data.settings || Object.keys(db.data.settings).length === 0) {
            db.data.settings = settings;
            await db.write();
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        await db.read();
        db.data.settings = { ...db.data.settings, ...req.body };
        await db.write();
        res.json(db.data.settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
