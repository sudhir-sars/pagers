"use client";

import { useState } from "react";
import MathpixRenderer from "@/component/mathpixRenderer/MathpixRenderer";

export default function DatabasePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeValid, setActiveValid] = useState<boolean | null>(null);

  // Fetch questions from the API with the given valid parameter.
  const fetchQuestions = async (valid: boolean) => {
    setLoading(true);
    setError(null);
    setActiveValid(valid);
    try {
      const response = await fetch(`/api/database?valid=${valid}`);
      const data = await response.json();
      if (data.questions) {
        setQuestions(data.questions);
      } else {
        setError("No questions found");
      }
    } catch (err) {
      setError("Error fetching questions");
    } finally {
      setLoading(false);
    }
  };

  // Button styling function based on whether the button is active.
  const buttonStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? '#0070f3' : 'transparent',
    color: isActive ? 'white' : 'black',
    padding: '8px 16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px'
  });

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Database Questions</h1>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => fetchQuestions(true)}
          disabled={loading}
          style={buttonStyle(activeValid === true)}
        >
          Fetch Valid Questions
        </button>
        <button
          onClick={() => fetchQuestions(false)}
          disabled={loading}
          style={buttonStyle(activeValid === false)}
        >
          Fetch Invalid Questions
        </button>
      </div>
      {loading && <p>Loading questions...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {questions.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          {questions.map((q, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                margin: "10px 0",
              }}
            >
              <h3>Question {q.question_number}</h3>
              <div>
                <strong>Content:</strong>{" "}
                <MathpixRenderer markdownData={q.content} />
              </div>
              <p>
                <strong>Type:</strong>{" "}
                {q.type === "multiple_choice" ? "Multiple Choice" : "Numerical"}
              </p>
              <div>
                <strong>Options:</strong>
                {q.options.map((option: any, idx: number) => (
                  <div key={idx} className="ml-4 mt-1 flex items-center">
                    {option.option_id && (
                      <MathpixRenderer
                        markdownData={JSON.stringify(option.option_id)}
                      />
                    )}
                    {option.content && (
                      <MathpixRenderer markdownData={option.content} />
                    )}
                  </div>
                ))}
              </div>
              <div>
                <strong>Solution:</strong>
                <div>
                  <strong>Answer:</strong>
                </div>
                <MathpixRenderer markdownData={q.solution.answer} />
              </div>
              {q.solution.explanation && (
                <div>
                  <strong>Explanation:</strong>
                  <MathpixRenderer markdownData={q.solution.explanation} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
