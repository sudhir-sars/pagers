'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IUserProfile } from '@/lib/types';
import { predefinedSkills } from '@/lib/dummyVars';

type IUserProfileForm = Pick<
  IUserProfile,
  | 'userId'
  | 'email'
  | 'alias'
  | 'image'
  | 'name'
  | 'title'
  | 'university'
  | 'bio'
  | 'location'
  | 'github'
  | 'codeforces'
  | 'skills'
>;

const ProfileSetup = () => {
  const [profileData, setProfileData] = useState<IUserProfileForm>({
    userId: '',
    image: '',
    name: '',
    title: '',
    university: '',
    bio: '',
    location: '',
    github: '',
    codeforces: '',
    skills: [],
    email: '',
    alias: '',
  });

  const [aliasCheckStatus, setAliasCheckStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initialName = searchParams.get('name');
    const initialImage = searchParams.get('image');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (initialName && initialImage && userId && email) {
      setProfileData((prevData) => ({
        ...prevData,
        name: initialName,
        email,
        image: initialImage,
        userId,
      }));
    }
  }, [searchParams]);

  // Handle alias input change
  const handleAliasChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const aliasValue = e.target.value;
    setProfileData((prev) => ({ ...prev, alias: aliasValue }));

    if (aliasValue.length >= 4) {
      try {
        const response = await fetch(
          `/api/profile/check-alias?alias=${aliasValue}`
        );
        const data = await response.json();

        if (data.isAvailable) {
          setAliasCheckStatus('Available');
        } else {
          setAliasCheckStatus('Alias is already taken');
        }
      } catch (error) {
        setAliasCheckStatus('Error checking alias availability');
      }
    } else {
      setAliasCheckStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let token = localStorage.getItem('JWT_token');

    if (!token) {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('JWT_token');
      if (token) {
        // Optionally clean URL if token is found
      }
    }

    if (!token) {
      toast.warning('Token not found', {
        description: 'Please provide a valid token.',
      });
      return;
    }

    try {
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        toast.error(errorResult.statusText || 'Failed to create profile');
        return;
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Profile created', {
          description: 'Your profile has been saved successfully.',
        });
        localStorage.setItem('JWT_token', token);
        localStorage.setItem('userId', profileData.userId);
        router.push('/');
      } else {
        toast.error(result.statusText || 'Failed to create profile');
      }
    } catch (error) {
      toast.error(
        'Error creating profile: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  };

  const addSkillToInput = (skill: string) => {
    if (!profileData.skills.includes(skill)) {
      setProfileData((prevData) => ({
        ...prevData,
        skills: [...prevData.skills, skill],
      }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setProfileData((prevData) => ({
          ...prevData,
          image: imageUrl,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 flex flex-col items-center">
      <ScrollArea className="h-[70vh] w-full p-4">
        <div className="flex items-center justify-center space-x-4">
          <Avatar className="h-32 w-32 mb-4">
            <AvatarImage src={profileData.image} />
            <AvatarFallback>
              {profileData.name ? profileData.name.charAt(0) : ''}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" onClick={handleFileInputClick}>
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-3">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your full name"
              value={profileData.name}
              disabled
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Your email address"
              value={profileData.email}
              disabled
            />
          </div>

          <div>
            <Label htmlFor="alias">Alias</Label>
            <Input
              id="alias"
              type="text"
              placeholder="Your alias (at least 4 characters)"
              value={profileData.alias}
              onChange={handleAliasChange}
            />
            {aliasCheckStatus && (
              <p
                className={`mt-2 text-sm ${
                  aliasCheckStatus === 'Available'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {aliasCheckStatus}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Your professional title"
              value={profileData.title}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="university">University</Label>
            <Input
              id="university"
              type="text"
              placeholder="Your university"
              value={profileData.university}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  university: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself"
              value={profileData.bio}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, bio: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              placeholder="Your location"
              value={profileData.location}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              type="text"
              placeholder="Your GitHub username or URL"
              value={profileData.github}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, github: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="codeforces">Codeforces</Label>
            <Input
              id="codeforces"
              type="text"
              placeholder="Your Codeforces handle"
              value={profileData.codeforces}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  codeforces: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="skills">Skills</Label>
            <Input
              id="skills"
              type="text"
              placeholder="Add your skills separated by commas"
              value={profileData.skills.join(', ')}
              onChange={(e) => {
                const newSkills = e.target.value
                  .split(',')
                  .map((skill) => skill.trim())
                  .filter(
                    (skill) =>
                      skill !== '' && !profileData.skills.includes(skill)
                  );
                setProfileData((prev) => ({ ...prev, skills: newSkills }));
              }}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {predefinedSkills.map((skill, index) =>
                !profileData.skills.includes(skill) ? (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      addSkillToInput(skill);
                    }}
                  >
                    + {skill}
                  </Button>
                ) : null
              )}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Profile
          </Button>
        </form>
      </ScrollArea>
    </div>
  );
};

export default ProfileSetup;
