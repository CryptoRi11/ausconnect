import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json();

  if (!email || !password || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Admin client bypasses RLS and email confirmation enforcement
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // email_confirm: true marks the email as already verified so the user
  // can sign in immediately without clicking a confirmation link
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, userId: data.user?.id });
}
