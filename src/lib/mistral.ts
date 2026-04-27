import axios from 'axios';
import type { MistralResponse } from '@/types';

const MISTRAL_BASE_URL = 'https://api.mistral.ai/v1';

export class MistralClient {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'mistral-small-latest') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(prompt: string, temperature: number = 0.3): Promise<MistralResponse> {
    const response = await axios.post(
      `${MISTRAL_BASE_URL}/chat/completions`,
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional Wall Street quantitative analyst. Return JSON only with no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature,
        response_format: {
          type: 'json_object',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    const content = response.data.choices[0].message.content;
    return JSON.parse(content) as MistralResponse;
  }
}

let mistralClient: MistralClient | null = null;

export function getMistralClient(): MistralClient {
  if (!mistralClient) {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY is not set');
    }
    mistralClient = new MistralClient(apiKey);
  }
  return mistralClient;
}

export async function generateRecommendation(prompt: string): Promise<MistralResponse> {
  return getMistralClient().chat(prompt);
}