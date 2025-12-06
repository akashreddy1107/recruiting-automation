
const extractDetails = (text) => {
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : 'N/A';

    const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+/);
    const linkedin = linkedinMatch ? `https://www.${linkedinMatch[0]}` : 'N/A';

    const githubMatch = text.match(/github\.com\/[a-zA-Z0-9-]+/);
    const github = githubMatch ? `https://www.${githubMatch[0]}` : 'N/A';

    // Basic Education Extraction (heuristic)
    const educationKeywords = ['Bachelor', 'Master', 'PhD', 'B.Sc', 'M.Sc', 'B.Tech', 'M.Tech', 'University', 'College'];
    const educationLines = text.split('\n').filter(line => educationKeywords.some(k => line.includes(k))).slice(0, 2); // Take top 2 matches
    const education = educationLines.length > 0 ? educationLines.join('; ').trim() : 'N/A';

    // Job Role (heuristic - look for common titles near top or in experience)
    const roles = ['Software Engineer', 'Developer', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data Scientist', 'Manager'];
    const jobRoleMatch = text.split('\n').find(line => roles.some(r => line.includes(r)));
    const jobRole = jobRoleMatch ? jobRoleMatch.trim() : 'N/A';

    // Certifications
    const certKeywords = ['Certified', 'Certificate', 'AWS', 'Azure', 'GCP', 'PMP'];
    const certLines = text.split('\n').filter(line => certKeywords.some(k => line.includes(k) && line.length < 100)).slice(0, 3);
    const certifications = certLines.length > 0 ? certLines.join('; ').trim() : 'N/A';

    return { phone, linkedin, github, education, jobRole, certifications };
};

const sampleText = `
John Doe
Software Engineer
Phone: 123-456-7890
Email: john@example.com
LinkedIn: linkedin.com/in/johndoe
GitHub: github.com/johndoe

Education:
B.Sc Computer Science, University of Tech

Certifications:
AWS Certified Solutions Architect
`;

console.log(extractDetails(sampleText));
