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
      console.log('Available models:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching models:',
        error.response?.data || error.message,
      );
      return { error: 'Failed to fetch models' };
    }
  }

  async extractTextWithPuppeteer(url: string): Promise<string> {
    const browser = await puppeteer.launch({});
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
    const response = await axios.get(url);
    const data = unfluff(response.data);

    if (data?.text == '') {
      articleText = await this.extractTextWithPuppeteer(url);
    }

    const prompt = `Summarize the following article and extract key points for the mentioned public URL:\n\n${articleText ? articleText : data.text}`;
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

    return {
      type: 'success',
      data: {
        url: url,
        title: data.title,
        summary: aiResponse,
        rawText: data.text,
        message: 'Data Fetched Sucessfully',
      },
    };
  }
}
