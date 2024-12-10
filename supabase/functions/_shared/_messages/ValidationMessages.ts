//Contest Module Validation Messages
export const CONTEST_VALIDATION_MESSAGES={

    INVALID_CONTEST_ID: "Invalid Contest ID. Please provide a valid UUID.",
    INVALID_CONTEST_TITLE: "Contest Title must be 3-100 characters.",
    MISSING_CONTEST_TITLE: "Contest Title is required.",
    INVALID_CONTEST_DESCRIPTION: "Description must be 8-500 characters.",
    INVALID_CONTEST_START_DATE_FORMAT: "Start Date must be in ISO 8601 format.",
    MISSING_CONTEST_START_DATE: "Start Date is required.",
    INVALID_CONTEST_END_DATE_FORMAT: "End Date must be in ISO 8601 format.",
    INVALID_CONTEST_END_DATE: "End Date must be after Start Date.",
    MISSING_CONTEST_END_DATE: "End Date is required.",
    INVALID_CONTEST_STATUS: "Status must be 'Ongoing', 'Completed', or 'Upcoming'."
};