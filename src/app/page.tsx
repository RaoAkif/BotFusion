"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import ChatContainer from "./components/ChatContainer";
import ChatInput from "./components/ChatInput";
import ScrollDownButton from "./components/ScrollDownButton";
import Sidebar from "./components/Sidebar";
import { DEFAULT_MODEL, ValidModel } from "../app/api/utils/models";

const BACKEND_URL = "/api/chat";

export type Message = {
  role: "user" | "ai";
  content: string;
};

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ValidModel>(DEFAULT_MODEL);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const [isScrollable, setIsScrollable] = useState<boolean>(false);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);

  const isButtonDisabled: boolean = !message.trim() || isLoading;

  const handleSendMessage = async (content: string): Promise<string | void> => {
    if (!content.trim()) return;

    const previousMessages: Message[] = [...messages];
    const userMessage: Message = { role: "user", content };

    setMessages([...previousMessages, userMessage]);
    setMessage("");

    setIsLoading(true);

    const temporaryResponse: Message = { role: "ai", content: "" };
    setMessages((prev) => [...prev, temporaryResponse]);

    try {
      const conversationHistory: string = [...previousMessages, userMessage]
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");
      const fullQuery: string = `${conversationHistory}\nuser: ${content}`;

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: fullQuery, model: selectedModel }),
      });

      if (response.status === 429) {
        const errorData = await response.json();
        setMessages((prev) => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1] = {
            role: "ai",
            content: `Rate limit exceeded. Try again in ${errorData.remainingTime} seconds.`,
          };
          return updatedMessages;
        });
        return;
      }

      if (!response.ok) throw new Error(response.statusText);

      const data = await response.json();
      const aiResponseText: string = data.data || "No response from AI.";
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          role: "ai",
          content: aiResponseText,
        };
        return updatedMessages;
      });

      const timestamp: string = new Date().toISOString();
      const chatHistory = {
        timestamp,
        messages: [...previousMessages, userMessage, { role: "ai", content: aiResponseText }],
      };
      localStorage.setItem(timestamp, JSON.stringify(chatHistory));

      // Redirect to the dynamic route with the chat ID
      router.push(`/chat/${timestamp}`);

      return aiResponseText;
    } catch (error: unknown) {
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          role: "ai",
          content:
            error instanceof Error
              ? error.message
              : "An error occurred while fetching the response.",
        };
        return updatedMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    await handleSendMessage(message);
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const isScrollableNow: boolean = container.scrollHeight > container.clientHeight;
      setIsScrollable(isScrollableNow);

      const isBottom: boolean =
        container.scrollHeight - container.scrollTop - container.clientHeight < 5;
      setIsAtBottom(isBottom);
    }
  };

  useEffect(() => {
    handleScroll();
    if (isAtBottom) {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll();
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const loadChatFromStorage = (timestamp: string) => {
    const storedChat = localStorage.getItem(timestamp);
    if (storedChat) {
      const chatData = JSON.parse(storedChat);
      setMessages(chatData.messages);
    }
  };

  return (
    <div className="flex h-screen bg-[#212121] text-gray-100">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        loadChat={loadChatFromStorage}
      />
      <div
        className={`flex flex-col transition-all duration-300 flex-grow ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          chatContainerRef={chatContainerRef}
        />
        <ChatInput
          message={message}
          setMessage={setMessage}
          handleSend={handleSend}
          handleAudioSend={handleSendMessage}
          isButtonDisabled={isButtonDisabled}
          isSidebarOpen={isSidebarOpen}
        />
        {isScrollable && !isAtBottom && (
          <ScrollDownButton
            onClick={() =>
              chatContainerRef.current?.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth",
              })
            }
          />
        )}
      </div>
    </div>
  );
}