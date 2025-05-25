import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
// IMPORTANT: Set your actual OpenAI API key in a .env.local file:
// OPENAI_API_KEY="your_openai_api_key_here"
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert in English grammar, spelling, style, and writing quality. Analyze the provided text and identify any issues.
          Return a JSON object with an array called "issues". Each issue object in the array should have the following fields:
          - "startIndex": The starting index of the problematic text (0-based).
          - "endIndex": The ending index (exclusive) of the problematic text.
          - "type": One of 'spelling', 'grammar', 'style', or 'phrasing'.
          - "message": A brief explanation of the error or suggestion.
          - "suggestions": An array of suggested corrections or alternative phrasings (strings).

          For 'spelling' and 'grammar' types, provide corrections in "suggestions".
          For 'style' type, provide suggestions for improvement (e.g., conciseness, clarity).
          For 'phrasing' type, identify sentences or parts of sentences that could be improved for clarity, flow, or impact. Provide alternative phrasings in the "suggestions" array. Also use 'phrasing' for general writing quality hints that apply to a specific text span.

          If there are no issues, return an empty "issues" array.
          Ensure your response is always a valid JSON object.

          Example for "This is a testt.":
          {
            "issues": [
              {
                "startIndex": 10,
                "endIndex": 15,
                "type": "spelling",
                "message": "Possible spelling mistake.",
                "suggestions": ["test"]
              }
            ]
          }
          Example for "He go to school.":
          {
            "issues": [
              {
                "startIndex": 3,
                "endIndex": 5,
                "type": "grammar",
                "message": "Subject-verb agreement error.",
                "suggestions": ["goes"]
              }
            ]
          }
          Example for "The report was read by me.": // Style and Phrasing
          {
            "issues": [
              {
                "startIndex": 0,
                "endIndex": 25,
                "type": "style",
                "message": "Passive voice. Consider active voice for stronger impact.",
                "suggestions": ["I read the report."]
              },
              {
                "startIndex": 0,
                "endIndex": 25,
                "type": "phrasing",
                "message": "This sentence can be more direct.",
                "suggestions": ["I read the report.", "The report I read was conclusive."]
              }
            ]
          }
          Example for a general quality hint on a specific phrase "In my opinion, I think that...":
          {
            "issues": [
              {
                "startIndex": 0,
                "endIndex": 28,
                "type": "phrasing",
                "message": "Redundant phrasing. 'In my opinion' and 'I think' convey the same meaning.",
                "suggestions": ["In my opinion...", "I think that..."]
              }
            ]
          }`
        },
        {
          role: 'user',
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return res.status(200).json(result);

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: 'Failed to check text with OpenAI' });
  }
}
