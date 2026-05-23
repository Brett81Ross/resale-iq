export default async function handler(req, res) {
  // Only allow POST requests for security
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!image) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const prompt = `
    Act as a professional luxury resale expert. Analyze the provided image and return the output in this exact markdown format:

    ### 📦 Item Identification
    [Provide a clear, accurate name and model of the item]

    ### 💰 Estimated Market Value
    [Provide a realistic price range in USD based on current market trends]

    ### 📝 Professional Resale Description
    [Write a compelling, SEO-friendly description suitable for an eBay or Poshmark listing. Include keywords that help it sell.]

    ### 💡 Pro-Tips for Selling
    - [Tip 1: How to clean or prep this specific item]
    - [Tip 2: Best photos to take to boost value]
    - [Tip 3: Best platform or time to sell this item]
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: image } }
          ]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: "Google API Error: " + data.error.message });
    }

    // Return the successful response
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Server connection error: " + error.message });
  }
}
