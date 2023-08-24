import * as utils from '../../utils';

const getMarketStabilityLiquidityScore = (project: any) => {
    if (project.liquidities365 == undefined || Object.keys(project.liquidities365).length < 7) {
        return 30;
    }
    const lastsSevenDaysKeys = Object.keys(project.liquidities365).slice(1).slice(-7);
    const lastsSevenDaysLiquidities = lastsSevenDaysKeys.map(x => project.liquidities365[x]);
    return utils.calculateActivityScore(lastsSevenDaysLiquidities, 10);
};

export {
    getMarketStabilityLiquidityScore
};