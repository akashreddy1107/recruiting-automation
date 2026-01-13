import Settings from '../models/Settings.js';

export const getSettings = async (req, res) => {
    try {
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

        // Use a fixed key 'default' for single-tenant app
        let settings = await Settings.findOne({ key: 'default' });

        if (!settings) {
            settings = await Settings.create({ key: 'default', ...defaults });
        }

        // Merge defaults with found settings to ensure all fields are present for frontend
        // This fixes the issue where an existing settings doc (created before schema update) causes crashes
        const mergedSettings = {
            ...defaults,
            ...settings.toObject(),
            jobDefaults: { ...defaults.jobDefaults, ...settings.jobDefaults },
            scoring: { ...defaults.scoring, ...settings.scoring },
            email: { ...defaults.email, ...settings.email }
        };

        res.json(mergedSettings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { key: 'default' },
            { $set: req.body }, // Only update fields sent
            { new: true, upsert: true }
        );
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
