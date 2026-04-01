
const https = require('https');

// Extract key from args
const apiKey = process.argv[2];
if (!apiKey) {
    console.error("Please provide API key as argument");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", json.error.message);
            } else {
                console.log("Available Models:");
                if (json.models) {
                    json.models.forEach(m => {
                        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                            console.log(`- ${m.name}`);
                        }
                    });
                } else {
                    console.log("No models found in response.");
                    console.log(data);
                }
            }
        } catch (e) {
            console.error("Parse Error:", e);
            console.log("Raw Data:", data);
        }
    });
}).on('error', (e) => {
    console.error("Network Error:", e);
});
