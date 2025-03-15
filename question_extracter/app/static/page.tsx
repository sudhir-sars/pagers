"use client";
import { useState } from 'react';
import MathpixRenderer from '@/component/mathpixRenderer/MathpixRenderer';

export default function Home() {
    const inputText = `\\quad \\Lambda_{\\mathrm{C}}^{+2}=57 \\mathrm{Scm}^{2} \\mathrm{~mol}^{-1}$\n$\\Lambda_{\\mathrm{A}}^{+2}=73 \\mathrm{Scm}^{2} \\mathrm{~mol}^{-1}$\n$\\Lambda_{\\text {Solution }}=\\lambda_{\\mathrm{C}}^{+2}+\\Lambda_{\\mathrm{A}}^{-2}$\n$=57+73=130$`;


  return <MathpixRenderer markdownData={inputText} />;
}
