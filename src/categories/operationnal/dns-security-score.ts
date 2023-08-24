import { runner } from "../../checker";

const getOperationnalDnsSecurityCheck = (project: any) => {
    const checkResult = runner(project, [
        { lbl: 'Missing SPF record', fn: (s: any) => s['SPF'] == 'Missing', status: false, error: project.websiteBroken, description: 'The File Transfer Protocol (FTP) port is open and accessible from the public internet.' },
        { lbl: 'Missing DMARC record', fn: (s: any) => s['DMARC'] == 'Missing', status: false, error: project.websiteBroken, description: 'The  File Transfer Protocol over SSL/TLS (FTPS) port is open and accessible from the public internet.' },
        { lbl: 'Missing DKIM Record', fn: (s: any) => s['DKIM'] == 'Missing', status: false, error: project.websiteBroken, description: 'The Simple Mail Transfer Protocol (SMTP) port is open and accessible from the public internet.' },
      ], (project: any) => project?.security?.networkSecurity);
    return checkResult;
}

const getOperationnalDnsSecurityScore = (project: any) => {
    return getOperationnalDnsSecurityCheck(project).passedPercentage;
};

export {
    getOperationnalDnsSecurityCheck,
    getOperationnalDnsSecurityScore
};