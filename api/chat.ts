import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

// Character personality prompts
const CHARACTER_PROMPTS: Record<string, string> = {
  yukino: `You are Yukinoshita Yukino from "My Teen Romantic Comedy SNAFU" (Oregairu).

Personality:
- Intelligent, sharp-tongued, and direct
- Formal and polite speech patterns (uses "desu/masu" form in Japanese)
- Slightly tsundere - caring underneath but doesn't show it easily
- Very observant and analytical
- Values honesty and directness
- Can be sarcastic but not mean-spirited

Speech style:
- Keep responses concise (1-2 sentences, max 3)
- Use formal language
- Be direct and honest
- Can be slightly sarcastic or teasing
- Show subtle care through actions/words, not overtly

Context: You are in a 3D world that was generated from an image. The user can explore this world and talk to you. Respond naturally to their questions and observations about the world.`,

  default: `You are a helpful anime character assistant. Keep responses concise and friendly.`,
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text, character = 'yukino' } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Step 1: Get character response from LLM (OpenAI GPT-4)
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        message: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.',
      });
    }

    const systemPrompt = CHARACTER_PROMPTS[character] || CHARACTER_PROMPTS.default;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using mini for cost efficiency, can upgrade to gpt-4 if needed
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: text.trim(),
          },
        ],
        temperature: 0.8, // Slightly creative for character personality
        max_tokens: 150, // Keep responses concise
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${errorText}`);
    }

    const llmData = await openaiResponse.json();
    const characterText = llmData.choices[0]?.message?.content;

    if (!characterText) {
      throw new Error('No response from LLM');
    }

    // Step 2: Synthesize speech using Modal TTS endpoint
    const modalTtsEndpoint = process.env.MODAL_TTS_ENDPOINT_URL;
    
    if (!modalTtsEndpoint) {
      // If TTS not configured, return text-only response
      return res.json({
        success: true,
        text: characterText,
        audioUrl: null,
        ttsConfigured: false,
      });
    }

    const ttsResponse = await fetch(modalTtsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: characterText,
        character: character,
        language: character === 'yukino' ? 'ja' : 'en', // Japanese for Yukino
        speed: 1.0,
      }),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('TTS API error:', errorText);
      // Return text response even if TTS fails
      return res.json({
        success: true,
        text: characterText,
        audioUrl: null,
        ttsError: errorText,
      });
    }

    const ttsData = await ttsResponse.json();

    if (!ttsData.success || !ttsData.audio_base64) {
      // Return text response if TTS fails
      return res.json({
        success: true,
        text: characterText,
        audioUrl: null,
        ttsError: ttsData.error || 'TTS synthesis failed',
      });
    }

    // Step 3: Upload audio to Vercel Blob Storage
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.json({
        success: true,
        text: characterText,
        audioUrl: null,
        blobError: 'Blob storage not configured',
      });
    }

    try {
      const audioBuffer = Buffer.from(ttsData.audio_base64, 'base64');
      const audioId = `audio-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const blob = await put(`audio/${audioId}.wav`, audioBuffer, {
        access: 'public',
        contentType: 'audio/wav',
      });

      res.json({
        success: true,
        text: characterText,
        audioUrl: blob.url,
        format: ttsData.format || 'wav',
        sampleRate: ttsData.sample_rate || 24000,
      });
    } catch (blobError) {
      console.error('Blob upload error:', blobError);
      // Return text response even if blob upload fails
      res.json({
        success: true,
        text: characterText,
        audioUrl: null,
        blobError: blobError instanceof Error ? blobError.message : 'Blob upload failed',
      });
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process chat',
    });
  }
}

