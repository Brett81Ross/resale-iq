export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    try {
        const { imageBase64 } = req.body;
        // Using the latest Gemini 3.5 Flash model
        const MODEL = "gemini-3.5-flash"; 
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [
                    { text: `You are an expert reseller. Analyze the item in the image and provide a professional, high-converting Facebook Marketplace ad.

Return ONLY this formatted text, ready to copy and paste:

[TITLE]
(Catchy title, max 60 chars)

[PRICE]
(Suggested price)

[DESCRIPTION]
(Detailed physical description: what it is, key features, exact condition, and why it's a great buy)

[CONDITION]
(New / Used - Excellent / Good / Fair)

[WHERE TO SELL & WHY]
(Top 2 platforms and a 1-sentence reason for each)

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
