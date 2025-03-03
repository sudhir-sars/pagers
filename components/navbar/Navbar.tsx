'use client';
import Link from 'next/link';
import { ThemeToggle } from '../Theme/ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { CiSearch } from 'react-icons/ci';
import MessagesDialog from '../messages/MessagesDialog';
import MoreDropdown from '@/components/navbar/MoreDropdown';
import { IoNotificationsOutline } from 'react-icons/io5';
import { ScrollArea } from '@/components/ui/scroll-area';

// Dummy notifications data
const dummyNotifications = [
  { id: '1', message: 'Your order has been shipped!', time: '2 hrs ago' },
  { id: '2', message: 'New comment on your post.', time: '3 hrs ago' },
  { id: '3', message: 'You have a new follower.', time: '5 hrs ago' },
  {
    id: '4',
    message: 'Your subscription is about to expire.',
    time: '1 day ago',
  },
  { id: '5', message: 'Weekly digest is here!', time: '2 days ago' },
];

// Badge component to show unread count
const Badge = ({ count }: { count: number }) => (
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
    {count}
  </span>
);

interface NavbarProps {
  onViewChange: (
    view: 'profile' | 'settings' | 'project-create' | 'notifications'
  ) => void;
}

// Navigation links component
const NavLinks = ({
  onViewChange,
}: {
  onViewChange: NavbarProps['onViewChange'];
}) => {
  const unreadCount = dummyNotifications.length;

  return (
    <>
      <button
        onClick={() => onViewChange('notifications')}
        className="relative p-2 rounded-full hover:bg-gray-200"
      >
        <IoNotificationsOutline size={24} />
        {unreadCount > 0 && <Badge count={unreadCount} />}
      </button>
      <MessagesDialog />
      <MoreDropdown />
      <ThemeToggle />
    </>
  );
};

const Navbar = ({ onViewChange }: NavbarProps) => {
  return (
    <header className="rounded-b-2xl border-r border-l fixed top-0 left-1/2 transform -translate-x-1/2 w-[75vw] flex items-center justify-between px-4 lg:px-6 h-14 border-b z-50 border-border/40 bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      {/* Logo and Link */}
      <Link href="/" className="flex items-center" prefetch={false}>
        <div className="h-8 w-8">{/* Insert your logo image here */}</div>
        <span className="text-xl font-bold ml-3 md:inline">Pager</span>
      </Link>

      {/* Search Input */}
      <div className="flex items-center justify-start w-[25vw] ml-36 shadow-inner text-sm px-4 border rounded-xl border-border">
        <CiSearch size={20} />
        <Input className="border-none outline-none shadow-none focus-visible:ring-0 py-0 h-8" />
      </div>

      {/* Desktop Nav Links */}
      <nav className="hidden md:flex items-center space-x-6">
        <NavLinks onViewChange={onViewChange} />
      </nav>

      {/* Mobile Menu */}
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
            <NavLinks onViewChange={onViewChange} />
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Navbar;
