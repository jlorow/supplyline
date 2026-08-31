const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';

export async function generateSummary(prompt: string): Promise<string> {
  const apiKey = process.env.KIMI_API_KEY;

  // Mock fallback for build verification without real API key
  if (!apiKey || apiKey === 'your_kimi_api_key_here') {
    return 'Rockridge Transport LLC is recommended at $1,620 after successful negotiation, saving $180 vs their original quote and beating Prairie Line Carriers by $30. The negotiated rate provides the best value for the Chicago to Atlanta lane.';
  }

  try {
    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: 'You are a professional freight broker assistant. Write concise, professional recommendation summaries with specific numbers. Max 2-3 sentences.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`Kimi API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || 'No summary generated.';
  } catch (error) {
    console.error('Kimi API call failed:', error);
    throw new Error('Failed to generate recommendation summary');
  }
}
