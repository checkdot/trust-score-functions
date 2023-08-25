import * as utils from '../../utils';

const getProjectTelegramLastSevenDaysChecks = (project: any) => {
    if (project.telegram365 == undefined || project.telegram365.exists != true) {
        return [];
    }
    const telegram365 = Object.entries(project.telegram365 ? project.telegram365 : {})
        .filter(x => ['exists'].includes(x[0]) == false)
        .reduce((acc: any, entry) => { acc[entry[0]] = entry[1]; return acc; }, {});

    if (telegram365 == undefined || Object.keys(telegram365).length < 1) {
        return [];
    }
    const lastsSevenDaysKeys = Object.keys(telegram365).slice(0).slice(-7);
    const lastsSevenDays = lastsSevenDaysKeys.map(x => telegram365[x]);

    return lastsSevenDays;
};

const getProjectTelegramLastCheck = (project: any) => {
    const lastsSevenDays = getProjectTelegramLastSevenDaysChecks(project);
    return lastsSevenDays.length > 0 ? lastsSevenDays[lastsSevenDays.length - 1] : undefined;
}

const getMembersCountActivityScore = (project: any) => {
    const lastsSevenDays = getProjectTelegramLastSevenDaysChecks(project);
    const membersCountActivityScore = utils.calculateActivityScore(lastsSevenDays.map(x => x.members), 20);
    return membersCountActivityScore;
}

const getOnlineMembersCountActivityScore = (project: any) => {
    const lastsSevenDays = getProjectTelegramLastSevenDaysChecks(project);
    const onlineMembersCountActivityScore = utils.calculateActivityScore(lastsSevenDays.map(x => x.onlineMembers), 40);
    return onlineMembersCountActivityScore;
}

const getCommunityTelegramScore = (project: any) => {
    if (project.telegram365 == undefined || project.telegram365.exists != true) {
        return 30;
    }
    const membersCountActivityScore = getMembersCountActivityScore(project);
    const onlineMembersCountActivityScore = getOnlineMembersCountActivityScore(project);
    
    const twitterScore = [
        // 50% of the score for Members count Activity
        membersCountActivityScore * 50 / 100,
        // 50% of the score for online Members activity
        onlineMembersCountActivityScore * 50 / 100,
    ].reduce((acc, s) => acc + s, 0); // 30% if no telegram.
    return twitterScore;
};

export {
    getCommunityTelegramScore,

    getOnlineMembersCountActivityScore,
    getMembersCountActivityScore,

    getProjectTelegramLastCheck,
    getProjectTelegramLastSevenDaysChecks
};