// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  
  const sendMessage = async () => {
    const newMessage = { role: "user", text: userInput };
    setMessages([...messages, newMessage]);

    // Send the user message to the API route
    const res = await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: '1234', text: userInput })
    });
    
    const data = await res.json();
    if (data.success) {
      setMessages([...messages, newMessage, { role: "triage", text: data.triageResponse }]);
    }
    
    setUserInput('');
  };

  return (
    <div>
      <h1>Health Assist Chat</h1>
      <div>
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.role}: </strong>{msg.text}</p>
        ))}
      </div>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Describe your symptoms"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
