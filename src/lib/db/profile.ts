import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, OutputFormat, ConversationStyle } from "@/types";

export async function getProfile(
  supabase: SupabaseClient
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data as Profile;
}

export async function updatePreferences(
  supabase: SupabaseClient,
  preferences: {
    preferred_format?: OutputFormat;
    preferred_style?: ConversationStyle;
    show_typing_indicator?: boolean;
  }
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("profiles")
    .update({ ...preferences, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating preferences:", error);
  }
}
