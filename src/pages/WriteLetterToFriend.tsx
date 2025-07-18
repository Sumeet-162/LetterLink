import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PenTool, Send, User, ArrowLeft, CheckCircle, AlertCircle, Loader2, Globe, Heart, Mail, Clock, Languages, BookOpen, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import LetterDialog from "@/components/LetterDialog";
import { api } from "@/services/api";
import "@/styles/fonts.css";

const WriteLetterToFriend = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const friendId = searchParams.get('friendId');
  const friendUsername = searchParams.get('username');
  const friendName = searchParams.get('name');
  const friendCountry = searchParams.get('country');
  const friendTimezone = searchParams.get('timezone');
  const friendBio = searchParams.get('bio');
  const friendInterests = searchParams.get('interests');
  const friendLanguages = searchParams.get('languages');
  const friendWritingStyle = searchParams.get('writingStyle');
  const friendPreferredLetterStyle = searchParams.get('preferredLetterStyle');
  const friendLetterCount = searchParams.get('letterCount');
  const friendProfilePicture = searchParams.get('profilePicture');

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Letter content state
  const [letterData, setLetterData] = useState({
    subject: "",
    content: ""
  });

  // Friend data state
  const [friendData, setFriendData] = useState(null);
  const [loadingFriend, setLoadingFriend] = useState(true);

  // Form state management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Font combinations
  const headingClasses = "font-inter font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-inter font-medium tracking-wide text-foreground/80";

  const maxContentLength = 2000;
  const contentProgress = (letterData.content.length / maxContentLength) * 100;

  // Parse interests and languages
  const interestsArray = friendInterests ? friendInterests.split(',').filter(Boolean) : [];
  const languagesArray = friendLanguages ? friendLanguages.split(',').filter(Boolean) : [];

  // Load friend data
  useEffect(() => {
    const loadFriendData = async () => {
      if (!friendId) {
        setSubmitError("Friend information missing. Please go back and try again.");
        setLoadingFriend(false);
        return;
      }

      try {
        // Set comprehensive friend data
        setFriendData({
          id: friendId,
          username: friendUsername,
          name: friendName,
          country: friendCountry,
          timezone: friendTimezone,
          bio: friendBio,
          interests: interestsArray,
          languages: languagesArray,
          writingStyle: friendWritingStyle,
          preferredLetterStyle: friendPreferredLetterStyle,
          letterCount: parseInt(friendLetterCount || '0'),
          profilePicture: friendProfilePicture
        });
      } catch (error) {
        console.error("Failed to load friend data:", error);
        setSubmitError("Failed to load friend information.");
      } finally {
        setLoadingFriend(false);
      }
    };

    loadFriendData();
  }, [friendId, friendUsername, friendName, friendCountry, friendTimezone, friendBio, friendInterests, friendLanguages, friendWritingStyle, friendPreferredLetterStyle, friendLetterCount, friendProfilePicture]);

  const handleSubmit = async (data: { subject: string; content: string }) => {
    const response = await api.sendLetter({
      recipientId: friendId!,
      subject: data.subject,
      content: data.content,
      deliveryDelay: 0 // Immediate delivery for first letters
    });
    return response;
  };

  const handleWriteLetter = () => {
    setIsDialogOpen(true);
  };

  if (loadingFriend) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-left bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-letter border-none mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/friends')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Friends
          </Button>
          
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage 
                src={friendData?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendData?.username}`} 
              />
              <AvatarFallback className="text-2xl">
                {friendData?.name ? friendData.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            
            {/* User Information */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className={`text-3xl ${headingClasses}`}>
                  Write Letter to {friendData?.name || friendData?.username}
                </h1>
                {friendData?.country && (
                  <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className={`text-sm text-primary ${accentClasses}`}>{friendData.country}</span>
                  </div>
                )}
              </div>
              
              <p className={`text-lg text-foreground/80 mb-4 ${bodyClasses}`}>
                Send a letter to connect and start a meaningful conversation
              </p>
              
              {/* User Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Username and Timezone */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm bg-primary/10 text-primary">
                    @{friendData?.username}
                  </Badge>
                  {friendData?.timezone && (
                    <Badge variant="outline" className="text-sm border-primary/20 text-foreground/80">
                      <Clock className="h-3 w-3 mr-1" />
                      {friendData.timezone}
                    </Badge>
                  )}
                </div>
                
                {/* Letter Count */}
                {friendData?.letterCount !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className={`text-primary ${accentClasses}`}>
                      {friendData.letterCount} letters exchanged
                    </span>
                  </div>
                )}
              </div>
              
              {/* Action Button */}
              <Button
                onClick={handleWriteLetter}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white shadow-letter"
              >
                <PenTool className="h-5 w-5 mr-2" />
                Compose Letter
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Interests Card */}
          {friendData?.interests && friendData.interests.length > 0 && (
            <Card className="bg-white/90 backdrop-blur-sm border-primary/10 shadow-letter">
              <CardHeader>
                <CardTitle className={`text-lg ${headingClasses} flex items-center gap-2`}>
                  <Heart className="h-5 w-5 text-primary" />
                  Interests & Hobbies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {friendData.interests.map((interest, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-primary/10 text-primary border-primary/20 px-3 py-1"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages Card */}
          {friendData?.languages && friendData.languages.length > 0 && (
            <Card className="bg-white/90 backdrop-blur-sm border-primary/10 shadow-letter">
              <CardHeader>
                <CardTitle className={`text-lg ${headingClasses} flex items-center gap-2`}>
                  <Languages className="h-5 w-5 text-primary" />
                  Languages Spoken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {friendData.languages.map((language, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-primary/10 text-primary border-primary/20 px-3 py-1"
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Writing Style Card */}
          {(friendData?.writingStyle || friendData?.preferredLetterStyle) && (
            <Card className="bg-white/90 backdrop-blur-sm border-primary/10 shadow-letter">
              <CardHeader>
                <CardTitle className={`text-lg ${headingClasses} flex items-center gap-2`}>
                  <BookOpen className="h-5 w-5 text-primary" />
                  Writing Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {friendData.writingStyle && (
                  <div>
                    <span className={`text-sm font-medium text-primary ${accentClasses}`}>Writing Style:</span>
                    <p className={`text-sm ${bodyClasses} text-foreground/80 mt-1`}>
                      {friendData.writingStyle}
                    </p>
                  </div>
                )}
                {friendData.preferredLetterStyle && (
                  <div>
                    <span className={`text-sm font-medium text-primary ${accentClasses}`}>Preferred Letter Style:</span>
                    <p className={`text-sm ${bodyClasses} text-foreground/80 mt-1`}>
                      {friendData.preferredLetterStyle}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Bio Card */}
          {friendData?.bio && (
            <Card className="bg-white/90 backdrop-blur-sm border-primary/10 shadow-letter">
              <CardHeader>
                <CardTitle className={`text-lg ${headingClasses} flex items-center gap-2`}>
                  <Sparkles className="h-5 w-5 text-primary" />
                  About {friendData.name || friendData.username}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`${bodyClasses} text-foreground/80 leading-relaxed`}>
                  "{friendData.bio}"
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enhanced Conversation Starters */}
        {(friendData?.interests || friendData?.languages || friendData?.writingStyle) && (
          <Card className="bg-white/90 backdrop-blur-sm border-primary/10 shadow-letter mb-8">
            <CardHeader>
              <CardTitle className={`text-xl ${headingClasses} flex items-center gap-2`}>
                <Sparkles className="h-6 w-6 text-primary" />
                Letter Writing Inspiration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-sm ${bodyClasses} text-foreground/70 mb-4`}>
                Here are some thoughtful conversation starters based on {friendData.name || friendData.username}'s profile:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Interest-based suggestions */}
                {friendData.interests && friendData.interests.length > 0 && (
                  <div className="space-y-2">
                    <h4 className={`text-sm font-semibold text-primary ${accentClasses} flex items-center gap-1`}>
                      <Heart className="h-4 w-4" />
                      About Their Interests
                    </h4>
                    {friendData.interests.slice(0, 3).map((interest, index) => (
                      <div key={index} className="text-sm bg-primary/5 rounded-lg p-3 border border-primary/10">
                        <span className={`${bodyClasses} text-foreground/80`}>
                          "I noticed you're interested in {interest.toLowerCase()}. What got you started with that?"
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Language-based suggestions */}
                {friendData.languages && friendData.languages.length > 0 && (
                  <div className="space-y-2">
                    <h4 className={`text-sm font-semibold text-primary ${accentClasses} flex items-center gap-1`}>
                      <Languages className="h-4 w-4" />
                      Language & Culture
                    </h4>
                    <div className="text-sm bg-primary/5 rounded-lg p-3 border border-primary/10">
                      <span className={`${bodyClasses} text-foreground/80`}>
                        "I see you speak {friendData.languages.join(' and ')}. What's your favorite thing about each culture?"
                      </span>
                    </div>
                    {friendData.country && (
                      <div className="text-sm bg-primary/5 rounded-lg p-3 border border-primary/10">
                        <span className={`${bodyClasses} text-foreground/80`}>
                          "What's something unique about life in {friendData.country} that people might not know?"
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Writing style suggestions */}
                {friendData.writingStyle && (
                  <div className="space-y-2 md:col-span-2">
                    <h4 className={`text-sm font-semibold text-primary ${accentClasses} flex items-center gap-1`}>
                      <BookOpen className="h-4 w-4" />
                      Writing & Communication
                    </h4>
                    <div className="text-sm bg-primary/5 rounded-lg p-3 border border-primary/10">
                      <span className={`${bodyClasses} text-foreground/80`}>
                        "I'd love to know more about your writing style - do you prefer sharing stories, deep thoughts, or everyday moments?"
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Letter Dialog */}
        <LetterDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSend={handleSubmit}
          recipientId={friendId || undefined}
          recipientName={friendData?.name || friendData?.username}
          type="letter"
          title="Write Letter to Friend"
          description="Send your first letter to start a meaningful connection"
        />
      </div>
    </div>
  );
};

export default WriteLetterToFriend;
