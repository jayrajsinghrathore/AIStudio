// /**
//  * Google AI API wrapper for Gemini text generation and image generation
//  * Handles prompt enhancement and image creation with robust error handling
//  */

// const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY
// const GOOGLE_IMAGE_API_KEY = process.env.GOOGLE_AI_API_KEY

// if (!GEMINI_API_KEY) {
//   console.warn("[google-api] GOOGLE_AI_API_KEY is not set. Gemini APIs will fail.")
// }

// interface GeminiResponse {
//   candidates: Array<{
//     content: {
//       parts: Array<{
//         text: string
//       }>
//     }
//   }>
// }

// interface ImageGenerationResponse {
//   results?: Array<{
//     image: string
//   }>
// }

// /**
//  * Enhance a prompt using Gemini API with professional photography focus
//  */
// export async function enhancePromptWithGemini(originalPrompt: string): Promise<string> {
//   if (!GEMINI_API_KEY) {
//     throw new Error("Google AI API key not configured")
//   }

//   const systemPrompt = `You are an expert beauty product photographer and AI prompt engineer. Your task is to enhance simple prompts into detailed, vivid descriptions for AI image generation.

// For the given prompt, create a single comprehensive paragraph that includes:
// - Subject description (product type, brand, packaging details)
// - Composition and framing
// - Camera technique (angle, shot type, depth of field)
// - Lens characteristics (focal length, bokeh quality)
// - Lighting setup (key light, fill light, backlighting, reflections)
// - Color palette (dominant colors, tones, gradients)
// - Textures and surface qualities
// - Mood and atmosphere
// - Professional photography style keywords

// Output ONLY the enhanced prompt, no additional text.`

//   try {
//     const response = await fetch(
//       "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text: originalPrompt,
//                 },
//               ],
//               role: "user",
//             },
//           ],
//           systemInstruction: {
//             parts: [
//               {
//                 text: systemPrompt,
//               },
//             ],
//           },
//           generationConfig: {
//             temperature: 0.7,
//             topK: 40,
//             topP: 0.95,
//             maxOutputTokens: 500,
//           },
//         }),
//         headers: {
//           "x-goog-api-key": GEMINI_API_KEY,
//           "Content-Type": "application/json",
//         },
//       },
//     )

//     if (!response.ok) {
//       const error = await response.json()
//       console.error("[google-api] Gemini enhancement error:", error)
//       throw new Error(`Gemini API error: ${response.status}`)
//     }

//     const data = (await response.json()) as GeminiResponse

//     if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
//       throw new Error("Invalid Gemini response format")
//     }

//     return data.candidates[0].content.parts[0].text
//   } catch (error) {
//     console.error("[google-api] Failed to enhance prompt:", error)
//     throw new Error(`Failed to enhance prompt: ${error instanceof Error ? error.message : "Unknown error"}`)
//   }
// }

// /**
//  * Generate images using Google's image generation API (Imagen/Gemini Vision)
//  * For production, use Google Cloud Vertex AI's imagegeneration endpoint
//  */
// export async function generateImagesWithGoogle(
//   prompt: string,
//   numVariations = 1,
//   width = 1024,
//   height = 1024,
// ): Promise<Buffer[]> {
//   if (!GOOGLE_IMAGE_API_KEY) {
//     throw new Error("Google AI API key not configured for image generation")
//   }

//   const images: Buffer[] = []

//   // Generate variations with slight prompt modifications
//   for (let i = 0; i < numVariations; i++) {
//     let variationPrompt = prompt

//     if (i > 0) {
//       const variations = [
//         ", with warmer tones and golden hour lighting",
//         ", with cooler tones and studio lighting",
//         ", with vintage color grading and soft focus",
//         ", with cinematic depth of field and dramatic shadows",
//       ]
//       variationPrompt = prompt + variations[i % variations.length]
//     }

//     try {
//       // Using a placeholder for actual image generation
//       // In production, integrate with:
//       // - Google Cloud Vertex AI (for Imagen)
//       // - Or use a service like Replicate/Banana with Stable Diffusion

//       // For now, return a placeholder that indicates successful API call structure
//       const imageBuffer = Buffer.from(
//         JSON.stringify({
//           prompt: variationPrompt,
//           timestamp: new Date().toISOString(),
//         }),
//       )

//       images.push(imageBuffer)
//     } catch (error) {
//       console.error(`[google-api] Failed to generate image variation ${i + 1}:`, error)
//       throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : "Unknown error"}`)
//     }
//   }

//   return images
// }

// /**
//  * Call Banana.dev API for image generation (alternative to Google)
//  */
// export async function generateImagesWithBanana(prompt: string, numVariations = 1): Promise<string[]> {
//   const BANANA_API_KEY = process.env.BANANA_API_KEY
//   const BANANA_MODEL_KEY = process.env.BANANA_MODEL_KEY

//   if (!BANANA_API_KEY || !BANANA_MODEL_KEY) {
//     throw new Error("Banana API keys not configured")
//   }

//   const imageUrls: string[] = []

//   for (let i = 0; i < numVariations; i++) {
//     let variationPrompt = prompt

//     if (i > 0) {
//       const variations = [", warmer color tone", ", cooler color tone", ", vintage style", ", cinematic style"]
//       variationPrompt = prompt + variations[i % variations.length]
//     }

//     try {
//       const response = await fetch("https://api.banana.dev/start/v4/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "api-key": BANANA_API_KEY,
//         },
//         body: JSON.stringify({
//           model_key: BANANA_MODEL_KEY,
//           startInputs: {
//             prompt: variationPrompt,
//             negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, disfigured",
//             width: 1024,
//             height: 1024,
//             num_inference_steps: 30,
//             guidance_scale: 7.5,
//           },
//         }),
//       })

//       if (!response.ok) {
//         throw new Error(`Banana API error: ${response.status}`)
//       }

//       const data = await response.json()

//       if (data.callID) {
//         imageUrls.push(data.callID)
//       }
//     } catch (error) {
//       console.error(`[google-api] Banana generation error for variation ${i + 1}:`, error)
//       throw new Error(
//         `Failed to generate image with Banana: ${error instanceof Error ? error.message : "Unknown error"}`,
//       )
//     }
// //   }

// //   return imageUrls
// // }


//////////////////////////////////////////////////////////////////////////////////////////////////


// // lib/google-api.ts
// // import fetch from "node-fetch"; // Node 18+ may have global fetch; keep import for clarity
// import { Buffer } from "buffer";
// import { supabaseServer } from "./supabase-server";
// import { v4 as uuidv4 } from "uuid";



// const GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY;
// const GOOGLE_MODEL_TEXT = process.env.GOOGLE_AI_MODEL_TEXT || "gemini-2.5-pro";
// const GOOGLE_MODEL_IMAGE = process.env.GOOGLE_AI_MODEL_IMAGE || "gemini-2.5-flash-image";

// /**
//  * Helper: perform prompt enhancement via Gemini (text model).
//  * Returns a trimmed single-paragraph enhanced prompt.
//  */
// export async function enhancePromptWithGemini(originalPrompt: string, stylePreset?: string) {
//   if (!GOOGLE_API_KEY) throw new Error("GOOGLE_AI_API_KEY not configured");
//   if (!originalPrompt || originalPrompt.trim().length === 0) {
//     throw new Error("original prompt required");
//   }

//   const systemInstruction = `You are an expert prompt engineer for image generation. Given the user's brief, return a single, vivid, detailed prompt optimized for an image-generation model used for commercial beauty product ads. Include subject description, composition, camera/shot, lens/focal length, lighting, color palette, textures, mood, and style keywords. If a style preset is provided, append style-specific keywords. Output only the enhanced prompt (one paragraph).`;

//   // Request body — adjust if Google API requires a slightly different shape in your account
//   const body = {
//     // This shape is representative; confirm with your Google AI docs if necessary.
//     model: GOOGLE_MODEL_TEXT,
//     input: [
//       { role: "system", content: systemInstruction },
//       {
//         role: "user",
//         content: `Prompt: ${originalPrompt}${stylePreset ? `\nStylePreset: ${stylePreset}` : ""}`,
//       },
//     ],
//     // add options like temperature/generation params if supported/desired
//   };

//   // const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
//   //   GOOGLE_MODEL_TEXT
//   // )}:generateText`;

//   // const res = await fetch(url, {
//   //   method: "POST",
//   //   headers: {
//   //     "Content-Type": "application/json",
//   //     Authorization: `Bearer ${GOOGLE_API_KEY}`,
//   //   },
//   //   body: JSON.stringify(body),
//   // });

//   // if (!res.ok) {
//   //   const txt = await res.text();
//   //   throw new Error(`Gemini text enhancement failed: ${res.status} ${txt}`);
//   // }

//   // const json = await res.json();

//   // ---------- REPLACEMENT CODE START ----------
// /**
//  * Build endpoint URL and headers correctly for:
//  *  - API key usage: pass ?key=API_KEY and DO NOT set Authorization header
//  *  - OAuth token usage: pass Authorization: Bearer <token>
//  */
// const baseUrl = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
//   GOOGLE_MODEL_TEXT
// )}:generateText`;

// // If the GOOGLE_API_KEY looks like an API key (not an OAuth2 Bearer token) then
// // append ?key=...; otherwise send Authorization header.
// // Heuristic: OAuth2 tokens often start with "ya29." (Google OAuth access tokens),
// // while API keys are short alphanumeric strings. We use a simple safe heuristic.
// const isOAuthBearer = typeof GOOGLE_API_KEY === "string" && GOOGLE_API_KEY.startsWith("ya29.");
// const url = isOAuthBearer || !GOOGLE_API_KEY ? baseUrl : `${baseUrl}?key=${encodeURIComponent(GOOGLE_API_KEY)}`;

// const headers: Record<string,string> = {
//   "Content-Type": "application/json",
// };

// // If we are using an OAuth Bearer token, send Authorization header
// if (isOAuthBearer) {
//   headers["Authorization"] = `Bearer ${GOOGLE_API_KEY}`;
// }

// // Now call the API
// const res = await fetch(url, {
//   method: "POST",
//   headers,
//   body: JSON.stringify(body),
// });

// if (!res.ok) {
//   const txt = await res.text();
//   // include response text in the thrown error (useful for debugging)
//   throw new Error(`Gemini text enhancement failed: ${res.status} ${txt}`);
// }

// const json = await res.json();
// // ... (rest of parsing logic)


//   // Robust parsing - different API versions use different keys; try common possibilities:
//   const candidate =
//     json?.candidates?.[0]?.content?.[0]?.text ||
//     json?.candidates?.[0]?.content ||
//     json?.output?.[0]?.content ||
//     json?.output?.[0]?.message?.content ||
//     json?.text ||
//     json?.response ||
//     null;

//   if (!candidate || typeof candidate !== "string") {
//     // fallback: try other fields
//     const raw = JSON.stringify(json).slice(0, 2000);
//     throw new Error(`Unexpected Gemini response shape: ${raw}`);
//   }

//   // Clean and return
//   const enhanced = candidate.trim().replace(/\s{2,}/g, " ");
//   // Optionally ensure it isn't too long/too short
//   if (enhanced.length < 20) {
//     throw new Error("Gemini returned an unusually short enhanced prompt");
//   }
//   return enhanced;
// }

// /**
//  * Generate a single image (or multiple in a loop) with the Google image generation model.
//  * Uploads the image to Supabase Storage and returns the public URL(s).
//  *
//  * Options:
//  *  - prompt: enhanced prompt (required)
//  *  - userId: used for storage path (optional but recommended)
//  *  - width/height: integers
//  *  - numVariations: integer (1 recommended for now)
//  *
//  * NOTE: Google response shapes vary by model/account. This function tries common keys:
//  *   - base64 image in response at: image.b64_json or output[0].b64_json or imageBytes
//  */
// export async function generateImageWithGemini({
//   prompt,
//   userId,
//   width = 1024,
//   height = 1024,
//   numVariations = 1,
//   stylePreset,
// }: {
//   prompt: string;
//   userId?: string;
//   width?: number;
//   height?: number;
//   numVariations?: number;
//   stylePreset?: string | null;
// }): Promise<string[]> {
//   if (!GOOGLE_API_KEY) throw new Error("GOOGLE_AI_API_KEY not configured");
//   if (!prompt || prompt.trim().length === 0) throw new Error("prompt required");

//   const model = GOOGLE_MODEL_IMAGE;
//   const bucket = process.env.SUPABASE_BUCKET || "generations";

//   const results: string[] = [];

//   // Limit to 1 for now per your instruction to ignore multi-variation schema
//   const iterations = Math.max(1, Math.min(1, numVariations));

//   for (let i = 0; i < iterations; i++) {
//     // Build final prompt (optionally include style)
//     let finalPrompt = prompt;
//     if (stylePreset) finalPrompt = `${finalPrompt}, style: ${stylePreset}`;

//     // Build the request body for image generation.
//     // NOTE: verify exact request structure for your chosen model — this is a common pattern.
//     const body = {
//       model,
//       prompt: finalPrompt,
//       size: { width, height },
//       // additional model params (guidance, seed, steps) may be added if supported
//     };

//     const url = `https://api.generativeai.google/v1/models/${encodeURIComponent(model)}:generateImage`;

//     const r = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${GOOGLE_API_KEY}`,
//       },
//       body: JSON.stringify(body),
//     });

//     if (!r.ok) {
//       const txt = await r.text();
//       throw new Error(`Google image generation failed: ${r.status} ${txt}`);
//     }

//     const j = await r.json();

//     // Try several common locations for base64 content. Adapt if your account returns a different shape.
//     const base64 =
//       j?.image?.b64_json ||
//       j?.output?.[0]?.b64_json ||
//       j?.imageBytes ||
//       j?.output?.[0]?.image?.b64 ||
//       j?.b64 ||
//       null;

//     if (!base64) {
//       // If Google returns a direct URL (rare) — check it
//       const maybeUrl = j?.output?.[0]?.url || j?.image?.url || j?.url || null;
//       if (maybeUrl && typeof maybeUrl === "string" && maybeUrl.startsWith("http")) {
//         // Download it and upload to Supabase, or simply use the URL (but for consistency we upload)
//         const imgResp = await fetch(maybeUrl);
//         if (!imgResp.ok) throw new Error("Failed to fetch image from Google-provided URL");
//         const buffer = Buffer.from(await imgResp.arrayBuffer());
//         const filename = `generations/${userId || "anon"}/${Date.now()}-${uuidv4()}.png`;
//         const { error: uploadError } = await supabaseServer.storage
//           .from(bucket)
//           .upload(filename, buffer, { contentType: "image/png" });
//         if (uploadError) throw uploadError;
//         // const { publicURL } = supabaseServer.storage.from(bucket).getPublicUrl(filename);
//         // results.push(publicURL);
//         const { data } = supabaseServer.storage.from(bucket).getPublicUrl(filename);
// const publicUrl = data?.publicUrl ?? null;
// if (!publicUrl) throw new Error('Failed to get public URL');
// results.push(publicUrl);

//         continue;
//       }

//       // otherwise error - unexpected response
//       throw new Error(`No image base64 found in Google response: ${JSON.stringify(j).slice(0, 2000)}`);
//     }

//     // Convert base64 to buffer and upload to Supabase
//     const buffer = Buffer.from(base64, "base64");
//     const filename = `generations/${userId || "anon"}/${Date.now()}-${uuidv4()}.png`;

//     const { error: uploadError } = await supabaseServer.storage
//       .from(bucket)
//       .upload(filename, buffer, {
//         contentType: "image/png",
//         upsert: false,
//       });

//     if (uploadError) {
//       throw new Error(`Supabase storage upload failed: ${uploadError.message}`);
//     }

//     // Get public URL
//     const { data } = supabaseServer.storage.from(bucket).getPublicUrl(filename);
// const publicUrl = data?.publicUrl ?? null;
// if (!publicUrl) throw new Error('Failed to get public URL');
// results.push(publicUrl);

//   }

//   return results;
// }


///////////////////////////////////////////////////////////////////////////////////////////////////////

// lib/google-api.ts
// import { Buffer } from "buffer";
// import { supabaseServer } from "./supabase-server";
// import { v4 as uuidv4 } from "uuid";

// /**
//  * Server-side Google / Gemini utility functions.
//  *
//  * Important:
//  * - Ensure this file runs only on the server (Next.js server route or server actions).
//  * - Put the API key in a server environment variable named GOOGLE_AI_API_KEY (no NEXT_PUBLIC_ prefix).
//  */

// const GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY;
// const GOOGLE_MODEL_TEXT = process.env.GOOGLE_AI_MODEL_TEXT || "gemini-2.5-pro";
// const GOOGLE_MODEL_IMAGE = process.env.GOOGLE_AI_MODEL_IMAGE || "gemini-2.5-flash-image";
// const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "hahaha";

// /** Simple heuristic: Google OAuth access tokens often start with "ya29." */
// function isOAuthToken(key?: string | null) {
//   return typeof key === "string" && key.startsWith("ya29.");
// }

// /** Helper: build headers for Google generative calls */
// function buildGoogleHeaders(useOAuth: boolean) {
//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//   };
//   if (useOAuth) {
//     headers["Authorization"] = `Bearer ${GOOGLE_API_KEY}`;
//   } else if (GOOGLE_API_KEY) {
//     // Prefer x-goog-api-key header for API keys
//     headers["x-goog-api-key"] = GOOGLE_API_KEY;
//   }
//   return headers;
// }

// /**
//  * Helper: perform prompt enhancement via Gemini (text model).
//  * Returns a trimmed single-paragraph enhanced prompt.
//  */
// export async function enhancePromptWithGemini(originalPrompt: string, stylePreset?: string) {
//   if (!GOOGLE_API_KEY) throw new Error("GOOGLE_AI_API_KEY not configured (server env)");
//   if (!originalPrompt || originalPrompt.trim().length === 0) {
//     throw new Error("original prompt required");
//   }

//   const systemInstruction = `You are an expert prompt engineer for image generation. Given the user's brief, return a single, vivid, detailed prompt optimized for an image-generation model used for commercial beauty product ads. Include subject description, composition, camera/shot, lens/focal length, lighting, color palette, textures, mood, and style keywords. If a style preset is provided, append style-specific keywords. Output only the enhanced prompt (one paragraph).`;

//   // Use v1beta endpoint with generateContent and contents -> parts shape
//   const model = GOOGLE_MODEL_TEXT;
//   const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
//     model
//   )}:generateContent`;

//   const useOAuth = isOAuthToken(GOOGLE_API_KEY);
//   const headers = buildGoogleHeaders(useOAuth);

  
//  // v1beta payload shape — FIXED
// const payload = {
//   model,
//   contents: [
//     {
//       role: "user",
//       parts: [
//         {
//           text:
//             `${systemInstruction}\n\n` +
//             `User prompt: ${originalPrompt}` +
//             `${stylePreset ? `\nStylePreset: ${stylePreset}` : ""}`,
//         },
//       ],
//     },
//   ],
// };


//   const res = await fetch(url, {
//     method: "POST",
//     headers,
//     body: JSON.stringify(payload),
//   });

//   // Diagnostic logging for server console — remove or reduce verbosity in production
//   if (!res.ok) {
//     const txt = await res.text();
//     // Log full details server-side for debugging (do not leak keys)
//     console.error("[Gemini text] Request failed", {
//       status: res.status,
//       statusText: res.statusText,
//       url,
//       usedOAuth: useOAuth,
//       responseBodySnippet: txt?.slice?.(0, 2000),
//     });
//     throw new Error(`Gemini text enhancement failed: ${res.status} ${txt}`);
//   }

//   const json = await res.json();

//   // Try several likely response shapes (v1beta and older variations)
//   const candidate =
//     json?.candidates?.[0]?.content?.[0]?.text ||
//     json?.output?.[0]?.content?.[0]?.text ||
//     json?.candidates?.[0]?.content ||
//     json?.output?.[0]?.message?.content ||
//     json?.text ||
//     json?.response ||
//     null;

//   if (!candidate || typeof candidate !== "string") {
//     console.error("[Gemini text] Unexpected response shape", {
//       url,
//       usedOAuth: useOAuth,
//       raw: JSON.stringify(json).slice(0, 2000),
//     });
//     throw new Error(`Unexpected Gemini response shape: ${JSON.stringify(json).slice(0, 2000)}`);
//   }

//   const enhanced = candidate.trim().replace(/\s{2,}/g, " ");
//   if (enhanced.length < 20) {
//     throw new Error("Gemini returned an unusually short enhanced prompt");
//   }

//   return enhanced;
// }

// /**
//  * Generate image(s) with Gemini image model and upload to Supabase Storage.
//  * Returns array of public URLs for uploaded images.
//  */
// export async function generateImageWithGemini({
//   prompt,
//   userId,
//   width = 1024,
//   height = 1024,
//   numVariations = 1,
//   stylePreset,
// }: {
//   prompt: string;
//   userId?: string;
//   width?: number;
//   height?: number;
//   numVariations?: number;
//   stylePreset?: string | null;
// }): Promise<string[]> {
//   if (!GOOGLE_API_KEY) throw new Error("GOOGLE_AI_API_KEY not configured (server env)");
//   if (!prompt || prompt.trim().length === 0) throw new Error("prompt required");

//   const model = GOOGLE_MODEL_IMAGE;
//   const bucket = SUPABASE_BUCKET;

//   const results: string[] = [];

//   // Cap iterations to 1 by default (you can increase if desired)
//   const iterations = Math.max(1, Math.min(1, numVariations));

//   const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
//     model
//   )}:generateImage`;

//   const useOAuth = isOAuthToken(GOOGLE_API_KEY);
//   const headers = buildGoogleHeaders(useOAuth);

//   for (let i = 0; i < iterations; i++) {
//     let finalPrompt = prompt;
//     if (stylePreset) finalPrompt = `${finalPrompt}, style: ${stylePreset}`;

//     // Build image generation body according to v1beta common pattern
//     const imagePayload = {
//       model,
//       prompt: finalPrompt,
//       size: { width, height },
//       // add other options if supported (guidance, seed, etc.)
//     };

//     const r = await fetch(baseUrl, {
//       method: "POST",
//       headers,
//       body: JSON.stringify(imagePayload),
//     });

//     if (!r.ok) {
//       const txt = await r.text();
//       console.error("[Gemini image] Request failed", {
//         status: r.status,
//         statusText: r.statusText,
//         usedOAuth: useOAuth,
//         responseBodySnippet: txt?.slice?.(0, 2000),
//       });
//       throw new Error(`Google image generation failed: ${r.status} ${txt}`);
//     }

//     const j = await r.json();

//     // Try likely locations for base64 image bytes; adapt if your account returns different structure
//     const base64 =
//       j?.image?.b64_json ||
//       j?.output?.[0]?.b64_json ||
//       j?.output?.[0]?.image?.b64 ||
//       j?.b64 ||
//       null;

//     // If API returned an external URL instead of base64, fetch that and upload
//     if (!base64) {
//       const maybeUrl = j?.output?.[0]?.url || j?.image?.url || j?.url || null;
//       if (maybeUrl && typeof maybeUrl === "string" && maybeUrl.startsWith("http")) {
//         const imgResp = await fetch(maybeUrl);
//         if (!imgResp.ok) {
//           const txt = await imgResp.text().catch(() => "binary-fetch-failed");
//           throw new Error(`Failed to fetch image from Google-provided URL: ${imgResp.status} ${txt}`);
//         }
//         const buffer = Buffer.from(await imgResp.arrayBuffer());
//         const filename = `generations/${userId || "anon"}/${Date.now()}-${uuidv4()}.png`;

//         const { error: uploadError } = await supabaseServer.storage.from(bucket).upload(filename, buffer, {
//           contentType: "image/png",
//           upsert: false,
//         });
//         if (uploadError) throw new Error(`Supabase storage upload failed: ${uploadError.message}`);

//         const { data } = supabaseServer.storage.from(bucket).getPublicUrl(filename);
//         const publicUrl = data?.publicUrl ?? null;
//         if (!publicUrl) throw new Error("Failed to get public URL after upload");
//         results.push(publicUrl);
//         continue;
//       }

//       // No base64 and no URL — unexpected response
//       throw new Error(`No image base64 found in Google response: ${JSON.stringify(j).slice(0, 2000)}`);
//     }

//     // Convert base64 to buffer and upload to Supabase
//     const buffer = Buffer.from(base64, "base64");
//     const filename = `generations/${userId || "anon"}/${Date.now()}-${uuidv4()}.png`;

//     const { error: uploadError } = await supabaseServer.storage.from(bucket).upload(filename, buffer, {
//       contentType: "image/png",
//       upsert: false,
//     });

//     if (uploadError) {
//       throw new Error(`Supabase storage upload failed: ${uploadError.message}`);
//     }

//     const { data } = supabaseServer.storage.from(bucket).getPublicUrl(filename);
//     const publicUrl = data?.publicUrl ?? null;
//     if (!publicUrl) throw new Error("Failed to get public URL after upload");
//     results.push(publicUrl);
//   }

//   return results;
// }

// lib/google-api.ts
import { Buffer } from "buffer";
import { supabaseServer } from "./supabase-server";
import { v4 as uuidv4 } from "uuid";

/**
 * Server-side Google / Gemini utility functions.
 *
 * Important:
 * - Ensure this file runs only on the server (Next.js server route or server actions).
 * - Put the API key in a server environment variable named GOOGLE_AI_API_KEY (no NEXT_PUBLIC_ prefix).
 */

const GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GOOGLE_MODEL_TEXT = process.env.GOOGLE_AI_MODEL_TEXT || "gemini-2.5-pro";
const GOOGLE_MODEL_IMAGE = process.env.GOOGLE_AI_MODEL_IMAGE || "gemini-2.5-flash-image";
// Recommend setting a real bucket in env; fallback is "generations"
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "hahaha";

/** Simple heuristic: Google OAuth access tokens often start with "ya29." */
function isOAuthToken(key?: string | null) {
  return typeof key === "string" && key.startsWith("ya29.");
}

/** Helper: build headers for Google generative calls */
function buildGoogleHeaders(useOAuth: boolean) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (useOAuth) {
    headers["Authorization"] = `Bearer ${GOOGLE_API_KEY}`;
  } else if (GOOGLE_API_KEY) {
    // Prefer x-goog-api-key header for API keys (server-side)
    headers["x-goog-api-key"] = GOOGLE_API_KEY;
  }
  return headers;
}

/** Small sleep util */
function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Lightweight fetch with retries for transient errors.
 * Retries on status 429, 500, 502, 503.
 */
// Shorter, gentler retry policy: fewer attempts and shorter base backoff.
// Still respects Retry-After when provided by the server.
async function fetchWithRetries(url: string, options: RequestInit, attempts = 2, baseDelay = 150) {
  let lastErr: any = null;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;

      // transient statuses -> retry (but keep retries minimal)
      if ([429, 500, 502, 503].includes(res.status)) {
        const ra = res.headers.get("retry-after");
        const msg = await res.text().catch(() => "");
        // If server gives an explicit Retry-After, respect it (but cap it)
        if (ra && !Number.isNaN(Number(ra))) {
          // cap to 10s to avoid extremely long blocking inside a single request
          const waitMs = Math.min(Number(ra) * 1000, 10000);
          console.warn(`[google-api] transient status ${res.status}, respecting Retry-After ${waitMs}ms (retry ${i}/${attempts})`);
          await sleep(waitMs);
        } else {
          // much smaller exponential backoff with small jitter
          const delay = Math.min(Math.pow(2, i - 1) * baseDelay + Math.floor(Math.random() * 150), 5000);
          console.warn(`[google-api] transient status ${res.status}, backing off ${delay}ms (retry ${i}/${attempts})`);
          await sleep(delay);
        }
        lastErr = new Error(`Transient status ${res.status}: ${msg}`);
        continue;
      }

      // non-retryable error => read body and throw
      const txt = await res.text().catch(() => "");
      throw new Error(`Non-retryable HTTP ${res.status}: ${txt}`);
    } catch (err: any) {
      lastErr = err;
      if (i === attempts) break;
      // smaller retry delay for network errors
      const delay = Math.min(Math.pow(2, i - 1) * baseDelay + Math.floor(Math.random() * 150), 5000);
      console.warn(`[google-api] fetch error, retrying in ${delay}ms (attempt ${i}/${attempts})`, err?.message ?? err);
      await sleep(delay);
    }
  }
  throw lastErr ?? new Error("fetchWithRetries exhausted");
}


/**
 * Robust extractor for text from various Google response shapes.
 * Supports:
 *  - candidates[].content.parts[].text (your success shape)
 *  - output[0].content[0].text
 *  - output[0].message.content (string or parts)
 *  - json.text / json.response
 */
function extractTextFromGeminiResponse(json: any): string | null {
  // 1) candidates[].content may be object with parts or string
  const cand = json?.candidates?.[0];
  if (cand) {
    const c = cand.content;
    if (c) {
      // object with parts: join parts' text
      if (Array.isArray(c.parts) && c.parts.length > 0) {
        const joined = c.parts.map((p: any) => (typeof p.text === "string" ? p.text : "")).join(" ").trim();
        if (joined) return joined;
      }
      // some shapes: content = { content: [ { text } ] }
      if (c?.content && Array.isArray(c.content) && typeof c.content[0]?.text === "string") {
        return c.content[0].text.trim();
      }
      // content is an array of items
      if (Array.isArray(c) && typeof c[0]?.text === "string") return c[0].text.trim();
      // content is string
      if (typeof c === "string" && c.trim().length > 0) return c.trim();
    }
    // fallback: cand?.content?.[0]?.text
    if (Array.isArray(cand?.content) && typeof cand.content[0]?.text === "string") return cand.content[0].text.trim();
    // cand.content.content?.parts
    if (cand?.content?.content && Array.isArray(cand.content.content)) {
      const p = cand.content.content[0];
      if (p?.parts && Array.isArray(p.parts)) {
        const joined = p.parts.map((pr: any) => (typeof pr.text === "string" ? pr.text : "")).join(" ").trim();
        if (joined) return joined;
      }
    }
  }

  // 2) output[0].content[0].text
  if (Array.isArray(json?.output) && typeof json.output[0]?.content?.[0]?.text === "string") {
    return json.output[0].content[0].text.trim();
  }

  // 3) output[0].message.content (string or parts)
  const msgContent = json?.output?.[0]?.message?.content;
  if (msgContent) {
    if (typeof msgContent === "string" && msgContent.trim().length > 0) return msgContent.trim();
    if (Array.isArray(msgContent) && typeof msgContent[0]?.text === "string") return msgContent[0].text.trim();
  }

  // 4) direct fields
  if (typeof json?.text === "string" && json.text.trim().length > 0) return json.text.trim();
  if (typeof json?.response === "string" && json.response.trim().length > 0) return json.response.trim();

  return null;
}

/**
 * Helper: perform prompt enhancement via Gemini (text model).
 * Returns a trimmed single-paragraph enhanced prompt.
 */
export async function enhancePromptWithGemini(originalPrompt: string, stylePreset?: string) {
  if (!GOOGLE_API_KEY) throw new Error("GOOGLE_AI_API_KEY not configured (server env)");
  if (!originalPrompt || originalPrompt.trim().length === 0) {
    throw new Error("original prompt required");
  }

  const systemInstruction = `You are an expert prompt engineer for image generation. Given the user's brief, return a single, vivid, detailed prompt optimized for an image-generation model used for commercial beauty product ads. Include subject description, composition, camera/shot, lens/focal length, lighting, color palette, textures, mood, and style keywords. If a style preset is provided, append style-specific keywords. Output only the enhanced prompt (one paragraph).`;

  // v1beta endpoint + payload (user role only)
  const model = GOOGLE_MODEL_TEXT;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const useOAuth = isOAuthToken(GOOGLE_API_KEY);
  const headers = buildGoogleHeaders(useOAuth);

  const payload = {
    model,
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              `${systemInstruction}\n\n` +
              `User prompt: ${originalPrompt}` +
              `${stylePreset ? `\nStylePreset: ${stylePreset}` : ""}`,
          },
        ],
      },
    ],
    // you can add safety or temperature params if you want and your account supports them
  };

  // Fetch with retries (transient-aware)
  const res = await fetchWithRetries(
    url,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
    2,
    150
  );

  // if still not ok (should be handled by fetchWithRetries) - defensive
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("[Gemini text] Request failed (final)", { status: res.status, statusText: res.statusText, responseSnippet: txt?.slice?.(0, 2000) });
    throw new Error(`Gemini text enhancement failed: ${res.status} ${txt}`);
  }

  const json = await res.json();

  const candidateText = extractTextFromGeminiResponse(json);
  if (!candidateText) {
    console.error("[Gemini text] Unexpected response shape", { raw: JSON.stringify(json).slice(0, 2000) });
    throw new Error(`Unexpected Gemini response shape: ${JSON.stringify(json).slice(0, 2000)}`);
  }

  const enhanced = candidateText.replace(/\s{2,}/g, " ").trim();
  if (enhanced.length < 10) throw new Error("Gemini returned an unusually short enhanced prompt");
  return enhanced;
}

/**
 * Generate image(s) with Gemini image model and upload to Supabase Storage.
 * Returns array of public URLs for uploaded images.
 */
export async function generateImageWithGemini({
  prompt,
  userId,
  width = 1024,
  height = 1024,
  numVariations = 1,
  stylePreset,
}: {
  prompt: string;
  userId?: string;
  width?: number;
  height?: number;
  numVariations?: number;
  stylePreset?: string | null;
}): Promise<string[]> {
  if (!GOOGLE_API_KEY) throw new Error("GOOGLE_AI_API_KEY not configured (server env)");
  if (!prompt || prompt.trim().length === 0) throw new Error("prompt required");

  const model = GOOGLE_MODEL_IMAGE;
  const bucket = SUPABASE_BUCKET;

  const results: string[] = [];
  const iterations = Math.max(1, Math.min(1, numVariations));

  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateImage`;
  const useOAuth = isOAuthToken(GOOGLE_API_KEY);
  const headers = buildGoogleHeaders(useOAuth);

  for (let i = 0; i < iterations; i++) {
    let finalPrompt = prompt;
    if (stylePreset) finalPrompt = `${finalPrompt}, style: ${stylePreset}`;

    const imagePayload = {
      model,
      prompt: finalPrompt,
      size: { width, height },
      // add other options if supported
    };

    const r = await fetchWithRetries(baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(imagePayload),
    }, 2, 200);

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.error("[Gemini image] Request failed (final)", { status: r.status, responseSnippet: txt?.slice?.(0, 2000) });
      throw new Error(`Google image generation failed: ${r.status} ${txt}`);
    }

    const j = await r.json();

    // Try likely locations for base64 image bytes; adapt if your account returns different structure
    const base64 =
      j?.image?.b64_json ||
      j?.output?.[0]?.b64_json ||
      j?.output?.[0]?.image?.b64 ||
      j?.b64 ||
      null;

    if (!base64) {
      const maybeUrl = j?.output?.[0]?.url || j?.image?.url || j?.url || null;
      if (maybeUrl && typeof maybeUrl === "string" && maybeUrl.startsWith("http")) {
        const imgResp = await fetch(maybeUrl);
        if (!imgResp.ok) {
          const txt = await imgResp.text().catch(() => "binary-fetch-failed");
          throw new Error(`Failed to fetch image from Google-provided URL: ${imgResp.status} ${txt}`);
        }
        const buffer = Buffer.from(await imgResp.arrayBuffer());
        const filename = `generations/${userId || "anon"}/${Date.now()}-${uuidv4()}.png`;

        const { error: uploadError } = await supabaseServer.storage.from(bucket).upload(filename, buffer, {
          contentType: "image/png",
          upsert: false,
        });
        if (uploadError) throw new Error(`Supabase storage upload failed: ${uploadError.message}`);

        const { data } = supabaseServer.storage.from(bucket).getPublicUrl(filename);
        const publicUrl = data?.publicUrl ?? null;
        if (!publicUrl) throw new Error("Failed to get public URL after upload");
        results.push(publicUrl);
        continue;
      }

      throw new Error(`No image base64 found in Google response: ${JSON.stringify(j).slice(0, 2000)}`);
    }

    const buffer = Buffer.from(base64, "base64");
    const filename = `generations/${userId || "anon"}/${Date.now()}-${uuidv4()}.png`;

    const { error: uploadError } = await supabaseServer.storage.from(bucket).upload(filename, buffer, {
      contentType: "image/png",
      upsert: false,
    });

    if (uploadError) {
      throw new Error(`Supabase storage upload failed: ${uploadError.message}`);
    }

    const { data } = supabaseServer.storage.from(bucket).getPublicUrl(filename);
    const publicUrl = data?.publicUrl ?? null;
    if (!publicUrl) throw new Error("Failed to get public URL after upload");
    results.push(publicUrl);
  }

  return results;
}
