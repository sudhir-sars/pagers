'use client';
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IoSendOutline } from 'react-icons/io5';
import { CiImageOn } from 'react-icons/ci';
import { BiPoll } from 'react-icons/bi';

const ComposePost = ({
  onPostSubmit,
}: {
  onPostSubmit: (postData: {
    content: string;
    media?: {
      url: string;
      type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'GIF';
      altText?: string;
      order?: number;
    }[];
    poll?: { question: string; options: string[] };
  }) => void;
}) => {
  const [postContent, setPostContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showPollInput, setShowPollInput] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  // Start with two poll options inputs.
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  // Create a ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPostContent(event.target.value);
  };

  // Trigger the file dialog
  const handleAddMediaClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection and create preview URLs
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert FileList to array and limit to 10 files
      const filesArray = Array.from(e.target.files).slice(0, 10);
      setSelectedFiles(filesArray);
      const urls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  // Revoke object URLs on cleanup to avoid memory leaks
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleSubmit = async () => {
    if (postContent.trim()) {
      let mediaData = [];

      // Retrieve the JWT token from storage (or use your auth context)
      const token = localStorage.getItem('JWT_token');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });

        try {
          const uploadResponse = await fetch('/api/post/upload-images', {
            method: 'POST',
            headers: {
              // Include auth header for the upload API
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          const uploadedFiles = await uploadResponse.json();

          if (uploadResponse.ok) {
            mediaData = uploadedFiles.urls.map((url, index) => ({
              url,
              type: getFileType(selectedFiles[index].type), // Dynamically determine file type
              order: index,
            }));
          } else {
            console.error('Upload failed', uploadedFiles);
            return;
          }
        } catch (error) {
          console.error('Error uploading files', error);
          return;
        }
      }

      const postData = {
        content: postContent,
        media: mediaData.length > 0 ? mediaData : undefined,
        poll:
          showPollInput &&
          pollQuestion.trim() &&
          pollOptions.filter((opt) => opt.trim() !== '').length >= 2
            ? {
                question: pollQuestion,
                options: pollOptions.filter((opt) => opt.trim() !== ''),
              }
            : undefined,
      };

      try {
        const response = await fetch('/api/post/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Include auth header for the create post API
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(postData),
        });

        if (response.ok) {
          onPostSubmit(postData);
          setPostContent('');
          setSelectedFiles([]);
          setPreviewUrls([]);
          setPollQuestion('');
          setPollOptions(['', '']);
          setShowPollInput(false);
        } else {
          console.error('Failed to submit post', await response.json());
        }
      } catch (error) {
        console.error('Error submitting post', error);
      }
    }
  };

  // Utility function to determine file type
  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType.startsWith('audio/')) return 'AUDIO';
    if (mimeType.includes('gif')) return 'GIF';
    return 'OTHER';
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const updatedOptions = [...pollOptions];
    updatedOptions[index] = value;
    setPollOptions(updatedOptions);
  };

  return (
    <section className="mb-4">
      <Card className="px-0 border-none shadow-none">
        <div className="flex items-center space-x-3">
          <Input
            className="py-8"
            type="text"
            placeholder="What's on your mind..."
            value={postContent}
            onChange={handleContentChange}
          />
        </div>
        <CardContent className="mt-2">
          {selectedFiles.length > 0 && (
            <div className="mb-2">
              <p className="text-sm">
                Selected files:{' '}
                {selectedFiles.map((file) => file.name).join(', ')}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative h-40 w-full">
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          {showPollInput && (
            <div className="mb-2 flex flex-col gap-2">
              <Input
                type="text"
                placeholder="Enter poll question"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
              />
              {pollOptions.map((option, index) => (
                <Input
                  key={index}
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) =>
                    handlePollOptionChange(index, e.target.value)
                  }
                />
              ))}
              <Button
                variant="outline"
                onClick={handleAddPollOption}
                disabled={pollOptions.length >= 5}
              >
                Add Option
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
                onClick={handleAddMediaClick}
              >
                <CiImageOn size={30} />
                <span className="text-sm">Add Media</span>
              </button>
              <button
                type="button"
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
                onClick={() => setShowPollInput((prev) => !prev)}
              >
                <BiPoll size={30} />
                <span className="text-sm">Poll</span>
              </button>
            </div>

            <Button variant="outline" className="pr-6" onClick={handleSubmit}>
              <IoSendOutline />
              Post
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ComposePost;
