// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.119.0/http/server.ts";
import Parser from "npm:rss-parser";

const parser = new Parser();

serve(async (req) => {
  // Get the RSS URL from query parameters
  const { searchParams } = new URL(req.url);
  const rssUrl = searchParams.get("url");

  if (!rssUrl) {
    return new Response(JSON.stringify({ error: "Missing RSS URL" }), { status: 400 });
  }

  try {
    console.log(`📡 Fetching RSS from: ${rssUrl}`);
    const feed = await parser.parseURL(rssUrl);
    // Convert feed into a clean JSON format
    const articles = feed.items.map((item) => ({
      title: item.title || "No title",
      link: item.link || "",
      date: item.pubDate || "Unknown date",
      creator: item.creator || "",
      content: item.content || "No content provided",
      description: item.contentSnippet || "",
      categories: item.categories || [],
      isoDate: item.isoDate || "",
    }));

    return new Response(JSON.stringify(articles), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching RSS:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch RSS feed" }), { status: 500 });
  }
});
