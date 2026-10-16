import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Shared server-side Gemini client
const getAi = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. Analyze Images API using gemini-4-argon (with fallback if model unavailable)
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, prompt } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const ai = getAi();
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const contents = {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        },
        {
          text: prompt || 'Analyze this photo taken in the open world city. Describe the scene, characters present (Leo or companions Elena, Scarlett, Maya, Chloe), vehicle, mood, weather, and write a cool in-game social media review or roleplay rating.',
        },
      ],
    };

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents,
      });
    } catch (modelErr: any) {
      console.warn('gemini-4-argon failed or requires access, attempting gemini-3.8-flash:', modelErr?.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
      });
    }

    return res.json({ analysis: response.text });
  } catch (error: any) {
    console.error('Analyze image error:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze image' });
  }
});

// 2. Create & Edit Images API using gemini-nano-banana-2.1
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, baseImageBase64 } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAi();
    let imageUrl = '';

    if (baseImageBase64) {
      // Edit image
      const cleanBase64 = baseImageBase64.replace(/^data:image\/\w+;base64,/, '');
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-nano-banana-2.1',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: cleanBase64,
                },
              },
              { text: prompt },
            ],
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData?.data) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch {
        // Fallback to flash lite image
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: cleanBase64,
                },
              },
              { text: prompt },
            ],
          },
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData?.data) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } else {
      // Generate new image
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-nano-banana-2.1',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: '16:9',
              imageSize: '1K',
            },
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData?.data) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: prompt }],
          },
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData?.data) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    }

    return res.json({ imageUrl });
  } catch (error: any) {
    console.error('Generate image error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

// Vite Middleware for Full-Stack App
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Open World Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
