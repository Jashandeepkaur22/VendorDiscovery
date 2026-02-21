import { GoogleGenerativeAI } from "@google/generative-ai";

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

Primary requirements:
${requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}

${
  exclusions?.length
    ? `Exclude these vendors: ${exclusions.join(", ")}`
    : ""
}

Return STRICT JSON array with:
vendorName, priceRange, keyFeaturesMatched, risksAndLimits, evidenceLinks, quotedSnippets.
`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log("No Gemini key found. Returning mock data.");
      return res.status(200).json({
        shortlist: [
          {
            vendorName: "Mock Vendor",
            priceRange: "₹0 - ₹2,000/mo",
            keyFeaturesMatched: "Matches your requirements.",
            risksAndLimits: "Limited support.",
            evidenceLinks: ["https://example.com"],
            quotedSnippets: ["Sample snippet."],
          },
        ],
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const response = await model.generateContent(prompt);

    const text = response.response.text();

    const cleanText = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanText);
    } catch {
      console.error("Invalid JSON from AI:", text);
      return res.status(500).json({ error: "AI returned malformed JSON." });
    }

    return res.status(200).json({ shortlist: parsedData });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
