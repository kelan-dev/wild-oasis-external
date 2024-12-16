import { supabase } from "@/app/_lib/supabase";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Simple query to keep the connection alive
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
