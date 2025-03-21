"use client"

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

const presetQuestions = [
  "Headache", "Ask", "Treat", "Talk Therapy", "Checkup",
  "Coaches", "Dentist", "Specialists", "Alternative", "Interpret",
  "Health Score", "Tools"
];

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm Doctor Wang, your AI Doctor trained by human doctors. What health issue do you want to work on today? You can say something like 'sinus pressure' or 'I have a sore throat.' Let's figure this out together!"
  }]);
  const [isLoading, setIsLoading] = useState(false); // 添加加载状态
  const [typingIndex, setTypingIndex] = useState(-1); // 添加打字效果索引
  const [typingContent, setTypingContent] = useState(""); // 添加打字效果内容
  const [fullContent, setFullContent] = useState(""); // 存储完整回复内容
  const messagesEndRef = useRef<HTMLDivElement>(null); // 用于自动滚动

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 打字效果
  useEffect(() => {
    if (typingIndex >= 0 && typingIndex < fullContent.length) {
      const timer = setTimeout(() => {
        setTypingContent(prev => prev + fullContent[typingIndex]);
        setTypingIndex(prev => prev + 1);
      }, 15); // 打字速度
      return () => clearTimeout(timer);
    } else if (typingIndex === fullContent.length && fullContent) {
      // 打字完成，更新消息
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.role !== "typing");
        return [...filtered, { role: "assistant", content: fullContent }];
      });
      setTypingIndex(-1);
      setTypingContent("");
      setFullContent("");
    }
  }, [typingIndex, fullContent]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    // 添加用户消息到对话
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    
    // 设置加载状态
    setIsLoading(true);
    
    try {
      // 添加思考状态消息
      setMessages(prev => [...prev, { role: "thinking", content: "Doctor Wang is thinking" }]);
      
      // 调用实际的API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("API错误:", data);
        throw new Error(data.details || data.error || 'API请求失败');
      }
      
      // 移除思考状态消息，准备打字效果
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.role !== "thinking");
        return [...filtered, { role: "typing", content: "" }];
      });
      
      // 设置完整内容并开始打字效果
      setFullContent(data.response);
      setTypingIndex(0);
      
    } catch (error: any) {
      console.error(error?.message || '未知错误');
      // 移除思考状态消息，添加错误消息
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.role !== "thinking");
        return [...filtered, { role: "assistant", content: "I'm sorry, I couldn't process your request. Please try again." }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化带有bullet points的文本
  const formatBulletPoints = (text: string) => {
    return text;
  };

  // 波浪跳动效果组件
  const ThinkingDots = () => {
    const [dots, setDots] = useState("");
    
    useEffect(() => {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev.length >= 3) return "";
          return prev + ".";
        });
      }, 300);
      
      return () => clearInterval(interval);
    }, []);
    
    return <span className="thinking-dots">{dots}</span>;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Doctor Homie</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* 医生头像和欢迎语 */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            <Image
              src="/doctor-avatar.jpg"
              alt="Doctor Wang"
              width={128}
              height={128}
              className="rounded-full"
              priority
            />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Doctor Wang
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your AI doctor assistant, ready to answer your health questions
            </p>
          </div>
        </div>

        {/* 预设问题按钮 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
          {presetQuestions.map((question, index) => (
            <button
              key={index}
              className="p-3 text-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
              onClick={() => handleSendMessage(question)}
              disabled={isLoading}
            >
              {question}
            </button>
          ))}
        </div>

        {/* 对话区域 */}
        <div className="mb-6 space-y-4 max-h-96 overflow-y-auto p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === "user" 
                    ? "bg-blue-500 text-white" 
                    : msg.role === "thinking" || msg.role === "typing"
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 italic"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
              >
                {msg.role === "thinking" ? (
                  <>Doctor Wang is thinking<ThinkingDots /></>
                ) : msg.role === "typing" ? (
                  <div className="doctor-response">
                    {typingContent.split('•').map((point, i) => {
                      if (i === 0) return <p key={i}>{point}</p>;
                      return point.trim() ? (
                        <div key={i} className="mt-2">
                          <span className="inline-block mr-2">•</span>
                          <span>{point.trim()}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : msg.role === "assistant" ? (
                  <div className="doctor-response">
                    {msg.content.split('•').map((point, i) => {
                      if (i === 0) return <p key={i}>{point}</p>;
                      return point.trim() ? (
                        <div key={i} className="mt-2">
                          <span className="inline-block mr-2">•</span>
                          <span>{point.trim()}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 */}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage(input)}
            placeholder="Enter your health question..."
            className="w-full p-4 pr-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={isLoading}
          />
          <button
            className={`absolute right-4 top-1/2 -translate-y-1/2 ${
              isLoading ? "text-gray-400" : "text-blue-500 hover:text-blue-600"
            }`}
            onClick={() => !isLoading && handleSendMessage(input)}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
