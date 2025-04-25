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
import {
  LoaderCircle,
  Menu,
  X,
  MessageSquare,
  BookOpen,
  Brain,
  PenLine,
  Plus,
  BrainCircuit,
  Star,
} from "lucide-react";
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

  const deleteNote = async (noteId) => {
    try {
      // Delete the note from the database
      await db.delete(quizes).where(eq(quizes.id, noteId));

      // Update the local state to remove the deleted note
      setRecord((prevRecord) =>
        prevRecord.filter((item) => item.id !== noteId)
      );

      // If the deleted note was selected, clear the selection
      if (selectedNote === noteId) {
        setSelectedNote(null);
        setNoteTitle("");
        setNoteContent("");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
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

      const QUESTIONS_PROMPT = `Only give Json format nothing else is needed, dont include '''json''' in it... Based on the title and content provided, generate a set of long-answer questions that test deep understanding of the material. The questions should require detailed explanations and critical thinking. Provide the questions in JSON format with the following structure. Sample:
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
    <div className="flex items-start h-screen bg-gradient-to-br from-[#2e4d55] via-[#be9b7b] to-[#80a984] relative overflow-hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setIsSidenavOpen(!isSidenavOpen)}
        className="absolute top-5 left-5 z-50 bg-amber-500/70 p-2 rounded-full hover:bg-amber-500 transition-colors text-white shadow-lg"
        aria-label={isSidenavOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidenavOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <Sidenav
        record={record}
        selectedNote={setSelectedNote}
        isOpen={isSidenavOpen}
        onDeleteNote={deleteNote}
      />

      <div
        className={`w-full h-full flex flex-col transition-all duration-300 ${
          isSidenavOpen ? "ml-[30%]" : "ml-0"
        }`}
      >
        {/* Header Section */}
        <div className="flex justify-between items-center w-full p-4 border-b border-amber-500/30 backdrop-blur-sm bg-[#2e4d55]/20">
          <h1 className="text-white text-2xl font-bold ml-14">
            StudyMate Dashboard
          </h1>
          <div className="flex justify-center items-center gap-6">
            <Dialog>
              <DialogTrigger>
                <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-all shadow-md">
                  <Plus size={18} />
                  <span className="font-medium">New Note</span>
                </button>
              </DialogTrigger>
              <DialogContent className="border-none bg-gradient-to-b from-[#2e4d55] to-[#80a984] flex justify-center items-center">
                <DialogHeader>
                  <DialogTitle className="text-white text-center text-xl font-bold">
                    Create New Note
                  </DialogTitle>
                  <DialogDescription>
                    <CreateNote />
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <UserButton />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 transition-all duration-300">
          {selectedNoteDetails ? (
            <div
              className={`flex flex-col gap-5 ${
                isSidenavOpen ? "grid grid-cols-1" : "grid grid-cols-2 gap-6"
              }`}
            >
              {/* Note Editor Section */}
              <div className="flex flex-col gap-4">
                <div className="bg-[#2e4d55]/30 backdrop-blur-sm rounded-xl shadow-lg p-1">
                  <input
                    className="text-white p-3 text-2xl rounded-xl bg-[#2e4d55]/50 text-center focus:outline-none focus:ring-2 focus:ring-amber-400 w-full font-bold border border-amber-700/50"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Note Title"
                  />
                </div>
                <div className="bg-[#2e4d55]/30 backdrop-blur-sm rounded-xl shadow-lg p-1 flex-1">
                  <textarea
                    className={`text-white p-5 text-lg rounded-xl w-full bg-[#2e4d55]/50 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none transition-all duration-300 border border-amber-700/50 ${
                      !isSidenavOpen ? "h-[65vh]" : "h-[60vh]"
                    }`}
                    value={noteContent}
                    onChange={handleContentChange}
                    placeholder="Enter your note content here..."
                  />
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex flex-col gap-5">
                <div className="bg-[#2e4d55]/30 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-amber-700/30 flex flex-wrap items-center gap-3">
                  <button
                    onClick={UpdateNote}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg transition-colors shadow-md flex-grow"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <>
                        <PenLine size={18} />
                        <span className="font-medium">Update Note</span>
                      </>
                    )}
                  </button>

                  {!isQuizOpen && (
                    <button
                      onClick={() => toggleInterface("quiz")}
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-md flex-grow"
                    >
                      <BrainCircuit size={18} />
                      <span className="font-medium">Start Quiz</span>
                    </button>
                  )}

                  {!isQuestionsOpen && (
                    <button
                      onClick={() => toggleInterface("questions")}
                      className="flex items-center gap-2 bg-[#2e4d55] hover:bg-[#26434a] text-white px-4 py-2.5 rounded-lg transition-colors shadow-md flex-grow"
                    >
                      <BookOpen size={18} />
                      <span className="font-medium">Start Questions</span>
                    </button>
                  )}

                  {!isChatOpen && (
                    <button
                      onClick={() => toggleInterface("chat")}
                      className="flex items-center gap-2 bg-[#80a984] hover:bg-[#6d9170] text-white px-4 py-2.5 rounded-lg transition-colors shadow-md flex-grow"
                    >
                      <MessageSquare size={18} />
                      <span className="font-medium">Chat with Notes</span>
                    </button>
                  )}
                </div>

                {/* Interface Components */}
                {isChatOpen && (
                  <div className="bg-[#2e4d55]/30 backdrop-blur-sm rounded-xl shadow-lg border border-amber-700/30 overflow-hidden">
                    <ChatInterface
                      selectedNote={selectedNoteDetails}
                      onClose={() => setIsChatOpen(false)}
                    />
                  </div>
                )}
                {isQuizOpen && (
                  <div className="bg-[#2e4d55]/30 backdrop-blur-sm rounded-xl shadow-lg border border-amber-700/30 overflow-hidden">
                    <Quiz
                      selectedNote={selectedNoteDetails}
                      onClose={() => setIsQuizOpen(false)}
                    />
                  </div>
                )}
                {isQuestionsOpen && (
                  <div className="bg-[#2e4d55]/30 backdrop-blur-sm rounded-xl shadow-lg border border-amber-700/30 overflow-hidden">
                    <QuestionInterface
                      selectedNote={selectedNoteDetails}
                      onClose={() => setIsQuestionsOpen(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            // No Note Selected State
            <div className="h-full flex flex-col items-center justify-center">
              <div className="bg-[#2e4d55]/30 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-amber-700/30 max-w-md text-center">
                <h2 className="text-white text-2xl font-bold mb-3">
                  Welcome to StudyMate!
                </h2>
                <p className="text-amber-50 text-lg mb-6">
                  Select a note from the sidebar or create a new one to get
                  started
                </p>
                <Dialog>
                  <DialogTrigger>
                    <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-all shadow-md mx-auto">
                      <Plus size={20} />
                      <span className="font-medium">
                        Create Your First Note
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="border-none bg-gradient-to-b from-[#2e4d55] to-[#80a984] flex justify-center items-center">
                    <DialogHeader>
                      <DialogTitle className="text-white text-center text-xl font-bold">
                        Create New Note
                      </DialogTitle>
                      <DialogDescription>
                        <CreateNote />
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
