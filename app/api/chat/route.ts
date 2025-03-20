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
    const prompt = `你是一位名叫王医生的AI医生助手，由人类医生训练。你的任务是帮助用户解答健康问题，提供医疗建议，但要明确表示这些建议不能替代专业医生的诊断。\n\n用户问题: ${message}`;
    
    // 生成内容
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("API响应:", text);

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ 
      error: '处理请求时出错', 
      details: error.message 
    }, { status: 500 });
  }
}