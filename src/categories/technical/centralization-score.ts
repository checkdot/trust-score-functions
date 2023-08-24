import { runner } from "../../checker";

const getContractUncertaintyCheck = (contract: any) => {
    const checkResult = runner(contract, [
        { lbl: 'Hidden Source Code', fn: (c: any) => c.is_open_source != '1', description: '' },
        { lbl: 'Proxy Contract', fn: (c: any) => c.is_proxy == '1', description: '' },
        { lbl: 'External Call Risk', fn: (c: any) => c.external_call == '1', description: '' },
        { lbl: 'Mint Function', fn: (c: any) => c.is_mintable == '1', description: '' },
        { lbl: 'Self Destruct', fn: (c: any) => c.selfdestruct == '1', description: '' }
    ], (_: any) => { return contract; });
    return checkResult;
};

const getContractOwnerPrivilegeCheck = (contract: any) => {
    const checkResult = runner(contract, [
        { lbl: 'Retrieve Ownership', fn: (c: any) => c.can_take_back_ownership == '1', description: '' },
        { lbl: 'Balance Modifiable', fn: (c: any) => c.owner_change_balance == '1', description: '' },
        { lbl: 'Hidden Owner', fn: (c: any) => c.hidden_owner == '1', description: '' },
        { lbl: 'Creator Percentage', fn: (c: any) => (c.creator_percent != undefined ? c.creator_percent*100 > 5 : false), getValue: (c: any) => `${(c.creator_percent != undefined ? c.creator_percent*100 : 0).toFixed(2)}%`, description: '' },
        { lbl: 'Owner Percentage', fn: (c: any) => (c.owner_percent != undefined ? c.owner_percent*100 > 5 : false), getValue: (c: any) => `${(c.owner_percent != undefined ? c.owner_percent*100 : 0).toFixed(2)}%`, description: '' },
    ], (_: any) => { return contract; });
    return checkResult;
};

const getContractTradingContraintCheck = (contract: any) => {
    const checkResult = runner(contract, [
        { lbl: 'Honeypot', fn: (c: any) => c.is_honeypot == '1', description: '' },
        { lbl: 'Buy Tax', fn: (c: any) => (c.buy_tax != undefined ? c.buy_tax*100 > 3 : false), getValue: (c: any) => `${(c.buy_tax != undefined ? c.buy_tax*100 : 0).toFixed(2)}%`, description: '' },
        { lbl: 'Sell Tax', fn: (c: any) => (c.sell_tax != undefined ? c.sell_tax*100 > 3 : false), getValue: (c: any) => `${(c.sell_tax != undefined ? c.sell_tax*100 : 0).toFixed(2)}%`, description: '' },
        { lbl: 'Modifiable Tax', fn: (c: any) => c.slippage_modifiable == '1', description: '' },
        { lbl: 'Transfer Pausable', fn: (c: any) => c.transfer_pausable == '1', description: '' },
        { lbl: 'Can Blacklist Wallet', fn: (c: any) => c.is_blacklisted == '1', description: '' },
        { lbl: 'Can Whitelist Wallet', fn: (c: any) => c.is_whitelisted == '1', description: '' },
    ], (_: any) => { return contract; });
    return checkResult;
};

const getTechnicalCentralizationScanningScore = (project: any) => {
    // Powered By GoPlus
    let contractsScores: any = [];
    let contractsChains = Object.keys(project.contracts);
    for (let i = 0; i < contractsChains.length; i++) {
        let currentChain = contractsChains[i];
        let contract = project.contracts[currentChain];

        if (contract.token == undefined) {
            continue ;
        }

        const uncertaintyScoreResult = getContractUncertaintyCheck(contract);
        const ownerPrivilegeScoreResult = getContractOwnerPrivilegeCheck(contract);
        const tradingContraintScoreResult = getContractTradingContraintCheck(contract);

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

export {
    getTechnicalCentralizationScanningScore,
    getContractUncertaintyCheck,
    getContractOwnerPrivilegeCheck,
    getContractTradingContraintCheck
};