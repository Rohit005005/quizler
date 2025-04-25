"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/configs";
import { quizes } from "@/configs/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";

function Quiz({ params }) {
  const [quizFromDb, setQuizFromDb] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track the current question index
  const [selectedAnswers, setSelectedAnswers] = useState([]); // Store the selected answers
  const [selectedOption, setSelectedOption] = useState(null); // Store selected option for current question
  const [isCorrect, setIsCorrect] = useState(null); // Track if the answer is correct
  const [quizCompleted, setQuizCompleted] = useState(false); // Track if the quiz is complete

  useEffect(() => {
    params && GetQuizData();
  }, [params]);

  const GetQuizData = async () => {
    const resp = await db
      .select()
      .from(quizes)
      .where(eq(quizes.id, Number(params?.quizid)));

    if (resp[0]) {
      const parsedQuiz = JSON.parse(resp[0].quiz);
      setQuizFromDb(parsedQuiz); // Set the parsed quiz data
    }
  };

  // Function to handle answer selection
  const handleAnswerClick = (selectedAnswer) => {
    const correctAnswer =
      quizFromDb.questions[currentQuestionIndex].CorrectAnswer;

    // Save the selected answer for the current question
    setSelectedAnswers((prevAnswers) => [
      ...prevAnswers,
      {
        question: quizFromDb.questions[currentQuestionIndex].Question,
        selected: selectedAnswer,
        correct: correctAnswer,
      },
    ]);

    // Check if selected answer is correct
    setSelectedOption(selectedAnswer); // Set the selected option
    setIsCorrect(selectedAnswer === correctAnswer); // Compare with correct answer

    // Delay showing the next question for 2 seconds
    setTimeout(() => {
      setSelectedOption(null); // Reset the selected option for the next question
      setIsCorrect(null); // Reset correctness check

      // Move to the next question if there are more questions
      if (currentQuestionIndex < quizFromDb.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setQuizCompleted(true); // Mark the quiz as completed
      }
    }, 1000); // 2-second delay to show if the answer was correct
  };

  // Function to calculate the score
  const calculateScore = () => {
    return selectedAnswers.filter(
      (answer) => answer.selected === answer.correct
    ).length;
  };

  // Function to reset the quiz
  const restartQuiz = () => {
    setCurrentQuestionIndex(0); // Reset question index
    setSelectedAnswers([]); // Clear selected answers
    setQuizCompleted(false); // Mark quiz as not completed
  };

  const getButtonClass = (option) => {
    if (selectedOption === null) return ""; // Default state, no color change
    if (selectedOption === option) {
      return isCorrect ? "bg-green-500" : "bg-red-500"; // Green if correct, red if incorrect
    }
    return ""; // Other buttons remain unchanged
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2e4d55] via-[#be9b7b] to-[#80a984] text-white">
      {quizFromDb && !quizCompleted && (
        <div>
          <h1 className="pt-6 text-center text-2xl font-bold">Quiz</h1>
          <div
            key={currentQuestionIndex}
            className="h-screen flex flex-col justify-center items-center"
          >
            <p className="text-center px-10 py-2 mb-10 text-xl">
              {quizFromDb.questions[currentQuestionIndex].Question}
            </p>
            <div className="flex flex-col justify-center items-center gap-10">
              <div className="w-full flex justify-between items-center gap-10">
                <Button
                  className={`w-[350px] ${getButtonClass("A")}`}
                  onClick={() => handleAnswerClick("A")}
                  disabled={selectedOption !== null} // Disable after selection
                >
                  A: {quizFromDb.questions[currentQuestionIndex].A}
                </Button>
                <Button
                  className={`w-[350px] ${getButtonClass("B")}`}
                  onClick={() => handleAnswerClick("B")}
                  disabled={selectedOption !== null} // Disable after selection
                >
                  B: {quizFromDb.questions[currentQuestionIndex].B}
                </Button>
              </div>
              <div className="w-full flex justify-between items-center gap-10">
                <Button
                  className={`w-[350px] ${getButtonClass("C")}`}
                  onClick={() => handleAnswerClick("C")}
                  disabled={selectedOption !== null} // Disable after selection
                >
                  C: {quizFromDb.questions[currentQuestionIndex].C}
                </Button>
                <Button
                  className={`w-[350px] ${getButtonClass("D")}`}
                  onClick={() => handleAnswerClick("D")}
                  disabled={selectedOption !== null} // Disable after selection
                >
                  D: {quizFromDb.questions[currentQuestionIndex].D}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show the results after the quiz is completed */}
      {quizCompleted && (
        <div className="flex flex-col justify-center items-center p-8">
          <h2 className="text-3xl font-bold mb-6">Quiz Completed!</h2>
          <p className="text-xl mb-6">
            Your Score: {calculateScore()} out of {quizFromDb.questions.length}
          </p>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl mb-6">
            {selectedAnswers.map((answer, index) => (
              <div key={index} className="mb-4">
                <p className="font-semibold">Question: {answer.question}</p>
                <p>Your Answer: {answer.selected}</p>
                <p>Correct Answer: {answer.correct}</p>
              </div>
            ))}
          </div>
          <Button 
            onClick={restartQuiz} 
            className="mt-5 bg-amber-500 hover:bg-amber-600 text-white">
            Restart Quiz
          </Button>
        </div>
      )}
    </div>
  );
}

export default Quiz;
