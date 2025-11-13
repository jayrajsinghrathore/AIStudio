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

import { generateImagesWithBanana } from "@/lib/google-api"
import { createGenerationRecord } from "@/lib/supabase-server"
import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

// Rate limiter for authenticated users
const userRateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkUserRateLimit(userId: string, maxRequests = 3, windowMs = 60000): boolean {
  const now = Date.now()
  const record = userRateLimitMap.get(userId)

  if (!record || now > record.resetTime) {
    userRateLimitMap.set(userId, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

async function getUserFromAuthHeader(authHeader?: string) {
  if (!authHeader) return null

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) return null

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const token = authHeader.replace("Bearer ", "")
    const { data } = await supabase.auth.getUser(token)

    return data?.user
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract user from auth header or cookies
    const authHeader = request.headers.get("authorization")
    const user = await getUserFromAuthHeader(authHeader)

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in to generate images." }, { status: 401 })
    }

    // Check rate limit: 3 requests per minute per user
    if (!checkUserRateLimit(user.id, 3, 60000)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. You can generate 3 images per minute. Please try again later." },
        { status: 429 },
      )
    }

    // Validate request
    const body = await request.json()
    const { prompt, enhancedPrompt, numVariations = 1, stylePreset } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid request. 'prompt' field is required." }, { status: 400 })
    }

    const variations = Math.min(Math.max(numVariations || 1, 1), 4)

    console.log(`[generate] Starting generation for user ${user.id}:`, {
      prompt,
      variations,
      stylePreset,
    })

    // Generate images with Banana.dev
    const imageIds = await generateImagesWithBanana(enhancedPrompt || prompt, variations)

    // For production: save metadata to database and return image URLs from Supabase
    // For now: return the generation metadata
    const generationId = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    console.log(`[generate] Image generation completed. IDs: ${imageIds.join(", ")}`)

    // Create database record
    try {
      await createGenerationRecord(user.id, prompt, enhancedPrompt || prompt, imageIds, stylePreset)
    } catch (dbError) {
      console.warn("[generate] Database save failed, but images generated:", dbError)
      // Don't fail the request if DB save fails
    }

    return NextResponse.json(
      {
        generationId,
        imageUrls: imageIds,
        message: "Images generated successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[generate] Error:", error)

    const message = error instanceof Error ? error.message : "An unexpected error occurred"

    if (message.includes("Rate limit")) {
      return NextResponse.json(
        { error: "Image generation service is busy. Please try again shortly." },
        { status: 429 },
      )
    }

    if (message.includes("API key")) {
      return NextResponse.json({ error: "Service configuration error. Please try again later." }, { status: 500 })
    }

    return NextResponse.json({ error: `Failed to generate images: ${message}` }, { status: 500 })
  }
}

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
