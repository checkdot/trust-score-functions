import * as utils from '../../utils';

const getMarketStabilityPriceScore = (project: any) => {
    if (project.price == undefined || project.prices365 == undefined || Object.keys(project.prices365).length < 7) {
        return 30;
    }
    const lastsSevenDaysKeys = Object.keys(project.prices365).slice(0).slice(-7);
    const lastsSevenDaysPrices = lastsSevenDaysKeys.map(x => project.prices365[x]);
    return utils.calculateActivityScore(lastsSevenDaysPrices, 10);
};

export {
    getMarketStabilityPriceScore
};