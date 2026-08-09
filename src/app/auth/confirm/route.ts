import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const next = request.nextUrl.searchParams.get("next") ?? "/";
  if (!supabase) return NextResponse.redirect(new URL(next, request.url));

  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" })
      : { error: new Error("缺少登录凭据") };

  return NextResponse.redirect(new URL(result.error ? "/?auth=failed" : next, request.url));
}
