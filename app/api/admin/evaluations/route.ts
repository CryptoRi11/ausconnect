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

  const playerId = req.nextUrl.searchParams.get("player_id");
  if (!playerId) return NextResponse.json({ error: "player_id required" }, { status: 400 });

  const { data, error } = await sb()
    .from("evaluations")
    .select("id, offensive_ability, defensive_skills, overall_iq, physical_ability, culture_rating, composite_score, notes, created_at")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!verify(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { player_id, offensive_ability, defensive_skills, overall_iq, physical_ability, culture_rating, notes } = await req.json();

  const { data, error } = await sb()
    .from("evaluations")
    .insert({ player_id, offensive_ability, defensive_skills, overall_iq, physical_ability, culture_rating, notes })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}

export async function PATCH(req: NextRequest) {
  if (!verify(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, offensive_ability, defensive_skills, overall_iq, physical_ability, culture_rating, notes } = await req.json();

  const { error } = await sb()
    .from("evaluations")
    .update({ offensive_ability, defensive_skills, overall_iq, physical_ability, culture_rating, notes })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
