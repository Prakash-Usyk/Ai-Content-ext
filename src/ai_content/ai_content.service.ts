import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as unfluff from 'unfluff';
import * as puppeteer from 'puppeteer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiContentService {
  private readonly GEMINI_API_URL: string;
  private readonly GEMINI_API_URL_LIST_MODEL: string;
  private readonly GEMINI_API_KEY: string;

  constructor(private configService: ConfigService) {
    this.GEMINI_API_URL =
      this.configService.get<string>('GEMINI_API_URL') ?? '';
    this.GEMINI_API_URL_LIST_MODEL =
      this.configService.get<string>('GEMINI_API_URL_LIST_MODEL') ?? '';
    this.GEMINI_API_KEY =
      this.configService.get<string>('GEMINI_API_KEY') ?? '';
  }

  async listAvailableModels() {
    try {
      const response = await axios.get(
        `${this.GEMINI_API_URL_LIST_MODEL}?key=${this.GEMINI_API_KEY}`,
      );
      return response.data;
    } catch (error) {
      return { error: 'Failed to fetch models' };
    }
  }

  async extractTextWithPuppeteer(url: string): Promise<string> {
    // const browser = await puppeteer.launch({});
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const text = await page.evaluate(() => {
      return document.body.innerText;
    });

    await browser.close();
    return text;
  }

  async extractAndSummarize(url: string) {
    if (this.GEMINI_API_URL === '' || this.GEMINI_API_KEY === '') {
      return {
        type: 'error',
        data: {
          url: url,
          message: 'Missing Environment Variables',
        },
      };
    }
    let articleText;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const data = unfluff(response.data);

    // articleText = await this.extractTextWithPuppeteer(url);

    const prompt = await this.getPrompt(data.text);

    let geminiResponse;

    try {
      geminiResponse = await axios.post(
        `${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
      );
    } catch (err) {
      return {
        type: 'error',
        data: {
          url: url,
          message: err.message,
        },
      };
    }

    const aiResponse =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      'No summary available.';

    const cleaned = aiResponse
      .replace(/```json\n?/, '')
      .replace(/```/, '')
      .trim();

    // Step 2: Parse to JS object
    const parsedData = JSON.parse(cleaned);

    return {
      type: 'success',
      data: {
        url: url,
        title: parsedData.title,
        summary: parsedData.summary,
        keyPoints: parsedData.keyPoints,
        message: 'Data Fetched Sucessfully',
      },
    };
  }

  async getPrompt(content): Promise<string> {
    return `You are an AI content extractor.

Summarize the content from this article in a clear and structured format. Please return the response in JSON format with the following structure:

{
  "title": "Short title of the article",
  "summary": "A 2-3 sentence overview of the article",
  "keyPoints": [
    "Point 1",
    "Point 2",
    "Point 3",
    ...
  ]
}

Here is the content extracted from the web URL:
\n\n${content}
`;
  }
}
