"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);

  const handleClick = async (category, subcategory) => {
    const key = `${category}-${subcategory}`;
    if (fetchedData[key]) {
      setSelectedKey(key);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v0/structurate/gemini/?category=${category}&subcategory=${subcategory}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      // Assuming the API returns an object with a "questions" field
      setFetchedData((prev) => ({ ...prev, [key]: data.questions }));
      console.log(data.questions)
      setSelectedKey(key);
    } catch (error) {
      console.error("Error calling API:", error);
    } finally {
      setLoading(false);
    }
  };

  const topics = [
    {
      category: "Trigonometry",
      subcategories: [
        "Trigonometric Functions and Equations",
        "Inverse Trigonometric Functions",
        "Properties of Triangles",
        "Heights and Distances",
      ],
    },
    {
      category: "Calculus",
      subcategories: [
        "Limits and Continuity",
        "Differentiability and Differentiation",
        "Applications of Derivatives (Maxima, Minima, Tangents, Normals)",
        "Indefinite and Definite Integrals",
        "Applications of Integrals (Area under Curves)",
        "Differential Equations",
      ],
    },
    {
      category: "Thermodynamics & Kinetic Theory",
      subcategories: [
        "Thermal Properties of Matter",
        "Laws of Thermodynamics",
        "Kinetic Theory of Gases",
        "Dual Nature of Matter and Radiation",
        "Atoms and Nuclei (Bohr’s Model, Radioactivity)",
        "Semiconductor Electronics (Logic Gates, Diodes, Transistors)",
      ],
    },
    {
      category: "Inorganic Chemistry",
      subcategories: [
        "Classification of Elements and Periodicity in Properties",
        "Chemical Bonding and Molecular Structure",
        "Hydrogen and Its Compounds",
        "The s-Block Elements (Group 1 and 2)",
        "The p-Block Elements (Group 13 to 18)",
        "The d- and f-Block Elements",
        "Coordination Compounds",
        "Environmental Chemistry",
      ],
    },
  ];

  const currentData = selectedKey ? fetchedData[selectedKey] : null;

  return (
    <div className="flex flex-row items-start justify-center min-h-screen p-4 gap-6">
      <div className="w-1/3 p-4 border-r h-[100vh] overflow-scroll">
        <h2 className="text-xl font-bold mb-4">Topics</h2>
        {topics.map((topic) => (
          <div key={topic.category} className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{topic.category}</h3>
            {topic.subcategories.map((sub) => (
              <Button
                key={sub}
                onClick={() => handleClick(topic.category, sub)}
                className="w-full my-1"
                size="sm"
              >
                {sub}
              </Button>
            ))}
          </div>
        ))}
      </div>
      <div className="w-2/3 p-4">
        <h2 className="text-xl font-bold mb-4">Questions</h2>
        {loading ? (
          <p>Loading...</p>
        ) : currentData ? (
          <div className="space-y-4">
            {currentData.map((question, index) => (
              <div
                key={index}
                className="border p-4 rounded-lg shadow-md bg-white"
              >
                <h3 className="text-lg font-bold mb-1">
                  {question.subject}
                </h3>
                <p className="mb-2">{question.content}</p>
                <div className="mb-2">
                  <p className="font-semibold">Options:</p>
                  <ul className="list-disc pl-5">
                    {question.options.map((opt, idx) => (
                      <li key={idx}>
                        <strong>{opt.option_id}:</strong> {opt.content}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2">
                  <p>
                    <strong>Answer:</strong> {question.solution.answer}
                  </p>
                  <p>
                    <strong>Explanation:</strong>{" "}
                    {question.solution.explanation}
                  </p>
                </div>
                <p>
                  <strong>Difficulty:</strong> {question.difficulty_level}
                </p>
                <p>
                  <strong>Validation:</strong>{" "}
                  {question.validation ? "Valid" : "Invalid"}
                </p>
                <p>
                  <strong>Summary:</strong>{" "}
                  {question.summary}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>Select a topic to fetch data.</p>
        )}
      </div>
    </div>
  );
}
