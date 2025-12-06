
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // IMPORTANT: The API key is sourced from environment variables.
    // Do not hardcode or expose it in the client-side code.
    // This setup assumes `process.env.API_KEY` is available in the execution environment.
    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set.");
      throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateChecklist(layerName: string, layerDescription: string): Promise<string[]> {
    const prompt = `
      Based on the following description of the "${layerName}" layer in a defense-in-depth security model, 
      generate a simple, actionable security checklist with 3 to 5 items. The items should be high-level best practices.
      
      Description: "${layerDescription}"
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              checklist: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: 'A list of security checklist items.'
              }
            }
          }
        }
      });
      
      const jsonStr = response.text.trim();
      const result = JSON.parse(jsonStr);
      
      if (result && Array.isArray(result.checklist)) {
        return result.checklist;
      } else {
        throw new Error('Invalid checklist format received from API.');
      }
    } catch (error) {
      console.error('Error generating checklist:', error);
      throw new Error('Failed to generate security checklist. Please check your API key and connection.');
    }
  }
}
