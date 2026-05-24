export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    try {
        const { imageBase64 } = req.body;
        const MODEL = "gemini-1.5-flash"; // Using 1.5-flash for maximum stability
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Write a Facebook Marketplace listing for this item using this format: TITLE, PRICE, DESCRIPTION, CONDITION, WHERE TO SELL." },
                        { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                    ]
                }]
            })
        });

        const result = await response.json();

        // This will print the actual error to your Vercel logs
        if (!result.candidates) {
            console.error("DEBUG ERROR:", JSON.stringify(result));
            return res.status(500).json({ error: "API rejected request: " + JSON.stringify(result) });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
