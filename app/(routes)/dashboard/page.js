// Dashboard.js
"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import ChatInterface from "./_components/ChatInterface";
import Quiz from "./_components/QuizInterface";
import { useEffect, useState } from "react";
import Sidenav from "./_components/Sidenav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateNote from "./_components/CreateNote";
import { db } from "@/configs";
import { quizes } from "@/configs/schema";
import { and, desc, eq } from "drizzle-orm";
import { LoaderCircle, Menu, X } from "lucide-react";
import { AiSession } from "@/configs/AiModel";
import QuestionInterface from "./_components/OuestionsInterface";

function Dashboard() {
  const { user } = useUser();
  const [record, setRecord] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [isSidenavOpen, setIsSidenavOpen] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      GetQuizs();
    }
  }, [user]);

  const GetQuizs = async () => {
    const resp = await db
      .select()
      .from(quizes)
      .where(eq(quizes.createBy, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(quizes.id));

    if (resp) {
      setRecord(resp);
    }
  };

  const UpdateNote = async () => {
    if (selectedNote) {
      const QUIZ_PROMPT = ` ,On the basis of the title and content provided generate a quiz covering each and every detail of the content, the title and content provided are actually student notes and they want quiz on it, the quiz generated should not repeat the questions, generate alot of relevant questions and provide quiz in json format having following fields:"questions" will be a array contaning- "Question", "4 options as (A,B,C,D)" and "CorrectAnswer" no other field should be added and spelling should be same as it is. Only give JSON format, nothing else is needed.Only give Json format nothing else is needed, dont include '''json''' in it. Sample: {
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

      const QUESTIONS_PROMPT = ` Based on the title and content provided, generate a set of long-answer questions that test deep understanding of the material. The questions should require detailed explanations and critical thinking. Provide the questions in JSON format with the following structure. Only give JSON format, nothing else is needed.Only give Json format nothing else is needed, dont include '''json''' in it. Sample:
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

      setIsUpdating(true);
      try {
        // Generate both quiz and questions in parallel
        const [quizResult, questionsResult] = await Promise.all([
          AiSession.sendMessage(
            "Title: " + noteTitle + "  Content : " + noteContent + QUIZ_PROMPT
          ),
          AiSession.sendMessage(
            "Title: " +
              noteTitle +
              "  Content : " +
              noteContent +
              QUESTIONS_PROMPT
          ),
        ]);

        if (quizResult.response.text() && questionsResult.response.text()) {
          const resp = await db
            .update(quizes)
            .set({
              content: noteContent,
              quiz: quizResult.response.text(),
              questions: questionsResult.response.text(),
            })
            .where(eq(quizes.id, selectedNote));

          console.log("Database update response:", resp);

          // Update the record state with the new content after the database update
          setRecord((prevRecord) =>
            prevRecord.map((item) =>
              item.id === selectedNote
                ? {
                    ...item,
                    content: noteContent,
                    quiz: quizResult.response.text(),
                    questions: questionsResult.response.text(),
                  }
                : item
            )
          );
        }
      } catch (error) {
        console.error("Error updating note:", error);
      }

      setIsUpdating(false);
    }
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    setNoteContent(value); // Just update the note content in the state without debouncing
  };

  const selectedNoteDetails = record.find((item) => item.id === selectedNote);

  useEffect(() => {
    if (selectedNoteDetails) {
      setNoteTitle(selectedNoteDetails.title);
      setNoteContent(selectedNoteDetails.content);
    }
  }, [selectedNoteDetails]);

  const toggleInterface = (type) => {
    if (type === "chat") {
      setIsChatOpen(!isChatOpen);
      setIsQuizOpen(false);
      setIsQuestionsOpen(false);
    } else if (type === "quiz") {
      setIsQuizOpen(!isQuizOpen);
      setIsChatOpen(false);
      setIsQuestionsOpen(false);
    } else if (type === "questions") {
      setIsQuestionsOpen(!isQuestionsOpen);
      setIsChatOpen(false);
      setIsQuizOpen(false);
    }
  };

  return (
    <div className="flex items-start h-screen bg-blue-500 relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsSidenavOpen(!isSidenavOpen)}
        className="absolute top-5 left-5 z-50 bg-blue-700 p-2 rounded-lg hover:bg-blue-800 transition-colors text-white"
        aria-label={isSidenavOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidenavOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <Sidenav
        record={record}
        selectedNote={setSelectedNote}
        isOpen={isSidenavOpen}
      />

      <div
        className={`w-full h-full flex flex-col transition-all duration-300 ${
          isSidenavOpen ? "ml-[30%]" : "ml-0"
        }`}
      >
        {/* Header Section */}
        <div className="flex justify-between items-center w-full p-5 border-b border-blue-400">
          <h1 className="text-white text-2xl font-semibold ml-12">Dashboard</h1>
          <div className="flex flex-row-reverse justify-center items-center gap-10">
            <UserButton />
            <Dialog>
              <DialogTrigger>
                <p className="bg-[#203d6d] hover:bg-[#3568b9] text-white px-5 py-2 rounded-lg transition-colors">
                  Create new
                </p>
              </DialogTrigger>
              <DialogContent className="border-none flex justify-center items-center">
                <DialogHeader>
                  <DialogTitle className="text-white text-center">
                    Add new note
                  </DialogTitle>
                  <DialogDescription>
                    <CreateNote />
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-5 transition-all duration-300">
          {selectedNoteDetails ? (
            <div
              className={`flex flex-col gap-5 ${
                isSidenavOpen ? "grid grid-cols-1" : "grid grid-cols-2 gap-4"
              }`}
            >
              {/* Note Editor Section */}
              <div className="flex flex-col gap-5">
                <input
                  className="text-white p-3 text-2xl rounded-xl bg-blue-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Title"
                />
                <textarea
                  className={`text-white p-5 text-lg rounded-xl w-full bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-all duration-300 ${
                    !isSidenavOpen ? "h-[65vh]" : "h-[60vh]"
                  }`}
                  value={noteContent}
                  onChange={handleContentChange}
                  placeholder="Content"
                />
              </div>

              {/* Actions Section */}
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div
                    onClick={UpdateNote} // Trigger the update on button click
                    className="text-white bg-blue-900 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-800 transition-colors"
                  >
                    {isUpdating ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      "Update Note"
                    )}
                  </div>
                  {!isQuizOpen && (
                    <div
                      onClick={() => toggleInterface("quiz")}
                      className="text-white bg-blue-900 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-800 transition-colors"
                    >
                      Start Quiz
                    </div>
                  )}
                  {!isQuestionsOpen&&(
                  <div
                    onClick={() => toggleInterface("questions")}
                    className="text-white bg-blue-900 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-800 transition-colors"
                  >
                    Start Questions
                  </div>
                  )}
                  {!isChatOpen && (
                    <div
                      onClick={() => toggleInterface("chat")}
                      className="text-white bg-blue-900 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-800 transition-colors"
                    >
                      Chat with notes
                    </div>
                  )}
                </div>

                {/* Interface Components */}
                {isChatOpen && (
                  <ChatInterface
                    selectedNote={selectedNoteDetails}
                    onClose={() => setIsChatOpen(false)}
                  />
                )}
                {isQuizOpen && (
                  <Quiz
                    selectedNote={selectedNoteDetails}
                    onClose={() => setIsQuizOpen(false)}
                  />
                )}
                {isQuestionsOpen && (
                  <QuestionInterface
                    selectedNote={selectedNoteDetails}
                    onClose={() => setIsQuestionsOpen(false)}
                  />
                )}
              </div>
            </div>
          ) : (
            // No Note Selected State
            <div className="h-full flex items-center justify-center">
              <p className="text-white text-lg">
                Select a note from the sidebar or create a new one
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
