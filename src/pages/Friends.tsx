import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Mail, Heart, Search, Globe, MessageSquare, UserPlus } from "lucide-react";
import { AnimateSvg } from "@/components/ui/AnimateSvg";
import Navigation from "@/components/Navigation";
import "@/styles/fonts.css";

interface Friend {
  id: string;
  name: string;
  country: string;
  interests: string[];
  lettersExchanged: number;
  lastActive: string;
  avatar?: string;
}

const Friends = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [friends] = useState<Friend[]>([
    {
      id: "1",
      name: "Akira",
      country: "Japan",
      interests: ["Philosophy", "Nature", "Photography"],
      lettersExchanged: 8,
      lastActive: "2 hours ago"
    },
    {
      id: "2",
      name: "Elena",
      country: "Czech Republic",
      interests: ["Literature", "Architecture", "Travel"],
      lettersExchanged: 12,
      lastActive: "1 day ago"
    },
    {
      id: "3",
      name: "Marcus",
      country: "Australia",
      interests: ["Nature", "Sports", "Travel"],
      lettersExchanged: 3,
      lastActive: "3 days ago"
    }
  ]);

  // Font combinations matching Landing page
  const headingClasses = "font-alata font-semibold tracking-tight";
  const bodyClasses = "font-spectral text-muted-foreground leading-relaxed";
  const accentClasses = "font-alata font-medium tracking-wide";

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.interests.some(interest => 
      interest.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleWriteLetter = (friend: Friend) => {
    navigate('/write', { state: { recipient: friend } });
  };

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-b border-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <AnimateSvg
                width="80"
                height="80"
                viewBox="0 0 100 100"
                className="mx-auto"
                path="M30,30 Q30,10 50,10 Q70,10 70,30 M20,50 Q20,30 30,30 Q40,30 40,50 M60,50 Q60,30 70,30 Q80,30 80,50 M30,70 Q30,50 40,50 Q50,50 50,70 M50,70 Q50,50 60,50 Q70,50 70,70"
                strokeColor="#4f46e5"
                strokeWidth={2.5}
                strokeLinecap="round"
                animationDuration={2}
                animationDelay={0}
                animationBounce={0.2}
                reverseAnimation={false}
                enableHoverAnimation={true}
                hoverAnimationType="pulse"
                hoverStrokeColor="#6366f1"
              />
            </div>
            <h1 className={`text-4xl lg:text-5xl text-foreground ${headingClasses}`}>
              Your Letter Friends
            </h1>
            <p className={`text-xl max-w-2xl mx-auto ${bodyClasses}`}>
              Connect with your pen pals from around the world
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Search Bar */}
          <Card className="shadow-vintage border-none bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search friends by name, country, or interests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-primary/20 focus:border-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Friends Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFriends.map((friend) => (
              <Card 
                key={friend.id}
                className="shadow-letter border-none bg-white/90 backdrop-blur-sm group hover:shadow-vintage transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/20">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${headingClasses}`}>
                        {friend.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        {friend.country}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <p className={`text-lg font-semibold ${headingClasses}`}>
                        {friend.lettersExchanged}
                      </p>
                      <p className={`text-xs ${bodyClasses}`}>Letters</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm ${bodyClasses}`}>
                        Active {friend.lastActive}
                      </p>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="space-y-2">
                    <p className={`text-sm font-medium ${accentClasses}`}>
                      Shared Interests
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {friend.interests.map((interest) => (
                        <Badge 
                          key={interest} 
                          variant="secondary" 
                          className="text-xs bg-primary/10 text-primary"
                        >
                          <Heart className="h-2 w-2 mr-1" />
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="letter"
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90 text-white font-alata"
                      onClick={() => handleWriteLetter(friend)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Write Letter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/20 hover:bg-primary/10"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredFriends.length === 0 && (
            <Card className="shadow-vintage border-none bg-white/95 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="flex justify-center mb-6">
                  <AnimateSvg
                    width="120"
                    height="120"
                    viewBox="0 0 100 100"
                    className="mx-auto"
                    path="M30,30 Q30,10 50,10 Q70,10 70,30 M20,50 Q20,30 30,30 Q40,30 40,50 M60,50 Q60,30 70,30 Q80,30 80,50"
                    strokeColor="#94a3b8"
                    strokeWidth={2}
                    strokeLinecap="round"
                    animationDuration={2}
                    animationDelay={0}
                    animationBounce={0.1}
                    reverseAnimation={false}
                    enableHoverAnimation={true}
                    hoverAnimationType="pulse"
                    hoverStrokeColor="#4f46e5"
                  />
                </div>
                <h3 className={`text-2xl ${headingClasses} mb-4`}>
                  No friends found
                </h3>
                <p className={`text-lg max-w-md mx-auto ${bodyClasses} mb-6`}>
                  {searchTerm ? "Try a different search term" : "Start writing letters to make new friends"}
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary/20 hover:bg-primary/10 font-alata"
                  onClick={() => navigate('/write')}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Write Your First Letter
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;
