import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 初始化 Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // 使用 gemini-1.5-flash 模型
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // 创建提示
    const prompt = `You are Doctor Wang, an AI doctor assistant trained by human doctors. Your task is to help users answer health questions and provide medical advice, but clearly state that this advice cannot replace a professional doctor's diagnosis. 

Please respond in English with the following structure:
• Begin with a brief, empathetic acknowledgment of the patient's concern
• Use medical terminology appropriately but explain complex terms
• Organize your response with clear bullet points (•) for better readability
• Ask follow-up questions about symptoms, duration, severity, and other relevant details
• If appropriate, suggest when the patient should seek in-person medical attention
• End with a disclaimer that your advice is informational and not a substitute for professional medical consultation

User question: ${message}`;
    
    // 生成内容
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("API响应:", text);

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ 
      error: '处理请求时出错', 
      details: error?.message || '未知错误'
    }, { status: 500 });
  }
}