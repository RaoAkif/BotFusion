"use client";
import { useEffect, useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  loadChat: (timestamp: string) => void;
}

const Sidebar = ({ isOpen, toggleSidebar, loadChat }: SidebarProps) => {
  const [savedChats, setSavedChats] = useState<{
    todayChats: { timestamp: string }[];
    yesterdayChats: { timestamp: string }[];
    past7DaysChats: { timestamp: string }[];
    pastMonthChats: { timestamp: string }[];
    pastYearChats: { timestamp: string }[];
    olderChats: { timestamp: string }[];
  }>({
    todayChats: [],
    yesterdayChats: [],
    past7DaysChats: [],
    pastMonthChats: [],
    pastYearChats: [],
    olderChats: [],
  });

  const categorizeChats = (chats: { timestamp: string }[]) => {
    const now = new Date();
    const todayChats: { timestamp: string }[] = [];
    const yesterdayChats: { timestamp: string }[] = [];
    const past7DaysChats: { timestamp: string }[] = [];
    const pastMonthChats: { timestamp: string }[] = [];
    const pastYearChats: { timestamp: string }[] = [];
    const olderChats: { timestamp: string }[] = [];

    chats.forEach((chat) => {
      const chatDate = new Date(chat.timestamp);
      const timeDifference = now.getTime() - chatDate.getTime();
      const daysDifference = timeDifference / (1000 * 3600 * 24);

      if (daysDifference < 1) {
        todayChats.push(chat);
      } else if (daysDifference < 2) {
        yesterdayChats.push(chat);
      } else if (daysDifference < 7) {
        past7DaysChats.push(chat);
      } else if (daysDifference < 30) {
        pastMonthChats.push(chat);
      } else if (daysDifference < 365) {
        pastYearChats.push(chat);
      } else {
        olderChats.push(chat);
      }
    });

    return {
      todayChats,
      yesterdayChats,
      past7DaysChats,
      pastMonthChats,
      pastYearChats,
      olderChats,
    };
  };

  useEffect(() => {
    const chats = Object.keys(localStorage)
      .filter((key) => key !== "timestamp")
      .map((key) => {
        const chat = JSON.parse(localStorage.getItem(key)!);
        return { timestamp: chat.timestamp };
      });

    const categorizedChats = categorizeChats(chats);
    setSavedChats(categorizedChats);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date instanceof Date && !isNaN(date.getTime()) ? date.toLocaleString() : "Invalid Date";
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-[#171717] transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      }`}
    >
      <div className="p-4">
        <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-200">
          <i className="fa-solid fa-list text-xl"></i>
        </button>
        <h2 className="mt-4 text-xl font-bold">Previous Chats</h2>

        <div>
          {savedChats.todayChats.length > 0 && (
            <>
              <h3 className="text-md font-semibold mt-4">Today</h3>
              <ul className="mt-2 space-y-2">
                {savedChats.todayChats.map((chat, index) => (
                  <li
                    key={index}
                    className="p-2 rounded bg-[#3F3F3F] hover:bg-[#4F4F4F]"
                    onClick={() => loadChat(chat.timestamp)}
                  >
                    {formatTimestamp(chat.timestamp)}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Repeat for other categories */}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;