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

  const PROMPT = ` ,On the basis of the title and content provided generate a quiz covering each and every detail of the content, the title and content provided are actually student notes and they want quiz on it, the quiz generated should not repeat the questions, generate alot of relevant questions and provide quiz in json format having following fields:"questions" will be a array contaning- "Question", "4 options as (A,B,C,D)" and "CorrectAnswer" no other field should be added and spelling should be same as it is.Only give Json format nothing else is needed, dont include '''json''' in it. Sample: {
  "questions": [
    {
      "Question": "What is the name of the lost city in the desert of Orin?",
      "A": "Zareth",
      "B": "Zirath",
      "C": "Zira",
      "D": "Zarath",
      "CorrectAnswer": "B"
    },
    {
      "Question": "What was the city of Zirath known for?",
      "A": "Its towering spires and lush gardens",
      "B": "The Crystal Fountain, a magical source of water",
      "C": "Being ruled by a wise and just king",
      "D": "All of the above",
      "CorrectAnswer": "D"
    },
    {
      "Question": "What happened to the city of Zirath?",
      "A": "It was swallowed by the sands",
      "B": "It was cursed by a powerful sorcerer",
      "C": "Both A and B are possible explanations",
      "D": "It was destroyed by a natural disaster",
      "CorrectAnswer": "C"
    },
    {
      "Question": "What motivated Kiran to search for Zirath?",
      "A": "Fame and fortune",
      "B": "Curiosity and a desire to learn the truth",
      "C": "A quest for power",
      "D": "He was instructed to find the city",
      "CorrectAnswer": "B"
    },
    {
      "Question": "What did Kiran find buried in the sand?",
      "A": "A massive stone gate",
      "B": "An ancient map",
      "C": "A hidden oasis",
      "D": "The remains of a forgotten temple",
      "CorrectAnswer": "A"
    },
    {
      "Question": "What did Kiran discover behind the stone gate?",
      "A": "A secret passage leading to the lost city",
      "B": "A hidden treasure chamber",
      "C": "A dangerous trap",
      "D": "A group of hostile natives",
      "CorrectAnswer": "A"
    },
    {
      "Question": "What was the source of light in the underground cavern where Zirath was located?",
      "A": "An enchanted moonstone",
      "B": "A hidden fire",
      "C": "Luminescent fungi",
      "D": "The light from the Crystal Fountain",
      "CorrectAnswer": "A"
    },
    {
      "Question": "Who did Kiran encounter in the heart of the city?",
      "A": "A group of survivors from Zirath",
      "B": "The spirit of King Arion",
      "C": "A mysterious guardian of the city",
      "D": "A powerful sorcerer who cursed the city",
      "CorrectAnswer": "B"
    },
    {
      "Question": "What was the reason for Zirath's downfall?",
      "A": "Their greed for magic and desire to control the world's forces",
      "B": "A war with neighboring kingdoms",
      "C": "A plague that wiped out their population",
      "D": "A sudden natural disaster",
      "CorrectAnswer": "A"
    },
    {
      "Question": "What did King Arion's spirit ask Kiran to do?",
      "A": "Protect the city from future threats",
      "B": "Find a way to revive the city's people",
      "C": "Take the water from the Crystal Fountain and pour it on the sands above",
      "D": "Discover the secret of the city's magic",
      "CorrectAnswer": "C"
    },
    {
      "Question": "What happened when Kiran poured the water from the Crystal Fountain on the desert sands?",
      "A": "The curse was broken and Zirath rose from the depths",
      "B": "The desert sands turned into fertile land",
      "C": "A new city was created",
      "D": "The Crystal Fountain disappeared",
      "CorrectAnswer": "A"
    }
  ]
}`;

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
    </div>
  );
}

export default CreateNote;
