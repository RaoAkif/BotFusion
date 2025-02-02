import ChatMessage from "./ChatMessage";

interface ChatContainerProps {
  messages: { role: string; content: string }[];
  isLoading: boolean;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
}

const ChatContainer = ({ messages, isLoading, chatContainerRef }: ChatContainerProps) => (
  // Added "custom-scroll" along with tailwind classes
  <div ref={chatContainerRef} className="flex-1 overflow-y-auto pb-32 custom-scroll">
    <div className="max-w-[55%] mx-auto pr-10">
      {messages.map((msg, index) => (
        <ChatMessage key={index} msg={msg} isLoading={isLoading} />
      ))}
    </div>
  </div>
);

export default ChatContainer;
