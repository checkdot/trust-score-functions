import * as utils from '../../utils';

const getMarketStabilityLiquidityScore = (project: any) => {
    if (project.liquidities365 == undefined
        || Object.values(project.liquidities365).filter(x => x != 0 && x != Infinity).length < 2) {
        return {
            trendActivityScore: 50,
            trend: 'Stable',
            averagePrice: 0,
            standardDeviation: 0,
            percentageOfDeviation: 0,
            score: 30
        };
    }
    const lastsThirtyDaysKeys = Object.keys(project.liquidities365).slice(0).slice(-30);
    const lastsThirtyDaysLiquidities = lastsThirtyDaysKeys.map(x => project.liquidities365[x]).filter(x => x != 0 && x != Infinity);
    
    const activityScore = utils.calculateActivityScore(lastsThirtyDaysLiquidities, 20);
    const stabilityData = utils.calculateStabilityDeviationAndAverage(lastsThirtyDaysLiquidities);

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
    getMarketStabilityLiquidityScore
};