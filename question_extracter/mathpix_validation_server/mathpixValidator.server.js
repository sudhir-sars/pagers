import { MathpixMarkdownModel, ParserErrors } from 'mathpix-markdown-it';
import { JSDOM } from 'jsdom';

if (typeof window === 'undefined') {
  const dom = new JSDOM('<!DOCTYPE html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.DOMParser = dom.window.DOMParser;
}

let total_req=1
export async function mathpixValidator(inputText) {
  const options = { parserErrors: ParserErrors.hide };
  // console.log("Input:", inputText);

  const html = MathpixMarkdownModel.markdownToHTML(inputText, options);
  const checkRegex = /\\quad|\\Lambda|\\tag|\\begin|\\mathrm|\\hline|\\end|\\frac|\\bullet|\\alpha|\\sqrt|\\leq|\\right|\\left|\\vec|\\pm|\\sum|\\ldots|\\log|\\int|\\theta|\\max|\\mathbb|\\mathbf|\\sim|\\mathcal|\\label|\\ref|\\eqref|\\title|\\author|\\section|\\subsection|\\subsubsection|\\textit|\\textbf|\\url|\\item|\\includegraphics|\\pagebreak|math-error/gi;
  
  const matches = html.match(checkRegex);
  let errorDetected = false; // Fix: Use boolean instead of string

  if (matches && matches.length > 0) {
    errorDetected = true;
  }

  let dollarCount = 0;
  for (let i = 0; i < inputText.length; i++) {
    if (inputText[i] === '$') {
      dollarCount++;
      if (i + 1 < inputText.length && inputText[i + 1] === '$') {
        i++; // Skip next '$' if it's a double
      }
    }
  }

  if (dollarCount % 2 !== 0) {
    errorDetected = true;
    
  }
  // console.log("total_req: ",total_req)

  return !errorDetected; // Fix: Ensure boolean return type
}
