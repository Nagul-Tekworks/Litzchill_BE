//contest module
export interface ContestModel {
    contest_id?: string;  
    contest_title: string;
    description?: string;
    start_date: string;
    end_date: string;
    status?: string;
    result?: object;
    prize?: string;
    created_at: string;
    updated_at?: string;
}
