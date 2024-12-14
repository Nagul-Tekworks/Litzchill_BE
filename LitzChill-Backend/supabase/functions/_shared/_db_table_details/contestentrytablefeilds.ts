export const CONTEST_ENTRY_TABLE={
    ENTRY_ID:"entry_id",
    CONTEST_ID:"contest_id",
    MEME_ID:"meme_id",
    USER_ID:"user_id",
    CREATED_AT:"created_at",
    LIKE_COUNT:"like_count",
    COMMENT_COUNT:"comment_count",
    FLAG_COUNT:"flag_count",
    RANK:"rank",
    STATUS:"status"
}

export const CONTEST_ENTRY_QUERY={
    GET_CONTEST_ENTRY:`*,memes(*)`
}

export const LIMIT_CONSTANT={
    RECORD_LIMIT:50,
    PAGE_SIZE:20,
}
export const CONTEST_TABLE={
    //All Contest Table Fields.
     CONTEST_ID:'contest_id',
     CONTEST_TITLE:'contest_title',
     CONTEST_DESCRIPTION:'description',
     CONTEST_START_DATE:'start_date',
     CONTEST_END_DATE:'end_date',
     CONTEST_STATUS:'status',
     CONTEST_RESULT:'result',
     CONTEST_PRIZE:'prize',
     CONTEST_CREATED_DATE:'created_at',
     CONTEST_UPDATED_DATE:'updated_at',
 
     //Contest Status For Deleting Contest.
     CONTEST_DELETE:"deleted",
}