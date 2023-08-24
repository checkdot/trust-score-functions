import { runner } from "../../checker";

const getOperationnalApplicationSecurityCheck = (project: any) => {
    const checkResult = runner(project, [
        { lbl: 'Missing X-Frame-Options header', fn: (s: any) => s['X-Frame-Options'] == 'Missing', status: false, error: project.websiteBroken, description: 'The File Transfer Protocol (FTP) port is open and accessible from the public internet.' },
        { lbl: 'Missing Strict-Transport-Security header', fn: (s: any) => s['Strict-Transport-Security'] == 'Missing', status: false, error: project.websiteBroken, description: 'The  File Transfer Protocol over SSL/TLS (FTPS) port is open and accessible from the public internet.' },
        { lbl: 'Missing X-Content-Type-Options header', fn: (s: any) => s['X-Content-Type-Options'] == 'Missing', status: false, error: project.websiteBroken, description: 'The Simple Mail Transfer Protocol (SMTP) port is open and accessible from the public internet.' },
        { lbl: 'Missing Meta Content-Security-Policy (CSP)', fn: (s: any) => s['Content-Security-Policy'] == 'Missing', name: 'LDAP', status: false, error: project.websiteBroken, description: 'The Lightweight Directory Access Protocol (LDAP) port is open and accessible from the public internet.' },
        { lbl: 'HTTP access enabled', fn: (s: any) => s['Http-Protocol-Redirection'] == false, status: false, error: project.websiteBroken, description: 'The remote synchronization Protocol (rsync) port is open and accessible from the public internet.' },
        { lbl: 'HTTPS self-signed certificate', fn: (s: any) => s['SSL']['selfSigned'] == true, status: false, error: project.websiteBroken, description: 'The Point-to-point tunneling protocol - RFC 2637 (PPTP) port is open and accessible from the public internet.' },
        { lbl: 'HTTPS bad host certificate', fn: (s: any) => s['SSL']['validHost'] == false, status: false, error: project.websiteBroken, description: 'The Windows Remote Desktop Protocol (RDP) port is open and accessible from the public internet.' },
        { lbl: 'HTTPS certificate expired', fn: (s: any) => s['SSL']['expired'] == true, status: false, error: project.websiteBroken, description: 'The Virtual Network Computing (VNC) port is open and accessible from the public internet.' },
        { lbl: 'Support Deprecated SSL protocols', fn: (s: any) => s['SSL']['SSLv2'] == 'Enabled' || s['SSL']['SSLv3'] == 'Enabled', status: false, error: project.websiteBroken, description: 'The Virtual Network Computing (VNC) port is open and accessible from the public internet.' },
        { lbl: 'Support Deprecated TLS versions', fn: (s: any) => s['SSL']['TLSv1'] == 'Enabled' || s['SSL']['TLSv11'] == 'Enabled', name: 'VNC', status: false, error: project.websiteBroken, description: 'The Virtual Network Computing (VNC) port is open and accessible from the public internet.' }
      ], (project: any) => project?.security?.networkSecurity);
      return checkResult;
};

const getOperationnalApplicationSecurityScore = (project: any) => {
    return getOperationnalApplicationSecurityCheck(project).passedPercentage;
};

export {
    getOperationnalApplicationSecurityCheck,
    getOperationnalApplicationSecurityScore
};