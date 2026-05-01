import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function verify(req: NextRequest) {
  return req.headers.get("x-admin-token") === process.env.ADMIN_PASSWORD;
}

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  if (!verify(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await sb()
    .from("coach_profiles")
    .select("id, user_id, full_name, university, position_title, created_at, users(email, subscription_status)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
