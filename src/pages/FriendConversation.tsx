import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Calendar, Eye, Reply, Globe, User, Clock, CloudSun, Loader2, Timer } from "lucide-react";
import Navigation from "@/components/Navigation";
import { api } from "@/services/api";
import { getCurrentUserId } from "@/utils/auth";
import { getLetterDeliveryStatus, formatRemainingTime, getDeliveryEmoji, getDeliveryColor } from "@/utils/deliveryTimer";
import "@/styles/fonts.css";

interface Letter {
  _id: string;
  subject: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    name: string;
    profilePicture?: string;
  };
  recipient: {
    _id: string;
    username: string;
    name: string;
    profilePicture?: string;
  };
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
  status: "sent" | "delivered" | "read";
  type: "delivery" | "reply";
  replyTo?: string;
  deliveryDelay?: number;
  scheduledDelivery?: string;
}

interface Friend {
  _id: string;
  username: string;
  name: string;
  country: string;
  timezone?: string;
  interests?: string[];
  letterCount: number;
  lastActivity: string;
  lastActivityType: "sent" | "delivered" | "received" | "replied";
}

const FriendConversation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get friend data from navigation state
  const friend = location.state?.friend as Friend;

  // Get current user ID from JWT token
  const currentUserId = getCurrentUserId();

  // Load conversation letters from API
  useEffect(() => {
    const loadConversation = async () => {
      if (!friend?._id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is authenticated
        if (!currentUserId) {
          console.warn('No authenticated user found');
          setError('Authentication required');
          return;
        }
        
        console.log('Current user ID:', currentUserId);
        
        // Load conversation
        const conversationLetters = await api.getConversation(friend._id);
        console.log('Loaded conversation letters:', conversationLetters);
        setLetters(conversationLetters || []);
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError('Failed to load conversation. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [friend?._id]);

  // Check if we need to refresh the conversation (e.g., after sending a reply)
  useEffect(() => {
    const shouldRefresh = location.state?.refreshConversation;
    if (shouldRefresh && friend?._id) {
      // Refresh the conversation to show the new reply
      const refreshConversation = async () => {
        try {
          const conversationLetters = await api.getConversation(friend._id);
          console.log('Conversation refreshed with new letters:', conversationLetters);
          setLetters(conversationLetters || []);
        } catch (err) {
          console.error('Error refreshing conversation:', err);
        }
      };
      
      refreshConversation();
      
      // Clear the refresh flag to prevent repeated refreshes
      navigate('/friend-conversation', { 
        state: { 
          friend,
          message: location.state?.message 
        },
        replace: true 
      });
    }
  }, [location.state?.refreshConversation, friend?._id, navigate, location.state?.message]);
  
  // Update time every minute and refresh delivery status
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Force re-render to update delivery timers
      setLetters(prevLetters => [...prevLetters]);
    }, 30000); // Update every 30 seconds for delivery timers
    
    return () => clearInterval(timer);
  }, []);
  
  // Mock weather data based on friend's country
  const getWeatherInfo = (country: string) => {
    const weatherData: { [key: string]: { temp: string; condition: string; icon: string } } = {
      "Japan": { temp: "22°C", condition: "Partly Cloudy", icon: "☁️" },
      "Czech Republic": { temp: "18°C", condition: "Sunny", icon: "☀️" },
      "Australia": { temp: "26°C", condition: "Clear", icon: "🌞" },
      "default": { temp: "20°C", condition: "Mild", icon: "🌤️" }
    };
    
    return weatherData[country] || weatherData["default"];
  };
  
  const formatFriendTime = (friendCountry: string) => {
    // Mock time zones for different countries
    const timezones: { [key: string]: string } = {
      "Japan": "Asia/Tokyo",
      "Czech Republic": "Europe/Prague",
      "Australia": "Australia/Sydney"
    };
    
    const timezone = timezones[friendCountry];
    if (timezone) {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(currentTime);
    }
    
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(currentTime);
  };

  // Helper function to check if current user is the sender
  const isCurrentUserSender = (letter: Letter) => {
    const letterSenderId = letter.sender._id;
    const isSender = letterSenderId === currentUserId || letterSenderId.toString() === currentUserId || letterSenderId === currentUserId?.toString();
    
    console.log('isCurrentUserSender check:', {
      letterId: letter._id,
      letterSenderId: letterSenderId,
      letterSenderName: letter.sender.name,
      currentUserId: currentUserId,
      letterSenderIdType: typeof letterSenderId,
      currentUserIdType: typeof currentUserId,
      strictEquals: letterSenderId === currentUserId,
      stringEquals: letterSenderId.toString() === currentUserId,
      bothStringEquals: letterSenderId.toString() === currentUserId?.toString(),
      finalResult: isSender,
      letterType: letter.type
    });
    return isSender;
  };

  // Get the most recent letter from friend that hasn't been replied to
  const getLatestUnrepliedFriendLetter = () => {
    // Find letters that don't have replies
    const unrepliedLetters = letters.filter(letter => {
      if (isCurrentUserSender(letter)) return false; // Skip own letters
      
      // Check if this letter has been replied to by finding a reply to it
      const hasReply = letters.some(replyLetter => 
        replyLetter.replyTo === letter._id && isCurrentUserSender(replyLetter)
      );
      
      return !hasReply;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return unrepliedLetters[0] || null;
  };

  // Check if a letter can be replied to
  const canReplyToLetter = (letter: Letter) => {
    if (isCurrentUserSender(letter)) return false; // Can't reply to own letters
    
    // Check if this letter has been replied to
    const hasReply = letters.some(replyLetter => 
      replyLetter.replyTo === letter._id && isCurrentUserSender(replyLetter)
    );
    
    if (hasReply) return false; // Already replied to
    
    const latestUnrepliedLetter = getLatestUnrepliedFriendLetter();
    return latestUnrepliedLetter && latestUnrepliedLetter._id === letter._id;
  };

  // Font combinations with Inter replacing Alata
  const headingClasses = "font-inter font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-inter font-medium tracking-wide text-foreground/80";

  const handleLetterClick = async (letter: Letter) => {
    setSelectedLetter(letter);
    setShowLetterModal(true);
    
    // Mark letter as read if it's not already read and user is the recipient
    if (letter.status !== 'read' && !isCurrentUserSender(letter)) {
      try {
        console.log('Marking letter as read when viewing:', letter._id);
        await api.markLetterAsRead(letter._id);
        
        // Update the letter status locally
        setLetters(prevLetters => 
          prevLetters.map(l => 
            l._id === letter._id ? { ...l, status: 'read' as const } : l
          )
        );
      } catch (error) {
        console.error('Error marking letter as read:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowLetterModal(false);
    setSelectedLetter(null);
  };

  const handleWriteLetter = () => {
    navigate('/write', { state: { recipient: friend } });
  };

  const handleReplyToLetter = async (letter: Letter) => {
    try {
      // Mark letter as read first (required for replying)
      if (letter.status !== 'read') {
        console.log('Marking letter as read before replying:', letter._id);
        await api.markLetterAsRead(letter._id);
        
        // Update the letter status locally
        const updatedLetter = { ...letter, status: 'read' as const };
        navigate('/reply', { state: { replyTo: updatedLetter, friend } });
      } else {
        navigate('/reply', { state: { replyTo: letter, friend } });
      }
    } catch (error) {
      console.error('Error marking letter as read:', error);
      // Still allow navigation even if marking as read fails
      navigate('/reply', { state: { replyTo: letter, friend } });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatLetterContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className={`${bodyClasses} mb-3 leading-relaxed`}>
        {paragraph}
      </p>
    ));
  };

  if (!friend) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Navigation />
        <div className="text-center">
          <h2 className={`text-2xl ${headingClasses} mb-4`}>Friend not found</h2>
          <Button onClick={() => navigate('/friends')} className="bg-primary hover:bg-primary/90 text-white font-inter">
            Back to Friends
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className={`${bodyClasses} text-foreground/70`}>Loading conversation...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className={`text-xl ${headingClasses} mb-4 text-red-600`}>Error Loading Conversation</h2>
              <p className={`${bodyClasses} text-foreground/70 mb-4`}>{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90 text-white font-inter">
                Try Again
              </Button>
            </div>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/friends')}
                className="flex items-center gap-2 text-foreground/80 hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Friends
              </Button>
              <h2 className={`text-3xl lg:text-4xl text-foreground ${headingClasses}`}>
                Conversation with {friend.name}
              </h2>
              <img className="h-16 w-16" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-C11jyRrHOs8lCOeNpdk3Qr3hLD3Oxt.png" alt="" />
            </div>
            
            {/* Time and Weather Section */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3 text-right">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-foreground/60" />
                  <span className={`text-sm ${bodyClasses}`}>
                    {friend.country}: {formatFriendTime(friend.country)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div className="flex items-center gap-2">
                  <CloudSun className="h-4 w-4 text-foreground/60" />
                  <span className={`text-sm ${bodyClasses}`}>
                    {getWeatherInfo(friend.country).temp} • {getWeatherInfo(friend.country).condition}
                  </span>
                  <span className="text-lg">{getWeatherInfo(friend.country).icon}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-foreground/60" />
              <span className={`${bodyClasses}`}>{friend.country}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-foreground/60" />
              <span className={`${bodyClasses}`}>{friend.letterCount || 0} letters exchanged</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <Button
            onClick={handleWriteLetter}
            className="bg-primary hover:bg-primary/90 text-white font-inter"
          >
            <Mail className="h-4 w-4 mr-2" />
            Write New Letter
          </Button>
        </div>

        {/* Letters List */}
        <div className="space-y-6">
          {letters.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-foreground/40 mx-auto mb-4" />
              <h3 className={`text-lg ${headingClasses} text-foreground/70 mb-2`}>No letters yet</h3>
              <p className={`${bodyClasses} text-foreground/60 mb-4`}>Start your conversation by writing a letter!</p>
              <Button 
                onClick={handleWriteLetter}
                className="bg-primary hover:bg-primary/90 text-white font-inter"
              >
                Write First Letter
              </Button>
            </div>
          ) : (
            letters.map((letter) => {
              const deliveryStatus = getLetterDeliveryStatus(letter);
              const canReadLetter = deliveryStatus.canRead || isCurrentUserSender(letter);
              
              return (
              <div
                key={letter._id}
                className={`bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6 cursor-pointer hover:shadow-xl transition-all duration-300 ${
                  isCurrentUserSender(letter) ? 'ml-12' : 'mr-12'
                } ${!canReadLetter ? 'opacity-75' : ''}`}
                onClick={() => canReadLetter && handleLetterClick(letter)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isCurrentUserSender(letter) ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {isCurrentUserSender(letter) ? (
                        <User className="h-4 w-4 text-blue-600" />
                      ) : (
                        <img className="h-4 w-4" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Friend" />
                      )}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${headingClasses}`}>
                        {letter.subject}
                      </h3>
                      <p className={`text-sm ${accentClasses}`}>
                        {isCurrentUserSender(letter) ? 'You' : friend.name} • {formatDate(letter.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Delivery Status Badge */}
                    {deliveryStatus.isInTransit && (
                      <Badge variant="outline" className={`text-xs ${getDeliveryColor(deliveryStatus)} border-orange-200 bg-orange-50`}>
                        <Timer className="h-3 w-3 mr-1" />
                        {deliveryStatus.formattedTime}
                      </Badge>
                    )}
                    
                    <Badge variant={letter.status === 'delivered' ? 'default' : 'secondary'} className="text-xs">
                      {getDeliveryEmoji(deliveryStatus)} {letter.status}
                    </Badge>
                    
                    {letter.type === 'reply' && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        Reply
                      </Badge>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canReadLetter) {
                          handleLetterClick(letter);
                        }
                      }}
                      disabled={!canReadLetter}
                      className={!canReadLetter ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className={`${bodyClasses} line-clamp-3 mb-4 ${!canReadLetter ? 'blur-sm' : ''}`}>
                  {canReadLetter ? letter.content.split('\n')[0] : 'Letter is traveling... Please wait for delivery.'}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${accentClasses}`}>
                    {deliveryStatus.isInTransit ? `Arriving in ${deliveryStatus.formattedTime}` : 'Click to read full letter'}
                  </span>
                  {canReplyToLetter(letter) && canReadLetter && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplyToLetter(letter);
                      }}
                      className="border-primary/20 hover:bg-primary/10"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  )}
                </div>
              </div>
            );
            })
          )}
        </div>
      </div>

      {/* Letter Reading Modal */}
      {showLetterModal && selectedLetter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border-none max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isCurrentUserSender(selectedLetter) ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {isCurrentUserSender(selectedLetter) ? (
                      <User className="h-5 w-5 text-blue-600" />
                    ) : (
                      <img className="h-5 w-5" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Friend" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold ${headingClasses}`}>
                      {selectedLetter.subject}
                    </h3>
                    <p className={`text-sm ${accentClasses}`}>
                      {isCurrentUserSender(selectedLetter) ? 'You' : friend.name} • {formatDate(selectedLetter.createdAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="text-foreground/60 hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="prose max-w-none">
                {formatLetterContent(selectedLetter.content)}
              </div>
            </div>
            
            <div className="p-6 border-t border-primary/20 flex justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-foreground/60" />
                <span className={`text-sm ${bodyClasses}`}>
                  Sent on {formatDate(selectedLetter.createdAt)}
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="border-primary/20 hover:bg-primary/10 font-inter"
                >
                  Close
                </Button>
                {canReplyToLetter(selectedLetter) && (
                  <Button
                    onClick={() => {
                      handleCloseModal();
                      handleReplyToLetter(selectedLetter);
                    }}
                    className="bg-primary hover:bg-primary/90 text-white font-inter"
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendConversation;
