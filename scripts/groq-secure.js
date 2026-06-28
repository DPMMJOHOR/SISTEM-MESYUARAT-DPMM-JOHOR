// ============================================================
// FRONTEND: Groq Chatbot via Edge Function
// Replace direct Groq API calls with Edge Function calls
// ============================================================

const GROQ_EDGE_FUNCTION_URL = 'https://lzoloupwtqmjyupvofhh.supabase.co/functions/v1/groq-chatbot';

// ============================================================
// GROQ CHATBOT FUNCTION (Secure Version)
// ============================================================
async function aimanSendSecure(contextSnippet, aimanHistory) {
  try {
    const AIMAN_SYSTEM = `Anda adalah Aiman, pembantu AI yang mesra untuk sistem DPMM Negeri Johor.
Jawab dalam Bahasa Melayu yang ringkas dan jelas.
Jangan dedahkan maklumat peribadi sensitif dalam jawapan anda.
Jika soalan berkaitan dengan data ahli, minta pengguna berikan nombor ahli untuk cari.`;

    const response = await fetch(GROQ_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: aimanHistory,
        systemPrompt: AIMAN_SYSTEM + '\n\nKonteks semasa:\n' + contextSnippet,
        maxTokens: 600,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Gagal menghubungi Aiman');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Aiman error:', error);
    return 'Maaf, Aiman sedang sibuk. Sila cuba lagi nanti.';
  }
}

// ============================================================
// MIGRATION GUIDE
// ============================================================

// Old way (INSECURE - remove this):
/*
async function aimanSend(){
  const resp=await fetch('https://api.groq.com/openai/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+GROQ_KEY},
    body:JSON.stringify({
      model:'llama-3.1-8b-instant',
      messages:[
        {role:'system',content:AIMAN_SYSTEM+'\n\nKonteks semasa:\n'+contextSnippet},
        ...aimanHistory
      ],
      max_tokens:600,temperature:0.7
    })
  });
  // ...
}
*/

// New way (SECURE - use this):
/*
async function aimanSend(){
  const response = await aimanSendSecure(contextSnippet, aimanHistory);
  // Process response
}
*/

// ============================================================
// CONFIGURATION
// ============================================================

// No GROQ_KEY needed in frontend anymore
// GROQ_KEY is stored in Supabase Edge Function environment variables
// To set it: Supabase Dashboard → Edge Functions → groq-chatbot → Environment Variables
// Add: GROQ_KEY = gsk_...
