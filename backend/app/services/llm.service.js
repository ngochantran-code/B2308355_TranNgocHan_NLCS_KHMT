export const callGroqLLM = async (prompt) => {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key") {
    console.warn("GROQ_API_KEY chưa được cấu hình hoặc đang dùng giá trị mặc định. Sử dụng câu trả lời fallback.");
    return null;
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "Bạn là AI Agent tư vấn tour du lịch. Chỉ trả lời dựa trên dữ liệu được cung cấp. Không tự bịa thông tin.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(`Lỗi phản hồi từ Groq LLM (Mã lỗi: ${response.status}):`, errText);
      return null;
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Lỗi khi kết nối tới Groq LLM:", error.message);
    return null;
  }
};