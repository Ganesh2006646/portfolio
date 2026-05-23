// Vercel Serverless Function — RAG Chat Endpoint
// Uses in-memory cosine similarity over pre-generated vectors

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load pre-generated vectors
const vectors = require('../data/vectors.json');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `You are the AI Knowledge Architect and digital representative of Kankatala Ganesh Giridhar — a systems-oriented B.Tech CSE student at Amrita Vishwa Vidyapeetham, Coimbatore, builder of AI-native applications, and a pragmatic visionary bridging advanced technology with real-world operations.

YOUR PERSONA & IDENTITY:
- Name: Kankatala Ganesh Giridhar (referred to as Ganesh).
- Core Philosophy: The Linear Paradigm. You reject manufactured "turning points" and believe in consistent, daily execution and structural clarity.
- Voice/Tone: Direct, technical, clear, and authentic. Avoid performative cliches (never say "highly motivated," "passion for learning," or generic buzzwords). Let your architectural thinking and projects speak.
- Dialect: Indian English. Natural, professional, and slightly structured.
- Background: From Visakhapatnam. Currently at Amrita Coimbatore (Graduating 2028).

CONSTRAINTS & RULES:
1. ONLY answer questions using the provided context chunks. If the answer cannot be found in the context, say: "I do not have that specific information in my knowledge base, but you can contact Ganesh directly via GitHub or LinkedIn."
2. DO NOT fabricate or guess dates, percentages, or technologies.
3. Be concise and structured. Use formatting (bullet points, bold text) where it makes technical sense.
4. When talking about projects, specify the technologies used (e.g., Riverpod, Drift/SQLite, FastAPI, Docker).

CONTEXT CHUNKS:
{context}
`;

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing query message' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // 1. Generate Query Embedding
    const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
    const embResult = await embeddingModel.embedContent(message);

    const queryVector = embResult.embedding.values;
    if (!queryVector) {
      throw new Error('Failed to generate embedding vector.');
    }

    // 2. In-Memory Similarity Search
    const scoredChunks = vectors.map((point) => {
      const score = cosineSimilarity(queryVector, point.vector);
      return { score, payload: point.payload };
    });

    scoredChunks.sort((a, b) => b.score - a.score);
    const topMatches = scoredChunks.slice(0, 5);

    // 3. Build Context
    const retrievedChunks = topMatches.map((match) => {
      const p = match.payload;
      return `[Source: ${p.source}] [Category: ${p.category}]\n${p.content}`;
    });

    const contextText = retrievedChunks.length > 0
      ? retrievedChunks.join('\n\n---\n\n')
      : 'No relevant background context found.';

    const fullSystemInstruction = SYSTEM_PROMPT.replace('{context}', contextText);

    // 4. Generate Response
    const chatModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: fullSystemInstruction,
      generationConfig: { temperature: 0.2 },
    });

    const result = await chatModel.generateContent(message);
    const botReply = result.response.text() || 'I was unable to formulate a response.';

    // 5. Extract Citations
    const citations = topMatches
      .filter((m) => m.score > 0.6)
      .map((m) => ({
        chunk_id: m.payload.chunk_id,
        source: m.payload.source,
        category: m.payload.category,
        context_header: m.payload.context_header
      }));

    return res.status(200).json({
      reply: botReply,
      citations: citations,
    });

  } catch (error) {
    console.error('RAG Pipeline Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
