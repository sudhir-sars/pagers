'use client';
import Link from 'next/link';
import { ThemeToggle } from '../Theme/ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { CiSearch } from 'react-icons/ci';
import { IoNotificationsOutline } from 'react-icons/io5';
import { FiMessageSquare } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { IUser } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNotifications } from '@/context/NotificationContext';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '../ui/button';

// Badge component to show unread count
const Badge = ({ count }: { count: number }) => (
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
    {count}
  </span>
);

interface NavbarProps {
  onViewChange?: (
    view: 'profile' | 'settings' | 'project-create' | 'notifications'
  ) => void;
  onMessageClick?: (target?: IUser) => void;
  onFeedTypeChange?: (
    feedType: 'home' | 'following' | 'projects' | 'editors-choice'
  ) => void;
  searchInput?: string;
  setSearchInput?: (input: string) => void;
}

const getLocalStorageItem = (key: string) =>
  typeof window !== 'undefined' ? localStorage.getItem(key) : null;
const getToken = () => getLocalStorageItem('JWT_token');

const Navbar = ({
  onViewChange,
  onMessageClick,
  onFeedTypeChange,
  searchInput,
  setSearchInput,
}: NavbarProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = getToken();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  const authorized = (callback: () => void) => {
    if (token) {
      if (pathname !== '/') {
        router.push('/');
      }
      callback();
    } else {
      router.push('/login');
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data.profile);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleNotificationClick = () => {
    authorized(() => onViewChange?.('notifications'));
  };

  const handleMessageClick = () => {
    authorized(() => onMessageClick?.());
  };

  return (
    <header className="rounded-b-2xl border-r border-l fixed top-0 left-1/2 transform -translate-x-1/2 w-[75vw] flex items-center justify-between px-4 lg:px-6 h-14 border-b z-50 border-border/40 bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div
        onClick={() => authorized(() => onFeedTypeChange?.('home'))}
        className="flex items-center cursor-pointer"
      >
        <div className="h-8 w-8">{/* Insert your logo image here */}</div>
        <span className="text-xl font-bold ml-3 md:inline">Pager</span>
      </div>

      <div className="flex items-center justify-start w-[25vw] ml-36 shadow-inner text-sm px-4 border rounded-xl border-border">
        <button type="submit" aria-label="Search">
          <CiSearch size={20} />
        </button>
        <Input
          disabled={!searchInput || !setSearchInput}
          value={searchInput}
          onChange={(e) => setSearchInput && setSearchInput(e.target.value)}
          className="border-none outline-none shadow-none focus-visible:ring-0 py-0 h-8"
          placeholder="Search..."
        />
      </div>

      <nav className="hidden md:flex items-center space-x-6">
        <button
          onClick={handleNotificationClick}
          className="relative p-2 rounded-full hover:bg-gray-200"
        >
          <IoNotificationsOutline size={24} />
          {unreadCount > 0 && <Badge count={unreadCount} />}
        </button>
        <button className="hover:text-blue-600" onClick={handleMessageClick}>
          <FiMessageSquare size={20} />
        </button>
        {!loading &&
          (token && profile && profile.image ? (
            <Avatar className="w-8 h-8 shadow-lg">
              <AvatarImage src={profile.image} alt="User Avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          ) : (
            <Link href="/login">
              <Button variant={'outline'}>Signup</Button>
            </Link>
          ))}
        <ThemeToggle />
      </nav>

      <Sheet>
        <SheetTrigger asChild>
          <button className="md:hidden">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </SheetTrigger>
        <SheetContent>
          <nav className="flex flex-col space-y-4 mt-6">
            {!loading &&
              (token && profile && profile.image ? (
                <Avatar className="w-8 h-8 shadow-lg">
                  <AvatarImage src={profile.image} alt="User Avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              ) : (
                <Link href="/login">
                  <Button variant={'outline'}>Signup</Button>
                </Link>
              ))}
            <button
              onClick={handleNotificationClick}
              className="relative p-2 rounded-full hover:bg-gray-200"
            >
              <IoNotificationsOutline size={24} />
              {unreadCount > 0 && <Badge count={unreadCount} />}
            </button>
            <button
              className="hover:text-blue-600"
              onClick={handleMessageClick}
            >
              <FiMessageSquare size={20} />
            </button>
            <ThemeToggle />
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Navbar;
