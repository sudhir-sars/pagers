'use client';
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { IoSendOutline } from 'react-icons/io5';
import { CiImageOn } from 'react-icons/ci';

const predefinedTechStack = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'JavaScript',
  'Next.js',
  'Django',
  'PostgreSQL',
  'MongoDB',
  'GraphQL',
  'Tailwind CSS',
  'Docker',
];

const ComposeProject = ({
  onProjectSubmit,
}: {
  onProjectSubmit: () => void;
}) => {
  const [name, setName] = useState('');
  const [brief, setBrief] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [github, setGithub] = useState('');
  const [liveLink, setLiveLink] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddMediaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 10);
      setSelectedFiles(filesArray);
      const urls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleTechStackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTech = e.target.value
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '' && !techStack.includes(t));
    setTechStack((prev) => [...prev, ...newTech]);
  };

  const addTechToStack = (tech: string) => {
    if (!techStack.includes(tech)) {
      setTechStack((prev) => [...prev, tech]);
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTags = e.target.value
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '' && !tags.includes(t));
    setTags((prev) => [...prev, ...newTags]);
  };

  const handleSubmit = async () => {
    if (
      !name.trim() ||
      !brief.trim() ||
      !description.trim() ||
      !github.trim()
    ) {
      setError('All fields except Live Link and media are required.');
      return;
    }

    const token = localStorage.getItem('JWT_token');
    if (!token) {
      console.error('No auth token found');
      setError('Authentication required.');
      return;
    }

    let mediaData: {
      url: string;
      type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'GIF';
      order: number;
    }[] = [];
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('files', file));

      try {
        const uploadResponse = await fetch('/api/project/upload-media', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const uploadedFiles = await uploadResponse.json();
        if (uploadResponse.ok) {
          mediaData = uploadedFiles.urls.map((url: string, index: number) => ({
            url,
            type: getFileType(selectedFiles[index].type),
            order: index,
          }));
        } else {
          console.error('Upload failed', uploadedFiles);
          setError('Failed to upload media.');
          return;
        }
      } catch (error) {
        console.error('Error uploading files', error);
        setError('Error uploading media.');
        return;
      }
    }

    const projectData = {
      name,
      brief,
      description,
      techStack,
      github,
      liveLink: liveLink || undefined,
      tags,
      media: mediaData.length > 0 ? mediaData : undefined,
    };

    try {
      const response = await fetch('/api/project/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        onProjectSubmit();
        setName('');
        setBrief('');
        setDescription('');
        setTechStack([]);
        setGithub('');
        setLiveLink('');
        setTags([]);
        setSelectedFiles([]);
        setPreviewUrls([]);
        setError(null);
      } else {
        console.error('Failed to submit project', await response.json());
        setError('Failed to create project.');
      }
    } catch (error) {
      console.error('Error submitting project', error);
      setError('Error submitting project.');
    }
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType.startsWith('audio/')) return 'AUDIO';
    if (mimeType.includes('gif')) return 'GIF';
    return 'IMAGE';
  };

  return (
    <section className="w-[50vw] max-w-5xl mx-auto mb-4">
      <Card className="w-full border-none shadow-lg">
        {/* Cover Image */}
        <div className="relative h-48 w-full bg-gray-200">
          {previewUrls.length > 0 ? (
            <Image
              src={previewUrls[0] || 'https://placehold.co/600x400'} // Use the first uploaded image as cover
              alt="Project cover"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-t-lg"
            />
          ) : (
            <Image
              src="/placeholder-project-cover.jpg" // Replace with your dummy image path
              alt="Placeholder cover"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-t-lg opacity-50"
            />
          )}
        </div>
        <CardContent className="p-6 space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="brief">Brief</Label>
            <Textarea
              id="brief"
              placeholder="A short summary of your project"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of your project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="techStack">Tech Stack</Label>
            <Input
              id="techStack"
              type="text"
              placeholder="Add tech stack separated by commas"
              value={''} // Clear input after adding
              onChange={handleTechStackChange}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {predefinedTechStack.map((tech, index) =>
                !techStack.includes(tech) ? (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => addTechToStack(tech)}
                  >
                    + {tech}
                  </Button>
                ) : null
              )}
              {techStack.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tech}
                  <button
                    className="ml-1 text-red-500"
                    onClick={() =>
                      setTechStack(techStack.filter((t) => t !== tech))
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="github">GitHub URL (Required)</Label>
            <Input
              id="github"
              type="url"
              placeholder="https://github.com/username/repo"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="liveLink">Live Link (Optional)</Label>
            <Input
              id="liveLink"
              type="url"
              placeholder="https://yourproject.com"
              value={liveLink}
              onChange={(e) => setLiveLink(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              type="text"
              placeholder="Add tags separated by commas"
              value={''} // Clear input after adding
              onChange={handleTagsChange}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    className="ml-1 text-red-500"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          {selectedFiles.length > 0 && (
            <div>
              <Label>Uploaded Media</Label>
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
            </div>
            <Button variant="outline" className="pr-6" onClick={handleSubmit}>
              <IoSendOutline className="mr-2" />
              Create Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ComposeProject;
