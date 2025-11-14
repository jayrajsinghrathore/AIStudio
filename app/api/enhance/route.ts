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

// import { enhancePromptWithGemini } from "@/lib/google-api"
// import { type NextRequest, NextResponse } from "next/server"

// // Simple in-memory rate limiter (per IP)
// const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
//   const now = Date.now()
//   const record = rateLimitMap.get(ip)

//   if (!record || now > record.resetTime) {
//     rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
//     return true
//   }

//   if (record.count >= maxRequests) {
//     return false
//   }

//   record.count++
//   return true
// }

// export async function POST(request: NextRequest) {
//   try {
//     // Get client IP for rate limiting
//     const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

//     // Check rate limit: 10 requests per minute
//     if (!checkRateLimit(ip, 10, 60000)) {
//       return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
//     }

//     // Validate request
//     const body = await request.json()
//     const { prompt, stylePreset } = body

//     if (!prompt || typeof prompt !== "string") {
//       return NextResponse.json(
//         { error: "Invalid request. 'prompt' field is required and must be a string." },
//         { status: 400 },
//       )
//     }

//     if (prompt.trim().length === 0) {
//       return NextResponse.json({ error: "Prompt cannot be empty." }, { status: 400 })
//     }

//     if (prompt.length > 2000) {
//       return NextResponse.json({ error: "Prompt is too long (max 2000 characters)." }, { status: 422 })
//     }

//     // Enhance prompt with Gemini
//     let enhancedPrompt = await enhancePromptWithGemini(prompt)

//     // Append style preset if provided
//     if (stylePreset && ["Photorealistic", "Oil Painting", "Social Ad", "Catalog"].includes(stylePreset)) {
//       enhancedPrompt = `${enhancedPrompt} | Style: ${stylePreset}`
//     }

//     console.log("[enhance] Successfully enhanced prompt")

//     return NextResponse.json({ enhancedPrompt }, { status: 200 })
//   } catch (error) {
//     console.error("[enhance] Error:", error)

//     const message = error instanceof Error ? error.message : "An unexpected error occurred"

//     // Return appropriate status based on error type
//     if (message.includes("API key")) {
//       return NextResponse.json({ error: "Service configuration error. Please try again later." }, { status: 500 })
//     }

//     return NextResponse.json({ error: `Failed to enhance prompt: ${message}` }, { status: 500 })
//   }
// }

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

//////////////////////////////////////////////////////////////////////////////////////////////////


// app/api/enhance/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { enhancePromptWithGemini } from "../../../lib/google-api";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { prompt, stylePreset } = body ?? {};

//     if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
//       return NextResponse.json({ error: "prompt is required" }, { status: 400 });
//     }

//     const enhanced = await enhancePromptWithGemini(prompt, stylePreset);
//     return NextResponse.json({ enhancedPrompt: enhanced }, { status: 200 });
//   } catch (err: any) {
//     console.error("Enhance error:", err);
//     const msg = err?.message || "Enhancement failed";
//     return NextResponse.json({ error: msg }, { status: 500 });
//   }
// }




// app/api/enhance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { enhancePromptWithGemini } from "../../../lib/google-api";

/**
 * Server-side enhance endpoint
 * - Expects { prompt: string, stylePreset?: string } in body
 * - Uses enhancePromptWithGemini(...) (server-only)
 * - Returns { enhancedPrompt } on success
 * - Returns friendly messages for transient errors (503) and client errors (400)
 */

const TIMEOUT_MS = 25000; // max wait for Gemini enhancement (tune as needed)
const RETRY_AFTER_SECONDS = 3; // suggested Retry-After for transient errors (tune as needed)

function isTransientErrorMessage(msg: string) {
  if (!msg) return false;
  const lower = msg.toLowerCase();
  return (
    lower.includes("unavailable") ||
    lower.includes("overloaded") ||
    lower.includes("503") ||
    lower.includes("service unavailable") ||
    lower.includes("too many requests") || // 429
    lower.includes("rate limit")
  );
}

function isClientErrorMessage(msg: string) {
  if (!msg) return false;
  const lower = msg.toLowerCase();
  return (
    lower.includes("invalid argument") ||
    lower.includes("please use a valid role") ||
    lower.includes("invalid") ||
    lower.includes("400")
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { prompt, stylePreset } = body ?? {};

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    // Run enhancePromptWithGemini but with a timeout guard
    const enhancementPromise = enhancePromptWithGemini(prompt, stylePreset);

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("enhancement_timeout")), TIMEOUT_MS)
    );

    let enhanced: string;
    try {
      enhanced = await Promise.race([enhancementPromise, timeoutPromise]);
    } catch (err: any) {
      const msg = String(err?.message ?? err);

      // Timeout
      if (msg === "enhancement_timeout") {
        console.error("[Enhance] Timeout after", TIMEOUT_MS, "ms for prompt:", prompt.slice(0, 200));
        return new NextResponse(
          JSON.stringify({ error: "Service timed out. Please try again." }),
          {
            status: 503,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(RETRY_AFTER_SECONDS),
            },
          }
        );
      }

      // If the underlying error is transient (model overloaded / rate limit), return 503
      if (isTransientErrorMessage(msg)) {
        console.warn("[Enhance] Transient error from Gemini:", msg);
        return new NextResponse(
          JSON.stringify({
            error: "Service temporarily busy. Please try again shortly.",
          }),
          {
            status: 503,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(RETRY_AFTER_SECONDS),
            },
          }
        );
      }

      // If it's a client-side error (bad payload), return 400 with the original message
      if (isClientErrorMessage(msg)) {
        console.warn("[Enhance] Client error from Gemini / validation:", msg);
        return NextResponse.json({ error: msg }, { status: 400 });
      }

      // Otherwise rethrow to outer catch to centralize logging
      throw err;
    }

    // Success: return enhanced prompt
    return NextResponse.json({ enhancedPrompt: enhanced }, { status: 200 });
  } catch (err: any) {
    // Centralized error handling & server-side logging
    const raw = String(err?.message ?? err);
    console.error("[Enhance] Unexpected server error:", raw);

    // If the message looks transient, map to 503 (safety)
    if (isTransientErrorMessage(raw)) {
      return new NextResponse(
        JSON.stringify({ error: "Service temporarily busy. Please try again shortly." }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(RETRY_AFTER_SECONDS),
          },
        }
      );
    }

    // Default: 500 internal server error
    return NextResponse.json({ error: "Enhancement failed. See server logs for details." }, { status: 500 });
  }
}
