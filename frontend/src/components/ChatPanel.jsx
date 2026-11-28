import { useEffect, useRef, useState } from 'react';
import { sendChat } from '../api.js';
import { formatRupiah } from '../format.js';
import '../styles/chat.css';

const nowHHMM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const GREETING = {
  from: 'bot',
  time: nowHHMM(),
  text: 'Halo! Tulis asal, tujuan, dan jam berangkatmu, misalnya: "Dari Halte ITS ke Tunjungan jam 3 sore, saya pelajar".',
};

// Chat panel (POST /chat). It stays mounted while closed, so the conversation is kept.
// onViewResult(result) is called when the user presses "Lihat detail" on a bot reply.
export default function ChatPanel({ open, onClose, onViewResult }) {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID?.() ?? String(Date.now()));
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, sending]);

  const send = async (text) => {
    const message = text.trim();
    if (!message || sending) return;

    setMessages((prev) => [...prev, { from: 'user', text: message, time: nowHHMM() }]);
    setInput('');
    setSending(true);

    try {
      const res = await sendChat({ session_id: sessionId, message });
      const hasRoutes = res.result && res.result.status === 'ok' && res.result.routes.length > 0;
      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          time: nowHHMM(),
          text: res.reply,
          result: hasRoutes ? res.result : null,
          options: res.needs_clarification ? res.options : [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          time: nowHHMM(),
          text: 'Chat tidak bisa dihubungi. Coba lagi sebentar lagi.',
          error: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  return (
    <aside className="chat-panel" aria-label="Chat GasRek!" hidden={!open}>
      <header className="chat-header">
        <div>
          <h2>Chat GasRek!</h2>
          <p className="chat-subtitle">Asisten rute bus Surabaya</p>
        </div>
        <button type="button" className="chat-close" onClick={onClose}>
          Tutup
        </button>
      </header>

      <div className="chat-messages">
        {messages.map((msg, index) => {
          const isLast = index === messages.length - 1;
          const route = msg.result ? msg.result.routes[0] : null;
          return (
            <div key={index} className={`chat-row chat-row-${msg.from}`}>
              {msg.from === 'bot' && <span className="chat-avatar" aria-hidden="true" />}

              <div className="chat-col">
                <div className={`chat-bubble chat-bubble-${msg.from}${msg.error ? ' chat-bubble-error' : ''}`}>
                  {msg.text}

                  {route && (
                    <div className="chat-summary">
                      <span className="label-caps">Rangkuman perjalanan</span>
                      <ol className="chat-timeline">
                        <li>
                          <strong>{route.departure_time}</strong>
                          <span>{route.legs[0].board_stop.name}</span>
                        </li>
                        <li>
                          <strong>{route.arrival_time}</strong>
                          <span>{route.legs[route.legs.length - 1].alight_stop.name}</span>
                        </li>
                      </ol>
                      <p className="chat-summary-meta">
                        {formatRupiah(route.fare)} • {route.duration_min} menit
                      </p>
                      <button
                        type="button"
                        className="primary-button chat-view-button"
                        onClick={() => onViewResult(msg.result)}
                      >
                        Lihat detail →
                      </button>
                    </div>
                  )}
                </div>

                <span className="chat-time">{msg.time}</span>

                {isLast && msg.options && msg.options.length > 0 && (
                  <div className="chat-options">
                    {msg.options.map((option) => (
                      <button
                        key={option.stop_id}
                        type="button"
                        className="chat-option"
                        disabled={sending}
                        onClick={() => send(option.name)}
                      >
                        <span>{option.name}</span>
                        <span aria-hidden="true">›</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="chat-row chat-row-bot">
            <span className="chat-avatar" aria-hidden="true" />
            <div className="chat-col">
              <div className="chat-bubble chat-bubble-bot">Mengetik...</div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pertanyaan..."
          aria-label="Pesan"
        />
        <button type="submit" className="primary-button" disabled={sending}>
          Kirim
        </button>
      </form>
    </aside>
  );
}
