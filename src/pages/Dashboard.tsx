import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, Globe, Heart, Users, Edit3, Send, FileText, PenTool, MessageSquare, Plus, Search, Flame, Star, Trophy, TrendingUp, Loader2 } from "lucide-react";
import { AnimateSvg } from "@/components/ui/AnimateSvg";
import Navigation from "@/components/Navigation";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated, getCurrentUserId } from "@/utils/auth";
import "@/styles/fonts.css";

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

interface Activity {
  _id: string;
  type: "received" | "sent";
  subject: string;
  content: string;
  sender: {
    name: string;
    username: string;
    country: string;
  };
  recipient: {
    name: string;
    username: string;
    country: string;
  };
  status: "sent" | "delivered" | "read";
  deliveredAt: string;
  readAt?: string;
  createdAt: string;
  timeAgo: string;
}

interface UserProfile {
  name?: string;
  country?: string;
  timezone?: string;
  friends?: number;
  lettersReceived?: number;
  lettersSent?: number;
  user?: {
    name?: string;
    country?: string;
    timezone?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface DashboardStats {
  incomingLetters: number;
  friendRequests: number;
  writingStreak: number;
  totalLetters: number;
  totalFriends: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for live data
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    incomingLetters: 0,
    friendRequests: 0,
    writingStreak: 0,
    totalLetters: 0,
    totalFriends: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Additional dashboard data (static for now, can be made dynamic later)
  const [trendingTopics] = useState([
    { topic: "Travel Adventures", count: 234 },
    { topic: "Local Food Culture", count: 189 },
    { topic: "Holiday Traditions", count: 156 },
    { topic: "City Life Stories", count: 142 }
  ]);

  const [featuredWriters] = useState([
    { name: "Sarah Chen", location: "Singapore", letters: 45, specialty: "Cultural stories" },
    { name: "Marco Rodriguez", location: "Mexico City", letters: 38, specialty: "Food & traditions" },
    { name: "Aisha Patel", location: "Mumbai", letters: 52, specialty: "Urban life" }
  ]);

  const [letterOfTheDay] = useState({
    title: "Morning Rituals Around the World",
    author: "Elena Kowalski",
    location: "Warsaw, Poland",
    excerpt: "Every morning at 6 AM, I watch my neighbor Mrs. Anna water her geraniums on the balcony across from mine. It's a ritual that connects us without words...",
    likes: 127
  });

  // Font combinations with Inter replacing Alata
  const headingClasses = "font-inter font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-inter font-medium tracking-wide text-foreground/80";

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!isAuthenticated()) {
          navigate('/signin');
          return;
        }

        setLoading(true);
        setError(null);

        // Fetch all necessary data in parallel
        const [inboxLetters, sentLetters, userProfileData, friendRequestsData, friendsData] = await Promise.all([
          api.getInboxLetters(),
          api.getSentLetters(),
          api.getProfile(),
          api.getFriendRequests(),
          api.getFriends()
        ]);

        // Process recent activity from both inbox and sent letters
        const currentUserId = getCurrentUserId();
        
        // Combine and sort recent letters
        const allRecentLetters = [
          ...inboxLetters.slice(0, 3).map((letter: any) => ({ ...letter, type: 'received' })),
          ...sentLetters.slice(0, 2).map((letter: any) => ({ ...letter, type: 'sent' }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        const activityData: Activity[] = allRecentLetters.map((letter: any) => ({
          _id: letter._id,
          type: letter.type,
          subject: letter.subject || (letter.type === 'received' ? 'Letter received' : 'Letter sent'),
          content: letter.content || '',
          sender: {
            name: letter.sender?.name || letter.sender?.username || 'Unknown',
            username: letter.sender?.username || '',
            country: letter.sender?.country || 'Unknown'
          },
          recipient: {
            name: letter.recipient?.name || letter.recipient?.username || 'Unknown',
            username: letter.recipient?.username || '',
            country: letter.recipient?.country || 'Unknown'
          },
          status: letter.status,
          deliveredAt: letter.deliveredAt,
          readAt: letter.readAt,
          createdAt: letter.createdAt,
          timeAgo: formatTimeAgo(letter.deliveredAt || letter.createdAt)
        }));

        setRecentActivity(activityData);
        
        // Update user profile with actual data
        console.log('Raw user profile data received:', userProfileData);
        console.log('Profile structure:', JSON.stringify(userProfileData, null, 2));
        
        // Try to extract the country from different possible locations
        const country = userProfileData?.country || 
                       userProfileData?.user?.country || 
                       userProfileData?.profile?.country;
        console.log('Extracted country:', country);
        
        setUserProfile(userProfileData);

        // Calculate dashboard stats with real data
        const unreadLettersCount = inboxLetters.filter((letter: any) => 
          letter.status === 'delivered' && !letter.readAt
        ).length;

        const pendingRequestsCount = Array.isArray(friendRequestsData) ? friendRequestsData.length : 0;
        const friendsCount = Array.isArray(friendsData) ? friendsData.length : 0;

        // Calculate writing streak (simple implementation - letters sent in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentSentLetters = sentLetters.filter((letter: any) => 
          new Date(letter.createdAt) > sevenDaysAgo
        );

        setDashboardStats({
          incomingLetters: unreadLettersCount,
          friendRequests: pendingRequestsCount,
          writingStreak: recentSentLetters.length,
          totalLetters: inboxLetters.length + sentLetters.length,
          totalFriends: friendsCount
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        toast({
          title: "Error loading dashboard",
          description: "Please refresh the page to try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, toast]);

  // User location and time data
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getUserLocationData = () => {
    let location = "Unknown location";
    let needsProfileCompletion = false;
    
    if (loading) {
      location = "Loading location...";
    } else if (userProfile) {
      // Try multiple possible locations for the country field
      const country = userProfile.country || 
                     userProfile.user?.country || 
                     userProfile.profile?.country;
      
      if (country) {
        location = country;
      } else if (userProfile.name || userProfile.user?.name) {
        // If we have user data but no country, show that profile needs completion
        location = "Profile incomplete";
        needsProfileCompletion = true;
      }
    }
    
    return {
      location,
      weather: "Partly cloudy, 22°C", // TODO: Integrate weather API
      greeting: getCurrentGreeting(),
      date: getCurrentDate(),
      needsProfileCompletion
    };
  };

  // Helper function to format time ago
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const letterDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - letterDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  };

  // Additional dashboard data
  const [writingStreak, setWritingStreak] = useState(dashboardStats.writingStreak);

  const renderTickIcon = (activity: Activity) => {
    if (activity.type === "received") return null;
    
    if (activity.status === "sent") {
      return <Clock className="h-4 w-4 text-orange-500" />;
    }
    
    if (activity.status === "read") {
      return (
        <div className="flex">
          <Mail className="h-4 w-4 text-blue-500 -mr-1" />
          <Mail className="h-4 w-4 text-blue-500" />
        </div>
      );
    }
    
    return <Mail className="h-4 w-4 text-gray-500" />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h2 className={`text-2xl ${headingClasses} mb-2`}>Loading Dashboard</h2>
              <p className={`${bodyClasses}`}>Fetching your latest letters and activity...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className={`text-2xl ${headingClasses} mb-2 text-red-600`}>Error Loading Dashboard</h2>
              <p className={`${bodyClasses} mb-4`}>{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userLocationData = getUserLocationData();

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Recent Activity Header */}
          <div className="text-left bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-letter border-none">
            <div className="flex items-center gap-4 mb-4">
              <h2 className={`text-3xl lg:text-4xl text-foreground ${headingClasses}`}>
                Recent Activity 
              </h2>
              <img className="h-20 w-20" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-v7to0FQpWGVK5703UVQOl7yFQm8qU7.png" alt="" />
            </div>
            <p className={`text-lg text-foreground/80 ${bodyClasses} mb-6`}>
              Your latest letter interactions and conversations
            </p>
            
            {/* User Location Details */}
            <div className="border-t border-primary/20 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/image-UbsvWWn2C9JrFY23BSpGoAekVwkvPX.png" alt="" />
                  <div>
                    <p className={`text-sm font-medium ${headingClasses}`}>
                      {userLocationData.greeting}!
                    </p>
                    <p className={`text-xs text-foreground/80`}>
                      {userLocationData.location}
                      {userLocationData.needsProfileCompletion && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto ml-2 text-xs text-primary underline"
                          onClick={() => navigate('/profile')}
                        >
                          Complete profile
                        </Button>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/061d58bb481804f2d9302ed590785f124fd5d6fb/icons/image-ij7GEZhfmzLNlLgDJVhkST8FIm5rJV.png" alt="" />
                    <div>
                      <p className={`text-xs font-medium text-foreground`}>
                        {userLocationData.date}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-qU6fpfrjnVtAmEOWtxxzIhqeyb7Tk3.png" alt="" />
                    <div>
                      <p className={`text-xs font-medium text-foreground`}>
                        {userLocationData.weather}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Cards */}
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-6 w-max">
              {recentActivity.length > 0 ? recentActivity.map((activity) => (
                <div
                  key={activity._id}
                  className="group relative cursor-pointer flex-shrink-0"
                  onClick={() => {
                    if (activity.type === "received") {
                      navigate('/inbox');
                    } else {
                      navigate('/inbox'); // Changed from '/drafts' to '/inbox' since we're showing sent letters
                    }
                  }}
                >
                  {/* Letter Card */}
                  <Card className="shadow-letter border-none bg-white/95 backdrop-blur-sm hover:shadow-vintage transition-all duration-500 hover:-translate-y-2 overflow-hidden w-80 h-96">
                    <CardContent className="p-0 h-full">
                      <div className="flex flex-col h-full">
                        {/* Letter Header with decorative top edge */}
                        <div className="h-3 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border-b-2 border-primary/20 relative">
                          <div className="absolute top-1 left-4 w-1 h-1 bg-primary/40 rounded-full"></div>
                          <div className="absolute top-1 right-4 w-1 h-1 bg-primary/40 rounded-full"></div>
                          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary/40 rounded-full"></div>
                        </div>

                        {/* Letter Content Area */}
                        <div className="flex-1 p-6 flex flex-col">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`text-lg font-semibold ${headingClasses} group-hover:text-primary transition-colors line-clamp-2`}>
                                {activity.subject}
                              </h3>
                              {activity.type === "received" && activity.status === "delivered" && (
                                <Badge className="bg-primary text-white text-xs px-2 py-1">
                                  New
                                </Badge>
                              )}
                            </div>
                            {activity.type === "sent" && (
                              <div className="flex items-center gap-1">
                                {renderTickIcon(activity)}
                              </div>
                            )}
                          </div>
                          
                          <p className={`text-sm ${bodyClasses} line-clamp-4 mb-4 flex-1`}>
                            {activity.content}
                          </p>
                          
                          <div className="mt-auto space-y-2">
                            <div className="flex items-center gap-2">
                              <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="" />
                              <span className={`text-sm ${accentClasses}`}>
                                {activity.type === "received" ? "From" : "To"} {
                                  activity.type === "received" 
                                    ? activity.sender.name || activity.sender.username
                                    : activity.recipient.name || activity.recipient.username
                                }
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${bodyClasses}`}>
                                {activity.type === "received" 
                                  ? activity.sender.country 
                                  : activity.recipient.country
                                }
                              </span>
                              <span className={`text-xs ${bodyClasses}`}>
                                {activity.timeAgo}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Letter Footer with decorative bottom edge */}
                        <div className="h-2 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-t border-primary/20"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )) : (
                <div className="w-80 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className={`text-lg ${headingClasses} mb-2 text-gray-600`}>No Recent Activity</h3>
                    <p className={`text-sm ${bodyClasses} text-gray-500`}>Start writing your first letter!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          <div className="space-y-4">
            {/* Incoming Letters Status */}
            <div 
              className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-letter border-none cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/inbox')}
            >
              <div className="flex items-center gap-3">
                <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-WYuC7gUQSKvGrmWIMI6NB1Ec64dbEv%20(1).png" alt="" />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${headingClasses}`}>
                    Incoming Letters
                  </p>
                  <p className={`text-xs text-foreground/80`}>
                    {loading ? 'Checking for new letters...' : 
                      (dashboardStats.incomingLetters > 0 
                        ? `${dashboardStats.incomingLetters} unread letter${dashboardStats.incomingLetters > 1 ? 's' : ''} waiting for you`
                        : 'No unread letters at this moment'
                      )
                    }
                  </p>
                </div>
                {dashboardStats.incomingLetters > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {dashboardStats.incomingLetters}
                  </Badge>
                )}
              </div>
            </div>

            {/* Friend Requests Status */}
            <div 
              className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-letter border-none cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                if (dashboardStats.friendRequests > 0) {
                  // TODO: Navigate to friend requests page when available
                  toast({
                    title: "Friend Requests",
                    description: "Friend requests management coming soon!",
                  });
                }
              }}
            >
              <div className="flex items-center gap-3">
                <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-qT0qCttwF0fSi4qeWZj6vo2Za76keg.png" alt="" />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${headingClasses}`}>
                    Friend Requests
                  </p>
                  <p className={`text-xs text-foreground/80`}>
                    {loading ? 'Checking for friend requests...' : 
                      (dashboardStats.friendRequests > 0 
                        ? `${dashboardStats.friendRequests} pending friend request${dashboardStats.friendRequests > 1 ? 's' : ''}`
                        : 'No pending friend requests'
                      )
                    }
                  </p>
                </div>
                {dashboardStats.friendRequests > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {dashboardStats.friendRequests}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compose New Letter */}
            <Card className="shadow-letter border-none bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 backdrop-blur-sm hover:shadow-vintage transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  onClick={() => navigate('/write')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-ko4lGcyaDCpjH9giHyNhCVEtwdI1If%20(1).png" alt="" />
                  <div>
                    <h3 className={`text-lg font-semibold ${headingClasses} mb-1`}>
                      Compose New Letter
                    </h3>
                    <p className={`text-sm ${bodyClasses}`}>
                      Share your thoughts with the world
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Find New Friends */}
            <Card className="shadow-letter border-none bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 backdrop-blur-sm hover:shadow-vintage transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  onClick={() => navigate('/friends')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-52p9Ub8JEM1ahgmDoRazWouxX7h1DZ.png" alt="" />
                  <div>
                    <h3 className={`text-lg font-semibold ${headingClasses} mb-1`}>
                      Find New Friends
                    </h3>
                    <p className={`text-sm ${bodyClasses}`}>
                      Connect based on interests & location
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Letter Writing Streak */}
          <Card className="shadow-letter border-none bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NddQdftBhn6rEWlENfoUc4kpma0Ixv.png" alt="" />
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${headingClasses} mb-1`}>
                    Letter Writing Streak
                  </h3>
                  <p className={`text-sm ${bodyClasses}`}>
                    Keep the momentum going!
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${headingClasses} text-orange-500`}>
                    {dashboardStats.writingStreak}
                  </div>
                  <div className={`text-sm text-foreground/80`}>
                    {dashboardStats.writingStreak === 1 ? 'day' : 'days'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Features */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Trending Topics */}
            <Card className="shadow-letter border-none bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className={`text-lg ${headingClasses} flex items-center gap-2`}>
                  <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-viLPTsEn03czmewucv5CSZIDGQ1130.png" alt="" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                    <span className={`text-sm font-medium ${headingClasses}`}>
                      {topic.topic}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {topic.count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Featured Writers */}
            <Card className="shadow-letter border-none bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className={`text-lg ${headingClasses} flex items-center gap-2`}>
                  <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-OhBdiUi1Ac3hO893KYRkNNtW2OQSs6.png" alt="" />
                  Featured Writers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {featuredWriters.map((writer, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer">
                    <div className="p-2 rounded-full bg-accent/10">
                      <Users className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-semibold ${headingClasses}`}>
                        {writer.name}
                      </h4>
                      <p className={`text-xs text-foreground/80`}>
                        {writer.location} • {writer.letters} letters
                      </p>
                      <p className={`text-xs text-accent font-medium`}>
                        {writer.specialty}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Letter of the Day */}
            <Card className="shadow-letter border-none bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className={`text-lg ${headingClasses} flex items-center gap-2`}>
                  <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-BVRbbADSVEBISzh8kjQOWr3OKiC7HH.png" alt="" />
                  Letter of the Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className={`text-sm font-semibold ${headingClasses} mb-1`}>
                      {letterOfTheDay.title}
                    </h4>
                    <p className={`text-xs text-foreground/80 mb-2`}>
                      by {letterOfTheDay.author} • {letterOfTheDay.location}
                    </p>
                  </div>
                  <p className={`text-xs text-foreground/80 line-clamp-3`}>
                    {letterOfTheDay.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className={`text-xs text-foreground/80`}>
                        {letterOfTheDay.likes}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs border-primary/20 hover:bg-primary/10 font-inter"
                      onClick={() => navigate('/inbox')}
                    >
                      Read Full Letter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Writing Inspiration */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-letter border-none p-8">
            <div className="text-center mb-8">
              <h2 className={`text-3xl lg:text-4xl text-foreground ${headingClasses} mb-4`}>
                Writing Inspiration
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${bodyClasses} leading-relaxed`}>
                Daily prompts to spark your creativity and connect with the world through meaningful letters
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-letter border-none bg-gradient-to-br from-accent/5 to-accent/10 backdrop-blur-sm hover:shadow-vintage transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-r3Nfm6tvS4gvHD2LdJp0c3IIp9u9zF.png" alt="" />
                    <div className="flex-1">
                      <h4 className={`font-semibold text-xl ${headingClasses} mb-4 text-accent`}>
                        Today's Prompt
                      </h4>
                      <p className={`text-base ${bodyClasses} mb-6 leading-relaxed`}>
                        "Describe a tradition from your culture that brings your community together. What makes it special to you?"
                      </p>
                      <Button 
                        variant="outline" 
                        size="default"
                        className="border-accent/30 hover:bg-accent/15 font-inter text-accent hover:text-accent font-medium"
                        onClick={() => navigate('/write')}
                      >
                        <PenTool className="h-4 w-4 mr-2" />
                        Write About This
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-letter border-none bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm hover:shadow-vintage transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-fxZYuvz3UXzipbTCxhkXz8yazNpTMI.png" alt="" />
                    <div className="flex-1">
                      <h4 className={`font-semibold text-xl ${headingClasses} mb-4 text-primary`}>
                        Cultural Exchange
                      </h4>
                      <p className={`text-base ${bodyClasses} mb-6 leading-relaxed`}>
                        Share something unique about your local area that visitors might not know about.
                      </p>
                      <Button 
                        variant="outline" 
                        size="default"
                        className="border-primary/30 hover:bg-primary/15 font-inter text-primary hover:text-primary font-medium"
                        onClick={() => navigate('/write')}
                      >
                        <PenTool className="h-4 w-4 mr-2" />
                        Start Writing
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
