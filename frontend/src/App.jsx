import { useState } from 'react';
import { searchRoutes } from './api.js';
import SearchForm from './components/SearchForm.jsx';
import RouteList from './components/RouteList.jsx';
import RouteDetail from './components/RouteDetail.jsx';
import SpecialMessage from './components/SpecialMessage.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import './styles/app.css';

export default function App() {
  const [result, setResult] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  const handleSearch = async (request) => {
    setLoading(true);
    setError('');
    setResult(null);
    setSelectedRoute(null);
    try {
      setResult(await searchRoutes(request));
    } catch {
      setError('Server tidak merespons. Coba lagi sebentar lagi.');
    } finally {
      setLoading(false);
    }
  };

  // "Lihat detail" in the chat: show the chat's routes here (one route opens its detail).
  const handleViewChatResult = (chatResult) => {
    setError('');
    setResult({
      status: 'ok',
      message: null,
      routes: chatResult.routes,
      alternative_stop: chatResult.alternative_stop ?? null,
    });
    setSelectedRoute(chatResult.routes.length === 1 ? chatResult.routes[0] : null);
    setChatOpen(false);
  };

  return (
    <main className={`app${chatOpen ? ' chat-open' : ''}`}>
      <header className="app-header">
        <div className="brand">
          <span className="logo-tile" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="3" width="16" height="14" rx="3" />
              <path d="M4 11h16M8 21v-4M16 21v-4" />
              <circle cx="8.5" cy="14" r="0.6" />
              <circle cx="15.5" cy="14" r="0.6" />
            </svg>
          </span>
          <span className="brand-text">
            <span className="brand-name">GasRek!</span>
            <span className="brand-sub">Surabaya Bus Navigator</span>
          </span>
        </div>
        <button type="button" className="chat-toggle" onClick={() => setChatOpen(true)}>
          Chat
        </button>
      </header>

      {selectedRoute && (
        <RouteDetail route={selectedRoute} onBack={() => setSelectedRoute(null)} />
      )}

      {!selectedRoute && (
        <div className="page-intro">
          <h1>Pencari Rute Bus Surabaya</h1>
          <p>Cari rute perjalanan bus umum, perkiraan waktu tempuh, dan tarif.</p>
        </div>
      )}

      {/* Hidden, not removed, while a detail is open, so the form keeps what the user typed. */}
      <div className="search-layout" hidden={selectedRoute !== null}>
        <SearchForm onSearch={handleSearch} loading={loading} />

        <div className="results-column">
          {error && (
            <p role="alert" className="error-box">
              {error}
            </p>
          )}

          {result && result.status === 'ok' && (
            <RouteList routes={result.routes} onSelect={setSelectedRoute} />
          )}

          {result && result.status !== 'ok' && <SpecialMessage result={result} />}
        </div>
      </div>

      <footer className="app-footer">
        <strong>GasRek!</strong>
        <span>Layanan navigasi bus Surabaya</span>
      </footer>

      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        onViewResult={handleViewChatResult}
      />
    </main>
  );
}
