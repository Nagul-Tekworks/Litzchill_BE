export const CONETST_ENTRY_ERROR_MESSAGE={
    //contest-entry get method msgs
    INVALID_INPUT:"Invalid input must and should need to provide contest id for this method or Invalid uuid",
    NODATA_FOUND:"No data found with this id",
    //contest-entry post method msgs
    INVALID_INPUT_POST:"For this method we need to pass fields contest id ",
    INVALID_JSON:"Need to pass meme id and user id in json format",
    INVALID_CONTEST:"Contest is not found in Contest Table",
    INVALID_MEME:"Memer is not found in Memes Table",
    INVALID_USER:"User is not found in User Table",
    ALLREADY_EXIST:"Entry with this is Id's already exist",
    
    //contest-entry patch method msgs
    REQUIRED_FIELDS:"For this method we need to pass fields contest id,entry id and new status in json(May be you entered in valid uuid)",
    INVALID_STATUS:"Status column must be Active or Disqualified",
    NOT_FOUND:"No matching entries found in Contest_Entry table."
    
}
export const CONETST_ENTRY_SUCCESS_MESSAGE={
    SUCESS_POST:"Entry inserted Succesfully",
    SUCESS_UPDATE:"Entry updated Succesfully",
    SUCESS_GET:"Data Found "
}