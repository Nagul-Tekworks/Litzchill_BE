// This module contains utility functions for interacting with a Supabase database to validate 
// and manage contest-related data. The operations include validation of contests, memes, and users, 
// checking for existing contest entries, and inserting new contest entries.

import ContestEntryModel from "../../_model/contest_entry_model.ts";
import supabase from "../../_shared/_config/DbConfig.ts";
import { CONTEST_TABLE } from "../../_shared/_db_table_details/contestentrytablefeilds.ts";
import { TABLE_NAMES } from "../../_shared/_db_table_details/TableNames.ts";

//checks the contest id present in the contest table or not
export async function validateContestEntry(contestId: string) {
  console.log("Validating contest entry for contestId:", contestId); // Log contestId being validated
  const { data: contestData, error: errorincontest } = await supabase
    .from(TABLE_NAMES.CONTEST_TABLE)
    .select("*")
    .eq(CONTEST_TABLE.CONTEST_ID, contestId)
    .eq(CONTEST_TABLE.CONTEST_STATUS, "ongoing");

  console.log("Contest validation result:", contestData); // Log contestData
  if (errorincontest) {
    console.error("Error during contest validation:", errorincontest); // Log error if present
  }
  return { contestData, errorincontest };
}

// To insert new record into contest-entry table
export async function insertContestEntry(entry: ContestEntryModel) {
  const { contest_id, meme_id, user_id } = entry;

  console.log("Meme id is: " ,entry.meme_id);

  console.log("Inserting contest entry with data:", entry); // Log the entry data being inserted

  // Default values for optional fields
  const created_at = new Date(); // Create a Date object
  const like_count = 0; // Default like count
  const comment_count = 0; // Default comment count
  const flag_count = 0; // Default flag count

  const { data: insertedData, error: errorininsert } = await supabase
    .from(TABLE_NAMES.CONTESTENTRY_TABLE)
    .insert({
      contest_id,
      meme_id,
      user_id,
      created_at,  // Pass the Date object
      like_count,  // Default like count
      comment_count,  // Default comment count
      flag_count,  // Default flag count
    })
    .select()
    .single();

  if (errorininsert) {
    console.error("Error inserting contest entry:", errorininsert); // Log error during insertion
  }

  console.log("Insert result:", insertedData); // Log the inserted data
  return { insertedData, errorininsert };
}
