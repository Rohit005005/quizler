"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/configs";
import { AiSession } from "@/configs/AiModel";
import { quizes } from "@/configs/schema";
import { useUser } from "@clerk/nextjs";
import { Loader2, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

function CreateNote() {
  const [noteTitle, setNoteTitle] = useState();
  const [noteContent, setNoteContent] = useState();
  const { user } = useUser();
  const [loading, setLoading] = useState();
  const [respId, setRespId] = useState();
  const route = useRouter();

  const QUIZ_PROMPT = ` ,On the basis of the title and content provided generate a quiz covering each and every detail of the content, the title and content provided are actually student notes and they want quiz on it, the quiz generated should not repeat the questions, generate alot of relevant questions and provide quiz in json format having following fields:"questions" will be a array contaning- "Question", "4 options as (A,B,C,D)" and "CorrectAnswer" no other field should be added and spelling should be same as it is.Only give Json format nothing else is needed, dont include '''json''' in it. Sample: {
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

  const QUESTIONS_PROMPT = ` Only give Json format nothing else is needed, dont include '''json''' in it... Based on the title and content provided, generate a set of long-answer questions that test deep understanding of the material. The questions should require detailed explanations and critical thinking. Provide the questions in JSON format with the following structure. Sample:
{
  "longQuestions": [
    {
      "question": "Explain in detail how the Crystal Fountain's magical properties affected the city of Zirath and its eventual downfall. Include specific examples from the text.",
      "expectedPoints": [
        "Discussion of the fountain's magical properties",
        "Impact on city development",
        "Role in the city's downfall",
        "Supporting evidence from the content"
      ]
    }
  ]
}`;

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const [quizResult, questionsResult] = await Promise.all([
      AiSession.sendMessage(
        "Title: " + noteTitle + "  Content : " + noteContent + QUIZ_PROMPT
      ),
      AiSession.sendMessage(
        "Title: " + noteTitle + "  Content : " + noteContent + QUESTIONS_PROMPT
      ),
    ]);
    if (quizResult.response.text() && questionsResult.response.text()) {
      const resp = await db
        .insert(quizes)
        .values({
          title: noteTitle,
          content: noteContent,
          quiz: quizResult.response.text(),
          questions: questionsResult.response.text(),
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
        className="flex flex-col gap-5 p-5 h-[500px] w-[400px] justify-center rounded-3xl bg-[#2e4d55]/90 backdrop-blur-sm border border-amber-500/20 shadow-lg"
        onSubmit={(e) => handleSubmit(e)}
      >
        <div className="flex justify-center items-center mb-2">
          <BookOpen className="w-6 h-6 mr-2 text-amber-400" />
          <h2 className="text-xl font-bold text-amber-100">Create New Note</h2>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-amber-100 font-medium">Title</label>
          <input
            type="text"
            required
            className="bg-[#26434a] text-white p-3 rounded-lg border border-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-400"
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Enter note title..."
          />
        </div>

        <div className="flex flex-col h-full gap-2">
          <label className="text-amber-100 font-medium">Content</label>
          <textarea
            required
            className="h-full bg-[#26434a] resize-none text-white p-4 rounded-lg border border-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-400"
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Enter your note content here..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="text-white font-medium flex items-center gap-2 rounded-lg px-6 py-2 bg-amber-500 hover:bg-amber-600 transition-colors shadow-md"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Create Note"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateNote;
