
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CategoryMap {
  [key: string]: string[];
}

// Simple but comprehensive category keyword mapping
const categoryKeywords: CategoryMap = {
  "Electronics": ["laptop", "computer", "phone", "smartphone", "tablet", "camera", "headphone", "speaker", "tv", "television", "monitor", "console", "game", "gaming", "keyboard", "mouse", "router", "drone", "printer", "projector"],
  "Home Appliances": ["refrigerator", "fridge", "microwave", "oven", "washer", "dryer", "vacuum", "cleaner", "air conditioner", "heater", "fan", "blender", "mixer", "cooker", "toaster", "iron", "dishwasher"],
  "Furniture": ["chair", "table", "desk", "sofa", "couch", "bed", "mattress", "cabinet", "wardrobe", "shelf", "bookcase", "drawer", "stool", "bench", "dining", "dresser"],
  "Tools": ["drill", "saw", "hammer", "screwdriver", "wrench", "plier", "ladder", "toolkit", "level", "sander", "grinder", "cutter", "mower", "shovel", "rake", "hoe", "wheelbarrow"],
  "Sports Equipment": ["bicycle", "bike", "treadmill", "weights", "dumbbell", "barbell", "yoga", "mat", "ball", "racket", "bat", "glove", "helmet", "skate", "ski", "snowboard", "surfboard", "tent", "backpack", "camping"],
  "Vehicles": ["car", "motorcycle", "scooter", "bike", "bicycle", "van", "truck", "boat", "jet ski", "kayak", "canoe", "trailer"],
  "Clothing": ["dress", "suit", "tuxedo", "gown", "costume", "uniform", "jacket", "coat", "formal", "wedding"],
  "Cameras & Photography": ["camera", "lens", "tripod", "lighting", "flash", "backdrop", "dslr", "mirrorless", "gopro", "stabilizer", "drone"],
  "Musical Instruments": ["guitar", "piano", "keyboard", "drum", "violin", "microphone", "amplifier", "speaker", "bass", "flute", "saxophone", "trumpet"],
  "Party Supplies": ["table", "chair", "tent", "decoration", "light", "sound", "speaker", "karaoke", "projector", "balloon", "banner"]
};

function suggestCategories(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const matches: { [category: string]: number } = {};
  
  // Count keyword matches for each category
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        matches[category] = (matches[category] || 0) + 1;
      }
    }
  }
  
  // Convert matches to sorted array
  const sortedMatches = Object.entries(matches)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);
  
  // Return top 3 categories or all if less than 3
  return sortedMatches.slice(0, 3);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();
    
    if (!description || typeof description !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Description is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const suggestedCategories = suggestCategories(description);

    return new Response(
      JSON.stringify({ categories: suggestedCategories }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
