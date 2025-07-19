"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import useSocket from "@/hooks/useSocket";
import { encrypt, decrypt } from "@/utils/crypto";
import {
  ShieldCheck,
  Globe,
  Zap,
  Mic,
  Eye,
  Moon,
  Sun,
  Github,
  Lock,
  BellOff,
  UserX,
  FileCheck,
} from "lucide-react";

interface TextMessage {
  type: "text";
  id: string;
  encrypted: string;
  decrypted?: string;
}

interface VoiceMessage {
  type: "voice";
  id: string;
  encrypted: string;
  decrypted?: string; // This will be the Base64 audio data
}

type Message = TextMessage | VoiceMessage;

export default function Home() {
  const [key, setKey] = useState("");
  const [tempKey, setTempKey] = useState("");
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [showDecrypted, setShowDecrypted] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [isDarkMode, setIsDarkMode] = useState(true);
  const socket = useSocket(
    "https://real-time-faiw.onrender.com"
  );
  const chatEndRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef(key);

  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (socket && isChatVisible) {
      const handleNewMessage = (msg: {
        id: string;
        type: "text" | "voice";
        data: string;
      }) => {
        if (!msg || !msg.id || !msg.data || !msg.type) {
          return;
        }

        const decrypted = decrypt(msg.data, keyRef.current);

        setMessages((prevMessages) => {
          if (prevMessages.some((m) => m.id === msg.id && m.encrypted === msg.data)) {
            return prevMessages;
          }
          const newMessage: Message = {
            type: msg.type,
            id: msg.id,
            encrypted: msg.data,
            decrypted,
          };
          return [...prevMessages, newMessage];
        });
      };

      socket.on("message", handleNewMessage);

      return () => {
        socket.off("message", handleNewMessage);
      };
    }
  }, [socket, isChatVisible]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (messageInput && key && socket) {
      const encryptedMessage = encrypt(messageInput, key);
      socket.emit("messaged", { type: "text", data: encryptedMessage });
      setMessageInput("");
    }
  };

  const handleVoiceMessage = (audioBlob: Blob) => {
    if (key && socket) {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        const encryptedAudio = encrypt(base64Audio, key);
        socket.emit("messaged", { type: "voice", data: encryptedAudio });
      };
    }
  };

  const toggleRecording = async () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const newMediaRecorder = new MediaRecorder(stream);
        setMediaRecorder(newMediaRecorder);

        const audioChunks: Blob[] = [];
        newMediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        newMediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          handleVoiceMessage(audioBlob);
          stream.getTracks().forEach((track) => track.stop());
        };

        newMediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    }
  };

  const handleClearRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.onstop = null;
      setIsRecording(false);
    }
  };

  const handleKeySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tempKey) {
      setKey(tempKey);
      setIsChatVisible(true);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }

  const FeatureCard = ({ icon, title, children }: FeatureCardProps) => (
    <div className="bg-gray-800 bg-opacity-40 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700 hover:bg-opacity-60 transition-all duration-300">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="ml-4 text-xl font-semibold text-white">{title}</h3>
      </div>
      <p className="text-gray-400">{children}</p>
    </div>
  );

  if (!isChatVisible) {
    return (
      <div className={`${isDarkMode ? "dark" : ""} bg-gray-900 text-white`}>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 p-4">
          {/* Hero Section */}
          <div className="w-full max-w-2xl text-center">
            <h1 className="text-6xl font-extrabold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500">
              Global Chat
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              One world, one room. Real-time, end-to-end encrypted messaging for
              everyone.
            </p>
            <form
              onSubmit={handleKeySubmit}
              className="flex flex-col sm:flex-row gap-4 items-center justify-center"
            >
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="w-full sm:w-auto flex-grow px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-lg backdrop-blur-sm"
                placeholder="Enter your secret key..."
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transform hover:scale-105 transition-transform duration-300"
              >
                Enter Chat
              </button>
            </form>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <a href="#features" className="animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-400"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20 px-4 bg-gray-900">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Global Chat?
          </h2>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="w-8 h-8 text-indigo-400" />}
              title="One Global Room"
            >
              No channels, no servers to choose. Just one global conversation,
              accessible to anyone with the key.
            </FeatureCard>
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-indigo-400" />}
              title="Real-Time Messaging"
            >
              Messages appear instantly across the globe. No delays, no waiting.
              Powered by modern WebSocket technology.
            </FeatureCard>
            <FeatureCard
              icon={<ShieldCheck className="w-8 h-8 text-indigo-400" />}
              title="AES Encrypted Messages"
            >
              Your messages are secured with military-grade AES-256 encryption.
              Only those with the key can read them.
            </FeatureCard>
            <FeatureCard
              icon={<Lock className="w-8 h-8 text-indigo-400" />}
              title="No Login, No Tracking"
            >
              Anonymity is paramount. We require no email, no phone number, and
              store no personal data. Your identity is safe.
            </FeatureCard>
            <FeatureCard
              icon={<Mic className="w-8 h-8 text-indigo-400" />}
              title="Encrypted Voice Messages"
            >
              Send voice notes with the same end-to-end encryption, ensuring your
              spoken words are as private as your typed ones.
            </FeatureCard>
            <FeatureCard
              icon={<Eye className="w-8 h-8 text-indigo-400" />}
              title="Decryptable-Only View"
            >
              Toggle your view to see only the messages you can decrypt, cutting
              through the noise of other conversations.
            </FeatureCard>
            <FeatureCard
              icon={<BellOff className="w-8 h-8 text-indigo-400" />}
              title="No Distractions"
            >
              Focus on the conversation. There are no notifications, pop-ups, or
              sounds to pull you away.
            </FeatureCard>
            <FeatureCard
              icon={<UserX className="w-8 h-8 text-indigo-400" />}
              title="True Anonymity"
            >
              We dont just hide your status, we dont have it. No online,
              last seen, or typing indicators.
            </FeatureCard>
            <FeatureCard
              icon={<FileCheck className="w-8 h-8 text-indigo-400" />}
              title="Verified Media"
            >
              To prevent malicious files, all media is handled client-side. No
              server uploads means no risk of fake or harmful content.
            </FeatureCard>
          </div>
        </div>


        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 py-8 px-4">
          <div className="max-w-6xl mx-auto text-center text-gray-400">
            <p>
              Made with ❤️ for privacy. No tracking, no logs, no data
              collection.
            </p>
            <div className="flex justify-center items-center gap-6 mt-4">
              <a
                href="https://github.com/its-me-nishmal"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-400 transition-colors"
              >
                <Github className="w-6 h-6" />
              </a>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span>Fully Client-Side Encryption</span>
              </div>
              <button onClick={toggleTheme} className="hover:text-indigo-400 transition-colors">
                {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <div className="bg-gray-800 bg-opacity-50 shadow-md p-4 flex justify-between items-center backdrop-blur-lg">
        <h1 className="text-3xl font-bold tracking-wider">Global Chat</h1>
        <button
          onClick={() => setShowDecrypted(!showDecrypted)}
          className="px-4 py-2 text-sm font-medium bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transform hover:scale-105 transition-transform duration-300"
        >
          {showDecrypted ? "Hide" : "Show"} Encrypted
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => {
          if (!msg.decrypted && !showDecrypted) {
            return null;
          }
          return (
            <div
              key={index}
              className={`mb-4 flex ${
                msg.id === socket?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-lg p-4 rounded-2xl ${
                  msg.id === socket?.id
                    ? "bg-indigo-600 rounded-br-none"
                    : "bg-gray-700 rounded-bl-none"
                }`}
              >
                {showDecrypted && msg.type === "text" && (
                  <p className="text-sm text-gray-400 break-all">
                    {msg.encrypted}
                  </p>
                )}
                {msg.type === "text" && msg.decrypted && (
                  <p className="text-lg">{msg.decrypted}</p>
                )}
                {msg.type === "voice" && msg.decrypted && (
                  <audio
                    controls
                    src={msg.decrypted}
                    preload="auto"
                    controlsList="nodownload"
                  />
                )}
                {msg.type === "voice" && !msg.decrypted && (
                  <p className="text-lg">🔐 Encrypted Voice Message</p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-gray-800 bg-opacity-50 border-t border-gray-700 backdrop-blur-lg">
        <form onSubmit={handleSendMessage}>
          <div className="flex items-center">
            <input
              type="text"
              name="message"
              id="message"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 block w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
              placeholder="Type your message..."
            />
            {isRecording ? (
              <button
                type="button"
                onClick={handleClearRecording}
                className="ml-4 inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transform hover:scale-105 transition-transform duration-300"
              >
                Clear
              </button>
            ) : (
              <button
                type="submit"
                className="ml-4 inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transform hover:scale-105 transition-transform duration-300"
              >
                Send
              </button>
            )}
            <button
              type="button"
              onClick={toggleRecording}
              className={`ml-4 p-3 rounded-full text-white transition-colors duration-300 ${
                isRecording ? "bg-red-600 animate-pulse" : "bg-green-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
