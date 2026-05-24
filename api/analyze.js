export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    try {
        const { imageBase64 } = req.body;
        const MODEL = "gemini-3.5-flash"; 
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [
                    { text: `Analyze the item in the image. Provide a high-converting Facebook Marketplace listing AND a sales strategy. 
                    
Format the output exactly as follows:

TITLE: [Catchy Title - 60 chars max]

PRICE: $[Suggested Price]

DESCRIPTION:
[Detailed, persuasive, and professional description]

CONDITION: [New/Used - Good/Fair/etc]

SALES STRATEGY:
- Recommended Platforms: [List platforms like Facebook Marketplace, eBay, OfferUp, Poshmark, etc.]
- Why these platforms are best for this specific item: [Reasoning]

---
Provide ONLY the text above so it is ready to be copied and pasted.` },
                    { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                ]}]
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Backend error: " + error.message });
    }
}
