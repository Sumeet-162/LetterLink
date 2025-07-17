import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnimateSvg } from "@/components/ui/AnimateSvg";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Heart, Reply, Share2, MapPin, Clock, Send, Users, Globe, Shuffle, Loader2, AlertCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { api } from "@/services/api";
import "@/styles/fonts.css";

interface Letter {
  _id: string;
  subject: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    country: string;
    interests: string[];
  };
  recipient: string;
  status: "sent" | "delivered" | "read";
  type: "letter" | "reply";
  deliveredAt: string;
  readAt?: string;
  replyTo?: string;
  isPremium?: boolean;
  isLocked?: boolean;
}

interface ApiError {
  message: string;
}

const Inbox = () => {
  const navigate = useNavigate();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [isRandomMatchModalOpen, setIsRandomMatchModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [randomMatchTitle, setRandomMatchTitle] = useState("");
  const [randomMatchContent, setRandomMatchContent] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  // New state for letter cycling
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [nextCycleTime, setNextCycleTime] = useState<Date | null>(null);

  // Font combinations with Inter replacing Alata
  const headingClasses = "font-inter font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-inter font-medium tracking-wide text-foreground/80";

  // Available interests for random matching
  const availableInterests = [
    "Travel", "Food", "Culture", "Literature", "Art", "Philosophy", "Nature", 
    "Photography", "Music", "History", "Sports", "Technology", "Science", 
    "Architecture", "Fashion", "Movies", "Books", "Writing", "Cooking", 
    "Fitness", "Meditation", "Languages", "Dancing", "Gaming", "Gardening"
  ];

  // Fetch letters and cycle info from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Inbox: Starting to fetch letters...');
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        console.log('Inbox: Auth token exists:', !!token);
        
        // Fetch letters first
        const lettersResponse = await api.getInboxLetters();
        console.log('Inbox: Received letters:', lettersResponse);
        setLetters(lettersResponse);
        
        // Try to fetch cycle info, but don't fail if it's not available
        try {
          const cycleResponse = await api.getNextCycleInfo();
          console.log('Inbox: Cycle info:', cycleResponse);
          
          setNextCycleTime(new Date(cycleResponse.nextCycleAt));
          setTimeUntilNext({
            hours: cycleResponse.timeRemaining.hours,
            minutes: cycleResponse.timeRemaining.minutes,
            seconds: cycleResponse.timeRemaining.seconds
          });
        } catch (cycleError) {
          console.warn('Inbox: Cycle API not available, using fallback:', cycleError);
          // Fallback: set next cycle to tomorrow at midnight
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          setNextCycleTime(tomorrow);
          
          // Calculate time until tomorrow
          const now = new Date();
          const diffMs = tomorrow.getTime() - now.getTime();
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          
          setTimeUntilNext({ hours, minutes, seconds });
        }
        
      } catch (err) {
        console.error('Inbox: Error fetching data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load inbox data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!nextCycleTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diffMs = nextCycleTime.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        // Cycle completed, refresh the page or fetch new data
        window.location.reload();
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilNext({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [nextCycleTime]);

  // Show all letters in the inbox (both read and unread)
  const availableLetters = letters;

  // Letter handling functions
  const handleReadLetter = async (letter: Letter) => {
    // Check if letter is locked
    if (letter.isLocked) {
      // Show a toast or alert that this letter is locked
      setError("This premium letter is locked. Reply to free letters to unlock premium content!");
      setTimeout(() => setError(null), 4000);
      return;
    }

    setSelectedLetter(letter);
    setIsLetterModalOpen(true);
    
    // Mark as read if not already
    if (letter.status === 'delivered') {
      try {
        await api.markLetterAsRead(letter._id);
        // Update local state
        setLetters(prevLetters => 
          prevLetters.map(l => 
            l._id === letter._id 
              ? { ...l, status: 'read' as const, readAt: new Date().toISOString() }
              : l
          )
        );
        console.log('Letter marked as read:', letter._id);
      } catch (error) {
        console.error('Failed to mark letter as read:', error);
      }
    }
  };

  const handleRandomMatch = () => {
    setIsRandomMatchModalOpen(true);
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSendRandomMatch = async () => {
    if (!randomMatchContent.trim() || selectedInterests.length === 0) return;
    
    setIsSending(true);
    try {
      await api.sendRandomMatchLetter({
        subject: randomMatchTitle.trim() || "A letter from a new friend",
        content: randomMatchContent.trim(),
        interests: selectedInterests
      });
      
      // Reset form
      setRandomMatchTitle("");
      setRandomMatchContent("");
      setSelectedInterests([]);
      setIsRandomMatchModalOpen(false);
      
      // Show success message (you could add a toast here)
      alert("Your random match letter has been sent! You'll receive replies in the next 24-hour cycle.");
      
    } catch (error) {
      console.error('Failed to send random match letter:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send letter';
      alert(`Failed to send letter: ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className={`${bodyClasses} text-foreground/80`}>Loading your letters...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !error.includes("premium letter")) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
            <p className={`${bodyClasses} text-red-600`}>{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-primary/20 hover:bg-primary/10"
            >
              Try Again
            </Button>
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
        <div className="text-left bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-letter border-none mb-12">
          <div className="flex items-center gap-4 mb-4">
            <h2 className={`text-3xl lg:text-4xl text-foreground ${headingClasses}`}>
              Discover Stories 
            </h2>
            <img className="h-20 w-20" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-ZblMHVcnWlhK5cBOJWbtMEXdz1YRjF.png" alt="" />
          </div>
          <p className={`text-lg text-foreground/80 ${bodyClasses} mb-6`}>
            {availableLetters.length === 0 
              ? "No letters yet. When you receive letters, they'll appear here!" 
              : `${availableLetters.length} letter${availableLetters.length !== 1 ? 's' : ''} waiting for you`
            }
          </p>
          
          {/* Additional Details */}
          <div className="border-t border-primary/20 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-uZIeLePaAt8YfYlabqbjKfSz1T3ESJ.png" alt="" />
                <div>
                  <p className={`text-xs font-medium text-foreground`}>
                    {letters.filter(l => l.status === 'delivered').length} unread letter{letters.filter(l => l.status === 'delivered').length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-1ZcsBwwKPF9lpnaWTFwUAmxkHIeKXD.png" alt="" />
                <div>
                  <p className={`text-xs font-medium text-foreground`}>
                    {letters.filter(l => l.status === 'read').length} read letter{letters.filter(l => l.status === 'read').length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800 text-sm flex-grow">{error}</p>
            <Button 
              onClick={() => setError(null)} 
              variant="ghost" 
              size="sm"
              className="text-amber-600 hover:text-amber-800 h-auto p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Letters Grid */}
        <div className="max-w-6xl mx-auto">
          {/* Available Letters */}
          {availableLetters.length === 0 ? (
            <div className="text-center py-16">
              <div className="space-y-4">
                <img className="h-20 w-20 mx-auto opacity-50" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-ZblMHVcnWlhK5cBOJWbtMEXdz1YRjF.png" alt="No letters" />
                <h3 className={`text-xl ${headingClasses} text-foreground/80`}>
                  Your inbox is empty
                </h3>
                <p className={`text-sm ${bodyClasses} text-foreground/60`}>
                  When you receive letters from friends or random matches, they'll appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {availableLetters.map((letter) => (
                <Card 
                  key={letter._id} 
                  className={`shadow-letter border-none backdrop-blur-sm hover:shadow-vintage transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                    letter.isLocked 
                      ? 'bg-gradient-to-br from-amber-50/80 to-yellow-50/80 border border-amber-200/50' 
                      : letter.status === 'read' 
                        ? 'bg-white/70 opacity-80' 
                        : 'bg-white/95'
                  } ${letter.isLocked ? 'relative overflow-hidden' : ''}`}
                  onClick={() => handleReadLetter(letter)}
                >
                  {/* Premium Lock Overlay */}
                  {letter.isLocked && (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100/90 to-yellow-100/90 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-3 bg-amber-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-semibold text-amber-800 mb-1">Premium Letter</h4>
                        <p className="text-xs text-amber-700">Reply to free letters to unlock</p>
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Letter Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <img className="h-6 w-6" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Globe" />
                          <span className={`text-sm ${accentClasses}`}>From {letter.sender?.country || 'Unknown'}</span>
                          {letter.isPremium && (
                            <Badge variant="default" className="text-xs bg-amber-500 hover:bg-amber-600">
                              Premium
                            </Badge>
                          )}
                        </div>
                        {letter.status === "delivered" && !letter.isLocked && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className={`text-xs ${bodyClasses} text-green-600`}>New</span>
                          </div>
                        )}
                        {letter.status === "read" && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            <span className={`text-xs ${bodyClasses} text-gray-600`}>Read</span>
                          </div>
                        )}
                        {letter.isLocked && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className={`text-xs ${bodyClasses} text-amber-600`}>Locked</span>
                          </div>
                        )}
                      </div>

                      {/* Letter Title */}
                      <h3 className={`text-lg font-semibold ${headingClasses} line-clamp-2`}>
                        {letter.subject}
                      </h3>

                      {/* Letter Preview */}
                      <p className={`text-sm ${bodyClasses} line-clamp-3 opacity-80`}>
                        {letter.content.substring(0, 150)}...
                      </p>

                      {/* Sender Info */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          @{letter.sender?.username || 'unknown'}
                        </Badge>
                        <span className={`text-xs ${bodyClasses} text-foreground/60`}>
                          {letter.sender?.name || 'Unknown User'}
                        </span>
                      </div>

                      {/* Interests */}
                      <div className="flex flex-wrap gap-2">
                        {letter.sender?.interests?.slice(0, 2).map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                        {letter.sender?.interests && letter.sender.interests.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{letter.sender.interests.length - 2} more
                          </Badge>
                        )}
                      </div>

                      {/* Footer with timestamp and read button */}
                      <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                        <span className={`text-xs ${bodyClasses} opacity-70`}>
                          {formatTimeAgo(letter.deliveredAt)}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-primary/20 hover:bg-primary/10 font-inter text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReadLetter(letter);
                          }}
                        >
                          {letter.status === 'read' ? 'View Again' : 'Read Letter'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Refresh Timer */}
          <div className="flex justify-center mt-8 mb-16">
            <Card className="shadow-letter border-none bg-white/95 backdrop-blur-sm inline-block">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-jZvuQMZCi8XuT0afzKwdnQXwS7maTf.png" alt="Clock" />
                  <div>
                    <p className={`text-sm font-medium ${headingClasses}`}>
                      New Letters Arrive In
                    </p>
                    <p className={`text-lg font-bold ${headingClasses} text-primary`}>
                      {String(timeUntilNext.hours).padStart(2, '0')}h {String(timeUntilNext.minutes).padStart(2, '0')}m {String(timeUntilNext.seconds).padStart(2, '0')}s
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Random Match Section */}
          <div className="mt-16">
            <Card className="shadow-letter border-none bg-gradient-to-br from-accent/10 via-accent/5 to-primary/10 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <img className="h-16 w-16" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-52p9Ub8JEM1ahgmDoRazWouxX7h1DZ.png" alt="Random Match" />
                    <h3 className={`text-3xl lg:text-4xl text-foreground ${headingClasses}`}>
                      Random Match
                    </h3>
                  </div>
                  <p className={`text-lg max-w-2xl mx-auto ${bodyClasses} mb-6`}>
                    Write a letter and it will be sent to 3 random recipients. In return, you'll receive 3 letters from other users in the next 24-hour cycle.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Feature 1 */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className={`text-lg font-semibold ${headingClasses} mb-2`}>
                      Smart Matching
                    </h4>
                    <p className={`text-sm ${bodyClasses} text-foreground/80`}>
                      Algorithm matches you with 3 recipients who share your interests
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-8 w-8 text-accent" />
                    </div>
                    <h4 className={`text-lg font-semibold ${headingClasses} mb-2`}>
                      Global Reach
                    </h4>
                    <p className={`text-sm ${bodyClasses} text-foreground/80`}>
                      Connect with people from different countries and cultures
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shuffle className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className={`text-lg font-semibold ${headingClasses} mb-2`}>
                      Serendipity
                    </h4>
                    <p className={`text-sm ${bodyClasses} text-foreground/80`}>
                      Discover unexpected connections and meaningful conversations
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={handleRandomMatch}
                    className="bg-primary hover:bg-primary/90 font-inter text-white px-8 py-3 text-lg"
                    size="lg"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Start Random Match
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Random Match Modal */}
      <Dialog open={isRandomMatchModalOpen} onOpenChange={setIsRandomMatchModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={`text-2xl ${headingClasses} text-foreground mb-2`}>
              Random Match Letter
            </DialogTitle>
            <p className={`text-sm ${bodyClasses} text-foreground/80`}>
              Write a letter that will be delivered to 3 random recipients with similar interests
            </p>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Letter Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className={`text-sm font-medium ${headingClasses}`}>
                Letter Title
              </Label>
              <Input
                id="title"
                value={randomMatchTitle}
                onChange={(e) => setRandomMatchTitle(e.target.value)}
                className="bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 font-spectral"
                placeholder="A meaningful title for your letter..."
              />
            </div>

            {/* Interest Selection */}
            <div className="space-y-3">
              <Label className={`text-sm font-medium ${headingClasses}`}>
                Select Your Interests (Choose at least 1)
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {availableInterests.map((interest) => (
                  <Badge
                    key={interest}
                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                    className={`cursor-pointer text-xs py-2 px-3 justify-center transition-colors ${
                      selectedInterests.includes(interest)
                        ? 'bg-primary text-white hover:bg-primary/80'
                        : 'hover:bg-primary/10'
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              <p className={`text-xs ${bodyClasses} text-foreground/60`}>
                Selected: {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Letter Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className={`text-sm font-medium ${headingClasses}`}>
                Your Message
              </Label>
              <Textarea
                id="content"
                value={randomMatchContent}
                onChange={(e) => setRandomMatchContent(e.target.value)}
                className="bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 font-spectral min-h-[300px] resize-none"
                placeholder="Share something about yourself, your thoughts, experiences, or ask questions to spark meaningful conversations..."
              />
            </div>

            {/* Tips */}
            <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
              <h4 className={`text-sm font-semibold ${headingClasses} mb-2`}>
                Tips for Random Match Letters
              </h4>
              <ul className={`text-xs ${bodyClasses} space-y-1 text-foreground/80`}>
                <li>• Share something personal but not too private</li>
                <li>• Ask questions to encourage replies</li>
                <li>• Mention your interests and hobbies</li>
                <li>• Be genuine and authentic</li>
                <li>• Keep it positive and engaging</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsRandomMatchModalOpen(false)}
                className="border-primary/20 hover:bg-primary/10 font-inter"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendRandomMatch}
                disabled={!randomMatchContent.trim() || selectedInterests.length === 0 || isSending}
                className="bg-primary hover:bg-primary/90 font-inter flex items-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send to 3 People
                  </>
                )}
              </Button>
            </div>

            {/* Info about the process */}
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className={`text-sm font-medium ${headingClasses}`}>How Random Match Works</span>
              </div>
              <ul className={`text-xs ${bodyClasses} space-y-1 text-foreground/80`}>
                <li>• Your letter will be sent to 3 people who share your selected interests</li>
                <li>• Recipients are randomly selected from different countries worldwide</li>
                <li>• They can reply back, starting new conversations and friendships</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Letter Reading Modal */}
      <Dialog open={isLetterModalOpen} onOpenChange={setIsLetterModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedLetter && (
            <div className="space-y-6">
              {/* Modal Header */}
              <DialogHeader>
                <DialogTitle className={`text-2xl ${headingClasses} text-foreground mb-2`}>
                  {selectedLetter.subject}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-foreground/70">
                  <div className="flex items-center gap-2">
                    <img className="h-5 w-5" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Globe" />
                    <span>From {selectedLetter.sender?.country || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimeAgo(selectedLetter.deliveredAt)}</span>
                  </div>
                </div>
              </DialogHeader>

              {/* Letter Content */}
              <div className="space-y-6">
                {/* Sender Info */}
                <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className={`font-semibold ${headingClasses}`}>
                        {selectedLetter.sender?.name || 'Unknown User'}
                      </h4>
                      <p className={`text-sm ${bodyClasses} text-foreground/70`}>
                        @{selectedLetter.sender?.username || 'unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span className={`text-sm ${accentClasses}`}>
                        {selectedLetter.sender?.country || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Sender Interests */}
                  {selectedLetter.sender?.interests && selectedLetter.sender.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedLetter.sender.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Letter Body */}
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg border border-primary/20">
                  <div className={`${bodyClasses} leading-relaxed whitespace-pre-wrap text-foreground`}>
                    {selectedLetter.content}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-primary/20">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                      className={`border-primary/20 hover:bg-primary/10 ${isLiked ? 'bg-red-50 text-red-600' : ''}`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement reply functionality
                        console.log('Reply to letter:', selectedLetter._id);
                      }}
                      className="border-primary/20 hover:bg-primary/10"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  </div>

                  <Button
                    onClick={() => setIsLetterModalOpen(false)}
                    className="bg-primary hover:bg-primary/90 font-inter"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inbox;
