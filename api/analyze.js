export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });
    
    // Check if the key exists at all
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Configuration Error: GEMINI_API_KEY is not defined in Vercel settings" });
    }

    try {
        const { imageBase64 } = req.body;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [
                    { text: "Analyze this item for resale: title, estimated price, and condition." },
                    { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                ]}]
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Backend failed to communicate with Gemini" });
    }
}
