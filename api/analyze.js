export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    try {
        const { imagesBase64 } = req.body; // Expecting an array of strings
        
        const imageParts = imagesBase64.map(base64 => ({
            inline_data: { mime_type: "image/jpeg", data: base64 }
        }));

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: `Act as an expert reseller. Analyze these images and create a high-converting marketplace listing. 
                        IMPORTANT: Do NOT include any information about shipping, delivery, or logistics. Focus only on the item itself and the sale.
                        
                        TITLE: [Catchy, optimized title]
                        PRICE: [Suggested competitive price]
                        CONDITION: [Specify condition]
                        WHERE TO SELL: [Best platform]
                        DESCRIPTION: [Professional, persuasive ad description, local pickup only.]` },
                        ...imageParts
                    ]
                }]
            })
        });

        const data = await response.json();
        if (!response.ok) return res.status(500).json({ error: data.error?.message });
        
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
