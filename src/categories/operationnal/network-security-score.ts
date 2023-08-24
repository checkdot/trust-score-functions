import { runner } from "../../checker";

const getOperationnalNetworkSecurityCheck = (project: any) => {
    const checkResult = runner(project, [
        { lbl: 'FTP service accessible', key: 'FTP', status: 'Open', error: project.websiteBroken, description: 'The File Transfer Protocol (FTP) port is open and accessible from the public internet.' },
        { lbl: 'FTPS service accessible', key: 'FTPS', status: 'Open', error: project.websiteBroken, description: 'The  File Transfer Protocol over SSL/TLS (FTPS) port is open and accessible from the public internet.' },
        { lbl: 'SMTP service accessible', key: 'SMTP', status: 'Open', error: project.websiteBroken, description: 'The Simple Mail Transfer Protocol (SMTP) port is open and accessible from the public internet.' },
        { lbl: 'LDAP service accessible', key: 'LDAP', status: 'Open', error: project.websiteBroken, description: 'The Lightweight Directory Access Protocol (LDAP) port is open and accessible from the public internet.' },
        { lbl: 'rsync service accessible', key: 'rsync', status: 'Open', error: project.websiteBroken, description: 'The remote synchronization Protocol (rsync) port is open and accessible from the public internet.' },
        { lbl: 'PPTP service accessible', key: 'PPTP', status: 'Open', error: project.websiteBroken, description: 'The Point-to-point tunneling protocol - RFC 2637 (PPTP) port is open and accessible from the public internet.' },
        { lbl: 'RDP service accessible', key: 'RDP', status: 'Open', error: project.websiteBroken, description: 'The Windows Remote Desktop Protocol (RDP) port is open and accessible from the public internet.' },
        { lbl: 'VNC service accessible', key: 'VNC', status: 'Open', error: project.websiteBroken, description: 'The Virtual Network Computing (VNC) port is open and accessible from the public internet.' }
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