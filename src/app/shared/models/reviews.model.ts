export interface Reviews {
    alreadyVoted: boolean,
    avgVote: number,
    numberOfFiveStarVotes: number,
    numberOfFourStarVotes: number,
    numberOfOneStarVotes: number,
    numberOfThreeStarVotes: number,
    numberOfTwoStarVotes: number,
    reviews: {
        comment: string, 
        date: number,
        id: string, 
        processorId: string, 
        title: string, 
        userId: string, 
        vote: number
    }[]
}
