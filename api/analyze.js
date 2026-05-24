export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    // Force a 15-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        const { imageBase64 } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Write a marketplace listing. Format: TITLE, PRICE, DESCRIPTION, CONDITION, WHERE TO SELL." },
                        { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                    ]
                }]
            })
        });

        clearTimeout(timeout);
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(500).json({ error: data.error?.message || "API Error" });
        }

        res.status(200).json(data);
    } catch (error) {
        clearTimeout(timeout);
        res.status(500).json({ error: error.name === 'AbortError' ? "Timed out: Server took too long" : error.message });
    }
}
