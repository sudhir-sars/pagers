"use client";
import { useState } from 'react';
import MathpixRenderer from '@/component/mathpixRenderer/MathpixRenderer';

export default function Home() {
  const [fileId, setFileId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'text/markdown') {
      setError('Please upload a .md file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.fileId) {
        setFileId(data.fileId);
        setError(null);
      } else {
        setError(data.error || 'File upload failed');
      }
    } catch (err) {
      setError('Error uploading file');
    }
  };

  const processWithModel = async (model: string) => {
    if (!fileId) {
      setError('Please upload a file first');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/structurate/${model}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });
      const data = await response.json();
      if (data.questions) {
        console.log(data.questions);
        setQuestions(data.questions);
      } else {
        setError(data.error || 'Processing failed');
      }
    } catch (err) {
      setError('Error processing file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Upload and Process Markdown Questions</h1>
      <input type="file" accept=".md" onChange={handleUpload} />
      {fileId && (
        <div className="space-x-6">
          <button onClick={() => processWithModel('gemini')} disabled={loading}>
            Gemini
          </button>
          <button onClick={() => processWithModel('ollma')} disabled={loading}>
            Ollama
          </button>
          <button onClick={() => processWithModel('gpt')} disabled={loading}>
            GPT
          </button>
        </div>
      )}
      {loading && <p>Processing...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {questions.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Processed Questions</h2>
          {questions.map((q, index) => (
            <div
              key={index}
              style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}
            >
              <h3>Question {q.question_number}</h3>
              <p>
                {/* <strong>Subject:</strong> {q.subject} */}
              </p>
              <div>
                <strong>Content:</strong>{' '}
                <MathpixRenderer markdownData={q.content} />
              </div>
              <p>
                <strong>Type:</strong>{' '}
                {q.type === 'multiple_choice' ? 'Multiple Choice' : 'Numerical'}
              </p>
              <div>
                <strong>Options:</strong>
                {q.options.map((option, idx) => (
                  <div key={idx} className="ml-4 mt-1 flex items-center">
                    
                    {option.option_id && <MathpixRenderer markdownData={JSON.stringify(option.option_id)} />}

                    {option.content && <MathpixRenderer markdownData={option.content} />}
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
