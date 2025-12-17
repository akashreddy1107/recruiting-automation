
// Mock logic from Updated gmailService.js 
import { ALL_SKILLS } from './skills.js';

const extractDetails = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // --- SCORED NAME EXTRACTION LOGIC (COPIED) ---
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
        'managed', 'developed', 'designed', 'implemented', 'orchestrated', 'holder', 'studio', 'intelligence', 'development', 'business'
    ];

    const companySuffixes = ['limited', 'ltd', 'inc', 'corp', 'corporation', 'llc', 'pvt', 'group', 'services', 'solutions', 'systems', 'technologies', 'consulting'];

    // Mock roles list
    const roles = ['Software Engineer', 'Developer', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data Scientist', 'Manager', 'Analyst', 'Architect', 'Administrator', 'Consultant', 'Specialist', 'Technician', 'Director', 'Lead', 'Associate', 'Intern', 'Scientist', 'Coordinator'];

    // Scan top 50 lines 
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

        // 2. Fatal Checks 
        if (/\d/.test(line)) continue;
        if (/[@.www]/.test(lower)) continue;
        if (blockedTerms.some(t => lower.includes(t))) continue;
        if (roles.some(r => lower.includes(r.toLowerCase()))) continue; // Looser role check
        if (companySuffixes.some(s => lower.endsWith(' ' + s) || lower.includes(' ' + s + ' '))) continue;

        // Visa check
        if (['green card', 'visa', 'h1b', 'citizen', 'permanent resident'].some(v => lower.includes(v))) continue;
        // Certification check (e.g. "Certified Kubernetes...")
        if (lower.startsWith('certified') || lower.includes('certification')) continue;

        if (ALL_SKILLS.some(skill => lower === skill.toLowerCase())) continue;
        if (line.includes(':')) continue;

        const words = line.split(/\s+/);
        // NEW: Allow single word names if robust
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
        // Boost single word
        if (words.length === 1 && isTitleCase) score += 10;

        if (['senior', 'junior', 'lead', 'principal', 'staff', 'architect'].some(t => lower.includes(t))) score -= 30;

        // Log rejected/accepted for debug
        if (score > 0) {
            console.log(`Checking: "${line}" | Valid: ${!blockedTerms.some(t => lower.includes(t))} | Score: ${score} | Words: ${words.length}`);
        }

        if (score > maxScore) {
            maxScore = score;
            candidateName = line;
        }
    }
    return candidateName;
};

// --- Test Cases from User Feedback ---
const testCases = [
    { name: "Subject Fail 1", text: "Data Science\nJohn Doe" }, // Should Extract John Doe
    { name: "Subject Fail 2", text: "Operating Systems: Red Hat Linux\nAlice Smith" }, // Should Extract Alice Smith
    { name: "Company Fail", text: "Infosys Limited\nBob Jones" }, // Should Extract Bob Jones
    { name: "Contractor Label", text: "Contractor Name: Charlie Brown\nSummary..." }, // Should Extract Charlie Brown
    { name: "Skill Fail", text: "Core Java\nDavid White" }, // Should Extract David White
    { name: "Narrative Fail", text: "Smart Narrative\nEve Black" }, // Should Extract Eve Black
    { name: "Adjective Fail", text: "Excellent Team Player\nFrank Green" }, // Should Extract Frank Green
    { name: "Prefix Test", text: "Name: George Blue\n..." }, // Should Extract George Blue
    { name: "Real Resume", text: "Resume\n\n\nSai Nikhil\nSoftware Engineer" }, // Should Extract Sai Nikhil
    { name: "Visa Fail", text: "Green Card Holder\nValid Name" }, // Should Extract Valid Name
    { name: "Cert Fail", text: "Certified Kubernetes Administrator\nReal Name" }, // Should Extract Real Name
    { name: "Verb Fail", text: "Created Dashboards\nDevin Person" }, // Should Extract Devin Person
    { name: "ETL Fail", text: "ETL Tools\nIan Data" }, // Should Extract Ian Data
    { name: "Sulabh Single Name", text: "Sulabh\n571 463 4744 | ...\nPROFESSIONAL SUMMARY" }, // Should Extract Sulabh
    { name: "Intelligence Block", text: "Intelligence Development Studio\nSai Nikhil Gowd Muppagowni\nSenior Java Full Stack Developer" } // Should Extract Sai Nikhil Gowd Muppagowni
];

console.log("--- Running Validation ---");
testCases.forEach(tc => {
    const result = extractDetails(tc.text);
    console.log(`Test '${tc.name}': Expected Name, Got '${result}'`);
});
