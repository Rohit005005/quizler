import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AiSession } from "@/configs/AiModel";
const EVALUATION_PROMPT = `
You are an expert evaluator. Evaluate the following answers based on the note content and provided questions.

Note Content:
{noteContent}

For each answer, provide:
1. A score out of 100
2. Specific feedback, bold statement on the users answer
3. Suggestions for improvement or correct answer

Return the response in this JSON format, Only give Json format nothing else is needed, dont include '''json''' in it.
Sample :
{
  "evaluations": [
    {
      "score": number,
      "feedback": string,
      "suggestions": string
    }
  ],
  "totalScore": number
}
 Only give Json format nothing else is needed, dont include '''json''' in it.

Questions and Answers to evaluate:
{questionsAndAnswers}
`;

const QuestionInterface = ({ selectedNote, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (selectedNote?.questions) {
      try {
        const parsedQuestions = JSON.parse(selectedNote.questions);
        setQuestions(parsedQuestions.longQuestions || []);
        const initialAnswers = {};
        parsedQuestions.longQuestions.forEach((_, index) => {
          initialAnswers[index] = "";
        });
        setAnswers(initialAnswers);
        setScores({});
        setFeedback({});
        setIsSubmitted(false);
      } catch (err) {
        setError("Error loading questions");
        console.error("Error parsing questions:", err);
      }
    }
  }, [selectedNote]);

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Format questions and answers for the prompt
      const questionsAndAnswers = questions
        .map(
          (q, i) => `
        Question ${i + 1}: ${q.question}
        Expected Points: ${q.expectedPoints.join(", ")}
        User's Answer: ${answers[i]}
      `
        )
        .join("\n");

      // Create the final prompt
      const prompt = EVALUATION_PROMPT.replace(
        "{noteContent}",
        selectedNote.content
      ).replace("{questionsAndAnswers}", questionsAndAnswers);

      console.log(questionsAndAnswers)

      // Send to AI for evaluation
      const evaluationResult = await AiSession.sendMessage(prompt);
      console.log(
        evaluationResult.response.candidates[0].content.parts[0].text
      );

      // Extract and parse the JSON content
      const contentText =
        evaluationResult.response.candidates[0].content.parts[0].text;

      if (!contentText) {
        throw new Error(
          "Unexpected response format: 'text' property is missing"
        );
      }
      

      const evaluation = JSON.parse(contentText);

      // Log the parsed evaluation for debugging
      console.log("Parsed Evaluation:", evaluation);

      // Update the UI with scores and feedback
      const newScores = {};
      const newFeedback = {};
      evaluation.evaluations.forEach((eva, index) => {
        newScores[index] = eva.score;
        newFeedback[index] = {
          feedback: eva.feedback,
          suggestions: eva.suggestions,
        };
      });

      setScores(newScores);
      setFeedback(newFeedback);
      setIsSubmitted(true);
    } catch (err) {
      setError("Error evaluating answers");
      console.error("Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalScore = () => {
    if (!Object.keys(scores).length) return 0;
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return Math.round(total / questions.length);
  };

  if (error) {
    return (
      <div className="bg-blue-900 rounded-xl p-6 text-white">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-900 rounded-xl p-6 relative max-h-[65vh] overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
      >
        <X size={24} />
      </button>

      <h2 className="text-white text-xl font-semibold mb-6">Brief Questions</h2>

      {isSubmitted && (
        <div className="bg-blue-800 p-4 rounded-lg mb-6">
          <h3 className="text-white font-semibold mb-2">
            Overall Score: {getTotalScore()}%
          </h3>
        </div>
      )}

      {questions.length === 0 ? (
        <p className="text-white">No questions available for this note.</p>
      ) : (
        <div className="space-y-8">
          {questions.map((q, index) => (
            <div key={index} className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-white font-medium">
                  Question {index + 1}:
                </h3>
                <p className="text-white">{q.question}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-white text-sm font-medium">
                  Key Points to Cover:
                </h4>
                <ul className="list-disc list-inside text-white text-sm space-y-1">
                  {q.expectedPoints.map((point, pointIndex) => (
                    <li key={pointIndex} className="text-gray-300">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <textarea
                  value={answers[index] || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="Write your answer here..."
                  className="w-full h-32 p-3 rounded-lg bg-blue-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
                {isSubmitted && feedback[index] && (
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="text-white font-medium">
                      Score : {scores[index]}%
                    </div>
                    <div className="text-green-400">
                        <h1 className="text-white font-bold">Feedback :</h1>
                      {feedback[index].feedback}
                    </div>
                    <div className="text-yellow-400">
                    <h1 className="text-white font-bold">Suggestions :</h1>
                      {feedback[index].suggestions}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isSubmitted}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isSubmitting || isSubmitted
                  ? "bg-blue-700 text-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isSubmitting
                ? "Evaluating..."
                : isSubmitted
                ? "Submitted"
                : "Submit Answers"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionInterface;
