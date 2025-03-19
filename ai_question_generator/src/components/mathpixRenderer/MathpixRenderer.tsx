"use client";
import { useEffect, useState } from 'react';
import { MathpixLoader, MathpixMarkdown } from 'mathpix-markdown-it';
import {
  addListenerContextMenuEvents,
  removeListenerContextMenuEvents,
} from "mathpix-markdown-it/lib/contex-menu";
import { loadSre } from "mathpix-markdown-it/lib/sre/sre-browser";

export default function MathpixRenderer({ markdownData }) {


  // Configure outMath options for math rendering
  const outMath = {
    include_svg: true,
    include_smiles: true,
    include_asciimath: true,
    include_latex: true,
    include_mathml: true,
    include_mathml_word: true,
  };



  return (
    <MathpixLoader>
  <div className="markdown-content 
                max-w-[600px]
                whitespace-pre-wrap 
                break-words 
                overflow-x-auto">
  <MathpixMarkdown text={markdownData} outMath={outMath} />
</div>



    </MathpixLoader>
  );
}
