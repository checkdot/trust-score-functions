
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
};

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
};


const getTechnicalTokenHoldersAnalysisScore = (project: any) => {
    if (project.contracts == undefined) { // set if not exists for.
        project.contracts = {};
    }
    // Data Powered By GoPlus
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
        return 30;
    }

    const technicalTokenHoldersAnalysisScore = [
        (currentChainData.lp_holders_with_more_of_30_percent_unlocked.length > 0 ? 0 : 100) * 25 / 100,
        (currentChainData.holderCount <= 1000 ? ((currentChainData.holderCount / 1000) * 100) : 100) * 25 / 100, // 1000 holders should be great
        ((currentChainData.top_ten_holders_percentage < 10) ? (((10 - currentChainData.top_ten_holders_percentage) / 10) * 100) : 0) * 25 / 100, // 10 percent maximum should be good
        ((currentChainData.contract_owner_percentage < 5) ? (((5 - currentChainData.contract_owner_percentage) / 5) * 100) : 0) * 25 / 100 // 5 percent maximum should be good
    ].reduce((acc, s) => acc + s, 0);
    return technicalTokenHoldersAnalysisScore;
};

export {
    getTechnicalTokenHoldersAnalysisScore,
    getLpHoldersWithMoreThan30PercentUnlocked,
    getTopTenHoldersPercentage
}