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
          
          // Calculate time until tomorrow midnight
          const now = new Date();
          const diff = tomorrow.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          setTimeUntilNext({ hours, minutes, seconds });
        }
        
      } catch (err) {
        console.error('Inbox: Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load letters');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update countdown timer every second
  useEffect(() => {
    if (!nextCycleTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = nextCycleTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        // Cycle time reached, refresh the page to get new letters
        window.location.reload();
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilNext({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextCycleTime]);

  // Calculate letter statistics
  const deliveredLetters = letters.filter(letter => letter.status === "delivered" || letter.status === "read");
  const unreadCount = letters.filter(letter => letter.status === "delivered").length;

  // For the "Discover Stories" concept - show recent letters
  const availableLetters = deliveredLetters.slice(0, 6);

  // Mock data for premium/locked letters
  const lockedLetters = [
    {
      id: "locked-1",
      title: "Stories from the Mountains",
      content: "High up in the Himalayas, where the air is thin and the views are breathtaking, I discovered something about myself that I never knew existed...",
      senderCountry: "Nepal",
      interests: ["Travel", "Nature", "Philosophy"]
    },
    {
      id: "locked-2", 
      title: "Midnight Reflections in Tokyo",
      content: "The neon lights never sleep here, and neither do the dreams. Walking through Shibuya at 3 AM, I realized that sometimes being lost is exactly where you need to be...",
      senderCountry: "Japan",
      interests: ["Culture", "Philosophy", "Urban Life"]
    },
    {
      id: "locked-3",
      title: "Letters from a Lighthouse Keeper",
      content: "For thirty years, I've guided ships safely to shore. But tonight, as the storm rages outside, I write to you about the storms we weather within ourselves...",
      senderCountry: "Ireland", 
      interests: ["Literature", "Nature", "Solitude"]
    }
  ];

  const markAsRead = async (letterId: string) => {
    try {
      await api.markLetterAsRead(letterId);
      // Update local state
      setLetters(prev => prev.map(letter => 
        letter._id === letterId ? { ...letter, status: "read" as const, readAt: new Date().toISOString() } : letter
      ));
    } catch (error) {
      console.error("Error marking letter as read:", error);
    }
  };

  const handleReadLetter = (letter: Letter) => {
    setSelectedLetter(letter);
    setIsLetterModalOpen(true);
    if (letter.status === "delivered") {
      markAsRead(letter._id);
    }
  };

  const handleReplyToLetter = () => {
    if (!selectedLetter) return;
    
    // Create a friend object from the letter data
    const friend = {
      id: selectedLetter.sender?._id || 'unknown',
      name: selectedLetter.sender?.name || 'Unknown User',
      username: selectedLetter.sender?.username || 'unknown',
      country: selectedLetter.sender?.country || 'Unknown',
      interests: selectedLetter.sender?.interests || [],
      lettersExchanged: 1,
      lastActive: "Recently active"
    };

    setIsLetterModalOpen(false);
    navigate('/reply', { 
      state: { 
        replyTo: selectedLetter,
        friend: friend
      } 
    });
  };

  const formatLetterContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className={`${bodyClasses} mb-4 leading-relaxed`}>
        {paragraph}
      </p>
    ));
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
        subject: randomMatchTitle || "A letter from afar",
        content: randomMatchContent,
        interests: selectedInterests
      });
      
      // Reset form and close modal
      setRandomMatchTitle("");
      setRandomMatchContent("");
      setSelectedInterests([]);
      setIsRandomMatchModalOpen(false);
      
      // Show success message
      alert("Your letter has been sent to 3 random recipients! You'll receive new letters in the next 24-hour cycle.");
      
      // Optionally refresh cycle info (don't fail if not available)
      try {
        const cycleResponse = await api.getNextCycleInfo();
        setNextCycleTime(new Date(cycleResponse.nextCycleAt));
        setTimeUntilNext({
          hours: cycleResponse.timeRemaining.hours,
          minutes: cycleResponse.timeRemaining.minutes,
          seconds: cycleResponse.timeRemaining.seconds
        });
      } catch (error) {
        console.warn('Error refreshing cycle info:', error);
        // Keep using the existing fallback timer
      }
      
    } catch (error) {
      console.error("Error sending random match letter:", error);
      alert("Failed to send letter. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const calculateJourneyTime = (deliveredAt: string) => {
    const delivered = new Date(deliveredAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - delivered.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just arrived";
    if (diffInHours < 24) return `${diffInHours}h journey`;
    const days = Math.floor(diffInHours / 24);
    return `${days}d journey`;
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

  if (error) {
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

  // Debug information
  console.log('Inbox render - Letters count:', letters.length);
  console.log('Inbox render - Available letters:', availableLetters.length);
  console.log('Inbox render - Loading:', loading);
  console.log('Inbox render - Error:', error);

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
                  <p className={`text-sm font-medium ${headingClasses}`}>
                    Your Letters
                  </p>
                  <p className={`text-xs text-foreground/80`}>
                    {letters.length === 0 ? 'No letters yet' : `${letters.length} letter${letters.length !== 1 ? 's' : ''} total`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {unreadCount > 0 && (
                  <div className="flex items-center gap-2">
                    <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-jZvuQMZCi8XuT0afzKwdnQXwS7maTf.png" alt="" />
                    <div>
                      <p className={`text-xs font-medium text-green-600`}>
                        {unreadCount} unread letter{unreadCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
                
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
        </div>

        {/* Letters Grid */}
        <div className="max-w-6xl mx-auto">
          {/* First Row - Available Letters */}
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
                  className="shadow-letter border-none bg-white/95 backdrop-blur-sm hover:shadow-vintage transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  onClick={() => handleReadLetter(letter)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Letter Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <img className="h-6 w-6" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Globe" />
                          <span className={`text-sm ${accentClasses}`}>From {letter.sender?.country || 'Unknown'}</span>
                        </div>
                        {letter.status === "delivered" && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className={`text-xs ${bodyClasses} text-green-600`}>New</span>
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

                      {/* Journey Time */}
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
                          Read Letter
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

          <div className="space-y-6">
            {/* Letter Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-letter border-none">
              <form className="space-y-6">
                {/* Letter Title */}
                <div className="space-y-2">
                  <Label htmlFor="random-title" className={`text-sm font-medium ${headingClasses}`}>
                    Letter Title
                  </Label>
                  <Input
                    id="random-title"
                    value={randomMatchTitle}
                    onChange={(e) => setRandomMatchTitle(e.target.value)}
                    className="bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 font-spectral"
                    placeholder="Give your letter a meaningful title..."
                  />
                </div>

                {/* Interest Selection */}
                <div className="space-y-3">
                  <Label className={`text-sm font-medium ${headingClasses}`}>
                    Select Your Interests (Choose at least 1)
                  </Label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
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
                  <Label htmlFor="random-content" className={`text-sm font-medium ${headingClasses}`}>
                    Your Message
                  </Label>
                  <Textarea
                    id="random-content"
                    value={randomMatchContent}
                    onChange={(e) => setRandomMatchContent(e.target.value)}
                    className="bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 font-spectral min-h-[300px] resize-none"
                    placeholder="Dear stranger,&#10;&#10;I hope this letter finds you well. I wanted to share something that's been on my mind lately..."
                  />
                </div>

                {/* Writing Tips */}
                <div className="bg-primary/5 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                  <h4 className={`text-sm font-medium ${headingClasses} mb-2 text-primary`}>
                    Tips for Random Match Letters
                  </h4>
                  <ul className={`text-xs ${bodyClasses} space-y-1 text-foreground/80`}>
                    <li>• Share something personal but not too private</li>
                    <li>• Ask open-ended questions to encourage responses</li>
                    <li>• Be curious about other cultures and perspectives</li>
                    <li>• Write as if you're talking to a potential friend</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRandomMatchModalOpen(false)}
                    className="border-primary/20 hover:bg-primary/10 font-inter"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSendRandomMatch}
                    disabled={!randomMatchContent.trim() || selectedInterests.length === 0 || isSending}
                    className="bg-primary hover:bg-primary/90 font-inter flex items-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Sending to 3 recipients...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send to 3 Random Recipients
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Match Preview */}
            <div className="bg-accent/5 backdrop-blur-sm rounded-lg p-6 border border-accent/20">
              <h4 className={`text-sm font-medium ${headingClasses} mb-4 text-accent flex items-center gap-2`}>
                <Users className="h-4 w-4" />
                How Random Match Works
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <p className={`text-xs ${bodyClasses} text-foreground/80`}>
                    Your letter will be sent to 3 people who share your selected interests
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🌍</div>
                  <p className={`text-xs ${bodyClasses} text-foreground/80`}>
                    Recipients are randomly selected from different countries worldwide
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">💌</div>
                  <p className={`text-xs ${bodyClasses} text-foreground/80`}>
                    They can reply back, starting new conversations and friendships
                  </p>
                </div>
              </div>
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className={`text-2xl ${headingClasses} text-foreground mb-2`}>
                      {selectedLetter.subject}
                    </DialogTitle>
                    <div className="flex items-center gap-4 text-sm text-foreground/80">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>From {selectedLetter.sender.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{calculateJourneyTime(selectedLetter.deliveredAt)}</span>
                      </div>
                      <span>Received {formatTimeAgo(selectedLetter.deliveredAt)}</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* Letter Content */}
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-8 shadow-letter border-none">
                <div className="space-y-6">
                  {/* Letter Header Decoration */}
                  <div className="border-b border-primary/20 pb-4">
                    <div className="flex items-center gap-3">
                      <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Globe" />
                      <div>
                        <p className={`text-sm font-medium ${headingClasses}`}>
                          A letter from {selectedLetter.sender?.country || 'Unknown'}
                        </p>
                        <p className={`text-xs text-foreground/80`}>
                          From: {selectedLetter.sender?.name || 'Unknown'} (@{selectedLetter.sender?.username || 'unknown'})
                        </p>
                        <p className={`text-xs text-foreground/80`}>
                          Shared interests: {selectedLetter.sender?.interests?.join(', ') || 'None listed'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Letter Body */}
                  <div className="prose max-w-none">
                    {formatLetterContent(selectedLetter.content)}
                  </div>

                  {/* Letter Footer */}
                  <div className="border-t border-primary/20 pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-foreground/80'}`}
                          onClick={() => setIsLiked(!isLiked)}
                        >
                          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                          <span className="text-sm">Like</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 text-foreground/80"
                        >
                          <Share2 className="h-4 w-4" />
                          <span className="text-sm">Share</span>
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsLetterModalOpen(false)}
                          className="border-primary/20 hover:bg-primary/10 font-inter"
                        >
                          Close
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleReplyToLetter}
                          className="bg-primary hover:bg-primary/90 font-inter"
                        >
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
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