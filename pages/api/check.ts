import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { text } = req.body as { text: string };

  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }

  try {
    const prompt = `You are a grammar checker. For the given text, return a JSON array. Each entry should have start and end offsets, a type of \"grammar\" or \"style\", an explanation, and a suggestion. Text: ${text}`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = completion.data.choices[0].message?.content || '[]';
    const marks = JSON.parse(content);
    return res.status(200).json({ marks });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to analyze text' });
  }
}
