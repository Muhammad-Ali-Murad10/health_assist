// pages/api/mcp.js
import fetch from 'node-fetch';
import { firestore } from '../../firebase'; // Import Firebase config

const GEMINI_API_KEY = 'AIzaSyD5mUyqQ3yDF1TzCWrtFyUeIyIKTeRqFbQ';  // Your Gemini API key

// Helper function to call Gemini API
async function callGemini(prompt, model = "gemini-2.5-flash-latest") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error.message);
  return data?.candidates[0]?.content?.parts[0]?.text;
}

// Triage agent function
async function triageAgent(userText) {
  const prompt = `You are a triage assistant. Respond with one of:
  - Self-care
  - BHU (visit basic health unit)
  - ER (go to emergency)
  Example Response: {"decision": "BHU", "reason": "fever for 48 hours", "confidence": 0.85}
  User: ${userText}`;
  return await callGemini(prompt);
}

// Facility agent function
async function facilityAgent(decision) {
  const prompt = `You are a facility finder. Based on the triage decision, find a nearby facility for the user.
  Example Response: {"found": true, "facility": {"name": "Model Town BHU", "services": ["general", "pediatrics"], "openHours": "9 AM - 5 PM"}}
  Decision: ${decision}`;
  return await callGemini(prompt);
}

// API route to handle user messages
export default async (req, res) => {
  try {
    const { sessionId, text } = req.body;

    // Save the user message to Firestore
    await firestore.collection('messages').add({
      sessionId,
      role: 'user',
      text,
      ts: new Date(),
    });

    // Call Triage Agent
    const triageResponse = await triageAgent(text);

    // Save Triage result to Firestore
    await firestore.collection('messages').add({
      sessionId,
      role: 'triage',
      text: triageResponse,
      ts: new Date(),
    });

    // Call Facility Agent (if needed)
    if (triageResponse.includes("BHU") || triageResponse.includes("ER")) {
      const facilityResponse = await facilityAgent(triageResponse);
      await firestore.collection('messages').add({
        sessionId,
        role: 'facility',
        text: facilityResponse,
        ts: new Date(),
      });
    }

    // Send response back to client
    res.status(200).json({ success: true, triageResponse });
  } catch (error) {
    console.error("Error in API route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
