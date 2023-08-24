import moment from 'moment';

const getCommunityVoteScore = (project: any) => {
    const lastDayDate = moment().subtract(30,'day').toDate().getTime();
    const voteScore = project.votes != undefined && project.votes.length > 0 ? (project.votes.filter((x: any) => x.t > lastDayDate).filter((x: any) => x.v).length * 100 / project.votes.length) : 0;
    return voteScore;
};

export {
    getCommunityVoteScore
};