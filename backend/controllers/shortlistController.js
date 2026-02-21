import { GoogleGenAI } from "@google/genai";

export const generateShortlist = async (req, res) => {
  try {
    const { need, requirements, exclusions } = req.body;

    if (!need || !requirements || !Array.isArray(requirements)) {
      return res
        .status(400)
        .json({ error: "Missing required fields: need, requirements" });
    }

    const prompt = `
You are an expert IT procurement and software discovery assistant.
The user is looking for software vendors for the following need: "${need}"
Their primary requirements are:
${requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}

${exclusions && exclusions.length > 0 ? `Please EXCLUDE the following vendors from your search and results: ${exclusions.join(", ")}` : ""}

You must find at least 3 software vendors that match the user's need.

For EACH vendor, provide the following information:
- vendorName: The name of the software or company.
- priceRange: A summary of their pricing. **CRITICAL: You MUST convert and format all prices in Indian Rupees (₹). Do NOT use Dollars ($)**.
- keyFeaturesMatched: Describe how they meet the user's requirements.
- risksAndLimits: Any potential downsides or risks.
- evidenceLinks: A list of 1-3 URLs.
- quotedSnippets: A short snippet of text from their website.

Return the result STRICTLY as a JSON array of objects.
Each object must have these exact keys:
"vendorName", "priceRange", "keyFeaturesMatched", "risksAndLimits", "evidenceLinks", "quotedSnippets".
`;

    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey =
      apiKey &&
      apiKey !== "your_api_key_here" &&
      apiKey !== "your_actual_api_key_here";

    // --- 1. MOCK DATA FALLBACK ---
    if (!hasValidKey) {
      console.log("Using Mock Data (No Valid Gemini Key Provided)");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const isVectorDb = need && need.toLowerCase().includes("vector");

      if (isVectorDb) {
        return res.status(200).json({
          shortlist: [
            {
              vendorName: "Pinecone",
              priceRange: "₹0 - ₹6,000/mo (Serverless Tier)",
              keyFeaturesMatched: `Matches "${need}". Fully managed, serverless vector database.`,
              risksAndLimits: "Free tier limits strictly to one index. Pricing scales rapidly.",
              evidenceLinks: ["https://www.pinecone.io/pricing/"],
              quotedSnippets: ["Serverless: Pay only for what you use, starting at $0."],
            },
            {
              vendorName: "Chroma",
              priceRange: "Free (Open Source)",
              keyFeaturesMatched: `Meets all requirements for "${need}". Runs entirely locally.`,
              risksAndLimits: "Cloud offering is still in early access; must manage infrastructure yourself.",
              evidenceLinks: ["https://trychroma.com/"],
              quotedSnippets: ["The AI-native open-source embedding database."],
            }
          ],
        });
      }

      return res.status(200).json({
        shortlist: [
          {
            vendorName: "Mock Service",
            priceRange: "₹0 - ₹5,000/mo",
            keyFeaturesMatched: `Matches "${need}".`,
            risksAndLimits: "Limited support on free tier.",
            evidenceLinks: ["https://example.com"],
            quotedSnippets: ["Standard mock response."],
          }
        ]
      });
    }

    // --- 2. ACTUAL AI GENERATION ---
    const genAI = new GoogleGenAI(apiKey);
    
    // Using 1.5-flash for speed or 1.5-pro for better reasoning
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      // Use the Google Search tool for grounding
      tools: [{ googleSearch: {} }],
    });

    const response = await result.response;
    const text = response.text();

    // Clean potential markdown formatting from the response
    const cleanJson = text.replace(/```json|```/g, "").trim();

    try {
      const parsedData = JSON.parse(cleanJson);
      // Ensure we always return an object with the 'shortlist' key for the frontend
      return res.status(200).json({ shortlist: Array.isArray(parsedData) ? parsedData : [parsedData] });
    } catch (e) {
      console.error("Failed to parse JSON response:", text);
      return res.status(500).json({ error: "AI returned malformed JSON." });
    }

  } catch (error) {
    console.error("Error in generateShortlist:", error);
    return res.status(500).json({ 
      error: "Internal server error.",
      details: error.message 
    });
  }
};