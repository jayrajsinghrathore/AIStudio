/**
 * Google AI API wrapper for Gemini text generation and image generation
 * Handles prompt enhancement and image creation with robust error handling
 */

const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY
const GOOGLE_IMAGE_API_KEY = process.env.GOOGLE_AI_API_KEY

if (!GEMINI_API_KEY) {
  console.warn("[google-api] GOOGLE_AI_API_KEY is not set. Gemini APIs will fail.")
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

interface ImageGenerationResponse {
  results?: Array<{
    image: string
  }>
}

/**
 * Enhance a prompt using Gemini API with professional photography focus
 */
export async function enhancePromptWithGemini(originalPrompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("Google AI API key not configured")
  }

  const systemPrompt = `You are an expert beauty product photographer and AI prompt engineer. Your task is to enhance simple prompts into detailed, vivid descriptions for AI image generation.

For the given prompt, create a single comprehensive paragraph that includes:
- Subject description (product type, brand, packaging details)
- Composition and framing
- Camera technique (angle, shot type, depth of field)
- Lens characteristics (focal length, bokeh quality)
- Lighting setup (key light, fill light, backlighting, reflections)
- Color palette (dominant colors, tones, gradients)
- Textures and surface qualities
- Mood and atmosphere
- Professional photography style keywords

Output ONLY the enhanced prompt, no additional text.`

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: originalPrompt,
                },
              ],
              role: "user",
            },
          ],
          systemInstruction: {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        }),
        headers: {
          "x-goog-api-key": GEMINI_API_KEY,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      const error = await response.json()
      console.error("[google-api] Gemini enhancement error:", error)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = (await response.json()) as GeminiResponse

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid Gemini response format")
    }

    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error("[google-api] Failed to enhance prompt:", error)
    throw new Error(`Failed to enhance prompt: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Generate images using Google's image generation API (Imagen/Gemini Vision)
 * For production, use Google Cloud Vertex AI's imagegeneration endpoint
 */
export async function generateImagesWithGoogle(
  prompt: string,
  numVariations = 1,
  width = 1024,
  height = 1024,
): Promise<Buffer[]> {
  if (!GOOGLE_IMAGE_API_KEY) {
    throw new Error("Google AI API key not configured for image generation")
  }

  const images: Buffer[] = []

  // Generate variations with slight prompt modifications
  for (let i = 0; i < numVariations; i++) {
    let variationPrompt = prompt

    if (i > 0) {
      const variations = [
        ", with warmer tones and golden hour lighting",
        ", with cooler tones and studio lighting",
        ", with vintage color grading and soft focus",
        ", with cinematic depth of field and dramatic shadows",
      ]
      variationPrompt = prompt + variations[i % variations.length]
    }

    try {
      // Using a placeholder for actual image generation
      // In production, integrate with:
      // - Google Cloud Vertex AI (for Imagen)
      // - Or use a service like Replicate/Banana with Stable Diffusion

      // For now, return a placeholder that indicates successful API call structure
      const imageBuffer = Buffer.from(
        JSON.stringify({
          prompt: variationPrompt,
          timestamp: new Date().toISOString(),
        }),
      )

      images.push(imageBuffer)
    } catch (error) {
      console.error(`[google-api] Failed to generate image variation ${i + 1}:`, error)
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return images
}

/**
 * Call Banana.dev API for image generation (alternative to Google)
 */
export async function generateImagesWithBanana(prompt: string, numVariations = 1): Promise<string[]> {
  const BANANA_API_KEY = process.env.BANANA_API_KEY
  const BANANA_MODEL_KEY = process.env.BANANA_MODEL_KEY

  if (!BANANA_API_KEY || !BANANA_MODEL_KEY) {
    throw new Error("Banana API keys not configured")
  }

  const imageUrls: string[] = []

  for (let i = 0; i < numVariations; i++) {
    let variationPrompt = prompt

    if (i > 0) {
      const variations = [", warmer color tone", ", cooler color tone", ", vintage style", ", cinematic style"]
      variationPrompt = prompt + variations[i % variations.length]
    }

    try {
      const response = await fetch("https://api.banana.dev/start/v4/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": BANANA_API_KEY,
        },
        body: JSON.stringify({
          model_key: BANANA_MODEL_KEY,
          startInputs: {
            prompt: variationPrompt,
            negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, disfigured",
            width: 1024,
            height: 1024,
            num_inference_steps: 30,
            guidance_scale: 7.5,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Banana API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.callID) {
        imageUrls.push(data.callID)
      }
    } catch (error) {
      console.error(`[google-api] Banana generation error for variation ${i + 1}:`, error)
      throw new Error(
        `Failed to generate image with Banana: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  return imageUrls
}
