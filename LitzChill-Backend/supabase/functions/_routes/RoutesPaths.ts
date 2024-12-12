
//User Module Routes
export const userModuleRoute = {
    SendOtpPath: "/UserModule/sendOtp",
    VerifyOtp: "/UserModule/verifyOtp",
    UpdateUser: "/UserModule/userUpdate/:id",
    FetchUser: "/UserModule/FetchUser/:id",
    DeactivateUser: "/UserModule/Deactivate/:id",  
    UserLogOut: "/UserModule/LogOut"
  };
//Meme Module Routes Path
export const MEME_ROUTES ={
    MEME_CREATE_PATH : "/MemeModule/creatememe",
    MEME_UPDATE_PATH : "/MemeModule/updatememe/:id",
    MEME_GETTING_PATH : "/MemeModule/getmemebyid/:id",
    GETTING_ALL_MEMES_PATH : "/MemeModule/getallmemes",
    MEME_DELETE_PATH : "/MemeModule/deletememe/:id",
    MEME_UPDATE_STATUS_PATH : "/MemeModule/updatememestatus/:id",
}

//Like Module Routes PAth
export const LIKES_ROUTES = {
    LIKE_MEME_PATH:"/LIKESMODULE/likememe/:id",
    UNLIK_MEME_PATH:"/LIKESMODULE/unlikememe/:id"
}

//Notification Module Routes Path
export const NOTIFICATION_ROUTES = {
    GET_NOTIFICATION_PATH:"/NOTIFICATIONSMODULE/getnotifications",
    MARK_NOTIFICATION_ROUTE:"/NOTIFICATIONSMODULE/marknotification/:id"
}

//Contest Module Routes Path
export const CONTEST_ROUTES = {
    CONTEST_CREATE_PATH: "/ContestModule/createContest",
    CONTEST_GET_ALL_PATH: "/ContestModule/getAllContest",
    CONTEST_GET_BY_ID_PATH: "/ContestModule/getContestById/:id",
    CONTEST_UPDATE_BY_ID_PATH: "/ContestModule/updateContestById/:id",
    CONTEST_DELETE_BY_ID_PATH: "/ContestModule/deleteContestById/:id",
}

//ContestModule Routes Path
export const COMMENT_ROUTES = {
    COMMENT_ADD_PATH: "/CommentModule/addComment",
    COMMENT_DELETE_BY_ID_PATH: "/CommentModule/deleteComment/:id"

}

//Flag Module Routes Path
export const FLAG_ROUTES = {
    ADD_FLAG_TO_MEME: "/FlagModule/addFlag"
}

//Contest Entry Module Routes Path
export const CONTEST_ENTRY_ROUTES={
    POST_CONTEST_ENTRY:"/ContestEntry/postById/:id",
    GET_CONTEST_ENTRY:"/ContestEntry/getById/:id",
    UPDATE_CONTEST_ENTRY:"/ContestEntry/update"
}


