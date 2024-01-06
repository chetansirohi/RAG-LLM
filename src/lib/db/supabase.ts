import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../@types/supabase";

const SUPABASE_URL: string | undefined = process.env.SUPABASE_URL;
const SUPABASE_PRIVATE_KEY: string | undefined = process.env.SUPABASE_PRIVATE_KEY;

if (!SUPABASE_URL) {
    throw new Error('Expected env var SUPABASE_URL');
}

if (!SUPABASE_PRIVATE_KEY) {
    throw new Error('Expected env var SUPABASE_PRIVATE_KEY');
}

const client: SupabaseClient<Database> = createClient(SUPABASE_URL, SUPABASE_PRIVATE_KEY);

export default client;
