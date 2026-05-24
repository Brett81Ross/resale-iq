export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }
    
    try {
        const { imageBase64 } = req.body;
        
        // This is the correct, official model ID as of May 2026
        const MODEL = "gemini-3.5-flash"; 
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // Safety settings to prevent the AI from blocking the output
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ],
                contents: [{ parts: [
                    { text: `Analyze the item in the image and write a selling ad. 
Output ONLY the following structure exactly, ready for a user to copy and paste:

TITLE:
[Catchy, searchable title]

PRICE:
$[Suggested Price]

DESCRIPTION:
[What it is: include physical features, materials, and condition. Then, 1 persuasive paragraph on why someone needs to buy this today.]

CONDITION:
[New / Used - Condition Details]

WHERE TO SELL:
[List 2 best platforms for this specific item and 1 brief reason why for each.]` },
                    { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                ]}]
            })
        });

        const data = await response.json();
        
        // Final check to ensure we actually got text back
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            return res.status(200).json(data);
        } else {
            console.error("Gemini API Error:", JSON.stringify(data));
            return res.status(500).json({ error: "AI returned no text. Check your API key or image quality." });
        }
    } catch (error) {
        console.error("Backend Catch Error:", error);
        return res.status(500).json({ error: "Backend error: " + error.message });
    }
}
