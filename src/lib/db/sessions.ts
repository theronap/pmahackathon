import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Session,
  OutputFormat,
  ConversationStyle,
  ReformatResult,
} from "@/types";

export async function saveSession(
  supabase: SupabaseClient,
  data: {
    input_text: string;
    input_source: "paste" | "file_upload";
    file_name?: string | null;
    file_storage_path?: string | null;
    format: OutputFormat;
    conversation_style?: ConversationStyle | null;
    result: ReformatResult;
  }
): Promise<Session | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      input_text: data.input_text,
      input_source: data.input_source,
      file_name: data.file_name ?? null,
      file_storage_path: data.file_storage_path ?? null,
      format: data.format,
      conversation_style: data.conversation_style ?? null,
      result: data.result,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving session:", error);
    return null;
  }

  return session as Session;
}

export async function getSessions(
  supabase: SupabaseClient,
  limit = 20
): Promise<Session[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }

  return data as Session[];
}

export async function getSession(
  supabase: SupabaseClient,
  sessionId: string
): Promise<Session | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) {
    console.error("Error fetching session:", error);
    return null;
  }

  return data as Session;
}

export async function deleteSession(
  supabase: SupabaseClient,
  sessionId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId);

  if (error) {
    console.error("Error deleting session:", error);
    return false;
  }

  return true;
}
