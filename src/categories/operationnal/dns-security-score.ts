import { runner } from "../../checker";

const getOperationnalDnsSecurityCheck = (project: any) => {
    const checkResult = runner(project, [
        { lbl: 'Missing SPF record', fn: (s: any) => s['SPF'] == 'Missing', status: false, description: 'The server is missing the Sender Policy Framework (SPF) record in DNS.\nThis record helps prevent email spoofing and phishing attacks.' },
        { lbl: 'Missing DMARC record', fn: (s: any) => s['DMARC'] == 'Missing', status: false, description: 'The server is missing the Domain-based Message Authentication, Reporting, and Conformance (DMARC) record in DNS.\nDMARC helps protect against email spoofing and phishing attempts.' },
        { lbl: 'Missing DKIM Record', fn: (s: any) => s['DKIM'] == 'Missing', status: false, description: 'The server is missing the DomainKeys Identified Mail (DKIM) record in DNS.\nDKIM helps verify the authenticity of email messages.' },
    ], (project: any) => project?.security?.dnsSecurity);
    return checkResult;
}

const getOperationnalDnsSecurityScore = (project: any) => {
    return getOperationnalDnsSecurityCheck(project).passedPercentage;
};

export {
    getOperationnalDnsSecurityCheck,
    getOperationnalDnsSecurityScore
};