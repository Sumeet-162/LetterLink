import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, Globe, Heart, Users, Edit3, Send, FileText, PenTool, MessageSquare, Plus, Search, Flame, Star, Trophy, TrendingUp } from "lucide-react";
import { AnimateSvg } from "@/components/ui/AnimateSvg";
import Navigation from "@/components/Navigation";
import "@/styles/fonts.css";

const Dashboard = () => {
  const navigate = useNavigate();

  // Font combinations matching Landing page
  const headingClasses = "font-alata font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-alata font-medium tracking-wide text-foreground/80";

  const recentActivity = [
    {
      id: "1",
      type: "received",
      title: "Autumn Reflections from Tokyo",
      username: "Akira",
      location: "Tokyo, Japan",
      time: "2 hours ago",
      isOpened: false,
      letterContent: "Dear friend, I hope this letter finds you well. As I write this, the autumn leaves in Tokyo are painting the city in brilliant shades of red and gold..."
    },
    {
      id: "2",
      type: "sent",
      title: "My thoughts on Barcelona",
      username: "Maria",
      location: "Barcelona, Spain",
      time: "1 day ago",
      isDelivered: true,
      isOpened: true,
      letterContent: "I wanted to share with you the incredible experience I had visiting the Sagrada Familia yesterday. The way the light filters through the stained glass windows..."
    },
    {
      id: "3",
      type: "sent",
      title: "Coffee culture in Seattle",
      username: "Alex",
      location: "Seattle, USA",
      time: "2 days ago",
      isDelivered: true,
      isOpened: false,
      letterContent: "Living in Seattle has given me such an appreciation for coffee culture. There's something magical about the way people here treat their morning ritual..."
    },
    {
      id: "4",
      type: "received",
      title: "Greetings from Prague",
      username: "Elena",
      location: "Prague, Czech Republic",
      time: "3 days ago",
      isOpened: true,
      letterContent: "I'm writing this from my favorite little café in Prague's old town. The cobblestone streets are wet from the morning rain, and the city feels like something out of a fairy tale..."
    },
    {
      id: "5",
      type: "sent",
      title: "Life in the countryside",
      username: "Marcus",
      location: "Yorkshire, England",
      time: "5 days ago",
      isDelivered: false,
      isOpened: false,
      letterContent: "I've been thinking about our conversation about city life vs rural living. Here in Yorkshire, the pace is so different from what you described in New York..."
    }
  ];

  // Status data
  const incomingLetters = 0; // Change this to dynamic data
  const friendRequests = 2; // Change this to dynamic data

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

  const userLocationData = {
    location: "New York, United States", // Replace with dynamic user location
    weather: "Partly cloudy, 22°C", // Replace with dynamic weather data
    greeting: getCurrentGreeting(),
    date: getCurrentDate()
  };

  // Additional dashboard data
  const writingStreak = 7; // consecutive days
  const trendingTopics = [
    { topic: "Travel Adventures", count: 234 },
    { topic: "Local Food Culture", count: 189 },
    { topic: "Holiday Traditions", count: 156 },
    { topic: "City Life Stories", count: 142 }
  ];

  const featuredWriters = [
    { name: "Sarah Chen", location: "Singapore", letters: 45, specialty: "Cultural stories" },
    { name: "Marco Rodriguez", location: "Mexico City", letters: 38, specialty: "Food & traditions" },
    { name: "Aisha Patel", location: "Mumbai", letters: 52, specialty: "Urban life" }
  ];

  const letterOfTheDay = {
    title: "Morning Rituals Around the World",
    author: "Elena Kowalski",
    location: "Warsaw, Poland",
    excerpt: "Every morning at 6 AM, I watch my neighbor Mrs. Anna water her geraniums on the balcony across from mine. It's a ritual that connects us without words...",
    likes: 127
  };

  const renderTickIcon = (activity: any) => {
    if (activity.type === "received") return null;
    
    if (!activity.isDelivered) {
      return <Clock className="h-4 w-4 text-orange-500" />;
    }
    
    if (activity.isOpened) {
      return (
        <div className="flex">
          <Mail className="h-4 w-4 text-blue-500 -mr-1" />
          <Mail className="h-4 w-4 text-blue-500" />
        </div>
      );
    }
    
    return <Mail className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Recent Activity Header */}
          <div className="text-left bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-letter border-none">
            <h2 className={`text-3xl lg:text-4xl text-foreground ${headingClasses} mb-4`}>
              Recent Activity
            </h2>
            <p className={`text-lg text-foreground/80 ${bodyClasses} mb-6`}>
              Your latest letter interactions and conversations
            </p>
            
            {/* User Location Details */}
            <div className="border-t border-primary/20 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${headingClasses}`}>
                      {userLocationData.greeting}!
                    </p>
                    <p className={`text-xs text-foreground/80`}>
                      {userLocationData.location}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-accent/10">
                      <MessageSquare className="h-3 w-3 text-accent" />
                    </div>
                    <div>
                      <p className={`text-xs font-medium text-foreground`}>
                        {userLocationData.date}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-primary/10">
                      <Heart className="h-3 w-3 text-primary" />
                    </div>
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
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="group relative cursor-pointer flex-shrink-0"
                  onClick={() => {
                    if (activity.type === "received") {
                      navigate('/inbox');
                    } else {
                      navigate('/drafts');
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
                              <h3 className={`text-lg font-semibold ${headingClasses} group-hover:text-primary transition-colors`}>
                                {activity.title}
                              </h3>
                              {activity.type === "received" && !activity.isOpened && (
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
                            {activity.letterContent}
                          </p>
                          
                          <div className="mt-auto space-y-2">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-primary" />
                              <span className={`text-sm ${accentClasses}`}>
                                {activity.type === "received" ? "From" : "To"} {activity.username}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${bodyClasses}`}>
                                {activity.location}
                              </span>
                              <span className={`text-xs ${bodyClasses}`}>
                                {activity.time}
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
              ))}
            </div>
          </div>

          {/* Status Messages */}
          <div className="space-y-4">
            {/* Incoming Letters Status */}
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-letter border-none">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${headingClasses}`}>
                    Incoming Letters
                  </p>
                  <p className={`text-xs text-foreground/80`}>
                    {incomingLetters > 0 
                      ? `${incomingLetters} incoming letter${incomingLetters > 1 ? 's' : ''} at this moment`
                      : 'No incoming letters at this moment'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Friend Requests Status */}
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-letter border-none">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-accent/10">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${headingClasses}`}>
                    Friend Requests
                  </p>
                  <p className={`text-xs text-foreground/80`}>
                    {friendRequests > 0 
                      ? `${friendRequests} pending friend request${friendRequests > 1 ? 's' : ''}`
                      : 'No pending friend requests'
                    }
                  </p>
                </div>
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
                  <div className="p-3 rounded-full bg-primary/20">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
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
                  <div className="p-3 rounded-full bg-accent/20">
                    <Search className="h-6 w-6 text-accent" />
                  </div>
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
                <div className="p-3 rounded-full bg-orange-100">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
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
                    {writingStreak}
                  </div>
                  <div className={`text-sm text-foreground/80`}>
                    {writingStreak === 1 ? 'day' : 'days'}
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
                  <TrendingUp className="h-5 w-5 text-primary" />
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
                  <Star className="h-5 w-5 text-accent" />
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
                  <Trophy className="h-5 w-5 text-yellow-500" />
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
                      className="text-xs border-primary/20 hover:bg-primary/10 font-alata"
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
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className={`text-2xl lg:text-3xl text-foreground ${headingClasses} mb-4`}>
                Writing Inspiration
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${bodyClasses}`}>
                Daily prompts to spark your creativity and connect with the world
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-letter border-none bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-accent/10">
                      <MessageSquare className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-lg ${headingClasses} mb-3`}>
                        Today's Prompt
                      </h4>
                      <p className={`text-sm ${bodyClasses} mb-4`}>
                        "Describe a tradition from your culture that brings your community together. What makes it special to you?"
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-accent/20 hover:bg-accent/10 font-alata"
                        onClick={() => navigate('/write')}
                      >
                        <PenTool className="h-4 w-4 mr-2" />
                        Write About This
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-letter border-none bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-lg ${headingClasses} mb-3`}>
                        Cultural Exchange
                      </h4>
                      <p className={`text-sm ${bodyClasses} mb-4`}>
                        Share something unique about your local area that visitors might not know about.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-primary/20 hover:bg-primary/10 font-alata"
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
