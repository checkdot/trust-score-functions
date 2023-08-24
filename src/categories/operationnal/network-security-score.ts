import { runner } from "../../checker";

const getOperationnalNetworkSecurityCheck = (project: any) => {
    const checkResult = runner(project, [
        { lbl: 'FTP service accessible', key: 'FTP', fn: (s: any) => s['FTP'] == 'Open', status: 'Open', error: project.websiteBroken, description: 'The File Transfer Protocol (FTP) port is open and accessible from the public internet.' },
        { lbl: 'FTPS service accessible', key: 'FTPS', fn: (s: any) => s['FTPS'] == 'Open', status: 'Open', error: project.websiteBroken, description: 'The  File Transfer Protocol over SSL/TLS (FTPS) port is open and accessible from the public internet.' },
        { lbl: 'SMTP service accessible', key: 'SMTP', fn: (s: any) => s['SMTP'] == 'Open', status: 'Open', error: project.websiteBroken, description: 'The Simple Mail Transfer Protocol (SMTP) port is open and accessible from the public internet.' },
        { lbl: 'LDAP service accessible', key: 'LDAP', fn: (s: any) => s['LDAP'] == 'Open', status: 'Open', error: project.websiteBroken, description: 'The Lightweight Directory Access Protocol (LDAP) port is open and accessible from the public internet.' },
        { lbl: 'rsync service accessible', key: 'rsync', fn: (s: any) => s['rsync'] == 'Open', status: 'Open', error: project.websiteBroken, description: 'The remote synchronization Protocol (rsync) port is open and accessible from the public internet.' },
        { lbl: 'PPTP service accessible', key: 'PPTP', fn: (s: any) => s['PPTP'] == 'Open', status: 'Open', error: project.websiteBroken, description: 'The Point-to-point tunneling protocol - RFC 2637 (PPTP) port is open and accessible from the public internet.' },
        { lbl: 'RDP service accessible', key: 'RDP', fn: (s: any) => s['RDP'] == 'Open', status: 'Open', error: project.websiteBroken, description: 'The Windows Remote Desktop Protocol (RDP) port is open and accessible from the public internet.' },
        { lbl: 'VNC service accessible', key: 'VNC', fn: (s: any) => s['VNC'] == 'Open', status: 'Open', error: project.websiteBroken, description: 'The Virtual Network Computing (VNC) port is open and accessible from the public internet.' }
      ], (project: any) => project?.security?.networkSecurity);
    return checkResult;
}

const getOperationnalNetworkSecurityScore = (project: any) => {
    return getOperationnalNetworkSecurityCheck(project).passedPercentage;
};

export {
    getOperationnalNetworkSecurityCheck,
    getOperationnalNetworkSecurityScore
};