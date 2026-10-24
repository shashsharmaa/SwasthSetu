import { Component, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { Minus, Mic, MicOff, RotateCcw, Send, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import KiwiLogo from './KiwiLogo';

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
  const [minimized, setMinimized] = useState(false);
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
          <section className={`flex w-[90vw] max-w-[450px] flex-col overflow-hidden rounded-3xl border border-teal-100 bg-white text-sm text-slate-800 shadow-2xl transition-[height] duration-300 ${minimized ? 'h-[70px]' : 'h-[600px] md:h-[650px]'}`} aria-label="Kiwi Insurance Assistant">
            <header className="kiwi-drag-handle flex min-h-[70px] cursor-move items-center justify-between border-b border-teal-100 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <KiwiLogo className="h-11 w-11" />
                <div>
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="SwasthSetu Logo" className="h-6 w-auto object-contain" />
                    <h2 className="font-semibold text-slate-800">Kiwi - SwasthSetu AI</h2>
                  </div>
                  <p className="text-xs text-slate-500">Insurance Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setMinimized((value) => !value)} className="rounded-lg p-2 text-slate-500 hover:bg-teal-50 hover:text-teal-700" aria-label={minimized ? 'Expand Kiwi' : 'Minimize Kiwi'}>
                  <Minus className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setMessages([])} className="rounded-lg p-2 text-slate-500 hover:bg-teal-50 hover:text-teal-700" aria-label="Clear chat">
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => { setOpen(false); setMinimized(false); }} className="rounded-lg p-2 text-slate-500 hover:bg-teal-50 hover:text-teal-700" aria-label="Close Kiwi">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {!minimized && <div className="flex-1 space-y-4 overflow-y-auto bg-teal-50/30 p-5" aria-live="polite">
              {messages.length === 0 && (
                <div className="rounded-2xl border border-teal-100 bg-white p-4 text-base leading-6 text-slate-600 shadow-sm">
                  Hi! I&apos;m Kiwi. Ask me about insurance or PM-JAY.
                </div>
              )}
              {messages.map((chatMessage) => (
                <div key={chatMessage.id} className={`flex ${chatMessage.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-base leading-6 ${chatMessage.sender === 'user' ? 'bg-teal-600 text-white shadow-md shadow-teal-600/15' : 'border border-slate-100 bg-white text-slate-700 shadow-sm'}`}>
                    {chatMessage.sender === 'assistant' ? <MarkdownMessage text={chatMessage.text || ''} /> : chatMessage.text}
                  </div>
                </div>
              ))}
              {isTyping && <p className="text-sm italic text-slate-500">Kiwi is typing...</p>}
            </div>}

            {!minimized && <form onSubmit={handleSubmit} className="flex gap-2 border-t border-teal-100 bg-white p-4">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask Kiwi something..."
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                aria-label="Message Kiwi"
              />
              <button type="button" onClick={toggleListening} disabled={isTyping} className={`rounded-xl p-3 ${isListening ? 'animate-pulse bg-red-600 text-white' : 'bg-teal-50 text-teal-700'} disabled:cursor-not-allowed disabled:opacity-50`} aria-label={isListening ? 'Stop voice input' : 'Start voice input'}>
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button type="submit" disabled={!message.trim() || isTyping} className="rounded-xl bg-teal-600 p-3 text-white disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </form>}
          </section>
        ) : (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-white p-2 shadow-xl shadow-teal-600/25 ring-4 ring-white/80"
            aria-label="Open Kiwi chat"
          >
            <KiwiLogo className="h-full w-full" />
          </motion.button>
        )}
      </div>
    </Draggable>
  );
}
