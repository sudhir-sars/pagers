"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import MathpixRenderer from "@/components/mathpixRenderer/MathpixRenderer";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [questionCounts, setQuestionCounts] = useState({});
  const [countsLoading, setCountsLoading] = useState(false);

  // Fetch counts for all topics/subcategories in one call
  const fetchAllCounts = async () => {
    setCountsLoading(true);
    try {
      const res = await fetch("/api/database/count", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setQuestionCounts(data.counts || {});
    } catch (error) {
      console.error("Error fetching counts:", error);
    } finally {
      setCountsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCounts();
  }, []);


  const handleClick = async (category, subcategory) => {
    const key = `${category}-${subcategory}`;
    if (fetchedData[key]) {
      setSelectedKey(key);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/database/get/?category=${category}&subcategory=${subcategory}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      setFetchedData((prev) => ({ ...prev, [key]: data.questions }));
      console.log(data.questions);
      setSelectedKey(key);
    } catch (error) {
      console.error("Error calling API:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    try {
      const res = await fetch("/api/database/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: questionId }),
      });
      if (res.ok) {
        // Remove the deleted question from state
        setFetchedData((prev) => {
          const newData = { ...prev };
          if (selectedKey && newData[selectedKey]) {
            newData[selectedKey] = newData[selectedKey].filter(
              (q) => q._id !== questionId
            );
          }
          return newData;
        });
      } else {
        console.error("Failed to delete question");
      }
    } catch (err) {
      console.error("Error deleting question:", err);
    }
  };
  

  const topics = [
    {
      category: "Algebra",
      subcategories: [
        "Sets, Relations, and Functions",
        "Complex Numbers and Quadratic Equations",
        "Matrices and Determinants",
        "Permutations and Combinations",
        "Binomial Theorem and Its Applications",
        "Sequences and Series (Arithmetic and Geometric Progressions)",
        "Mathematical Induction",
      ],
    },
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
      category: "Coordinate Geometry",
      subcategories: [
        "Straight Lines",
        "Circles",
        "Conic Sections (Parabola, Ellipse, Hyperbola)",
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
      category: "Vector and 3D Geometry",
      subcategories: [
        "Vectors and Their Properties",
        "Three-Dimensional Geometry (Lines, Planes, Sphere)",
      ],
    },
    {
      category: "Probability and Statistics",
      subcategories: [
        "Probability (Basic Concepts, Conditional Probability, Bayes’ Theorem)",
        "Statistics (Mean, Median, Mode, Variance, Standard Deviation)",
      ],
    },
    {
      category: "Mathematical Reasoning",
      subcategories: ["Statements and Logical Operations"],
    },
    {
      category: "Mechanics",
      subcategories: [
        "Units and Dimensions",
        "Kinematics (Motion in a Straight Line and Plane)",
        "Laws of Motion",
        "Work, Energy, and Power",
        "System of Particles and Rotational Motion",
        "Gravitation",
      ],
    },
    {
      category: "Thermodynamics & Kinetic Theory",
      subcategories: [
        "Thermal Properties of Matter",
        "Laws of Thermodynamics",
        "Kinetic Theory of Gases",
      ],
    },
    {
      category: "Electromagnetism",
      subcategories: [
        "Electrostatics (Charges, Fields, Potential, Gauss’ Law)",
        "Capacitance",
        "Current Electricity",
        "Magnetic Effects of Current and Magnetism",
        "Electromagnetic Induction and Alternating Currents",
        "Electromagnetic Waves",
      ],
    },
    {
      category: "Waves and Optics",
      subcategories: [
        "Oscillations and Waves (SHM, Mechanical and Sound Waves)",
        "Wave Optics (Interference, Diffraction, Polarization)",
        "Ray Optics (Mirrors, Lenses, Optical Instruments)",
      ],
    },
    {
      category: "Modern Physics",
      subcategories: [
        "Dual Nature of Matter and Radiation",
        "Atoms and Nuclei (Bohr’s Model, Radioactivity)",
        "Semiconductor Electronics (Logic Gates, Diodes, Transistors)",
      ],
    },
    {
      category: "Physical Chemistry",
      subcategories: [
        "Some Basic Concepts of Chemistry (Mole Concept, Stoichiometry)",
        "Atomic Structure",
        "Chemical Thermodynamics",
        "States of Matter (Gases and Liquids)",
        "Chemical Equilibrium",
        "Ionic Equilibrium",
        "Redox Reactions",
        "Solutions and Colligative Properties",
        "Electrochemistry",
        "Chemical Kinetics",
        "Surface Chemistry",
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
    {
      category: "Organic Chemistry",
      subcategories: [
        "General Organic Chemistry (GOC)",
        "Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic Hydrocarbons)",
        "Haloalkanes and Haloarenes",
        "Alcohols, Phenols, and Ethers",
        "Aldehydes, Ketones, and Carboxylic Acids",
        "Organic Compounds Containing Nitrogen (Amines, Diazonium Salts)",
        "Biomolecules (Carbohydrates, Proteins, Nucleic Acids)",
        "Polymers",
        "Chemistry in Everyday Life",
        "Practical Organic Chemistry (Purification, Qualitative Analysis)",
      ],
    },
  ];

  const currentData = selectedKey ? fetchedData[selectedKey] : null;

  return (
    <div className="flex flex-row items-start justify-center  p-4 gap-6">
      <div className="w-1/3 p-4 border-r h-[95vh] overflow-scroll  top-0 left-0 relative">
      <div className="h-[13vh]  ">
        <div className=" fixed top-0 left-15 px-7 bg-amber-100 rounded-xl rounded-t-none">


        <h2 className="text-xl font-bold mb-4">Topics</h2>
        <Button
          onClick={fetchAllCounts}
          disabled={countsLoading}
          className="mb-4"
          >
          {countsLoading ? "Refreshing........" : "Refresh Counts"}
        </Button>
            </div>
        </div>

        {topics.map((topic) => (
          <div key={topic.category} className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{topic.category}</h3>
            {topic.subcategories.map((sub) => {
              let key = `${topic.category}-${sub}`;
              
              const count = questionCounts[key] || 0;
              return (
                <Button
                  key={sub}
                  onClick={() => handleClick(topic.category, sub)}
                  className={`w-full my-1 ${
                    selectedKey === key ? "bg-blue-500 text-white" : ""
                  }`}
                  size="sm"
                >
                  {sub} ({count})
                </Button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="w-2/3 p-4 h-[95vh] overflow-y-scroll">
        <h2 className="text-xl font-bold mb-4">Questions</h2>
        {loading ? (
          <p>Loading...</p>
        ) : currentData ? (
          <div className="space-y-4">
            <div>Total Questions: {currentData.length}</div>
            {currentData.map((question, index) => (
              <div
                key={index}
                className="border p-4 rounded-lg shadow-md bg-white relative"
              >
                <h3 className="text-lg font-bold mb-1">
                  {question.subject}
                </h3>
                <div className="mb-2 flex">
                  {index+1}<MathpixRenderer markdownData={question.content} />
                </div>
                <div className="mb-2">
                  <p className="font-semibold">Options:</p>
                  <ul className="list-disc pl-5">
                    {question.options.map((opt, idx) => (
                      <li key={idx}>
                        <div className="flex items-center justify-start">
                          <strong>{opt.option_id}:</strong>
                          <MathpixRenderer markdownData={opt.content} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2">
                  <div>
                    <strong>Answer ID:</strong>{" "}
                    <span>{question.solution.answer_id}</span>
                  </div>
                  <div>
                    <strong>Answer:</strong>
                    <MathpixRenderer markdownData={question.solution.answer} />
                  </div>
                  <div>
                    <strong>Explanation:</strong>
                    <MathpixRenderer
                      markdownData={question.solution.explanation}
                    />
                  </div>
                </div>
                <p>
                  <strong>Difficulty:</strong> {question.difficulty_level}
                </p>
                <p>
                  <strong>Validation:</strong>{" "}
                  {question.validation ? "Valid" : "Invalid"}
                </p>
                <div>
                  <MathpixRenderer markdownData={question.summary} />
                </div>
                <Button
                  onClick={() => handleDelete(question._id)}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  Delete
                </Button>
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
