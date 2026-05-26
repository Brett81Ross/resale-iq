export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { imagesBase64 } = req.body;

        // Validation: Ensure images exist and are an array
        if (!imagesBase64 || !Array.isArray(imagesBase64) || imagesBase64.length === 0) {
            return res.status(400).json({ error: "No images provided" });
        }
        
        // Map the array of base64 strings into the format Gemini requires
        const imageParts = imagesBase64.map(base64 => ({
            inline_data: { mime_type: "image/jpeg", data: base64 }
        }));

        // Send to Gemini - using model: gemini-3.5-flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: `Act as a professional marketplace analyst and expert reseller. 
                        Analyze these images and provide:
                        
                        1. MARKET DATA: Estimate current price range (Low, Mid, High).
                        2. SELL-THROUGH SIGNAL: Rate the speed (Fast/Average/Slow) and explain why.
                        3. PRICING RATIONALE: Identify top 3 features visible in the photos that justify the price.
                        4. OPTIMIZED LISTING: 
                           TITLE: [Catchy, optimized title]
                           PRICE: [Suggested price]
                           CONDITION: [Specify condition]
                           WHERE TO SELL: [Best platform]
                           DESCRIPTION: [Professional, persuasive ad description, local pickup only.]
                           
                        IMPORTANT: Do NOT include information about shipping, delivery, or logistics.` },
                        ...imageParts
                    ]
                }]
            })
        });

        // Parse response
        const data = await response.json();
        
        // Error handling for non-200 responses
        if (!response.ok) {
            console.error("Gemini API Error details:", JSON.stringify(data));
            return res.status(500).json({ 
                error: data.error?.message || "Gemini API error occurred" 
            });
        }
        
        // Return successful response
        res.status(200).json(data);

    } catch (error) {
        console.error("Server execution error:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
}
