// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.119.0/http/server.ts";
import { parseFeed } from "npm:@rowanmanning/feed-parser";

serve(async (req) => {
  // Get the RSS URL from query parameters
  const { searchParams } = new URL(req.url);
  const rssUrl = searchParams.get("url");

  if (!rssUrl) {
    return new Response(JSON.stringify({ error: "Missing RSS URL" }), { status: 400 });
  }

  try {
    console.log(`📡 Fetching RSS from: ${rssUrl}`);

    // Fetch RSS XML from the given URL
    const response = await fetch(rssUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the RSS feed
    const feed = parseFeed(await response.text());
    const articles = feed.items;

    return new Response(JSON.stringify(articles), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching RSS:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch RSS feed" }), { status: 500 });
  }
});
