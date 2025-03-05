'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import FeedPost from '@/components/feed/FeedPost';
import { IUserProfile, PostActionType } from '@/lib/types';
import { FaGithub, FaMapMarkerAlt, FaUniversity } from 'react-icons/fa';
import { SiCodeforces } from 'react-icons/si';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProfileViewProps {
  isOwnProfile?: boolean;
  id?: string;
}

export default function ProfileView({
  isOwnProfile = true,
  id,
}: ProfileViewProps) {
  const getToken = () => localStorage.getItem('JWT_token');
  const token = getToken();

  // If there is no id in params, we assume it's the logged in user's own profile.
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const endpoint = !isOwnProfile
          ? `/api/profile/?id=${id}`
          : '/api/profile';
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (isOwnProfile) {
          headers['id'] = `Bearer ${token}`;
        }

        const res = await fetch(endpoint, { headers });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data.profile);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) return <div>Loading Profile...</div>;
  if (!profile) return <div>No profile data available</div>;

  const handleAddEducation = async (newEdu: {
    degreeName: string;
    institution: string;
    startDate: string;
    endDate?: string | null;
    description: string;
  }) => {
    try {
      const res = await fetch('/api/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEdu),
      });
      if (!res.ok) throw new Error('Failed to add education');
      const data = await res.json();
      setProfile((prevProfile) =>
        prevProfile
          ? {
              ...prevProfile,
              education: [...prevProfile.education, data.education],
            }
          : prevProfile
      );
      setShowEducationForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddExperience = async (newExp: {
    title: string;
    company: string;
    startDate: string;
    endDate?: string | null;
    description: string;
  }) => {
    try {
      const res = await fetch('/api/experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newExp),
      });
      if (!res.ok) throw new Error('Failed to add experience');
      const data = await res.json();
      setProfile((prevProfile) =>
        prevProfile
          ? {
              ...prevProfile,
              experiences: [...prevProfile.experiences, data.experience],
            }
          : prevProfile
      );
      setShowExperienceForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-10">
      {/* Hero Section */}
      <div className="rounded-3xl p-8 w-[50vw] border border-border">
        <div className="flex items-center">
          <div className="relative w-32 h-32 rounded-full flex-shrink-0 border border-[#FFD700]">
            <Image
              src={profile.image}
              alt={profile.name}
              height={400}
              width={400}
              className="rounded-full p-1 object-cover"
            />
          </div>
          <div className="ml-8 flex items-start">
            <div>
              <h1 className="text-4xl font-bold">
                {profile.name
                  .split(' ')
                  .map((word, index, array) =>
                    index === 0 || index === array.length - 1
                      ? word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                      : word
                  )
                  .join(' ')}
              </h1>
              <p className="text-xl capitalize">{profile.title}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-sm">
          <div className="mt-4 space-y-3">
            {profile.location && (
              <p className="mt-1 flex items-center">
                <FaMapMarkerAlt size={18} className="mr-2" />
                {profile.location}
              </p>
            )}
            {profile.university && (
              <p className="mt-1 flex items-center">
                <FaUniversity size={18} className="mr-2" />
                {profile.university}
              </p>
            )}
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center mt-1 hover:text-gray-200"
              >
                <FaGithub size={18} className="mr-2" />
                {profile.github}
              </a>
            )}
            {profile.codeforces && (
              <a
                href={profile.codeforces}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center mt-1 hover:text-gray-200"
              >
                <SiCodeforces size={18} className="mr-2" />
                {profile.codeforces}
              </a>
            )}
          </div>
          <div className="w-full border-b mt-6"></div>
          <p className="text-lg mt-10">{profile.bio}</p>
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-10">
        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Education</h2>
          {profile.education && profile.education.length > 0 ? (
            <div className="space-y-4">
              {profile.education.map((edu) => (
                <div key={edu.id} className="p-4 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold">{edu.degreeName}</h3>
                  <p className="text-gray-700">{edu.institution}</p>
                  <p className="text-gray-600 text-sm">
                    {new Date(edu.startDate).toLocaleDateString()} -{' '}
                    {edu.endDate
                      ? new Date(edu.endDate).toLocaleDateString()
                      : 'Present'}
                  </p>
                  <p className="mt-2">{edu.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <p>No education added yet.</p>
              {/* Only show add button if it is the user's own profile */}
              {isOwnProfile && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setShowEducationForm(true)}
                    className="mt-2"
                  >
                    Add Education
                  </Button>
                  {showEducationForm && (
                    <EducationForm
                      onSubmit={handleAddEducation}
                      onCancel={() => setShowEducationForm(false)}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Experience */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Experience</h2>
          {profile.experiences && profile.experiences.length > 0 ? (
            <div className="space-y-4">
              {profile.experiences.map((exp) => (
                <div key={exp.id} className="p-4 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold">{exp.title}</h3>
                  <p className="text-gray-700">{exp.company}</p>
                  <p className="text-gray-600 text-sm">
                    {new Date(exp.startDate).toLocaleDateString()} -{' '}
                    {exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString()
                      : 'Present'}
                  </p>
                  <p className="mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <p>No experience added yet.</p>
              {isOwnProfile && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setShowExperienceForm(true)}
                    className="mt-2"
                  >
                    Add Experience
                  </Button>
                  {showExperienceForm && (
                    <ExperienceForm
                      onSubmit={handleAddExperience}
                      onCancel={() => setShowExperienceForm(false)}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Your Posts */}
        <div>
          <div className="flex flex-col gap-6">
            {profile.posts && profile.posts.length > 0 ? (
              profile.posts.map((post) => {
                const userComment = post.comments.find(
                  (comment) => comment.author.userId === profile.userId
                );
                const userShared = post.actions.find(
                  (action) =>
                    action.actionType === PostActionType.SHARED &&
                    action.userProfileId === profile.id
                );
                const userLiked = post.actions.find(
                  (action) =>
                    action.actionType === PostActionType.LIKED &&
                    action.userProfileId === profile.id
                );
                let header = null;
                if (userComment) {
                  header = (
                    <div className="text-gray-600 text-sm">
                      You commented on this post on{' '}
                      {new Date(userComment.createdAt).toLocaleDateString()} and
                      said: <span className="italic">"{userComment.text}"</span>
                    </div>
                  );
                } else if (userShared) {
                  header = (
                    <div className="text-gray-600 text-sm">
                      You shared this post on{' '}
                      {new Date(userShared.createdAt).toLocaleDateString()}
                    </div>
                  );
                } else if (userLiked) {
                  header = (
                    <div className="text-gray-600 text-sm">
                      You liked this post on{' '}
                      {new Date(userLiked.createdAt).toLocaleDateString()}
                    </div>
                  );
                }
                return (
                  <div key={post.id} className="space-y-2">
                    {header}
                    <FeedPost post={post} />
                  </div>
                );
              })
            ) : (
              <div>No posts available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EducationForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: {
    degreeName: string;
    institution: string;
    startDate: string;
    endDate?: string | null;
    description: string;
  }) => void;
  onCancel: () => void;
}) {
  const [degreeName, setDegreeName] = useState('');
  const [institution, setInstitution] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      degreeName,
      institution,
      startDate,
      endDate: endDate || null,
      description,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 p-4 border rounded-lg"
    >
      <Input
        value={degreeName}
        onChange={(e) => setDegreeName(e.target.value)}
        placeholder="Degree Name"
        required
      />
      <Input
        value={institution}
        onChange={(e) => setInstitution(e.target.value)}
        placeholder="Institution"
        required
      />
      <div className="flex space-x-6">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
          required
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date (optional)"
        />
      </div>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        required
      />
      <div className="flex gap-2">
        <Button type="submit">Submit</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ExperienceForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: {
    title: string;
    company: string;
    startDate: string;
    endDate?: string | null;
    description: string;
  }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      company,
      startDate,
      endDate: endDate || null,
      description,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 p-4 border rounded-lg"
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Job Title"
        required
      />
      <Input
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company"
        required
      />
      <div className="flex space-x-6">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
          required
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date (optional)"
        />
      </div>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        required
      />
      <div className="flex gap-2">
        <Button type="submit">Submit</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
