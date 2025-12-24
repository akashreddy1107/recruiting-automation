export const calculateScore = (candidate, criteria = {}, weights = {}) => {
    let score = 0;
    const breakdown = [];

    // Default Criteria
    const requiredSkills = criteria.skills || ['React', 'Node', 'JavaScript'];
    const minExperience = criteria.experience || 2;
    const preferredVisa = criteria.visa || ['Citizen', 'Green Card'];

    // Default Weights (if not provided)
    const wSkills = weights.skillsWeight !== undefined ? weights.skillsWeight : 50;
    const wExperience = weights.experienceWeight !== undefined ? weights.experienceWeight : 30;
    const wVisa = weights.visaWeight !== undefined ? weights.visaWeight : 20;

    // Skills Score
    const matchedSkills = candidate.skills.filter(s => requiredSkills.some(rs => rs.toLowerCase() === s.toLowerCase()));
    // Calculate ratio of matched skills to total possible score for skills
    // Logic: If you have all skills, you get full wSkills points.
    // Let's keep it simple: (matched / required) * wSkills? 
    // Or old logic: min(matched * 10, max) -> now min(matched * 10, wSkills)
    const skillScore = Math.min(matchedSkills.length * 10, wSkills);
    score += skillScore;
    breakdown.push({ label: 'Skills Match', score: skillScore, details: matchedSkills.join(', ') });

    // Experience Score
    let expScore = 0;
    if (candidate.experience >= minExperience) {
        // Base points for meeting req + bonus
        // Old: 20 + bonus. New: (2/3 of wExperience) + bonus?
        // Let's scale it: If met, get 70% of wExperience. Rest 30% for extra years.
        const baseExp = Math.floor(wExperience * 0.7);
        const bonusPerYear = Math.floor(wExperience * 0.1); // 10% per extra year
        const maxBonus = wExperience - baseExp;

        expScore = baseExp + Math.min((candidate.experience - minExperience) * bonusPerYear, maxBonus);
    }
    score += expScore;
    breakdown.push({ label: 'Experience', score: expScore, details: `${candidate.experience} years` });

    // Visa Score
    let visaScore = 0;
    if (preferredVisa.some(v => candidate.visaStatus.toLowerCase().includes(v.toLowerCase()))) {
        visaScore = wVisa;
    } else if (candidate.visaStatus !== 'Unknown') {
        visaScore = Math.floor(wVisa * 0.25); // 25% points for having status known but not preferred
    }
    score += visaScore;
    breakdown.push({ label: 'Visa Status', score: visaScore, details: candidate.visaStatus });

    return {
        total: Math.min(score, 100),
        breakdown
    };
};
