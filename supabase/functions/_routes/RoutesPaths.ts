export const CONTEST_ROUTES = {
    CONTEST_CREATE_PATH: "/ContestModule/createContest",
    CONTEST_GET_ALL_PATH: "/ContestModule/getAllContest",
    CONTEST_GET_BY_ID_PATH: "/ContestModule/getContestById/:id",
    CONTEST_UPDATE_BY_ID_PATH: "/ContestModule/updateContestById/:id",
    CONTEST_DELETE_BY_ID_PATH: "/ContestModule/deleteContestById/:id",
}

export const COMMENT_ROUTES = {
    COMMENT_ADD_PATH: "/CommentAPI/addComment",
    COMMENT_DELETE_BY_ID_PATH: "/CommentAPI/deleteComment/:id"
}

export const FLAG_ROUTES = {
    ADD_FLAG_TO_MEME: "/FlagAPI/addFlag"
}
