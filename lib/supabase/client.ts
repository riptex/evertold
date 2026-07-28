import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. " +
      "Set them in .env.local (see .env.example) before running the app.",
  );
}

/**
 * Standard organizer/member/viewer client — persists the user's own
 * session via AsyncStorage, auto-refreshes tokens.
 *
 * Do NOT use this client for storyteller-device auth. The storyteller
 * device session is a separate, custom-JWT flow (short-lived token,
 * organizer-paired, revocation-checked on refresh — see
 * docs/architecture/data-model.md §0) minted by an Edge Function, not
 * Supabase's normal email/phone/OAuth session. That flow gets its own
 * client instance once the pairing task lands, configured with
 * `persistSession: false` and its own storage key so the two sessions
 * never collide on one device.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
