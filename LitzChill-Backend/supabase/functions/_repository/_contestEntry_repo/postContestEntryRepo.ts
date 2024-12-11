import { createClient } from "npm:@supabase/supabase-js";
import ContestEntryModel from "../../_model/contest_entry_model.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// This module contains utility functions for interacting with a Supabase database to validate 
// and manage contest-related data. The operations include validation of contests, memes, and users, 
// checking for existing contest entries, and inserting new contest entries.

export async function validateContest(contestId: string) {
  const { data: contestData, error: errorincontest } = await supabase
    .from("contest")
    .select("*")
    .eq("contest_id", contestId);
  return { contestData, errorincontest };
}

export async function validateMeme(memeId: string) {
  const { data: MemeData, error: errorinmeme } = await supabase
    .from("memes")
    .select("*")
    .eq("meme_id", memeId);
  return { MemeData, errorinmeme };
}

export async function validateUser(userId: string) {
  const { data: userData, error: errorinuser } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId);
  return { userData, errorinuser };
}

export async function checkExistingEntry(contestId: string, memeId: string) {
  const { data: isFound, error: errorinexist } = await supabase
    .from("contest_entry")
    .select("*")
    .eq("contest_id", contestId)
    .eq("meme_id", memeId);
  return { isFound, errorinexist };
}

export async function insertContestEntry(entry: ContestEntryModel) {
  const { data: insertedData, error: errorininsert } = await supabase
    .from("contest_entry")
    .insert(entry)
    .select().single();
  return { insertedData, errorininsert };
}
