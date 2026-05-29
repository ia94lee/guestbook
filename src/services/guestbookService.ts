import { supabase } from "../lib/supabase";
import type { GuestbookEntry, GuestbookInsertPayload } from "../types/guestbook";

type Row = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

function rowToEntry(row: Row): GuestbookEntry {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function listGuestbookEntries(): Promise<GuestbookEntry[]> {
  const { data, error } = await supabase
    .from("guestbook")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Row[]).map(rowToEntry);
}

export async function insertGuestbookEntry(
  payload: GuestbookInsertPayload
): Promise<GuestbookEntry> {
  const { data, error } = await supabase
    .from("guestbook")
    .insert({ name: payload.name, message: payload.message })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToEntry(data as Row);
}
