import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

import { siteUrl } from "@/constants/siteUrl";

export async function POST() {
  const supabase = createServerClient();

  // Sign the user out by invoking the signOut method of the Supabase auth client.
  await supabase.auth.signOut();

  // Redirect the user to the login page.
  return NextResponse.redirect(`${siteUrl}/login`, {
    // a 301 status is required to redirect from a POST to a GET route
    status: 303,
  });
}
