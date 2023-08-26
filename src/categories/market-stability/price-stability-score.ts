import * as utils from '../../utils';

const getMarketStabilityPriceScore = (project: any) => {
    if (project.price == undefined || project.prices365 == undefined || Object.keys(project.prices365).length < 2) {
        return {
            trendActivityScore: 50,
            trend: 'Stable',
            averagePrice: 0,
            standardDeviation: 0,
            percentageOfDeviation: 0,
            score: 30
        };
    }
    const lastsThirtyDaysKeys = Object.keys(project.prices365).slice(0).slice(-30);
    const lastsThirtyDaysPrices = lastsThirtyDaysKeys.map(x => project.prices365[x]);
    
    const activityScore = utils.calculateActivityScore(lastsThirtyDaysPrices, 20);
    const stabilityData = utils.calculateStabilityDeviationAndAverage(lastsThirtyDaysPrices);

    return {
        trendActivityScore: activityScore,
        trend: activityScore < 45 ? 'Bearish' : (activityScore > 55 ? 'Bullish': 'Stable'),
        averagePrice: stabilityData.averagePrice,
        standardDeviation: stabilityData.standardDeviation,
        percentageOfDeviation: stabilityData.percentageOfDeviation,
        score: 100 - stabilityData.percentageOfDeviation
    };
};

export {
    getMarketStabilityPriceScore
};