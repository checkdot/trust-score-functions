import { runner } from "../../checker";

const getContractUncertaintyCheck = (contract: any) => {
    const checkResult = runner(contract, [
        { lbl: 'Hidden Source Code', fn: (c: any) => c.is_open_source != '1', description: 'The contract\'s source code is hidden and not available for public review.' },
        { lbl: 'Proxy Contract', fn: (c: any) => c.is_proxy == '1', description: 'This contract is a proxy contract, which can introduce additional complexities and risks to the system.' },
        { lbl: 'External Call Risk', fn: (c: any) => c.external_call == '1', description: 'The contract performs external calls, which can introduce vulnerabilities and security risks.' },
        { lbl: 'Mint Function', fn: (c: any) => c.is_mintable == '1', description: 'The contract includes a mint function, which can have implications for the token supply and value.' },
        { lbl: 'Self Destruct', fn: (c: any) => c.selfdestruct == '1', description: 'The contract contains a self-destruct function, which can lead to the contract being removed from the blockchain.' }
    ], (_: any) => { return contract; });
    return checkResult;
};

const getContractOwnerPrivilegeCheck = (contract: any) => {
    const checkResult = runner(contract, [
        { lbl: 'Retrieve Ownership', fn: (c: any) => c.can_take_back_ownership == '1', description: 'The contract allows the owner to retrieve ownership, which can have implications for the control and management of the contract.' },
        { lbl: 'Balance Modifiable', fn: (c: any) => c.owner_change_balance == '1', description: 'The contract permits modification of balances by the owner, which can introduce security risks.' },
        { lbl: 'Hidden Owner', fn: (c: any) => c.hidden_owner == '1', description: 'The contract has a hidden owner, potentially obscuring the identity of the entity with control over the contract.' },
        { lbl: 'Creator Percentage', fn: (c: any) => (c.creator_percent != undefined ? c.creator_percent*100 > 5 : false), getValue: (c: any) => `${(c.creator_percent != undefined ? c.creator_percent*100 : 0).toFixed(2)}%`, description: 'The contract\'s creator retains a percentage of ownership, potentially affecting the distribution of rewards and control.' },
        { lbl: 'Owner Percentage', fn: (c: any) => (c.owner_percent != undefined ? c.owner_percent*100 > 5 : false), getValue: (c: any) => `${(c.owner_percent != undefined ? c.owner_percent*100 : 0).toFixed(2)}%`, description: 'The contract\'s owner holds a percentage of ownership, potentially influencing decision-making and profits.' },
    ], (_: any) => { return contract; });
    return checkResult;
};

const getContractTradingContraintCheck = (contract: any) => {
    const checkResult = runner(contract, [
        { lbl: 'Honeypot', fn: (c: any) => c.is_honeypot == '1', description: 'The contract is flagged as a honeypot, which could indicate potential malicious intent or deceptive behavior.' },
        { lbl: 'Buy Tax', fn: (c: any) => (c.buy_tax != undefined ? c.buy_tax*100 > 3 : false), getValue: (c: any) => `${(c.buy_tax != undefined ? c.buy_tax*100 : 0).toFixed(2)}%`, description: 'The contract applies a buy tax percentage that could impact users\' transactions.' },
        { lbl: 'Sell Tax', fn: (c: any) => (c.sell_tax != undefined ? c.sell_tax*100 > 3 : false), getValue: (c: any) => `${(c.sell_tax != undefined ? c.sell_tax*100 : 0).toFixed(2)}%`, description: 'The contract imposes a sell tax percentage that might affect the profitability of selling tokens.' },
        { lbl: 'Modifiable Tax', fn: (c: any) => c.slippage_modifiable == '1', description: 'The contract\'s tax slippage is modifiable, allowing potential adjustments to tax rates.' },
        { lbl: 'Transfer Pausable', fn: (c: any) => c.transfer_pausable == '1', description: 'Transfers in the contract can be paused, potentially impacting the ability to move tokens.' },
        { lbl: 'Can Blacklist Wallet', fn: (c: any) => c.is_blacklisted == '1', description: 'The contract is capable of blacklisting wallets, which could lead to access restrictions for certain addresses.' },
        { lbl: 'Can Whitelist Wallet', fn: (c: any) => c.is_whitelisted == '1', description: 'The contract has the ability to whitelist wallets, allowing specific addresses special privileges.' },
    ], (_: any) => { return contract; });    
    return checkResult;
};

const getTechnicalCentralizationScanningScore = (project: any) => {
    if (project.contracts == undefined) { // set if not exists for.
        project.contracts = {};
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
    if (contractsScores.length == 0) {
        return 30; // default.
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