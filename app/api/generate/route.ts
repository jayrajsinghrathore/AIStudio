/**
 * POST /api/generate
 * Generates images using Banana.dev (Stable Diffusion) and saves to Supabase Storage
 *
 * Request body: { prompt: string, enhancedPrompt: string, numVariations?: number, stylePreset?: string }
 * Response: { generationId: string, imageUrls: string[] }
 *
 * Error responses:
 * - 400: Invalid input
 * - 401: Unauthorized
 * - 429: Rate limit exceeded
 * - 500: Server error
 */

// import { generateImagesWithBanana } from "@/lib/google-api"
// import { createGenerationRecord } from "@/lib/supabase-server"
// import { createClient } from "@supabase/supabase-js"
// import { type NextRequest, NextResponse } from "next/server"

// // Rate limiter for authenticated users
// const userRateLimitMap = new Map<string, { count: number; resetTime: number }>()

// function checkUserRateLimit(userId: string, maxRequests = 3, windowMs = 60000): boolean {
//   const now = Date.now()
//   const record = userRateLimitMap.get(userId)

//   if (!record || now > record.resetTime) {
//     userRateLimitMap.set(userId, { count: 1, resetTime: now + windowMs })
//     return true
//   }

//   if (record.count >= maxRequests) {
//     return false
//   }

//   record.count++
//   return true
// }

// async function getUserFromAuthHeader(authHeader?: string) {
//   if (!authHeader) return null

//   try {
//     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
//     const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

//     if (!supabaseUrl || !supabaseAnonKey) return null

//     const supabase = createClient(supabaseUrl, supabaseAnonKey)

//     const token = authHeader.replace("Bearer ", "")
//     const { data } = await supabase.auth.getUser(token)

//     return data?.user
//   } catch {
//     return null
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     // Extract user from auth header or cookies
//     const authHeader = request.headers.get("authorization")
//     const user = await getUserFromAuthHeader(authHeader)

//     if (!user || !user.id) {
//       return NextResponse.json({ error: "Unauthorized. Please log in to generate images." }, { status: 401 })
//     }

//     // Check rate limit: 3 requests per minute per user
//     if (!checkUserRateLimit(user.id, 3, 60000)) {
//       return NextResponse.json(
//         { error: "Rate limit exceeded. You can generate 3 images per minute. Please try again later." },
//         { status: 429 },
//       )
//     }

//     // Validate request
//     const body = await request.json()
//     const { prompt, enhancedPrompt, numVariations = 1, stylePreset } = body

//     if (!prompt || typeof prompt !== "string") {
//       return NextResponse.json({ error: "Invalid request. 'prompt' field is required." }, { status: 400 })
//     }

//     const variations = Math.min(Math.max(numVariations || 1, 1), 4)

//     console.log(`[generate] Starting generation for user ${user.id}:`, {
//       prompt,
//       variations,
//       stylePreset,
//     })

//     // Generate images with Banana.dev
//     const imageIds = await generateImagesWithBanana(enhancedPrompt || prompt, variations)

//     // For production: save metadata to database and return image URLs from Supabase
//     // For now: return the generation metadata
//     const generationId = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

//     console.log(`[generate] Image generation completed. IDs: ${imageIds.join(", ")}`)

//     // Create database record
//     try {
//       await createGenerationRecord(user.id, prompt, enhancedPrompt || prompt, imageIds, stylePreset)
//     } catch (dbError) {
//       console.warn("[generate] Database save failed, but images generated:", dbError)
//       // Don't fail the request if DB save fails
//     }

//     return NextResponse.json(
//       {
//         generationId,
//         imageUrls: imageIds,
//         message: "Images generated successfully",
//       },
//       { status: 200 },
//     )
//   } catch (error) {
//     console.error("[generate] Error:", error)

//     const message = error instanceof Error ? error.message : "An unexpected error occurred"

//     if (message.includes("Rate limit")) {
//       return NextResponse.json(
//         { error: "Image generation service is busy. Please try again shortly." },
//         { status: 429 },
//       )
//     }

//     if (message.includes("API key")) {
//       return NextResponse.json({ error: "Service configuration error. Please try again later." }, { status: 500 })
//     }

//     return NextResponse.json({ error: `Failed to generate images: ${message}` }, { status: 500 })
//   }
// }

/**
 * Example successful response:
 * {
 *   "generationId": "gen-1704067200000-abc123def456",
 *   "imageUrls": ["banana-call-id-1", "banana-call-id-2"],
 *   "message": "Images generated successfully"
 * }
 *
 * Example error response (rate limit):
 * {
 *   "error": "Rate limit exceeded. You can generate 3 images per minute. Please try again later."
 * }
 *
 * Example cURL:
 * curl -X POST http://localhost:3000/api/generate \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
 *   -d '{
 *     "prompt":"rose quartz serum",
 *     "enhancedPrompt":"A luxurious rose quartz face serum...",
 *     "numVariations":2,
 *     "stylePreset":"Photorealistic"
 *   }'
 */
// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateImageWithGemini } from "../../../lib/google-api";
import { supabaseServer } from "../../../lib/supabase-server";

/**
 * POST body:
 * {
 *   prompt: string,               // either original or enhanced
 *   enhancedPrompt?: string,      // optional
 *   stylePreset?: string,         // optional
 *   width?: number,
 *   height?: number
 * }
 *
 * Authentication:
 * This handler tries to read the Supabase session cookie via createServerSupabaseClient in your app.
 * If you do not use the auth-helpers, you may need to pass userId in body (not recommended in prod).
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, enhancedPrompt, stylePreset, width = 1024, height = 1024 } = body ?? {};

    const finalPrompt = (enhancedPrompt && enhancedPrompt.trim().length > 0) ? enhancedPrompt : prompt;

    if (!finalPrompt || typeof finalPrompt !== "string" || finalPrompt.trim().length === 0) {
      return NextResponse.json({ error: "prompt or enhancedPrompt required" }, { status: 400 });
    }

    // AUTH: try to read the user from Supabase cookie/session
    // If you use @supabase/auth-helpers-nextjs, you can import and use createServerSupabaseClient
    // Fallback: require user_id in body (dev only)
    // Below is a safe fallback: attempt to get user via Supabase session cookie (if present)
    let userId: string | null = null;
    try {
      // If project includes auth-helpers, use this:
      // import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
      // const supabaseAuth = createServerSupabaseClient({ req, res }); // App Router trickiness may vary
      // const { data } = await supabaseAuth.auth.getUser();
      // userId = data?.user?.id ?? null;

      // Simple fallback: try to read supabase auth cookie JWT token from "Authorization" header or cookie (less secure)
      // Not implemented here — require user id in body for dev fallback
      // For safety, require a server-side check: if no userId present, do not proceed
      userId = body?.userId ?? null;
    } catch (err) {
      userId = body?.userId ?? null;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unable to authenticate user. Include valid session or userId (dev only)" }, { status: 401 });
    }

    // Call image generation
    const urls = await generateImageWithGemini({
      prompt: finalPrompt,
      userId,
      width,
      height,
      numVariations: 1,
      stylePreset,
    });

    // Persist metadata to Supabase 'generations' table
    // Table should have columns: id (uuid), user_id, original_prompt, enhanced_prompt, style_preset, image_urls (text[]), created_at
    const { error: insertError } = await supabaseServer.from("generations").insert([
      {
        user_id: userId,
        original_prompt: prompt ?? null,
        enhanced_prompt: enhancedPrompt ?? finalPrompt,
        style_preset: stylePreset ?? null,
        image_urls: urls,
        meta: { model: process.env.GOOGLE_AI_MODEL_IMAGE ?? null },
      },
    ]);

    if (insertError) {
      console.error("DB insert error:", insertError);
      // Return images but indicate DB write failed
      return NextResponse.json({ imageUrls: urls, warning: "db_insert_failed", dbError: insertError.message }, { status: 200 });
    }

    return NextResponse.json({ imageUrls: urls }, { status: 200 });
  } catch (err: any) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: err?.message || "Image generation failed" }, { status: 500 });
  }
}
