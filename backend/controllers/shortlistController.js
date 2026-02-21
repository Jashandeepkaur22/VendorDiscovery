import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateShortlist = async (req, res) => {
  try {
    const { need, requirements, exclusions } = req.body;

    // 1. Basic Validation
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

${exclusions && exclusions.length > 0 ? `Please EXCLUDE the following vendors: ${exclusions.join(", ")}` : ""}

Find at least 3 software vendors. Return the result STRICTLY as a JSON array of objects.
Each object must have these exact keys:
"vendorName", "priceRange", "keyFeaturesMatched", "risksAndLimits", "evidenceLinks" (array), "quotedSnippets" (array).

CRITICAL: Convert and format all prices in Indian Rupees (₹).
`;

    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey = apiKey && apiKey.length > 10;

    // 2. Mock Data Fallback (for local testing or missing API key)
    if (!hasValidKey) {
      console.log("Using Mock Data (No Valid Gemini Key Provided)");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return res.status(200).json({
        shortlist: [
          {
            vendorName: "Mock Vendor Pro",
            priceRange: "₹1,200 - ₹5,000/mo",
            keyFeaturesMatched: `Simulated match for "${need}".`,
            risksAndLimits: "This is mock data because no API key was found.",
            evidenceLinks: ["https://example.com"],
            quotedSnippets: ["Mock snippet"],
          }
        ],
      });
    }

    // 3. Official AI Integration
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Clean the output (Removes ```json ... ``` if Gemini includes it)
    const cleanJson = text.replace(/```json|```/g, "").trim();

    try {
      const parsedData = JSON.parse(cleanJson);
      // Ensure the response always follows the { shortlist: [...] } format the frontend expects
      const finalArray = Array.isArray(parsedData) ? parsedData : [parsedData];
      return res.status(200).json({ shortlist: finalArray });
    } catch (e) {
      console.error("JSON Parsing Error. Raw output:", text);
      return res.status(500).json({ error: "AI output was not valid JSON." });
    }

  } catch (error) {
    console.error("Error in generateShortlist:", error);
    return res.status(500).json({ 
      error: "Internal server error.",
      details: error.message 
    });
  }
};