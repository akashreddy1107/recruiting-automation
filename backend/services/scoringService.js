export const calculateScore = (candidate, criteria = {}) => {
    let score = 0;
    const breakdown = [];

    // Default Criteria
    const requiredSkills = criteria.skills || ['React', 'Node', 'JavaScript'];
    const minExperience = criteria.experience || 2;
    const preferredVisa = criteria.visa || ['Citizen', 'Green Card'];

    // Skills Score (Max 50)
    const matchedSkills = candidate.skills.filter(s => requiredSkills.some(rs => rs.toLowerCase() === s.toLowerCase()));
    const skillScore = Math.min(matchedSkills.length * 10, 50);
    score += skillScore;
    breakdown.push({ label: 'Skills Match', score: skillScore, details: matchedSkills.join(', ') });

    // Experience Score (Max 30)
    let expScore = 0;
    if (candidate.experience >= minExperience) {
        expScore = 20 + Math.min((candidate.experience - minExperience) * 5, 10);
    }
    score += expScore;
    breakdown.push({ label: 'Experience', score: expScore, details: `${candidate.experience} years` });

    // Visa Score (Max 20)
    let visaScore = 0;
    if (preferredVisa.some(v => candidate.visaStatus.toLowerCase().includes(v.toLowerCase()))) {
        visaScore = 20;
    } else if (candidate.visaStatus !== 'Unknown') {
        visaScore = 5; // Some points for having status known
    }
    score += visaScore;
    breakdown.push({ label: 'Visa Status', score: visaScore, details: candidate.visaStatus });

    return {
        total: Math.min(score, 100),
        breakdown
    };
};
