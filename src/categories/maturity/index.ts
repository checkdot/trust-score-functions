import moment from "moment";

const getMaturityScore = (project: any) => {
    if (project.createDate == undefined) {
        return 30;
    }
    const projectCreateDate = (new Date(project.createDate)).getTime();
    const matureTargetDate = moment().subtract(2,'year').toDate().getTime();
    const timeBetween = moment().toDate().getTime() - matureTargetDate;
    const isRecentProject = projectCreateDate > matureTargetDate ? true : false;
    const projectMaturityScore = isRecentProject ? (100 - (((projectCreateDate - matureTargetDate) / timeBetween) * (100))) : 100;

    return projectMaturityScore;
};

export {
    getMaturityScore
};