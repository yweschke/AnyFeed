// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.119.0/http/server.ts";
import { parseFeed } from "npm:@rowanmanning/feed-parser";

export interface Article {
  authors: Author[];
  categories: Category[];
  content?: string;
  description?: string;
  image?: Image;
  published?: Date;
  title?: string;
  updated?: Date;
  url: string;
}

export interface Author {
  name: string;
  email: string;
  link: string;
}

export interface Category {
  label: string;
  term: string;
  url: string;
}

export interface Image {
  url: string;
  title: string;
}

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

    // Transform RSS items into the `Article` interface
    const articles: Article[] = feed.items.map((item) => ({
      title: item.title || "No title",
      url: item.link || "",
      description: item.description || "",
      content: item.content || "No content available",
      published: item.published ? new Date(item.published) : undefined,
      updated: item.updated ? new Date(item.updated) : undefined,
      authors: item.authors
          ? item.authors.map((author) => ({
            name: author.name || "",
            email: author.email || "",
            link: author.url || "",
          }))
          : [],
      categories: item.categories
          ? item.categories.map((cat) => ({
            label: cat.label || "",
            term: cat.term || "",
            url: cat.url || "",
          }))
          : [],
      image: item.image
          ? { url: item.image.url, title: item.image.title || "No title" }
          : null,
    }));

    return new Response(JSON.stringify(articles), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching RSS:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch RSS feed" }), { status: 500 });
  }
});
