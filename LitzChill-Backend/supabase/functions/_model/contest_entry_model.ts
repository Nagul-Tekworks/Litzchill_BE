 interface ContestEntry {
    entry_id?: string;
    contest_id: string;
    meme_id: string;
    user_id: string;
    created_at: Date;
    like_count: number;
    comment_count: number;
    flag_count: number;
    rank: number;
    status: string;
  }
  
  export default class ContestEntryModel implements ContestEntry {
    entry_id?: string;
    contest_id: string;
    meme_id: string;
    user_id: string;
    created_at: Date;
    like_count: number;
    comment_count: number;
    flag_count: number;
    rank: number;
    status: string;
  
    constructor(data: ContestEntry) {
      this.entry_id = data.entry_id;
      this.contest_id = data.contest_id;
      this.meme_id = data.meme_id;
      this.user_id = data.user_id;
      this.created_at = data.created_at;
      this.like_count = data.like_count;
      this.comment_count = data.comment_count;
      this.flag_count = data.flag_count;
      this.rank = data.rank;
      this.status = data.status;
    }
  }
  