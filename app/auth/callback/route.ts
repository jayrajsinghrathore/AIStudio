import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/studio"

  // In production, exchange code for session here
  if (code) {
    const supabase = await createClient()
    // await supabase.auth.exchangeCodeForSession(code)
  }

  // redirect the user to the specified redirect URL
  return NextResponse.redirect(new URL(next, request.url))
}
