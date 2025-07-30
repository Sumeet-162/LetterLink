import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Mail, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Heart, 
  Home, 
  Users, 
  FileText, 
  PenTool,
  HelpCircle,
  Info
} from "lucide-react";
import "@/styles/fonts.css";

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/write", label: "Compose", icon: PenTool },
  { href: "/inbox", label: "Inbox", icon: Mail },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/drafts", label: "Drafts", icon: FileText },
];

// Logo component
const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="p-2 rounded-full bg-primary/10">
      <Heart className="h-5 w-5 text-primary" />
    </div>
    <span className="font-alata font-semibold text-lg text-primary">LetterLink</span>
  </div>
);

// Info menu component
const InfoMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Info className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Help & Info</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <HelpCircle className="h-4 w-4 mr-2" />
        Help Center
      </DropdownMenuItem>
      <DropdownMenuItem>
        <FileText className="h-4 w-4 mr-2" />
        Guidelines
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Info className="h-4 w-4 mr-2" />
        About LetterLink
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Notification menu component
const NotificationMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8 relative">
        <Bell className="h-4 w-4" />
        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-primary">
          3
        </Badge>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80">
      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <Mail className="h-4 w-4 mr-2" />
        New letter from Tokyo
        <Badge variant="secondary" className="ml-auto">2h</Badge>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Users className="h-4 w-4 mr-2" />
        Friend request from Elena
        <Badge variant="secondary" className="ml-auto">1d</Badge>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <PenTool className="h-4 w-4 mr-2" />
        Your letter was delivered
        <Badge variant="secondary" className="ml-auto">3d</Badge>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// User menu component
const UserMenu = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/api/placeholder/32/32" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="h-4 w-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/95 backdrop-blur-md border-primary/10 px-4 md:px-6 shadow-sm">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-out group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-in-out group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-out group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      <NavigationMenuLink 
                        href={link.href} 
                        className="flex items-center gap-2 py-2 px-3 w-full rounded-md hover:bg-primary/10 transition-all duration-300 ease-in-out transform hover:scale-105"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(link.href);
                        }}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
          
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-primary hover:text-primary/90 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <Logo />
            </button>
            
            {/* Navigation menu */}
            <NavigationMenu className="max-md:hidden">
              <NavigationMenuList className="gap-2">
                {navigationLinks.map((link, index) => (
                  <NavigationMenuItem key={index}>
                    <NavigationMenuLink
                      href={link.href}
                      className={`flex items-center gap-2 py-2 px-3 rounded-md font-alata font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                        location.pathname === link.href
                          ? 'text-primary bg-primary/10 shadow-sm'
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(link.href);
                      }}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        
        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Info menu */}
            <InfoMenu />
            {/* Notification */}
            <NotificationMenu />
          </div>
          {/* User menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Navigation;
