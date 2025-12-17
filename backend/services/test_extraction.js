
// Mock logic from gmailService.js for testing (simplified imports)
const extractDetails = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // --- SCORED NAME EXTRACTION LOGIC ---
    let candidateName = null;
    let maxScore = 0;

    const blockedTerms = [
        'resume', 'curriculum', 'vitae', 'cv', 'profile', 'summary', 'about', 'contact', 'mobile', 'phone', 'email', 'address', 'linkedin', 'github',
        'education', 'skills', 'experience', 'projects', 'certifications', 'languages', 'references', 'page', 'task order', 'job description',
        'citizen', 'visa', 'passport', 'nationality', 'date', 'birth', 'gender', 'marital', 'status', 'work', 'permit',
        'expertise', 'proficient', 'competent', 'declaration', 'objective', 'professional', 'certification', 'qualification', 'summary'
    ];

    const roles = ['Software Engineer', 'Developer', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data Scientist', 'Manager', 'Analyst', 'Architect', 'Administrator', 'Consultant', 'Specialist', 'Technician', 'Director', 'Lead', 'Associate', 'Intern', 'Scientist', 'Coordinator'];

    // Scan top 40 lines
    for (let i = 0; i < Math.min(lines.length, 40); i++) {
        let line = lines[i];

        const splitMatch = line.match(/\s+[|–\-(]\s+|[|–\-(]/);
        if (splitMatch) line = line.substring(0, splitMatch.index).trim();
        if (line.includes(',')) line = line.split(',')[0].trim();

        if (line.length < 3) continue;
        const lower = line.toLowerCase();

        if (/\d/.test(line)) continue;
        if (/[@.www]/.test(lower)) continue;
        if (blockedTerms.some(t => lower.includes(t))) continue;
        if (roles.some(r => lower.includes(r.toLowerCase()))) continue;

        const words = line.split(/\s+/);
        if (words.length < 2 || words.length > 5) continue;
        const stopWords = ['the', 'and', 'for', 'with', 'via', 'from', 'in', 'at', 'to', 'of', 'on', 'by', 'is', 'as', 'my', 'i', 'an', 'or', 'be'];
        if (words.some(w => stopWords.includes(w.toLowerCase()))) continue;

        let score = 0;
        score += (40 - i) * 2;

        const isTitleCase = words.every(w => /^[A-Z]/.test(w));
        const isAllCaps = line === line.toUpperCase() && /[A-Z]/.test(line);

        if (isTitleCase) score += 50;
        else if (isAllCaps) score += 30;
        else continue;

        console.log(`   -> Candidate: "${line}", Score: ${score}, Pos: ${i}`);

        if (score > maxScore) {
            maxScore = score;
            candidateName = line;
        }
    }

    // Mock Skill Extraction
    const ALL_SKILLS = ['Python', 'Java', 'React', '.NET', 'C#', 'C++', 'Go', 'AWS']; // Subset for testing
    const foundSkills = new Set();
    ALL_SKILLS.forEach(skill => {
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(`(\\b|^)${escapedSkill}(\\b|$)`, 'i').test(text)) {
            foundSkills.add(skill);
        }
    });

    return { candidateName, skills: Array.from(foundSkills) };
};

const testCases = [
    {
        name: "Standard Header",
        text: "John Doe\nSoftware Engineer\nSummary of skills..."
    },
    {
        name: "Header with Junk",
        text: "Resume\nPage 1\nAlice Smith\nContact: 12345"
    },
    {
        name: "All Caps Name",
        text: "RESUME OF\nBOB JONES\nEXPERIENCE..."
    },
    {
        name: "Name with Role Separator",
        text: "Charlie Brown - DevOps Engineer\nEmail: charlie@example.com"
    },
    {
        name: "Skills Check",
        text: "I know Python, Java, and React.js but not GoLang really."
    },
    {
        name: "False Positive Avoidance",
        text: "Task Order #123\nStart Date: Jan 2020\nSoftware Engineer Required\nValid Name Here"
    }
];

testCases.forEach(tc => {
    console.log(`\n--- Testing: ${tc.name} ---`);
    console.log(`Input:\n${tc.text.replace(/\n/g, '\\n')}`);
    const result = extractDetails(tc.text);
    console.log(`Result: Name=[${result.candidateName}], Skills=[${result.skills.join(', ')}]`);
});
