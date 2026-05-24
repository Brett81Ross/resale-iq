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
                    { text: `You are an expert reseller. Analyze this item and provide a professional, high-converting Facebook Marketplace ad.

Provide ONLY the text below, formatted exactly so the user can copy and paste it:

---
TITLE: [Catchy, optimized title]

PRICE: $[Suggested Price]

DESCRIPTION:
[Detailed description: what it is, key features, exact condition, and why it's a great buy]

CONDITION: [New/Used - Condition Details]

SALES STRATEGY:
[Recommend the best 2 platforms for this item and why]
---` },
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
