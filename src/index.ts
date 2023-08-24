import moment from 'moment';

const NO_SCORE_PERCENTAGE = 30;
// --------------------------
// TECHNICAL SCORE FUNCTIONS
// --------------------------
const getTechnicalGithubMonitoringScore = (project: any) => {
    const lastGithubDayIdCheck = project.github365 != undefined ? Object.keys(project.github365).filter((x: any) => !isNaN(x)).sort((a: any,b: any)=>a-b).reverse()[0] : 0;
            
    const getGithubStarsCountScore = (project: any, lastGithubDayIdCheck: any) => {
        const MAX_STARS = 100;
        return (project.github365[lastGithubDayIdCheck].stars_count <= MAX_STARS ? (project.github365[lastGithubDayIdCheck].stars_count / MAX_STARS) * 100 : 100);
    };

    const getGithubAccountAgeScore = (project: any, lastGithubDayIdCheck: any) => {
        const first_repo_at = project.github365[lastGithubDayIdCheck].first_repo_at;
        if (first_repo_at == undefined) {
            return 0;
        }
        const firstRepoAtDate = (new Date(first_repo_at)).getTime();
        const matureTargetDate = moment().subtract(1,'year').toDate().getTime();
        const timeBetween = moment().toDate().getTime() - matureTargetDate;
        const isRecentGithub = firstRepoAtDate > matureTargetDate ? true : false;
        const githubAccountAgeScore = isRecentGithub ? (100 - (((firstRepoAtDate - matureTargetDate) / timeBetween) * (100))) : 100;
        return githubAccountAgeScore;
    }

    const getGithubRepoCountScore = (project: any, lastGithubDayIdCheck: any) => {
        const MAX_REPOS = 10;
        return (project.github365[lastGithubDayIdCheck].repo_count <= MAX_REPOS ? (project.github365[lastGithubDayIdCheck].repo_count / MAX_REPOS) * 100 : 100);
    };

    const githubScore = project.github365 != undefined ? [
        // 33% of the score for stars check.
        getGithubStarsCountScore(project, lastGithubDayIdCheck) * 33 / 100,
        // 33% of the score for account age check.
        getGithubAccountAgeScore(project, lastGithubDayIdCheck) * 33 / 100,
        // 33% of the score for repo count check.
        getGithubRepoCountScore(project, lastGithubDayIdCheck) * 33 / 100,
    ].reduce((acc, s) => acc + s, 0) : NO_SCORE_PERCENTAGE; // 30% if no github.
    return githubScore;
};

const getTechnicalAuditScore = (project: any) => {
    let auditScore = 0;
    let reportScore = 30; // if no report the report score is always set at 30.
    if (project.audit != undefined) {
        auditScore = 100;
    }
    let totalScore = 0;
    if (project.report != undefined && project.report.status != 'KO') {
        // Si le projet.report.status est défini, c'est-à-dire que l'audit a réussi
        const highSeverityScore = (100 / (Number(project.report.high) + 1)) * 50 / 100;
        const mediumSeverityScore = (100 / (Number(project.report.medium) + 1)) * 30 / 100;
        const lowSeverityScore = (100 / (Number(project.report.low) + 1)) * 20 / 100;
        // Calcul du score total du rapport
        reportScore = highSeverityScore + mediumSeverityScore + lowSeverityScore;
        totalScore = (auditScore != 0 ? (auditScore / 2) + (reportScore / 2) : reportScore);
    } else {
        totalScore = auditScore;
    }
    return totalScore;
};

const getTechnicalCentralizationScanningScore = (project: any) => {

    const getContractUncertaintyScore = (contract: any) => {
        const securityList = [
            { lbl: 'Hidden Source Code', fn: (c: any) => c.is_open_source != '1' },
            { lbl: 'Proxy Contract', fn: (c: any) => c.is_proxy == '1' },
            { lbl: 'External Call Risk', fn: (c: any) => c.external_call == '1' },
            { lbl: 'Mint Function', fn: (c: any) => c.is_mintable == '1' },
            { lbl: 'Self Destruct', fn: (c: any) => c.selfdestruct == '1' }
        ].map((x: any) => {
            x.status = x.fn(contract); // fn return true it's invalid
            return {
              ... x,
              valid: x.status == false
            };
        });
        const passed = securityList.reduce((acc, x) => acc + (x.valid ? 1 : 0), 0);
        const attention = securityList.reduce((acc, x) => acc + (x.valid ? 0 : 1), 0);
        const passedPercentage = (passed / securityList.length) * 100;

        return {
            securityList: securityList,
            passed: passed,
            attention: attention,
            level: passedPercentage > 95 ? 'High' : passedPercentage > 70 ? 'Medium' : 'Low',
            scanned: contract != undefined,
            passedPercentage: passedPercentage
        };
    }
    const getContractOwnerPrivilegeScore = (contract: any) => {
        const securityList = [
            { lbl: 'Retrieve Ownership', fn: (c: any) => c.can_take_back_ownership == '1' },
            { lbl: 'Balance Modifiable', fn: (c: any) => c.owner_change_balance == '1' },
            { lbl: 'Hidden Owner', fn: (c: any) => c.hidden_owner == '1' },
            { lbl: 'Creator Percentage', fn: (c: any) => (c.creator_percent != undefined ? c.creator_percent*100 > 5 : false), getValue: (c: any) => `${(c.creator_percent != undefined ? c.creator_percent*100 : 0).toFixed(2)}%` },
            { lbl: 'Owner Percentage', fn: (c: any) => (c.owner_percent != undefined ? c.owner_percent*100 > 5 : false), getValue: (c: any) => `${(c.owner_percent != undefined ? c.owner_percent*100 : 0).toFixed(2)}%` },
        ].map((x: any) => {
            x.status = x.fn(contract); // fn return true it's invalid
            return {
              ... x,
              valid: x.status == false,
              value: (x.getValue != undefined ? x.getValue(contract) : undefined)
            };
        });
        const passed = securityList.reduce((acc, x) => acc + (x.valid ? 1 : 0), 0);
        const attention = securityList.reduce((acc, x) => acc + (x.valid ? 0 : 1), 0);
        const passedPercentage = (passed / securityList.length) * 100;

        return {
            securityList: securityList,
            passed: passed,
            attention: attention,
            level: passedPercentage > 95 ? 'High' : passedPercentage > 70 ? 'Medium' : 'Low',
            scanned: contract != undefined,
            passedPercentage: passedPercentage
        };
    }

    const getContractTradingContraintScore = (contract: any) => {
        const securityList = [
            { lbl: 'Honeypot', fn: (c: any) => c.is_honeypot == '1' },
            { lbl: 'Buy Tax', fn: (c: any) => (c.buy_tax != undefined ? c.buy_tax*100 > 3 : false), getValue: (c: any) => `${(c.buy_tax != undefined ? c.buy_tax*100 : 0).toFixed(2)}%` },
            { lbl: 'Sell Tax', fn: (c: any) => (c.sell_tax != undefined ? c.sell_tax*100 > 3 : false), getValue: (c: any) => `${(c.sell_tax != undefined ? c.sell_tax*100 : 0).toFixed(2)}%` },
            { lbl: 'Modifiable Tax', fn: (c: any) => c.slippage_modifiable == '1' },
            { lbl: 'Transfer Pausable', fn: (c: any) => c.transfer_pausable == '1' },
            { lbl: 'Can Blacklist Wallet', fn: (c: any) => c.is_blacklisted == '1' },
            { lbl: 'Can Whitelist Wallet', fn: (c: any) => c.is_whitelisted == '1' },
        ].map((x: any) => {
            x.status = x.fn(contract); // fn return true it's invalid
            return {
              ... x,
              valid: x.status == false,
              value: (x.getValue != undefined ? x.getValue(contract) : undefined)
            };
        });
        const passed = securityList.reduce((acc, x) => acc + (x.valid ? 1 : 0), 0);
        const attention = securityList.reduce((acc, x) => acc + (x.valid ? 0 : 1), 0);
        const passedPercentage = (passed / securityList.length) * 100;

        return {
            securityList: securityList,
            passed: passed,
            attention: attention,
            level: passedPercentage > 95 ? 'High' : passedPercentage > 70 ? 'Medium' : 'Low',
            scanned: contract != undefined,
            passedPercentage: passedPercentage
        };
    }
    // Powered By GoPlus
    let contractsScores: any = [];
    let contractsChains = Object.keys(project.contracts);
    for (let i = 0; i < contractsChains.length; i++) {
        let currentChain = contractsChains[i];
        let contract = project.contracts[currentChain];

        if (contract.token == undefined) {
            continue ;
        }

        const uncertaintyScoreResult = getContractUncertaintyScore(contract);
        const ownerPrivilegeScoreResult = getContractOwnerPrivilegeScore(contract);
        const tradingContraintScoreResult = getContractTradingContraintScore(contract);

        const globalContractScore = [
            uncertaintyScoreResult.passedPercentage * 33 / 100,
            ownerPrivilegeScoreResult.passedPercentage * 33 / 100,
            tradingContraintScoreResult.passedPercentage * 33 / 100
        ].reduce((acc, s) => acc + s, 0);
        contractsScores.push(globalContractScore);
    }
    const goPlusScore = contractsScores.reduce((acc: any, s: any) => acc + s, 0) / contractsScores.length;
    return goPlusScore;
};

const getTechnicalTokenHoldersAnalysisScore = (project: any) => {

    const getLpHoldersWithMoreThan30PercentUnlocked = (contract: any, currentChainName: any) => {
        let lp_holders_with_more_of_30_percent_unlocked = [];
        if (contract.lp_holders != undefined && contract.lp_holders.length > 0) {
            lp_holders_with_more_of_30_percent_unlocked = contract.lp_holders.reduce((acc: any, lp: any) => {
                if (lp.percent * 100 > 30 && lp.is_contract != 1 && lp.is_locked == 0) {
                    acc.push({
                        ... lp,
                        percent: lp.percent * 100,
                        chain: currentChainName
                    });
                }
                return acc;
            }, []);
        }
        return lp_holders_with_more_of_30_percent_unlocked;
    }

    const getTopTenHoldersPercentage = (contract: any) => {
        let topTenHoldersPercentage = 0;
        if (contract.holders != undefined && contract.holders.length > 0) {
            topTenHoldersPercentage = contract.holders.reduce((acc: any, lp: any) => {
                if (lp.percent * 100 > 30 && lp.is_contract != 1 && lp.is_locked == 0) {
                    acc += (lp.percent * 100);
                }
                return acc;
            }, 0);
        }
        return topTenHoldersPercentage;
    }
    // Powered By GoPlus
    let contractsDatas: any = [];
    let contractsChains = Object.keys(project.contracts);
    for (let i = 0; i < contractsChains.length; i++) {
        let currentChain = contractsChains[i];
        let contract = project.contracts[currentChain];

        if (contract.token == undefined) {
            continue ;
        }

        let lp_holders_with_more_of_30_percent_unlocked = getLpHoldersWithMoreThan30PercentUnlocked(contract, currentChain);
        let holderCount = contract.holder_count != undefined ? Number(contract.holder_count) : 0;
        let top_ten_holders_percentage = getTopTenHoldersPercentage(contract);
        let contract_owner_percentage = contract.owner_percent != undefined ? contract.owner_percent * 100 : 0;

        contractsDatas.push({
            lp_holders_with_more_of_30_percent_unlocked: lp_holders_with_more_of_30_percent_unlocked,
            holderCount: holderCount,
            top_ten_holders_percentage: top_ten_holders_percentage,
            contract_owner_percentage: contract_owner_percentage,
            chain: currentChain
        });
    }

    const currentChainData = contractsDatas.find((x: any) => x.chain == project.chain);

    if (currentChainData == undefined) {
        return NO_SCORE_PERCENTAGE;
    }

    const technicalTokenHoldersAnalysisScore = [
        (currentChainData.lp_holders_with_more_of_30_percent_unlocked.length > 0 ? 0 : 100) * 25 / 100,
        (currentChainData.holderCount <= 1000 ? ((currentChainData.holderCount / 1000) * 100) : 100) * 25 / 100, // 1000 holders should be great
        ((currentChainData.top_ten_holders_percentage < 10) ? (((10 - currentChainData.top_ten_holders_percentage) / 10) * 100) : 0) * 25 / 100, // 10 percent maximum should be good
        ((currentChainData.contract_owner_percentage < 5) ? (((5 - currentChainData.contract_owner_percentage) / 5) * 100) : 0) * 25 / 100 // 5 percent maximum should be good
    ].reduce((acc, s) => acc + s, 0);
    return technicalTokenHoldersAnalysisScore;
};
// --------------------------

// --------------------------
// MATURITY SCORE FUNCTIONS
// --------------------------
const getMaturityScore = (project: any) => {
    if (project.createDate == undefined) {
        return NO_SCORE_PERCENTAGE;
    }
    const projectCreateDate = (new Date(project.createDate)).getTime();
    const matureTargetDate = moment().subtract(2,'year').toDate().getTime();
    const timeBetween = moment().toDate().getTime() - matureTargetDate;
    const isRecentProject = projectCreateDate > matureTargetDate ? true : false;
    const projectMaturityScore = isRecentProject ? (100 - (((projectCreateDate - matureTargetDate) / timeBetween) * (100))) : 100;

    return projectMaturityScore;
};
// --------------------------

// --------------------------
// OPERATIONNAL SECURITY SCORE FUNCTIONS
// --------------------------
const getOperationnalNetworkSecurityScore = (project: any) => {
    const getProjectSecurityNetwork = (project: any) => {
        const securityList = [
            { lbl: 'FTP service accessible', key: 'FTP', status: 'Open', error: project.websiteBroken, description: 'The File Transfer Protocol (FTP) port is open and accessible from the public internet.' },
            { lbl: 'FTPS service accessible', key: 'FTPS', status: 'Open', error: project.websiteBroken, description: 'The  File Transfer Protocol over SSL/TLS (FTPS) port is open and accessible from the public internet.' },
            { lbl: 'SMTP service accessible', key: 'SMTP', status: 'Open', error: project.websiteBroken, description: 'The Simple Mail Transfer Protocol (SMTP) port is open and accessible from the public internet.' },
            { lbl: 'LDAP service accessible', key: 'LDAP', status: 'Open', error: project.websiteBroken, description: 'The Lightweight Directory Access Protocol (LDAP) port is open and accessible from the public internet.' },
            { lbl: 'rsync service accessible', key: 'rsync', status: 'Open', error: project.websiteBroken, description: 'The remote synchronization Protocol (rsync) port is open and accessible from the public internet.' },
            { lbl: 'PPTP service accessible', key: 'PPTP', status: 'Open', error: project.websiteBroken, description: 'The Point-to-point tunneling protocol - RFC 2637 (PPTP) port is open and accessible from the public internet.' },
            { lbl: 'RDP service accessible', key: 'RDP', status: 'Open', error: project.websiteBroken, description: 'The Windows Remote Desktop Protocol (RDP) port is open and accessible from the public internet.' },
            { lbl: 'VNC service accessible', key: 'VNC', status: 'Open', error: project.websiteBroken, description: 'The Virtual Network Computing (VNC) port is open and accessible from the public internet.' }
          ].map(x => {
            if (project?.security?.networkSecurity != undefined) {
              x.status = project.security.networkSecurity[x.key];
            }
            return {
              ... x,
              valid: x.status == 'Closed'
            };
          });
        const passed = securityList.reduce((acc, x) => acc + (x.valid ? 1 : 0), 0);
        const attention = securityList.reduce((acc, x) => acc + (x.valid ? 0 : 1), 0);
        const passedPercentage = (passed / securityList.length) * 100;
    
        return {
            securityList: securityList,
            passed: passed,
            attention: attention,
            level: passedPercentage > 95 ? 'High' : passedPercentage > 70 ? 'Medium' : 'Low',
            scanned: project?.security?.networkSecurity != undefined,
            passedPercentage: passedPercentage
        }
    };

    return getProjectSecurityNetwork(project).passedPercentage;
};

const getOperationnalApplicationSecurityScore = (project: any) => {
    const getProjectSecurityApplication = (project: any) => {
        const securityList = [
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
          ].map(x => {
            if (project?.security?.applicationSecurity != undefined) {
              x.status = x.fn(project.security.applicationSecurity);
            }
            return {
              ... x,
              valid: x.status == false
            };
          });
        const passed = securityList.reduce((acc, x) => acc + (x.valid ? 1 : 0), 0);
        const attention = securityList.reduce((acc, x) => acc + (x.valid ? 0 : 1), 0);
        const passedPercentage = (passed / securityList.length) * 100;
    
        return {
            securityList: securityList,
            passed: passed,
            attention: attention,
            level: passedPercentage > 95 ? 'High' : passedPercentage > 70 ? 'Medium' : 'Low',
            scanned: project?.security?.applicationSecurity != undefined,
            passedPercentage: passedPercentage
        }
    };
    return getProjectSecurityApplication(project).passedPercentage;
};

const getOperationnalDnsSecurityScore = (project: any) => {
    const getProjectSecurityDNS = (project: any) => {
        const securityList = [
            { lbl: 'Missing SPF record', fn: (s: any) => s['SPF'] == 'Missing', status: false, error: project.websiteBroken, description: 'The File Transfer Protocol (FTP) port is open and accessible from the public internet.' },
            { lbl: 'Missing DMARC record', fn: (s: any) => s['DMARC'] == 'Missing', status: false, error: project.websiteBroken, description: 'The  File Transfer Protocol over SSL/TLS (FTPS) port is open and accessible from the public internet.' },
            { lbl: 'Missing DKIM Record', fn: (s: any) => s['DKIM'] == 'Missing', status: false, error: project.websiteBroken, description: 'The Simple Mail Transfer Protocol (SMTP) port is open and accessible from the public internet.' },
          ].map(x => {
            if (project?.security?.dnsSecurity != undefined) {
              x.status = x.fn(project.security.dnsSecurity);
            }
            return {
              ... x,
              valid: x.status == false
            };
          });
        const passed = securityList.reduce((acc, x) => acc + (x.valid ? 1 : 0), 0);
        const attention = securityList.reduce((acc, x) => acc + (x.valid ? 0 : 1), 0);
        const passedPercentage = (passed / securityList.length) * 100;
    
        return {
            securityList: securityList,
            passed: passed,
            attention: attention,
            level: passedPercentage > 95 ? 'High' : passedPercentage > 70 ? 'Medium' : 'Low',
            scanned: project?.security?.dnsSecurity != undefined,
            passedPercentage: passedPercentage
        }
    };

    return getProjectSecurityDNS(project).passedPercentage;
};
// --------------------------

// --------------------------
// MARKET STABILITY SCORE FUNCTIONS
// --------------------------

const getMarketStabilityPriceScore = (project: any) => {
    if (project.price == undefined || project.prices365 == undefined || Object.keys(project.prices365).length < 7) {
        return NO_SCORE_PERCENTAGE;
    }
    const lastsSevenDaysKeys = Object.keys(project.prices365).slice(1).slice(-7);
    const lastsSevenDaysPrices = lastsSevenDaysKeys.map(x => project.prices365[x]);
    return calculateActivityScore(lastsSevenDaysPrices, 10);
};

const getMarketStabilityMarketCapScore = (project: any) => {
    if (project.totalSupply == undefined || project.prices365 == undefined || Object.keys(project.prices365).length < 7) {
        return NO_SCORE_PERCENTAGE;
    }
    const lastsSevenDaysKeys = Object.keys(project.prices365).slice(1).slice(-7);
    const lastsSevenDaysMC = lastsSevenDaysKeys.map(x => (project.totalSupply * project.prices365[x]));
    return calculateActivityScore(lastsSevenDaysMC, 10);
};

const getMarketStabilityLiquidityScore = (project: any) => {
    if (project.liquidities365 == undefined || Object.keys(project.liquidities365).length < 7) {
        return NO_SCORE_PERCENTAGE;
    }
    const lastsSevenDaysKeys = Object.keys(project.liquidities365).slice(1).slice(-7);
    const lastsSevenDaysLiquidities = lastsSevenDaysKeys.map(x => project.liquidities365[x]);
    return calculateActivityScore(lastsSevenDaysLiquidities, 10);
};
// --------------------------

// --------------------------
// COMMUNITY SCORE FUNCTIONS
// --------------------------

// UTILITY FUNCTIONS
const calculateActivityScore = (followerCounts: any, sensitivity = 20) => {
    if (followerCounts.length == 0 || followerCounts.length == 1) {
        return 50;
    }
    // Calculer les différences entre les jours consécutifs
    let totalDifference = followerCounts.reduce((acc: any, c: any, i: any, array: any) => {
        return acc + (i != 0 ? /* Difference */(c - array[i - 1]) : 0);
    }, 0);
    // Calculer la moyenne des différences
    const averageDifference = totalDifference / (followerCounts.length - 1);
    // Normaliser la moyenne des différences dans la plage -100 à 100
    const normalizedDifference = ((averageDifference * sensitivity) / Math.max(...followerCounts)) * 100;
    // Calculer le score d'activité en combinant la tendance
    let activityScore = (normalizedDifference + 100) / 2;
    // Assurer que le score reste dans la plage de 0 à 100
    const finalScore = Math.max(0, Math.min(100, activityScore));
    // Arrondir le score à deux décimales
    const roundedScore = Math.round(finalScore * 100) / 100;
    return roundedScore;
}
////////////////////////////

const getCommunityTwitterScore = (project: any) => {

    const getTwitterAccountAgeScore = (project: any) => {
        const created_at = project.twitter365.created_at;
        if (created_at == undefined) {
            return NO_SCORE_PERCENTAGE;
        }
        const createdAtDate = (new Date(created_at)).getTime();
        const matureTargetDate = moment().subtract(6,'months').toDate().getTime();
        const timeBetween = moment().toDate().getTime() - matureTargetDate;
        const isRecent = createdAtDate > matureTargetDate ? true : false;
        const accountAgeScore = isRecent ? (100 - (((createdAtDate - matureTargetDate) / timeBetween) * (100))) : 100;
        return accountAgeScore;
    }

    const getTwitterLastTweetAgeScore = (project: any) => {
        const last_tweet_at = project.twitter365.last_tweet_at;
        if (last_tweet_at == undefined) {
            return NO_SCORE_PERCENTAGE;
        }
        const createdAtDate = (new Date(last_tweet_at)).getTime();
        const maxTargetDate = moment().subtract(60,'days').toDate().getTime();
        const timeBetween = moment().toDate().getTime() - maxTargetDate;
        const isRecent = createdAtDate > maxTargetDate ? true : false;
        const score = isRecent ? ((((createdAtDate - maxTargetDate) / timeBetween) * (100))) : 0;
        return score;
    }

    if (project.twitter365 == undefined || project.twitter365.exists != true) {
        return NO_SCORE_PERCENTAGE;
    }
    const twitter365 = Object.entries(project.twitter365 ? project.twitter365 : {})
        .filter(x => ['verified', 'created_at', 'last_tweet_at', 'exists'].includes(x[0]) == false)
        .reduce((acc: any, entry) => { acc[entry[0]] = entry[1]; return acc; }, {});

    const lastTwitterDayIdCheck = twitter365 != undefined ? Object.keys(twitter365).filter((x: any) => !isNaN(x)).sort((a: any,b: any)=>a-b).reverse()[0] : 0;

    if (twitter365 == undefined || Object.keys(twitter365).length < 1) {
        return NO_SCORE_PERCENTAGE;
    }

    const lastsSevenDaysKeys = Object.keys(twitter365).slice(1).slice(-7);
    const lastsSevenDays = lastsSevenDaysKeys.map((x: any) => twitter365[x]);

    const followersActivityScore = calculateActivityScore(lastsSevenDays.map(x => x.followers_count), 20);
    const ownerActivityScore = calculateActivityScore(lastsSevenDays.map(x => x.posts_count), 40);
    const twitterAccountAgeScore = getTwitterAccountAgeScore(project);
    const lastTweetAgeScore = getTwitterLastTweetAgeScore(project);

    const twitterScore = [
        // 25% of the score for followers Activity
        followersActivityScore * 25 / 100,
        // 25% of the score for owner activity
        ownerActivityScore * 25 / 100,
        // 25% of the score for account age (Minimum 6months for reach 100)
        twitterAccountAgeScore * 25 / 100,
        // 25% of the score for last tweet is recent (More it's recent more the score is better)
        lastTweetAgeScore * 25 / 100,
    ].reduce((acc, s) => acc + s, 0); // 30% if no twitter.
    return twitterScore;
};

const getCommunityTelegramScore = (project: any) => {
    if (project.telegram365 == undefined || project.telegram365.exists != true) {
        return NO_SCORE_PERCENTAGE;
    }
    const telegram365 = Object.entries(project.telegram365 ? project.telegram365 : {})
        .filter(x => ['exists'].includes(x[0]) == false)
        .reduce((acc: any, entry) => { acc[entry[0]] = entry[1]; return acc; }, {});

    const lastTwitterDayIdCheck = telegram365 != undefined ? Object.keys(telegram365).filter((x: any) => !isNaN(x)).sort((a: any,b: any)=>a-b).reverse()[0] : 0;

    if (telegram365 == undefined || Object.keys(telegram365).length < 1) {
        return NO_SCORE_PERCENTAGE;
    }

    const lastsSevenDaysKeys = Object.keys(telegram365).slice(1).slice(-7);
    const lastsSevenDays = lastsSevenDaysKeys.map(x => telegram365[x]);

    const membersCountActivityScore = calculateActivityScore(lastsSevenDays.map(x => x.members), 20);
    const onlineMembersCountActivityScore = calculateActivityScore(lastsSevenDays.map(x => x.onlineMembers), 40);
    
    const twitterScore = [
        // 50% of the score for Members count Activity
        membersCountActivityScore * 50 / 100,
        // 50% of the score for online Members activity
        onlineMembersCountActivityScore * 50 / 100,
    ].reduce((acc, s) => acc + s, 0); // 30% if no telegram.
    return twitterScore;
};

const getCommunityVoteScore = (project: any) => {
    const lastDayDate = moment().subtract(30,'day').toDate().getTime();
    const voteScore = project.votes != undefined && project.votes.length > 0 ? (project.votes.filter((x: any) => x.t > lastDayDate).filter((x: any) => x.v).length * 100 / project.votes.length) : 0;
    return voteScore;
};
// --------------------------

export const trustScoreFunctions = {
    // Technical Score
    getTechnicalGithubMonitoringScore,
    getTechnicalAuditScore,
    getTechnicalCentralizationScanningScore,
    getTechnicalTokenHoldersAnalysisScore,
    // Maturity Score
    getMaturityScore,
    // Operationnal Security Score
    getOperationnalNetworkSecurityScore,
    getOperationnalApplicationSecurityScore,
    getOperationnalDnsSecurityScore,
    // Market Stability Score
    getMarketStabilityPriceScore,
    getMarketStabilityMarketCapScore,
    getMarketStabilityLiquidityScore,
    // Community Score
    getCommunityTwitterScore,
    getCommunityTelegramScore,
    getCommunityVoteScore
};