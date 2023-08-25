import moment from 'moment';
import * as utils from '../../utils';

const getProjectTwitterLastSevenDayChecks = (project: any) => {
    if (project.twitter365 == undefined || project.twitter365.exists != true) {
        return [];
    }
    const twitter365 = Object.entries(project.twitter365 ? project.twitter365 : {})
        .filter(x => ['verified', 'created_at', 'last_tweet_at', 'exists'].includes(x[0]) == false)
        .reduce((acc: any, entry) => { acc[entry[0]] = entry[1]; return acc; }, {});

    if (twitter365 == undefined || Object.keys(twitter365).length < 1) {
        return [];
    }
    const lastsSevenDaysKeys = Object.keys(twitter365).slice(0).slice(-7);
    const lastsSevenDays = lastsSevenDaysKeys.map((x: any) => twitter365[x]);
    return lastsSevenDays;
}

const getProjectTwitterLastCheck = (project: any) => {
    const lastsSevenDays = getProjectTwitterLastSevenDayChecks(project);
    return lastsSevenDays.length > 0 ? lastsSevenDays[lastsSevenDays.length - 1] : undefined;
}

// proach of 0 is bear, proach of 100 is bull and proach of 50 is stable
const getFollowersActivityScore = (project: any) => {
    const lastsSevenDays = getProjectTwitterLastSevenDayChecks(project);
    const followersActivityScore = utils.calculateActivityScore(lastsSevenDays.map(x => x.followers_count), 20);
    return followersActivityScore;
}

// proach of 0 is bear, proach of 100 is bull and proach of 50 is stable
const getOwnerActivityScore = (project: any) => {
    const lastsSevenDays = getProjectTwitterLastSevenDayChecks(project);
    const followersActivityScore = utils.calculateActivityScore(lastsSevenDays.map(x => x.posts_count), 40);
    return followersActivityScore;
}

const getTwitterAccountAgeScore = (project: any) => {
    const created_at = project?.twitter365?.created_at;
    if (created_at == undefined) {
        return 30;
    }
    const createdAtDate = (new Date(created_at)).getTime();
    const matureTargetDate = moment().subtract(6,'months').toDate().getTime();
    const timeBetween = moment().toDate().getTime() - matureTargetDate;
    const isRecent = createdAtDate > matureTargetDate ? true : false;
    const accountAgeScore = isRecent ? (100 - (((createdAtDate - matureTargetDate) / timeBetween) * (100))) : 100;
    return accountAgeScore;
};

const getTwitterLastTweetAgeScore = (project: any) => {
    const last_tweet_at = project?.twitter365?.last_tweet_at;
    if (last_tweet_at == undefined) {
        return 30;
    }
    const createdAtDate = (new Date(last_tweet_at)).getTime();
    const maxTargetDate = moment().subtract(60,'days').toDate().getTime();
    const timeBetween = moment().toDate().getTime() - maxTargetDate;
    const isRecent = createdAtDate > maxTargetDate ? true : false;
    const score = isRecent ? ((((createdAtDate - maxTargetDate) / timeBetween) * (100))) : 0;
    return score;
};

const getCommunityTwitterScore = (project: any) => {
    if (project.twitter365 == undefined || project.twitter365.exists != true) {
        return 30;
    }

    const followersActivityScore = getFollowersActivityScore(project);
    const ownerActivityScore = getOwnerActivityScore(project);
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

export {
    getCommunityTwitterScore,

    getFollowersActivityScore,
    getOwnerActivityScore,
    getTwitterAccountAgeScore,
    getTwitterLastTweetAgeScore,

    // utils
    getProjectTwitterLastCheck,
    getProjectTwitterLastSevenDayChecks
};