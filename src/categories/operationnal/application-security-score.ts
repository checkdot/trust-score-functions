import { runner } from "../../checker";

const getOperationnalApplicationSecurityCheck = (project: any) => {
    const checkResult = runner(project, [
        { lbl: 'Missing X-Frame-Options header', fn: (s: any) => project.websiteBroken || s['X-Frame-Options'] == 'Missing', status: true, description: 'The server is not providing the X-Frame-Options security header in HTTP responses.\nThis might allow attackers to potentially perform clickjacking attacks by embedding the site\'s content in malicious frames on other sites.' },
        { lbl: 'Missing Strict-Transport-Security header', fn: (s: any) => project.websiteBroken || s['Strict-Transport-Security'] == 'Missing', status: true, description: 'The server is missing the Strict-Transport-Security (HSTS) security header in HTTP responses.\nThis could expose the site to SSL stripping attacks, allowing attackers to redirect users to an insecure HTTP connection.' },
        { lbl: 'Missing X-Content-Type-Options header', fn: (s: any) => project.websiteBroken || s['X-Content-Type-Options'] == 'Missing', status: true, description: 'The X-Content-Type-Options header is not included in HTTP responses.\nThis could potentially allow attackers to exploit vulnerabilities related to unexpected content execution.' },
        { lbl: 'Missing Meta Content-Security-Policy (CSP)', fn: (s: any) => project.websiteBroken || s['Content-Security-Policy'] == 'Missing', name: 'LDAP', status: true, description: 'The Content Security Policy (CSP) is not specified via a meta tag in the HTML code.\nThis could leave the site vulnerable to cross-site scripting (XSS) attacks and other types of code injection.' },
        { lbl: 'HTTP access enabled', fn: (s: any) => project.websiteBroken || s['Http-Protocol-Redirection'] == false, status: true, description: 'HTTP access is enabled on the server, which could expose the site to security risks as HTTP communications are not encrypted.' },
        { lbl: 'HTTPS self-signed certificate', fn: (s: any) => project.websiteBroken || s['SSL']['selfSigned'] == true, status: true, description: 'The HTTPS server is using a self-signed SSL/TLS certificate, which may trigger security warnings in browsers and does not guarantee the authenticity of the site.' },
        { lbl: 'HTTPS bad host certificate', fn: (s: any) => project.websiteBroken || s['SSL']['validHost'] == false, status: true, description: 'The HTTPS server\'s SSL/TLS certificate does not match the hostname the user is trying to access.\nThis could indicate an attempt to impersonate the site.' },
        { lbl: 'HTTPS certificate expired', fn: (s: any) => project.websiteBroken || s['SSL']['expired'] == true, status: true, description: 'The HTTPS server\'s SSL/TLS certificate has expired.\nThis could prevent users from accessing the site due to security issues related to the certificate\'s validity.' },
        { lbl: 'Support Deprecated SSL protocols', fn: (s: any) => project.websiteBroken || s['SSL']['SSLv2'] == 'Enabled' || s['SSL']['SSLv3'] == 'Enabled', status: true, description: 'The server supports deprecated SSL protocols like SSLv2 and SSLv3, which have known vulnerabilities.\nThis could expose the site to POODLE attacks and other security flaws.' },
        { lbl: 'Support Deprecated TLS versions', fn: (s: any) => project.websiteBroken || s['SSL']['TLSv1'] == 'Enabled' || s['SSL']['TLSv11'] == 'Enabled', name: 'VNC', status: true, description: 'The server supports outdated versions of the TLS protocol, such as TLSv1 and TLSv11, which might have vulnerabilities.\nThis could expose the site to security risks.' }
    ], (project: any) => project?.security?.applicationSecurity);    
    return checkResult;
};

const getOperationnalApplicationSecurityScore = (project: any) => {
    if (project.websiteBroken) {
        return 0;
    }
    return getOperationnalApplicationSecurityCheck(project).passedPercentage;
};

export {
    getOperationnalApplicationSecurityCheck,
    getOperationnalApplicationSecurityScore
};