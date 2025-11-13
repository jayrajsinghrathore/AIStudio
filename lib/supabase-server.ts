/**
 * Server-side Supabase client using SUPABASE_SERVICE_ROLE_KEY
 * This client has elevated permissions for uploads and database writes
 * NEVER expose this client to the browser
 */

// import { createClient } from "@supabase/supabase-js"

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// if (!supabaseUrl || !serviceRoleKey) {
//   throw new Error("Missing Supabase environment variables")
// }

// // Create a singleton client instance
// let supabaseServerClient: ReturnType<typeof createClient> | null = null

// export function getSupabaseServerClient() {
//   if (!supabaseServerClient) {
//     supabaseServerClient = createClient(supabaseUrl, serviceRoleKey, {
//       auth: {
//         autoRefreshToken: false,
//         persistSession: false,
//       },
//     })
//   }
//   return supabaseServerClient
// }

// /**
//  * Upload image to Supabase Storage
//  */
// export async function uploadImageToStorage(userId: string, imageBuffer: Buffer, filename: string): Promise<string> {
//   const supabase = getSupabaseServerClient()

//   const storagePath = `generations/${userId}/${filename}`

//   try {
//     const { data, error } = await supabase.storage.from("beauty-ads").upload(storagePath, imageBuffer, {
//       contentType: "image/png",
//       upsert: false,
//     })

//     if (error) {
//       throw new Error(`Storage upload failed: ${error.message}`)
//     }

//     // Get public URL
//     const { data: publicUrlData } = supabase.storage.from("beauty-ads").getPublicUrl(storagePath)

//     return publicUrlData?.publicUrl || ""
//   } catch (error) {
//     console.error("[supabase-server] Upload error:", error)
//     throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`)
//   }
// }

// /**
//  * Insert generation record into database
//  */
// export async function createGenerationRecord(
//   userId: string,
//   originalPrompt: string,
//   enhancedPrompt: string,
//   imageUrls: string[],
//   stylePreset?: string,
// ) {
//   const supabase = getSupabaseServerClient()

//   try {
//     const { data, error } = await supabase.from("generations").insert([
//       {
//         user_id: userId,
//         original_prompt: originalPrompt,
//         enhanced_prompt: enhancedPrompt,
//         image_url: imageUrls[0], // Store first image URL
//         style_preset: stylePreset || null,
//         created_at: new Date().toISOString(),
//       },
//     ])

//     if (error) {
//       throw new Error(`Database insert failed: ${error.message}`)
//     }

//     return data
//   } catch (error) {
//     console.error("[supabase-server] Database error:", error)
//     throw new Error(`Failed to save generation: ${error instanceof Error ? error.message : "Unknown error"}`)
//   }
// }

// /**
//  * Fetch user's generations
//  */
// export async function getUserGenerations(userId: string) {
//   const supabase = getSupabaseServerClient()

//   try {
//     const { data, error } = await supabase
//       .from("generations")
//       .select("*")
//       .eq("user_id", userId)
//       .order("created_at", { ascending: false })

//     if (error) {
//       throw new Error(`Fetch failed: ${error.message}`)
//     }

//     return data || []
//   } catch (error) {
//     console.error("[supabase-server] Fetch error:", error)
//     throw error
//   }
// }

// /**
//  * Delete a generation record
//  */
// export async function deleteGeneration(generationId: string, userId: string) {
//   const supabase = getSupabaseServerClient()

//   try {
//     const { error } = await supabase.from("generations").delete().eq("id", generationId).eq("user_id", userId)

//     if (error) {
//       throw new Error(`Delete failed: ${error.message}`)
//     }

//     return true
//   } catch (error) {
//     console.error("[supabase-server] Delete error:", error)
//     throw error
//   }
// }
// lib/supabase-server.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in environment");
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment (server-only)");
}

/**
 * Server-side Supabase client using the service role key.
 * Use this only in API routes / server code.
 */
export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
