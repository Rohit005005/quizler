// Sidenav.js
"use client";

import { EllipsisVertical, Trash2, Search, BookOpen } from "lucide-react";
import React, { useState } from "react";

function Sidenav({ record, selectedNote, isOpen, onDeleteNote }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (onDeleteNote) {
      onDeleteNote(id);
    }
    setOpenMenuId(null);
  };

  const filteredRecord = record?.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`
        text-white fixed h-screen w-[30%] bg-gradient-to-b from-[#2e4d55] to-[#26434a]
        transition-all duration-300 ease-in-out overflow-hidden shadow-2xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="p-4 mt-12 mb-2">
        <div className="flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 mr-2 text-amber-400" />
          <h1 className="text-2xl font-bold text-amber-100">Saved Notes</h1>
        </div>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#203d45]/50 text-white placeholder-amber-200/60 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-amber-400 border border-amber-700/30"
          />
          <Search className="absolute left-3 top-2.5 text-amber-300 w-4 h-4" />
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-140px)] px-3 pb-6">
        {filteredRecord && filteredRecord.length > 0 ? (
          <div className="space-y-2">
            {filteredRecord.map((item, index) => (
              <div
                key={index}
                className="flex p-3 bg-[#203d45]/50 text-md rounded-lg hover:bg-[#26434a] cursor-pointer justify-between items-center border-l-4 border-amber-500 group transition-all"
                onClick={() => selectedNote(item.id)}
              >
                <div className="truncate pr-2">
                  <h2 className="font-medium group-hover:text-amber-200">
                    {item.title}
                  </h2>
                </div>
                <div className="relative">
                  <EllipsisVertical
                    className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity text-amber-300"
                    onClick={(e) => toggleMenu(item.id, e)}
                  />
                  {openMenuId === item.id && (
                    <div className="absolute right-0 mt-1 w-32 bg-white text-gray-700 rounded-md shadow-xl z-10 overflow-hidden">
                      <div
                        className="flex items-center gap-2 p-2.5 hover:bg-red-50 cursor-pointer transition-all"
                        onClick={(e) => handleDelete(item.id, e)}
                      >
                        <Trash2 size={16} className="text-red-500" />
                        <span className="font-medium whitespace-nowrap">Delete Note</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-amber-300">
            {searchQuery ? "No matching notes found" : "No notes yet"}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidenav;
