"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/configs";
import { AiSession } from "@/configs/AiModel";
import { quizes } from "@/configs/schema";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

function CreateNote() {
  const [noteTitle, setNoteTitle] = useState();
  const [noteContent, setNoteContent] = useState();
  const { user } = useUser();
  const [loading, setLoading] = useState();
  const [respId, setRespId] = useState();
  const route = useRouter();

  const PROMPT = `  ,On the basis of the title and content provided generate a quiz covering each and every detail of the content, the title and content provided are actually student notes and they want quiz on it, the quiz generated should not repeat the questions, generate alot of relevant questions and provide quiz in json format having following fields: "Question", "4 options as (A,B,C,D)" and "CorrectAnswer".Only give Json format nothing else is needed, dont include '''json''' in it.`;

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const result = await AiSession.sendMessage(
      "Title: " + noteTitle + "  Content : " + noteContent + PROMPT
    );
    console.log(result.response.text());
    if (result.response.text()) {
      const resp = await db
        .insert(quizes)
        .values({
          title: noteTitle,
          content: noteContent,
          quiz: result.response.text(),
          createBy: user?.primaryEmailAddress?.emailAddress,
        })
        .returning({ id: quizes.id });
      if (resp[0].id) {
        setRespId(resp[0].id);
      }
    }
    setLoading(false);
  };
  return (
    <div>
      <form
        className="flex flex-col gap-5  p-5 h-[500px] w-[400px] justify-center rounded-3xl bg-[#192d4d]"
        onSubmit={(e) => handleSubmit(e)}
      >
        <div className="flex flex-col gap-2">
          <label className="text-white">Title</label>
          <input
            type="text"
            required
            className="bg-[#294066] text-white p-1"
            onChange={(e) => setNoteTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col h-full gap-2">
          <label className="text-white">Content</label>
          <textarea
            required
            className="h-full bg-[#304972] resize-none text-white p-2"
            onChange={(e) => setNoteContent(e.target.value)}
          />
        </div>
        <div className=" flex justify-end">
          <button
            type="submit"
            className="text-white text-md  rounded-full w-[20%] py-1 bg-[#203d6d] hover:bg-[#3568b9]"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Save"}
          </button>
        </div>
      </form>
      <Button
            className="bg-[#203d6d] hover:bg-[#3568b9] rounded-full text-md -translate-y-14 ml-5"
            disabled={noteContent == ""}
            onClick={()=>route.push("/quiz/"+respId)}
          >
            Start Quiz
          </Button>
    </div>
  );
}

export default CreateNote;
