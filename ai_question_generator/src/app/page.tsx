"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import MathpixRenderer from "@/components/mathpixRenderer/MathpixRenderer";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [ongoingFetches, setOngoingFetches] = useState(0);

  // Define subjects with their categories and subcategories
  const subjects = [
    {
      name: "mathematics",
      categories: [
        {
          name: "Algebra",
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
          name: "Trigonometry",
          subcategories: [
            "Trigonometric Functions and Equations",
            "Inverse Trigonometric Functions",
            "Properties of Triangles",
            "Heights and Distances",
          ],
        },
        {
          name: "Coordinate Geometry",
          subcategories: [
            "Straight Lines",
            "Circles",
            "Conic Sections (Parabola, Ellipse, Hyperbola)",
          ],
        },
        {
          name: "Calculus",
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
          name: "Vector and 3D Geometry",
          subcategories: [
            "Vectors and Their Properties",
            "Three-Dimensional Geometry (Lines, Planes, Sphere)",
          ],
        },
        {
          name: "Probability and Statistics",
          subcategories: [
            "Probability (Basic Concepts, Conditional Probability, Bayes’ Theorem)",
            "Statistics (Mean, Median, Mode, Variance, Standard Deviation)",
          ],
        },
        {
          name: "Mathematical Reasoning",
          subcategories: ["Statements and Logical Operations"],
        },
      ],
    },
    {
      name: "physics",
      categories: [
        // {
        //   name: "Mechanics",
        //   subcategories: [
        //     "Units and Dimensions",
        //     "Kinematics (Motion in a Straight Line and Plane)",
        //     "Laws of Motion",
        //     "Work, Energy, and Power",
        //     "System of Particles and Rotational Motion",
        //     "Gravitation",
        //   ],
        // },
        // {
        //   name: "Thermodynamics & Kinetic Theory",
        //   subcategories: [
        //     "Thermal Properties of Matter",
        //     "Laws of Thermodynamics",
        //     "Kinetic Theory of Gases",
        //   ],
        // },
        // {
        //   name: "Electromagnetism",
        //   subcategories: [
        //     "Electrostatics (Charges, Fields, Potential, Gauss’ Law)",
        //     "Capacitance",
        //     "Current Electricity",
        //     "Magnetic Effects of Current and Magnetism",
        //     "Electromagnetic Induction and Alternating Currents",
        //     "Electromagnetic Waves",
        //   ],
        // },
        // {
        //   name: "Waves and Optics",
        //   subcategories: [
        //     "Oscillations and Waves (SHM, Mechanical and Sound Waves)",
        //     "Wave Optics (Interference, Diffraction, Polarization)",
        //     "Ray Optics (Mirrors, Lenses, Optical Instruments)",
        //   ],
        // },
        {
          name: "Modern Physics",
          subcategories: [
            "Dual Nature of Matter and Radiation",
            "Atoms and Nuclei (Bohr’s Model, Radioactivity)",
            "Semiconductor Electronics (Logic Gates, Diodes, Transistors)",
          ],
        },
      ],
    },
    {
      name: "chemistry",
      categories: [
        {
          name: "Physical Chemistry",
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
          name: "Inorganic Chemistry",
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
          name: "Organic Chemistry",
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
      ],
    },
  ];

  // Handle clicking a subject to fetch all its subcategories
  const handleSubjectClick = (subject) => {
    subject.categories.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        handleClick(subject.name, category.name, subcategory, false);
      });
    });
  };

  // Updated handleClick with an optional setSelected parameter
  const handleClick = async (subject, category, subcategory, setSelected = true) => {
    const key = `${category}-${subcategory}`;
    if (fetchedData[key]) {
      if (setSelected) setSelectedKey(key);
      return;
    }

    let subjectParam = subject;
    if (subject === "chemistry") {
      if (category === "Organic Chemistry") {
        subjectParam = "chemistry_organic";
      } else if (category === "Inorganic Chemistry" || category === "Physical Chemistry") {
        subjectParam = "chemistry_inorganic";
      }
    }

    setOngoingFetches((prev) => prev + 1);
    try {
      const res = await fetch(
        `/api/v0/structurate/gemini/?subject=${subjectParam}&category=${category}&subcategory=${subcategory}`,
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
      if (setSelected) setSelectedKey(key);
    } catch (error) {
      console.error("Error calling API:", error);
    } finally {
      setOngoingFetches((prev) => prev - 1);
    }
  };

  // Update loading state based on ongoing fetches
  useEffect(() => {
    setLoading(ongoingFetches > 0);
  }, [ongoingFetches]);

  const currentData = selectedKey ? fetchedData[selectedKey] : null;

  return (
    <div className="flex flex-row items-start justify-center min-h-screen p-4 gap-6">
      <div className="w-1/3 p-4 border-r h-[100vh] overflow-scroll">
        <h2 className="text-xl font-bold mb-4">Topics</h2>
        {subjects.map((subject) => (
          <div key={subject.name} className="mb-6">
            <h2
              className="text-2xl font-bold mb-2 cursor-pointer hover:underline"
              onClick={() => handleSubjectClick(subject)}
            >
              {subject.name}
            </h2>
            {subject.categories.map((category) => (
              <div key={category.name} className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                {category.subcategories.map((sub) => (
                  <Button
                    key={sub}
                    onClick={() => handleClick(subject.name, category.name, sub, true)}
                    className="w-full my-1"
                    size="sm"
                  >
                    {sub}
                  </Button>
                ))}
              </div>
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
                <h3 className="text-lg font-bold mb-1">{question.subject}</h3>
                <div className="mb-2 flex">
                  {index + 1}
                  <MathpixRenderer markdownData={question.content} />
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
                    <strong>Answer:</strong>
                    <MathpixRenderer markdownData={question.solution.answer} />
                  </div>
                  <div>
                    <strong>Explanation:</strong>
                    <MathpixRenderer markdownData={question.solution.explanation} />
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