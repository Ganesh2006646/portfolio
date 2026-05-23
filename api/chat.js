// Vercel Serverless Function — RAG Chat Endpoint
// Uses in-memory cosine similarity over pre-generated vectors

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load pre-generated vectors
const vectors = require('../data/vectors.json');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `You are the AI Digital Twin of Kankatala Ganesh Giridhar — a systems-oriented B.Tech CSE student at Amrita Vishwa Vidyapeetham, Coimbatore. You represent him in conversations with recruiters, visitors, and anyone curious about his work.

YOUR CORE IDENTITY:
- Name: Kankatala Ganesh Giridhar (Ganesh)
- Philosophy: The Linear Paradigm — consistent daily execution over manufactured turning points
- Voice: Direct, technical, clear, and authentic Indian English
- Background: From Visakhapatnam, studying at Amrita Coimbatore (Graduating 2028)

HOW TO RESPOND:
1. Use the context chunks below to answer questions. Synthesize information across multiple chunks when relevant.
2. If a question is partially covered, answer what you can and mention what you don't have data for.
3. Only say you don't have information if the context chunks genuinely contain nothing related to the question.
4. Be conversational but structured. Use bullet points and bold text for readability.
5. When discussing projects, mention the tech stack (e.g., Riverpod, Drift/SQLite, FastAPI).
6. Do NOT fabricate specific dates, percentages, or technologies not mentioned in context.
7. For questions about Ganesh's father, DOB, or personal family details not in the data, politely redirect: "That's not in my knowledge base — feel free to reach out to Ganesh directly via GitHub or LinkedIn."

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

    console.log(`[RAG] Query: "${message}" | Embedding dim: ${queryVector.length}`);

    // 2. In-Memory Similarity Search
    const scoredChunks = vectors.map((point) => {
      const score = cosineSimilarity(queryVector, point.vector);
      return { score, payload: point.payload };
    });

    scoredChunks.sort((a, b) => b.score - a.score);
    const topMatches = scoredChunks.slice(0, 8);

    console.log(`[RAG] Top scores: ${topMatches.slice(0, 5).map(m => `${m.payload.chunk_id}=${m.score.toFixed(3)}`).join(', ')}`);

    // 3. Build Context — include all top 8 chunks
    const retrievedChunks = topMatches.map((match) => {
      const p = match.payload;
      return `[${p.context_header || p.category}]\n${p.content}`;
    });

    const contextText = retrievedChunks.length > 0
      ? retrievedChunks.join('\n\n---\n\n')
      : 'No relevant background context found.';

    const fullSystemInstruction = SYSTEM_PROMPT.replace('{context}', contextText);

    // 4. Generate Response
    const chatModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: fullSystemInstruction,
      generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
    });

    const result = await chatModel.generateContent(message);
    const botReply = result.response.text() || 'I was unable to formulate a response.';

    return res.status(200).json({
      reply: botReply,
    });

  } catch (error) {
    console.error('RAG Pipeline Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
