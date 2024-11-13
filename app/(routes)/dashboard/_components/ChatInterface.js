// ChatInterface.js
import { useState, useEffect } from "react";
import { sendChatMessage } from "@/configs/AiModel";
import { X } from "lucide-react";

export default function ChatInterface({ selectedNote, onClose }) {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setChatHistory([]);
    setError(null);
  }, [selectedNote?.title]);

  const handleSend = async (e) => {
    e?.preventDefault();
    
    if (!userInput.trim() || !selectedNote) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userMessage = { role: "user", content: userInput };
      setChatHistory(prev => [...prev, userMessage]);

      console.log("Sending chat message...");
      const response = await sendChatMessage(
        userInput,
        selectedNote.title,
        selectedNote.content
      );
      console.log("Received response:", response);

      if (response?.content) {
        const botMessage = { role: "assistant", content: response.content };
        setChatHistory(prev => [...prev, botMessage]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setError(error.message);
      setChatHistory(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again."
      }]);
    } finally {
      setIsLoading(false);
      setUserInput("");
    }
  };

  if (!selectedNote) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center bg-blue-900 rounded-t-lg">
        <h3 className="font-medium text-lg text-white">Chatting with: {selectedNote.title}</h3>
        <button
          onClick={onClose}
          className="text-white hover:bg-blue-800 rounded-full p-1"
        >
          <X size={20} />
        </button>
      </div>
      
      {error && (
        <p className="text-red-500 text-sm p-2 bg-red-50">{error}</p>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${
              message.role === "user"
                ? "bg-blue-100 ml-auto"
                : "bg-white border border-gray-200"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="bg-white border border-gray-200 p-3 rounded-lg animate-pulse">
            Thinking...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask about this note..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}