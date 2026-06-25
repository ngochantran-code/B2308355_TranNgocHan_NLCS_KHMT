import api from "./api";

export const askChatbot = (question) => {
  return api.post("/chatbot/ask", { question });
};

export const ingestDocument = (formData) => {
  return api.post("/chatbot/ingest", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};