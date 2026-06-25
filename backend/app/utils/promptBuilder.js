export const buildChatbotPrompt = ({ question, tours = [], chunks = [] }) => {
  const tourContext = tours
    .map((tour, index) => {
      return `
Tour ${index + 1}:
Tên tour: ${tour.name}
Giá: ${tour.price}
Thời lượng: ${tour.duration}
Điểm khởi hành: ${tour.departurePoint}
Phương tiện: ${tour.transport}
Mô tả: ${tour.description}
Điểm đến: ${tour.destination?.name || ""}
Danh mục: ${tour.categories?.map((c) => c.name).join(", ") || ""}
`;
    })
    .join("\n");

  const ragContext = chunks
    .map((chunk, index) => {
      const tourName = chunk.metadata?.tourName || (chunk.tour ? chunk.tour.name : "Chưa xác định");
      const destName = chunk.metadata?.destinationName || (chunk.tour?.destination ? chunk.tour.destination.name : "");
      return `
Tài liệu ${index + 1} (Tour: ${tourName} | Điểm đến: ${destName}):
${chunk.content}
`;
    })
    .join("\n");

  return `
Bạn là AI Agent tư vấn tour du lịch.

Câu hỏi của người dùng:
${question}

Dữ liệu tour tìm thấy:
${tourContext || "Không có dữ liệu tour phù hợp."}

Dữ liệu lịch trình/tài liệu liên quan:
${ragContext || "Không có dữ liệu tài liệu phù hợp."}

Yêu cầu trả lời:
- Trả lời bằng tiếng Việt.
- Tư vấn tự nhiên, dễ hiểu.
- Chỉ dựa trên dữ liệu được cung cấp.
- Không tự bịa giá, lịch trình hoặc điểm đến.
- Nếu không có dữ liệu phù hợp, hãy nói chưa tìm thấy thông tin.
`;
};