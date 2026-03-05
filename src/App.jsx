import { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { companyInfo } from "./companyInfo";
import Home from "./pages/Home";
import History from "./pages/History";
import Menu from "./pages/Menu";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const chatBodyRef = useRef();
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "user",
      text: companyInfo,
    },
    {
      hideInChat: true,
      role: "model",
      text: "Entendido. Usarei formatação em negrito e listas.",
    }
  ]);

  const generateBotResponse = async (history) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [...prev.filter((msg) => msg.text != "Thinking..."), { role: "model", text, isError }]);
    };

    history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history }),
    };

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error.message || "Algo deu errado!");

      const apiResponseText = data.candidates[0].content.parts[0].text.trim();
      updateHistory(apiResponseText);
    } catch (error) {
      updateHistory(error.message, true);
    }
  };

  useEffect(() => {
    if(chatBodyRef.current) {
      chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chatHistory, showChatbot]);

  return (
    <Router>
      <ScrollToTop />

      <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>

        <header className="site-header">
          <div className="logo">Aroma Beans</div>
          <div className="nav-container">
            <nav className="nav-links">
              <Link to="/">Início</Link>
              <Link to="/menu">Menu</Link>
              <Link to="/history">Sobre</Link>
            </nav>
            <button onClick={() => setShowChatbot((prev) => !prev)} id="chatbot-toggler">
              <span className="material-symbols-rounded">mode_comment</span>
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/menu" element={<Menu />} />
          </Routes>
        </main>

        <footer className="site-footer">
          <div className="footer-content">
            <div className="footer-column">
              <h2 className="footer-logo">Aroma Beans</h2>
              <p>Café artesanal e momentos únicos desde 2010.</p>
            </div>
            <div className="footer-column">
              <h3>Contato</h3>
              <ul className="footer-list">
                <li>Rua das Flores, 123 - SP</li>
                <li>(11) 99999-9999</li>
                <li>contato@aromabeans.com</li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Horário</h3>
              <ul className="footer-list times">
                <li><span>Seg-Sex</span><span>07:00 - 20:00</span></li>
                <li><span>Sáb</span><span>08:00 - 22:00</span></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Novidades</h3>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Seu e-mail" />
                <button type="submit">→</button>
              </form>
            </div>
          </div>
          <div className="footer-bottom"><p>&copy; 2024 Aroma Beans.</p></div>
        </footer>

        <div className="chatbot-popup">
          
          <div className="chat-header">
            <div className="header-icon-left">
              <ChatbotIcon />
            </div>
            <h2 className="chat-title-center">CHATBOOT</h2>
          </div>

          <div ref={chatBodyRef} className="chat-body">
            <div className="message bot-message">
              <ChatbotIcon />
              <p className="message-text">Olá! 👋 <br /> Sou o especialista da Aroma Beans. Quer ajuda para escolher um café hoje?</p>
            </div>
            {chatHistory.map((chat, index) => (
              <ChatMessage key={index} chat={chat} />
            ))}
          </div>
          
          <div className="chat-footer">
            <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse} />
          </div>
        </div>

      </div>
    </Router>
  );
};

export default App;