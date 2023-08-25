import * as utils from '../../utils';

const getMarketStabilityMarketCapScore = (project: any) => {
    if (project.totalSupply == undefined || project.prices365 == undefined || Object.keys(project.prices365).length < 7) {
        return 30;
    }
    const lastsSevenDaysKeys = Object.keys(project.prices365).slice(0).slice(-7);
    const lastsSevenDaysMC = lastsSevenDaysKeys.map(x => (project.totalSupply * project.prices365[x]));
    return utils.calculateActivityScore(lastsSevenDaysMC, 10);
};

export {
    getMarketStabilityMarketCapScore
};