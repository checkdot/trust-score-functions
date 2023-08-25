import moment from "moment";

const getProjectGithubLastSevenDaysChecks = (project: any) => {
    if (project.github365 == undefined || project.github365.exists != true) {
        return [];
    }
    const github365 = Object.entries(project.github365 ? project.github365 : {})
        .filter(x => ['exists', 'avatar', 'first_repo_at'].includes(x[0]) == false)
        .reduce((acc: any, entry) => { acc[entry[0]] = entry[1]; return acc; }, {});

    if (github365 == undefined || Object.keys(github365).length < 1) {
        return [];
    }
    const lastsSevenDaysKeys = Object.keys(github365).slice(0).slice(-7);
    const lastsSevenDays = lastsSevenDaysKeys.map(x => github365[x]);

    return lastsSevenDays;
};

const getProjectGithubLastCheck = (project: any) => {
    const lastsSevenDays = getProjectGithubLastSevenDaysChecks(project);
    return lastsSevenDays.length > 0 ? lastsSevenDays[lastsSevenDays.length - 1] : undefined;
}

const getGithubStarsCountScore = (project: any, dayId: any) => {
    const MAX_STARS = 100;
    return (project.github365[dayId].stars_count <= MAX_STARS ? (project.github365[dayId].stars_count / MAX_STARS) * 100 : 100);
};

const getGithubAccountAgeScore = (project: any, dayId: any) => {
    const first_repo_at = project.github365[dayId].first_repo_at;
    if (first_repo_at == undefined) {
        return 0;
    }
    const firstRepoAtDate = (new Date(first_repo_at)).getTime();
    const matureTargetDate = moment().subtract(1,'year').toDate().getTime();
    const timeBetween = moment().toDate().getTime() - matureTargetDate;
    const isRecentGithub = firstRepoAtDate > matureTargetDate ? true : false;
    const githubAccountAgeScore = isRecentGithub ? (100 - (((firstRepoAtDate - matureTargetDate) / timeBetween) * (100))) : 100;
    return githubAccountAgeScore;
};

const getGithubRepoCountScore = (project: any, dayId: any) => {
    const MAX_REPOS = 10;
    return (project.github365[dayId].repo_count <= MAX_REPOS ? (project.github365[dayId].repo_count / MAX_REPOS) * 100 : 100);
};

const getTechnicalGithubMonitoringScore = (project: any) => {
    const NO_SCORE_PERCENTAGE = 30;
    const lastGithubDayIdCheck = project.github365 != undefined ? Object.keys(project.github365).filter((x: any) => !isNaN(x)).sort((a: any,b: any)=>a-b).reverse()[0] : 0;

    const githubScore = project.github365 != undefined ? [
        // 33% of the score for stars check.
        getGithubStarsCountScore(project, lastGithubDayIdCheck) * 33 / 100,
        // 33% of the score for account age check.
        getGithubAccountAgeScore(project, lastGithubDayIdCheck) * 33 / 100,
        // 33% of the score for repo count check.
        getGithubRepoCountScore(project, lastGithubDayIdCheck) * 33 / 100,
    ].reduce((acc, s) => acc + s, 0) : NO_SCORE_PERCENTAGE; // 30% if no github.
    return githubScore;
};

export {
    getTechnicalGithubMonitoringScore,
    getGithubStarsCountScore,
    getGithubAccountAgeScore,
    getGithubRepoCountScore,

    getProjectGithubLastSevenDaysChecks,
    getProjectGithubLastCheck
};