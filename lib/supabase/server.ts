import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    auth: {
      getUser: async () => {
        // For demo purposes, return a mock user if auth token exists
        const token = cookieStore.get("sb-token")?.value
        if (token) {
          return {
            data: {
              user: { id: "demo-user-123", email: "demo@example.com" },
            },
          }
        }
        return { data: { user: null } }
      },
    },
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (field: string, value: string) => ({
          order: (field: string, opts: any) => Promise.resolve({ data: [], error: null }),
        }),
      }),
      insert: (data: any) => ({
        select: () => ({
          single: async () => ({ data: { ...data, id: `gen-${Date.now()}` }, error: null }),
        }),
      }),
    }),
  }
}
