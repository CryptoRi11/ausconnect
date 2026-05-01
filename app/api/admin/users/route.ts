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

export async function PATCH(req: NextRequest) {
  if (!verify(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, updates } = await req.json();
  const { error } = await sb()
    .from("users")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
