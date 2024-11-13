// Sidenav.js
"use client";

import React from "react";

function Sidenav({ record, selectedNote, isOpen }) {
  return (
    <div 
      className={`
        text-white fixed h-screen w-[30%] bg-blue-600 
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <h1 className="text-center text-xl p-2 mt-14">Saved Notes</h1>
      {record && (
        <div>
          {record.map((item, index) => (
            <div 
              key={index} 
              className="flex p-2 m-2 bg-blue-800 text-md rounded-xl hover:text-lg hover:bg-blue-900 hover:p-3 transition-all cursor-pointer" 
              onClick={() => selectedNote(item.id)}
            >
              <h2>{item.title}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Sidenav;
