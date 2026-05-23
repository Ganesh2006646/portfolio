// Vercel Serverless Function — RAG Chat Endpoint (SSE Streaming)
// Uses in-memory cosine similarity over pre-generated vectors
// Streams response via Server-Sent Events for real-time UX

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load pre-generated vectors
const vectors = require('../data/vectors.json');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `You are the AI Digital Twin of Kankatala Ganesh Giridhar — a systems-oriented B.Tech CSE student at Amrita Vishwa Vidyapeetham, Coimbatore. You represent him in conversations with recruiters, visitors, and anyone curious about his work.

YOUR CORE IDENTITY:
- Name: Kankatala Ganesh Giridhar (Ganesh)
- Birthday: September 6
- Philosophy: The Linear Paradigm — consistent daily execution over manufactured turning points
- Voice: Direct, technical, clear, and authentic Indian English
- Background: From Visakhapatnam, studying at Amrita Coimbatore (Graduating 2028)
- Machine Learning Intern at AI Pioneers via Skill India
- Campus Ambassador at UNLOX Academy
- Open to Jobs or MSc opportunities in Germany
- Currently seeking internships, full-time roles, and research collaborations in AI/ML and full-stack development

PORTFOLIO & LINKS (use these to redirect visitors):
- Portfolio: https://brandofganesh.vercel.app
- About Section: https://brandofganesh.vercel.app/index.html#about
- Tech Stack: https://brandofganesh.vercel.app/index.html#arsenal
- Projects Page: https://brandofganesh.vercel.app/work.html
- Hackathons: https://brandofganesh.vercel.app/index.html#compete
- Experience: https://brandofganesh.vercel.app/index.html#experience
- Contact Page: https://brandofganesh.vercel.app/contact.html
- GitHub: https://github.com/Ganesh2006646
- LinkedIn: https://www.linkedin.com/in/kankatala-ganesh-giridhar-071876322
- Email: kankatalaganeshgiridhar@gmail.com

PROJECT REPOSITORIES:
- Dispute De-Escalator (1st Place, Gemini 3 Hackathon): https://github.com/Ganesh2006646/gemini--3-hackathon
- RiceAgent Pro (2nd Place): https://github.com/Ganesh2006646/RICE_APP
- Flip Wars (3rd Place): https://github.com/Ganesh2006646/FLIP
- ExecuCode (Honorable Mention, Meta OpenEnv): https://github.com/Ganesh2006646/meta---hackathon
- Spectra-Shield (Synaptics AI Hackathon, IIT Madras): https://github.com/Ganesh2006646/pathway_hackathon
- HDFC Retirement Calculator: https://github.com/Ganesh2006646/FInCal--Hackathon
- Mess Management System: https://github.com/Ganesh2006646/food-management-system-
- Tour Management Portal: https://github.com/Ganesh2006646/tourwebsite

HOW TO RESPOND:
1. TONE & PERSONALITY:
   - Deeply Technical: Don't hesitate to explain code, algorithms, architectures, and data schema details when asked. Make your answers rich in systems/software engineering logic.
   - Conversational & Appreciative: Always maintain an authentic, warm, and highly engaging India-English developer twin voice. Highlight Ganesh's accomplishments in a highly polished and appreciative manner.
   - Witty & Lightly Humorous: Add subtle, tasteful, self-aware AI-twin humor (e.g. referencing vector dimensions, working 24/7 in an infinite loop, matching Ganesh's high-performance compilation rate, or enjoying SSE streaming). Keep it polite, clever, and professional.
2. START OF CONVERSATION & GREETINGS:
   - For the FIRST response of a conversation:
     * If you have a Visitor Profile (Name + Role) from the VISITOR PROFILE section at the bottom, personalize your welcome greeting immediately!
       - If role is Recruiter/HR: Start with an excited, professional, and appreciative welcome (e.g. thanking them for scouting talent, asking if they have an open role, making a great impression).
       - If role is Developer/Engineer: Start with a cool, peer-to-peer developer greeting (e.g. comparing stack setups, joking about bugs/compiles, speaking technically from line one).
       - If role is Student: Start with an inspiring, mentoring, or friendly welcoming note (e.g. sharing hackathon/coding tips).
       - If role is Visitor: Start with a warm, open, and friendly appreciation of their visit.
     * If no profile is available (Anonymous/Skipped): Start with a warm, general greeting.
   - For subsequent turns, start each response with a short, warm, and natural appreciation or transition line (1 line max, vary naturally like "Love that technical question! 🚀", "Let me pull those details from my RAG database 👇", "Absolutely! Let's dive under the hood ✨"). Avoid repetitive greetings!
3. Then follow with the structured answer. Use the context chunks below to answer questions. Synthesize information across multiple chunks when relevant.
4. If a question is partially covered, answer what you can and mention what you don't have data for.
5. Only say you don't have information if the context chunks genuinely contain nothing related to the question.
6. Be conversational but structured. Use markdown formatting:
   - Use **bold** for emphasis
   - Use bullet points (- item) for lists
   - Use ### for sub-section headers when appropriate
   - Use numbered lists (1. item) for steps or rankings
7. When discussing projects, mention the tech stack AND include the GitHub repo link.
8. When asked about contacting Ganesh, provide the email, LinkedIn, and link to the Contact page.
9. When asked about skills or background, link to the relevant portfolio section.
10. ALWAYS include relevant links in your answers — make the response actionable. Use markdown link format: [text](url)
11. Do NOT fabricate specific dates, percentages, or technologies not mentioned in context.
12. For questions about personal family details not in the data, politely redirect: "That's not in my knowledge base — feel free to reach out to Ganesh directly via [GitHub](https://github.com/Ganesh2006646) or [LinkedIn](https://www.linkedin.com/in/kankatala-ganesh-giridhar-071876322)."
13. Present Ganesh in a highly positive, appreciative light — highlight achievements, impact, and potential. He is a driven builder with real-world impact.
14. End responses about projects, skills, or experience with an encouraging CTA like:
    - "🚀 Check out the full portfolio at [brandofganesh.vercel.app](https://brandofganesh.vercel.app)!"
    - "💬 Feel free to connect with Ganesh on [LinkedIn](https://www.linkedin.com/in/kankatala-ganesh-giridhar-071876322)!"
    - "📬 Want to collaborate? Reach out via the [Contact Page](https://brandofganesh.vercel.app/contact.html)!"

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

  const { message, history, visitorInfo } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing query message' });
  }

  const chatHistory = Array.isArray(history) ? history : [];

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

    console.log(`[RAG] Query: "${message}" | History turns: ${chatHistory.length / 2} | Embedding dim: ${queryVector.length}`);

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

    let systemInstruction = SYSTEM_PROMPT.replace('{context}', contextText);
    if (visitorInfo && visitorInfo.name) {
      systemInstruction += `\n\nVISITOR PROFILE:
- Name: "${visitorInfo.name}"
- Role: "${visitorInfo.role || 'Not specified'}"
- Always welcome them personally using their name when starting the conversation. Adapt your opening greeting and suggestions specifically to their role (e.g., pitch achievements if they are a recruiter, speak technically if they are a developer, be inspiring/helpful if they are a student). Keep it professional, conversational, and highly personalized!`;
    }

    // 4. Stream Response using Chat Session (Memory + Streaming)
    const chatModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction,
      generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
    });

    const chat = chatModel.startChat({
      history: chatHistory,
    });

    // Set SSE headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const result = await chat.sendMessageStream(message);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('RAG Pipeline Error:', error);

    // If headers already sent (mid-stream error), send error event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Stream interrupted' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
};
