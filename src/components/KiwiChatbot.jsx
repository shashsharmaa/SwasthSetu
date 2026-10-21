import { Component, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { Bot, Mic, MicOff, Send, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

class MarkdownMessage extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return this.props.text;
    }

    return <ReactMarkdown className="prose prose-sm max-w-none">{this.props.text || ''}</ReactMarkdown>;
  }
}

export default function KiwiChatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const nodeRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => () => {
    recognitionRef.current?.stop();
  }, []);

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((currentMessages) => [...currentMessages, {
        id: `${Date.now()}-speech-error`,
        text: 'Voice input is not supported in this browser. Please type your question instead.',
        sender: 'assistant',
      }]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) {
        setMessage((currentMessage) => `${currentMessage}${currentMessage ? ' ' : ''}${transcript}`);
      }
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    recognition.start();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isTyping) return;

    const userMessage = { id: `${Date.now()}-user`, text: trimmedMessage, sender: 'user' };
    const history = [
      ...messages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
      { role: 'user', content: trimmedMessage },
    ];
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }
      const reply = data.reply || data.response;
      if (!reply) {
        throw new Error('The chat response did not contain a reply.');
      }
      setMessages((currentMessages) => [...currentMessages, { id: `${Date.now()}-kiwi`, text: String(reply), sender: 'assistant' }]);
    } catch (error) {
      console.error('FRONTEND FETCH ERROR:', error);
      console.error('Kiwi chat request failed:', error);
      setMessages((currentMessages) => [...currentMessages, { id: `${Date.now()}-kiwi-error`, text: 'Sorry, I am having trouble connecting right now.', sender: 'assistant' }]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <Draggable nodeRef={nodeRef} handle={open ? '.kiwi-drag-handle' : undefined}>
      <div ref={nodeRef} className="fixed bottom-6 right-6 z-[1000]">
        {open ? (
          <section className="flex h-[600px] w-[90vw] max-w-[450px] flex-col overflow-hidden rounded-2xl border border-teal-200 bg-white text-sm shadow-2xl" aria-label="Kiwi Insurance Assistant">
            <header className="kiwi-drag-handle flex cursor-move items-center justify-between bg-teal-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <h2 className="font-semibold">Kiwi - Insurance Assistant</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-white hover:bg-teal-700" aria-label="Minimize Kiwi">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-teal-50/40 p-4" aria-live="polite">
              {messages.length === 0 && (
                <div className="rounded-xl bg-white p-3 text-sm text-gray-600 shadow-sm">
                  Hi! I&apos;m Kiwi. Ask me about insurance or PM-JAY.
                </div>
              )}
              {messages.map((chatMessage) => (
                <div key={chatMessage.id} className={`flex ${chatMessage.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 ${chatMessage.sender === 'user' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 shadow-sm'}`}>
                    {chatMessage.sender === 'assistant' ? <MarkdownMessage text={chatMessage.text || ''} /> : chatMessage.text}
                  </div>
                </div>
              ))}
              {isTyping && <p className="text-sm italic text-gray-500">Kiwi is typing...</p>}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-gray-100 bg-white p-3">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask Kiwi something..."
                className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                aria-label="Message Kiwi"
              />
              <button type="button" onClick={toggleListening} disabled={isTyping} className={`rounded-lg p-2 ${isListening ? 'animate-pulse bg-red-600 text-white' : 'bg-teal-50 text-teal-700'} disabled:cursor-not-allowed disabled:opacity-50`} aria-label={isListening ? 'Stop voice input' : 'Start voice input'}>
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button type="submit" disabled={!message.trim() || isTyping} className="rounded-lg bg-teal-600 p-2 text-white disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </section>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white shadow-xl shadow-teal-600/30" aria-label="Open Kiwi chat">
            <span className="flex flex-col items-center leading-none"><Bot className="mb-1 h-6 w-6" />Kiwi</span>
          </button>
        )}
      </div>
    </Draggable>
  );
}
