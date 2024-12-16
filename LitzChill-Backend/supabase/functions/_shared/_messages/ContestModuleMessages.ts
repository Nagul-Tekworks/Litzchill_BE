//contest module Error Messages
export const CONTEST_MODULE_ERROR_MESSAGES={
    CONTEST_NOT_CREATED: "Unable to create contest. Please try again later.",
    CONTEST_NOT_FOUND_OR_DELETED: "Contest not found or it may have been deleted.",
    NO_CONTEST_FOUND: "No contests are available."
};


//contest Module  Success messages
export const CONTEST_MODULE_SUCCESS_MESSAGES={

    CONTEST_CREATED: "The contest has been created successfully!",
    CONTEST_DELETED: "The contest has been deleted successfully!",
    CONTEST_DETAILS_FETCHED: "Fetched the contest details successfully!",
    CONTEST_UPDATED: "The contest has been updated successfully!",
    CONTEST_STATUS_UPDATED:"All Contests Status Has Been Updated Successfully"
  }

//Contest Module Validation Messages
export const CONTEST_VALIDATION_MESSAGES={
    MISSING_CONTEST_ID:"Please Provide Contest Id ",
    INVALID_CONTEST_ID: "Invalid Contest ID. Please provide a valid UUID.",
    INVALID_CONTEST_TITLE: "Contest Title must be 3-100 characters.",
    MISSING_CONTEST_TITLE: "Contest Title is required.",
    INVALID_CONTEST_DESCRIPTION: "Description must be 8-500 characters.",
    INVALID_START_DATE_VALUE:"Start Date Must be After Current Date",
    INVALID_CONTEST_START_DATE_FORMAT: "Start Date must be in ISO 8601 format.",
    MISSING_CONTEST_START_DATE: "Start Date is required.",
    INVALID_CONTEST_END_DATE_FORMAT: "End Date must be in ISO 8601 format.",
    INVALID_END_DATE_VALUE:"END Date Must be After Current Date",
    INVALID_CONTEST_END_DATE: "End Date must be after Start Date. And Current Date",
    MISSING_CONTEST_END_DATE: "End Date is required.",
    INVALID_CONTEST_STATUS: "Status must be 'Ongoing', 'Completed', or 'Upcoming' .",
    INVALID_TYPE_FOR_RESULT:"Please Provide Valid Result",
    INVALID_TYPE_FOR_PRIZE:"Please provide a valid prize.",
    EMPTY_RESULT:"The result Should contain all 3 Winners",
    EMPTY_PRIZE:"The Prize Should contain all 3 prizes",
};