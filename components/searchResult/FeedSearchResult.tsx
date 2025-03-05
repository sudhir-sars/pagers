'use client';

import { useState, useEffect } from 'react';
import { IUser, IPost, IProjectProfile } from '@/lib/types';
import FeedPost from '../feed/FeedPost';
import UserCard from '../card/UserCard';
// Define types for search results based on API response
interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface PostSearchResult {
  id: number;
  brief: string;
  author: {
    name: string;
    image: string;
  };
}

interface ProjectSearchResult {
  id: string;
  name: string;
  brief: string;
  projectLead: {
    name: string;
    image: string;
  };
}

interface FeedSearchResultProps {
  query: string;
  followedUserIds: string[];
  updateFollowList: (userId: string, isFollowing: boolean) => void;
  likedPostIds: number[];
  shareUsers: { id: string; name: string; image: string }[];
}

const FeedSearchResult: React.FC<FeedSearchResultProps> = ({
  query,
  followedUserIds,
  updateFollowList,
  likedPostIds,
  shareUsers,
}) => {
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [posts, setPosts] = useState<PostSearchResult[]>([]);
  const [projects, setProjects] = useState<ProjectSearchResult[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  const fetchSearchResults = async (pageNum: number) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('JWT_token');
      if (!token) throw new Error('No authentication token found');

      const res = await fetch(
        `/api/search?q=${encodeURIComponent(
          query
        )}&page=${pageNum}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await res.json();
      setUsers((prev) => [...prev, ...data.users.results]);
      setPosts((prev) => [...prev, ...data.posts.results]);
      setProjects((prev) => [...prev, ...data.projects.results]);
      setTotalUsers(data.users.total);
      setTotalPosts(data.posts.total);
      setTotalProjects(data.projects.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset and fetch initial results when query changes
  useEffect(() => {
    if (query) {
      setUsers([]);
      setPosts([]);
      setProjects([]);
      setPage(1);
      fetchSearchResults(1);
    }
  }, [query]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSearchResults(nextPage);
  };

  // Determine if there are more results to load
  const hasMore =
    users.length < totalUsers ||
    posts.length < totalPosts ||
    projects.length < totalProjects;

  if (loading && page === 1) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2>Search Results for &quot;{query}&quot;</h2>

      <section>
        {users.length > 0 && (
          <div className="flex flex-col gap-4">
            {users.map((user, index) => (
              <UserCard
                key={index}
                user={user}
                initialIsFollowing={followedUserIds.includes(user.id)}
                updateFollowList={updateFollowList}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        {posts.length > 0 && (
          <div className="flex flex-col gap-4">
            {posts.map((post, index) => (
              <FeedPost
                key={index}
                post={post}
                followedUserIds={followedUserIds}
                updateFollowList={updateFollowList}
                likedPostIds={likedPostIds}
                shareUsers={shareUsers}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        {projects.length > 0 && (
          <ul>
            {projects.map((project) => (
              <li key={project.id}>
                <span>{project.name}</span>: <span>{project.brief}</span> -{' '}
                <span>Lead by {project.projectLead.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {hasMore && (
        <button onClick={handleLoadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default FeedSearchResult;
