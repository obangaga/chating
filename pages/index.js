// pages/index.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function ChatApp() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Selamat datang di aplikasi chat!", sender: "system", timestamp: new Date() },
    { id: 2, text: "Silakan mulai mengobrol", sender: "system", timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [userName, setUserName] = useState('Pengguna Baru');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Simulasikan chat dari bot setiap beberapa detik
  useEffect(() => {
    const botTimer = setInterval(() => {
      const botMessages = [
        "Hai! Bagaimana kabarmu hari ini?",
        "Aplikasi chat ini sangat mudah digunakan, bukan?",
        "Kamu bisa mengubah nama dengan mengklik menu di pojok kanan atas",
        "Aplikasi ini siap di-deploy ke Vercel!",
        "Coba kirim pesan untuk mencoba fiturnya"
      ];
      
      if (messages.length > 2 && Math.random() > 0.7) {
        const randomMessage = botMessages[Math.floor(Math.random() * botMessages.length)];
        const newMessage = {
          id: messages.length + 1,
          text: randomMessage,
          sender: "DeepSeek Bot",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
      }
    }, 8000);

    return () => clearInterval(botTimer);
  }, [messages.length]);

  // Scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: userName,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    // Auto-hide keyboard setelah mengirim pesan
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  const handleNameChange = (newName) => {
    if (!newName.trim()) return;
    
    setUserName(newName);
    setIsMenuOpen(false);
    
    // Tambahkan notifikasi perubahan nama
    setMessages(prev => [
      ...prev, 
      { 
        id: prev.length + 1, 
        text: `Nama pengguna diubah menjadi: ${newName}`, 
        sender: "system", 
        timestamp: new Date() 
      }
    ]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <Head>
        <title>Aplikasi Chat Android</title>
        <meta name="description" content="Aplikasi chat mobile-friendly untuk Android" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header dengan hamburger menu */}
      <header className="bg-indigo-600 text-white p-3 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mr-3 p-1 rounded-md hover:bg-indigo-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">DeepSeek Chat</h1>
          </div>
          
          <div className="flex items-center">
            <span className="bg-green-400 w-3 h-3 rounded-full mr-2"></span>
            <span className="font-medium text-sm">{userName}</span>
          </div>
        </div>
      </header>

      {/* Side Menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className="bg-white w-64 h-full p-4 shadow-lg transform transition-transform"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pengaturan</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Nama Pengguna</label>
              <div className="flex">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none"
                />
                <button
                  onClick={() => handleNameChange(userName)}
                  className="bg-indigo-600 text-white px-3 py-2 rounded-r-lg"
                >
                  Simpan
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-bold text-gray-800 mb-2">Cara Deploy ke Vercel</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-600">
                <li>Buat file <code className="bg-gray-100 px-1 rounded">index.js</code></li>
                <li>Buat akun Vercel gratis</li>
                <li>Install Vercel CLI</li>
                <li>Login: <code>vercel login</code></li>
                <li>Deploy: <code>vercel</code></li>
              </ol>
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg w-full"
              >
                Tutup Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Area Chat Utama */}
      <main className="flex-grow flex flex-col p-2">
        <div className="bg-white rounded-lg shadow-lg flex-grow flex flex-col">
          <div className="p-3 border-b">
            <h2 className="font-semibold text-gray-700">Obrolan Umum</h2>
          </div>
          
          {/* Area Pesan */}
          <div 
            className="flex-grow overflow-y-auto p-3" 
            style={{ maxHeight: 'calc(100vh - 180px)' }}
          >
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-3 flex ${message.sender === userName ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    message.sender === userName 
                      ? 'bg-indigo-500 text-white rounded-br-none' 
                      : message.sender === "system" 
                        ? 'bg-gray-200 text-gray-700 rounded-bl-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.sender !== "system" && message.sender !== "DeepSeek Bot" && (
                    <div className="font-medium text-xs mb-1">
                      {message.sender === userName ? 'Anda' : message.sender}
                    </div>
                  )}
                  {message.sender === "system" && (
                    <div className="text-xs text-center italic">{message.text}</div>
                  )}
                  {message.sender !== "system" && (
                    <div className={message.sender === "DeepSeek Bot" ? "font-medium" : ""}>
                      {message.text}
                    </div>
                  )}
                  <div className="text-right text-xs opacity-70 mt-1">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Pesan */}
          <form onSubmit={handleSendMessage} className="p-3 border-t flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-grow px-4 py-3 border rounded-full focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
            <button
              type="submit"
              className="ml-2 bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      </main>

      {/* Footer dengan tombol akses cepat */}
      <footer className="bg-gray-800 text-white py-3 px-2">
        <div className="flex justify-between">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Pengaturan
          </button>
          
          <div className="text-xs text-gray-400">
            Aplikasi Chat Sederhana &copy; {new Date().getFullYear()}
          </div>
          
          <button 
            onClick={() => {
              setMessages([]);
              setMessages([
                { id: 1, text: "Obrolan telah direset", sender: "system", timestamp: new Date() }
              ]);
            }}
            className="flex items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </footer>
    </div>
  );
}
