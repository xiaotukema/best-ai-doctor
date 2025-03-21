"use client"

import Image from "next/image";
import { useState } from "react";

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

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // 添加用户消息到对话
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    
    // 在catch块中添加类型注解
    try {
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
      
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error: any) { // 添加类型注解为any
      // 使用可选链操作符访问message属性
      console.error(error?.message || '未知错误');
      // 其他错误处理代码
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Best AI Doctor</h1>
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
              您的AI医生助手，随时为您解答健康问题
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
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* 输入框 */}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage(input)}
            placeholder="输入您的健康问题..."
            className="w-full p-4 pr-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
            onClick={() => handleSendMessage(input)}
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
