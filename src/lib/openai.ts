import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCallSummary(transcription: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes phone call transcriptions. Provide a concise, professional summary highlighting key points, decisions made, action items, and overall tone of the conversation. Keep it under 200 words."
        },
        {
          role: "user",
          content: `Please summarize this call transcription:\n\n${transcription}`
        }
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || "Unable to generate summary";
  } catch (error) {
    console.error('Error generating call summary:', error);
    return "Summary generation failed";
  }
}