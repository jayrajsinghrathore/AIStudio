/**
 * POST /api/enhance
 * Enhances a beauty product prompt using Google Gemini API
 *
 * Request body: { prompt: string, stylePreset?: string }
 * Response: { enhancedPrompt: string }
 *
 * Error responses:
 * - 400: Invalid input
 * - 429: Rate limit exceeded
 * - 500: Server error
 */

import { enhancePromptWithGemini } from "@/lib/google-api"
import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory rate limiter (per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Check rate limit: 10 requests per minute
    if (!checkRateLimit(ip, 10, 60000)) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    // Validate request
    const body = await request.json()
    const { prompt, stylePreset } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid request. 'prompt' field is required and must be a string." },
        { status: 400 },
      )
    }

    if (prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt cannot be empty." }, { status: 400 })
    }

    if (prompt.length > 2000) {
      return NextResponse.json({ error: "Prompt is too long (max 2000 characters)." }, { status: 422 })
    }

    // Enhance prompt with Gemini
    let enhancedPrompt = await enhancePromptWithGemini(prompt)

    // Append style preset if provided
    if (stylePreset && ["Photorealistic", "Oil Painting", "Social Ad", "Catalog"].includes(stylePreset)) {
      enhancedPrompt = `${enhancedPrompt} | Style: ${stylePreset}`
    }

    console.log("[enhance] Successfully enhanced prompt")

    return NextResponse.json({ enhancedPrompt }, { status: 200 })
  } catch (error) {
    console.error("[enhance] Error:", error)

    const message = error instanceof Error ? error.message : "An unexpected error occurred"

    // Return appropriate status based on error type
    if (message.includes("API key")) {
      return NextResponse.json({ error: "Service configuration error. Please try again later." }, { status: 500 })
    }

    return NextResponse.json({ error: `Failed to enhance prompt: ${message}` }, { status: 500 })
  }
}

/**
 * Example successful response:
 * {
 *   "enhancedPrompt": "A luxurious rose quartz face serum in a minimalist glass bottle with rose gold dropper,
 *   captured with macro photography at 1:1 aspect ratio. Soft window lighting with subtle fill light revealing
 *   the luminous serum texture inside. Pastel pink and warm white color palette with soft shadows. Professional
 *   beauty product photography, shallow depth of field with blurred elegant background, shot on Hasselblad with
 *   50mm macro lens. Creamy smooth surfaces with dewdrops reflecting light. Luxurious, serene mood. Magazine cover
 *   quality. | Style: Photorealistic"
 * }
 *
 * Example cURL:
 * curl -X POST http://localhost:3000/api/enhance \
 *   -H "Content-Type: application/json" \
 *   -d '{"prompt":"rose quartz serum bottle","stylePreset":"Photorealistic"}'
 */
