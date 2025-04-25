"use client";
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, X } from "lucide-react";
import { db } from "@/configs";
import { quizes } from "@/configs/schema";
import { eq } from "drizzle-orm";

const Quiz = ({ selectedNote, onClose }) => {
  const [quizData, setQuizData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (selectedNote) {
      fetchQuizData();
    }
  }, [selectedNote]);

  const fetchQuizData = async () => {
    try {
      const resp = await db
        .select()
        .from(quizes)
        .where(eq(quizes.id, Number(selectedNote?.id)));

      if (resp[0]) {
        setQuizData(JSON.parse(resp[0].quiz));
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
    }
  };

  const handleAnswer = (option) => {
    const currentQuestion = quizData.questions[currentIndex];
    const correct = option === currentQuestion.CorrectAnswer;
    
    setSelectedOption(option);
    setIsCorrect(correct);
    setAnswers([...answers, {
      question: currentQuestion.Question,
      selected: option,
      correct: currentQuestion.CorrectAnswer,
      isCorrect: correct
    }]);

    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrect(null);
      
      if (currentIndex < quizData.questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsCompleted(true);
      }
    }, 1000);
  };

  const getOptionStyle = (option) => {
    if (selectedOption === null) {
      return "bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white";
    }
    if (selectedOption === option) {
      return isCorrect 
        ? "bg-green-600 text-white" 
        : "bg-red-600 text-white";
    }
    return "bg-white/5 backdrop-blur-sm text-white cursor-not-allowed";
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setIsCompleted(false);
  };

  if (!quizData) return null;

  const currentQuestion = quizData.questions[currentIndex];
  const progress = ((currentIndex) / quizData.questions.length) * 100;

  if (isCompleted) {
    const score = answers.filter(answer => answer.isCorrect).length;
    const percentage = (score / quizData.questions.length) * 100;

    return (
      <Card className="w-full bg-gradient-to-br from-[#2e4d55] via-[#be9b7b] to-[#80a984] text-white relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-white hover:text-amber-200"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold">{score}/{quizData.questions.length}</div>
            <Progress value={percentage} className="w-full h-2" />
            <div className="text-sm text-amber-200">
              {percentage}% Correct
            </div>
          </div>
          
          <div className="space-y-4">
            {answers.map((answer, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 space-y-2 bg-white/10 backdrop-blur-sm">
                <div className="font-medium">{answer.question}</div>
                <div className="flex items-center gap-2">
                  {answer.isCorrect ? (
                    <CheckCircle className="text-green-400 w-5 h-5" />
                  ) : (
                    <XCircle className="text-red-400 w-5 h-5" />
                  )}
                  <span>Your answer: {answer.selected}</span>
                  {!answer.isCorrect && (
                    <span className="text-amber-300">(Correct: {answer.correct})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4 justify-end">
          <Button 
            onClick={restartQuiz}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Try Again
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
          >
            Close
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-[#2e4d55] via-[#be9b7b] to-[#80a984] text-white relative rounded-xl">
      <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full p-1 absolute right-2 top-2"
        >
          <X size={20} />
        </button>
      <CardHeader>
        <div className="space-y-2 mt-5">
          <Progress value={progress} className="w-full h-2" />
          <div className="text-sm text-amber-200 text-left">
            Question {currentIndex + 1} of {quizData.questions.length}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="text-xl font-medium text-center">
          {currentQuestion.Question}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['A', 'B', 'C', 'D'].map((option) => (
            <Button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={selectedOption !== null}
              className={`h-auto py-4 px-6 text-left transition-all duration-200 ${getOptionStyle(option)}`}
            >
              <div className="flex items-start gap-2">
                <span className="font-medium">{option}.</span>
                <span>{currentQuestion[option]}</span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Quiz;