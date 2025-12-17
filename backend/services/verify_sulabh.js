
import { ALL_SKILLS } from './skills.js';

const extractDetails = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let candidateName = null;
    let maxScore = 0;

    // Define Blocklists (Copied from gmailService.js)
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
    const roles = ['Software Engineer', 'Developer', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data Scientist', 'Manager', 'Analyst', 'Architect', 'Administrator', 'Consultant', 'Specialist', 'Technician', 'Director', 'Lead', 'Associate', 'Intern', 'Scientist', 'Coordinator'];

    for (let i = 0; i < Math.min(lines.length, 50); i++) {
        let line = lines[i];
        console.log(`\n--- Line ${i}: "${line}" ---`);

        // Check 1
        const splitMatch = line.match(/\s+[|–\-(]\s+|[|–\-(]/);
        if (splitMatch) line = line.substring(0, splitMatch.index).trim();
        if (line.includes(',')) line = line.split(',')[0].trim();

        if (line.length < 3 || line.length > 35) { console.log("Fail: Length"); continue; }

        const lower = line.toLowerCase();
        if (/\d/.test(line)) { console.log("Fail: Digits"); continue; }
        if (/[@.www]/.test(lower)) { console.log("Fail: URL/Email"); continue; }

        if (blockedTerms.some(t => lower.includes(t))) {
            console.log(`Fail: Blocked Term (${blockedTerms.find(t => lower.includes(t))})`); continue;
        }
        if (roles.some(r => lower.includes(r.toLowerCase()))) { console.log("Fail: Role"); continue; }
        if (companySuffixes.some(s => lower.endsWith(' ' + s) || lower.includes(' ' + s + ' '))) { console.log("Fail: Company"); continue; }

        if (['green card', 'visa', 'h1b', 'citizen', 'permanent resident'].some(v => lower.includes(v))) { console.log("Fail: Visa"); continue; }
        if (lower.startsWith('certified') || lower.includes('certification')) { console.log("Fail: Cert"); continue; }
        if (ALL_SKILLS.some(skill => lower === skill.toLowerCase())) { console.log("Fail: Skill"); continue; }
        if (line.includes(':')) { console.log("Fail: Colon"); continue; }

        const words = line.split(/\s+/);
        if (words.length < 1 || words.length > 4) { console.log(`Fail: Word Count (${words.length})`); continue; }
        if (words.length === 1 && line.length < 4) { console.log("Fail: Single word too short"); continue; }

        const stopWords = ['the', 'and', 'for', 'with', 'via', 'from', 'in', 'at', 'to', 'of', 'on', 'by', 'is', 'as', 'my', 'i', 'an', 'or', 'be', 'excellent', 'good', 'proficient'];
        if (words.some(w => stopWords.includes(w.toLowerCase()))) { console.log("Fail: Stop Word"); continue; }

        let score = 0;
        score += Math.max(0, (40 - i) * 2);

        const isTitleCase = words.every(w => /^[A-Z]/.test(w));
        const isAllCaps = line === line.toUpperCase() && /[A-Z]/.test(line);

        if (isTitleCase) score += 40;
        else if (isAllCaps) score += 20;
        else { console.log("Fail: Formatting"); continue; }

        if (line.length < 5) score -= 10;
        if (words.length === 2) score += 15;
        if (words.length === 1 && isTitleCase) score += 10;
        if (['senior', 'junior', 'lead', 'principal', 'staff', 'architect'].some(t => lower.includes(t))) score -= 30;

        console.log(`PASS! Score: ${score}`);
        if (score > maxScore) {
            maxScore = score;
            candidateName = line;
        }
    }
    return candidateName;
};

const text = "Sulabh\n571 463 4744 | ravidatasiva@gmail.com\nPROFESSIONAL SUMMARY";
console.log("Result:", extractDetails(text));
