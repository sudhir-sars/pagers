"use client";
import { useEffect, useState } from 'react';
import { MathpixLoader, MathpixMarkdown } from 'mathpix-markdown-it';
import {
  addListenerContextMenuEvents,
  removeListenerContextMenuEvents,
} from "mathpix-markdown-it/lib/contex-menu";
import { loadSre } from "mathpix-markdown-it/lib/sre/sre-browser";

export default function MathpixRenderer({ markdownData }) {
    // console.log(markdownData)
  const [loading, setLoading] = useState(true);
  // console.log(markdownData)

  // Configure outMath options for math rendering
  const outMath = {
    include_svg: true,
    include_smiles: true,
    include_asciimath: true,
    include_latex: true,
    include_mathml: true,
    include_mathml_word: true,
  };

  // Configure accessibility options with SRE
  const accessibility = {
    assistiveMml: true,
    sre: loadSre(),
  };

  // Wait until the SRE engine is ready before rendering math content
  useEffect(() => {
    accessibility.sre.engineReady().finally(() => {
      setLoading(false);
    });
  }, [accessibility.sre]);

  // Add context menu event listeners on mount and remove them on unmount
  useEffect(() => {
    addListenerContextMenuEvents();
    return () => {
      removeListenerContextMenuEvents();
    };
  }, []);

  if (loading) {
    return <div>Loading accessibility engine...</div>;
  }

  return (
    <MathpixLoader>
      <div className="markdown-content">
        <MathpixMarkdown 
          text={markdownData} 
          outMath={outMath} 
          accessibility={accessibility} 
        />
      </div>
    </MathpixLoader>
  );
}
