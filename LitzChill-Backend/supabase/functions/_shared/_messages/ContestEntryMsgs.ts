export const CONETST_ENTRY_ERROR_MESSAGE={
    //contest-entry get method msgs
    INVALID_INPUT:"Invalid input must and should need to provide contest id for this method or Invalid uuid",
    NODATA_FOUND:"No data found with this id",
    //contest-entry post method msgs
    INVALID_INPUT_POST:"For this method we need to pass fields contest id ",
    INVALID_JSON:"Need to pass meme id and user id in json format",
    INVALID_CONTEST:"Contest id is not found in the contest table",
    WRONG_CONTEST:"Contest is Complted or Not yet Started",
    INVALID_MEME:"Memer is not found in Memes Table",
    INVALID_USER:"User is not found in User Table",
    ALLREADY_EXIST:"Entry with this is Id's already exist",
    INVALID_UUID:"Please provide Good UUid",
    ALLREADY_REG:"This user is already registered for this contest",
    
    //contest-entry patch method msgs
    REQUIRED_FIELDS:"For this method we need to pass fields contest id,entry id and new status in json(May be you entered in valid uuid)",
    INVALID_STATUS:"Status column must be Active or Disqualified",
    NOT_FOUND:"No matching entries found in Contest_Entry table.",
    INVALID_USER_TYPE:"Invalid user type provided. Please ensure the user type is either 'Admin', 'Active User', or 'Disqualified User'."
   
    
}
export const CONETST_ENTRY_SUCCESS_MESSAGE={
    SUCESS_POST:"Entry inserted Succesfully",
    SUCESS_UPDATE:"Entry updated Succesfully",
    SUCESS_GET:"Data Found "
}

export const MEME_SUCCESS_MESSAGES={
    MEME_CREATED_SUCCESSFULLY:"Meme Created Successfully",
    FAILED_TO_CREATE:"Failed to Create Meme",
}