import { GoogleGenAI } from "@google/genai";

// Initialize the SDK. It automatically picks up GEMINI_API_KEY from the environment.

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

You must use your knowledge and ANY search tools available to you to find at least 3 software vendors that match the user's need.

For EACH vendor, provide the following information:
- vendorName: The name of the software or company.
- priceRange: A summary of their pricing. **CRITICAL: You MUST convert and format all prices in Indian Rupees (₹). Do NOT use Dollars ($)**. (e.g., "Starts at ₹800/mo", "Free tier available, enterprise custom", etc).
- keyFeaturesMatched: Describe how they meet the user's requirements.
- risksAndLimits: Any potential downsides, limitations, or risks of choosing them.
- evidenceLinks: A list of 1-3 URLs (official docs, pricing pages, etc) that prove the capabilities or pricing.
- quotedSnippets: A short snippet of text quoted from their website/docs that supports the features or pricing.

Return the result STRICTLY as a JSON array of objects, with NO surrounding markdown formatting or backticks. 
Each object in the array should have the exact keys:
"vendorName", "priceRange", "keyFeaturesMatched", "risksAndLimits", "evidenceLinks" (array of strings), "quotedSnippets" (array of strings).
`;

    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey =
      apiKey &&
      apiKey !== "your_api_key_here" &&
      apiKey !== "your_actual_api_key_here";

    if (!hasValidKey) {
      console.log("Using Mock Data (No Valid Gemini Key Provided)");
      // Provide a 1.5 second artificial delay to simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const isVectorDb = need && need.toLowerCase().includes("vector");

      if (isVectorDb) {
        return res.status(200).json({
          shortlist: [
            {
              vendorName: "Pinecone",
              priceRange: "₹0 - ₹6,000/mo (Serverless Tier)",
              keyFeaturesMatched: `Matches "${need}". Fully managed, serverless vector database perfect for small teams without dedicated DevOps.`,
              risksAndLimits:
                "Free tier limits strictly to one index and 2GB storage. Pricing scales rapidly with heavy usage.",
              evidenceLinks: ["https://www.pinecone.io/pricing/"],
              quotedSnippets: [
                "Serverless: Pay only for what you use, starting at $0.",
              ],
            },
            {
              vendorName: "Chroma",
              priceRange: "Free (Open Source) / Cloud Private Preview",
              keyFeaturesMatched: `Meets all requirements for a small team looking for a "${need}". Runs entirely locally or via Docker during early development.`,
              risksAndLimits:
                "Cloud offering is still in early access, meaning you must manage infrastructure yourself if deploying to production right now.",
              evidenceLinks: ["https://trychroma.com/"],
              quotedSnippets: ["The AI-native open-source embedding database."],
            },
            {
              vendorName: "Qdrant",
              priceRange: "₹0 - ₹2,500/mo (Free Cloud Cluster)",
              keyFeaturesMatched: `Highly performant Rust-based "${need}" with a generous 1GB free cloud tier.`,
              risksAndLimits:
                "Rust ecosystem might have a steeper learning curve for advanced custom plugins compared to purely Python-based alternatives.",
              evidenceLinks: ["https://qdrant.tech/pricing/"],
              quotedSnippets: [
                "Forever free 1GB cluster for rapid prototyping.",
              ],
            },
          ],
        });
      }

      return res.status(200).json({
        shortlist: [
          {
            vendorName: "MockEmailService India",
            priceRange: "₹0 - ₹5,000/mo (Free Tier available)",
            keyFeaturesMatched: `Perfectly matches "${need}". Includes Asia-Pacific servers, high deliverability in India, and basic template builder.`,
            risksAndLimits:
              "Free tier limits to 100 emails/day. Customer support is forum-only on cheap plans.",
            evidenceLinks: [
              "https://example.com/mock-email/pricing",
              "https://example.com/mock-email/features-in",
            ],
            quotedSnippets: [
              "We guarantee 99.9% uptime across all major Indian ISPs.",
            ],
          },
          {
            vendorName: "SendGiant",
            priceRange: "₹1,600/mo starting price",
            keyFeaturesMatched: `Meets 4/5 requirements for "${need}". Enterprise grade API with extensive Node.js SDKs.`,
            risksAndLimits:
              "Pricing scales poorly as volume increases. Dashboard can be confusing for non-technical users.",
            evidenceLinks: ["https://example.com/sendgiant/docs"],
            quotedSnippets: [
              "Rated #1 for developer experience and easy integration.",
            ],
          },
          {
            vendorName: "LocalDelivery AI",
            priceRange: "Custom Enterprise Pricing",
            keyFeaturesMatched: `Fully compliant with Indian data localization laws. Specifically built for high-scale "${need}".`,
            risksAndLimits:
              "No self-serve sign up. Requires a sales call. Implementation takes 2-4 weeks.",
            evidenceLinks: ["https://example.com/localdelivery/compliance"],
            quotedSnippets: [
              "All data is stored and processed exclusively in Mumbai, India.",
            ],
          },
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    let parsedData = [];
    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON response:", text);
      return res.status(500).json({ error: "AI returned malformed JSON." });
    }

    return res.status(200).json({ shortlist: parsedData });
  } catch (error) {
    console.error("Error in generateShortlist:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while generating shortlist." });
  }
};
