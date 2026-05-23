        async function analyzeImage() {
            const btn = document.getElementById('analyzeBtn');
            const res = document.getElementById('result');
            
            if (!resizedBase64) {
                res.innerText = "Please select or take a photo first.";
                return;
            }

            btn.disabled = true;
            btn.innerText = "Analyzing...";
            res.innerText = "Processing, please wait...";

            try {
                const response = await fetch('/api/analyze', { 
                    method: 'POST', 
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify({ image: resizedBase64 }) 
                });
                
                const data = await response.json();

                // 1. Check for API-level errors
                if (data.error) {
                    res.innerText = "Server Error: " + (data.error.message || data.error);
                    return;
                }

                // 2. Deep Validation: Ensure the data structure exists
                // We check candidates, then the content, then the parts, then the text
                const candidate = data.candidates?.[0];
                const text = candidate?.content?.parts?.[0]?.text;

                if (!text) {
                    console.error("Full Response:", data);
                    res.innerText = "The analysis failed to return a valid response. Please try a different photo or angle.";
                    return;
                }

                // 3. Formatting Logic
                let formattedText = text;
                
                // Use a standard regex to wrap headers and sections
                formattedText = formattedText.replace("### 🔗 Live Market Comparisons", '<div class="links-box"><h3>🔗 Live Market Comparisons</h3>');
                formattedText = formattedText.replace("### 📋 Listing Data (Ready to Copy)", '</div><div class="listing-data-box"><h3>📋 Listing Data</h3>');
                
                // Bold formatting
                formattedText = formattedText.replace("Title:", "<strong>Title:</strong>");
                formattedText = formattedText.replace("Price:", "<strong>Price:</strong>");
                formattedText = formattedText.replace("Description:", "<strong>Description:</strong>") + '</div>';
                
                res.innerHTML = formattedText.replace(/\n/g, '<br>');
                document.getElementById('copyBtn').style.display = 'block';
                res.scrollIntoView({ behavior: 'smooth' });

            } catch (err) { 
                res.innerText = "Connection Error: " + err.message; 
            } finally { 
                btn.innerText = "🔍 Get Value"; 
                btn.disabled = false; 
            }
        }
