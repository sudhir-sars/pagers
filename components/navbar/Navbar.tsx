// components/navbar/Navbar.tsx
'use client';
import Link from 'next/link';
import { ThemeToggle } from '../Theme/ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { CiSearch } from 'react-icons/ci';
import NotificationsDropdown from '@/components/navbar/NotificationsDropdown';
import MessagesDialog from '../messages/MessagesDialog';
import MoreDropdown from '@/components/navbar/MoreDropdown';

interface NavbarProps {
  onNavItemClick?: (view: 'feed' | 'messages') => void;
}

export default function Navbar({ onNavItemClick }: NavbarProps) {
  // Create a set of navigation buttons. You can adjust the styling as needed.
  const NavLinks = () => (
    <>
      <button
        onClick={() => onNavItemClick?.('feed')}
        className="px-3 py-2 hover:bg-gray-100 rounded"
      ></button>
      <NotificationsDropdown />
      <MessagesDialog />
      <MoreDropdown />
      <ThemeToggle />
    </>
  );

  return (
    <header className="rounded-b-2xl border-r border-l fixed top-0 left-1/2 transform -translate-x-1/2 w-[75vw] flex items-center justify-between px-4 lg:px-6 h-14 border-b z-50 border-border/40 bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <Link href="/" className="flex items-center" prefetch={false}>
        <div className="h-8 w-8">{/* Insert your logo image here */}</div>
        <span className="text-xl font-bold ml-3 md:inline">Pager</span>
      </Link>
      <div className="flex items-center justify-start w-[25vw] ml-36 shadow-inner text-sm px-4 border rounded-xl border-border">
        <CiSearch size={20} />
        <Input className="border-none outline-none shadow-none focus-visible:ring-0 py-0 h-8" />
      </div>

      <nav className="hidden md:flex items-center space-x-6">
        <NavLinks />
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
            <NavLinks />
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
