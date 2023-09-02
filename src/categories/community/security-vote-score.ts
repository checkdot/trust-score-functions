import moment from 'moment';

const getCommunityVoteScore = (project: any) => {
    const lastDayDate = moment().subtract(30,'day').toDate().getTime();

    if (project.votes != undefined && project.votes.filter((x: any) => x.t > lastDayDate).length > 0) {
        let voteForSecureCount = project.votes.filter((x: any) => x.t > lastDayDate).filter((x: any) => x.v).length;
        let totalNumberOfVotes = project.votes.filter((x: any) => x.t > lastDayDate).length;
        let votePercentage = voteForSecureCount * 100 / totalNumberOfVotes;
        
        return Number(votePercentage.toFixed(0));
    }
    return 50; // no votes the score is neutral
};

export {
    getCommunityVoteScore
};