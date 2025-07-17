import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Calendar, Eye, Reply, Globe, User, Clock, CloudSun } from "lucide-react";
import Navigation from "@/components/Navigation";
import "@/styles/fonts.css";

interface Letter {
  id: string;
  title: string;
  content: string;
  sender: "user" | "friend";
  dateSent: string;
  isRead: boolean;
  status: "delivered" | "in-transit" | "read";
  hasBeenRepliedTo?: boolean;
}

interface Friend {
  id: string;
  name: string;
  country: string;
  interests: string[];
  lettersExchanged: number;
  lastActive: string;
}

const FriendConversation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [letters, setLetters] = useState<Letter[]>([
    {
      id: "1",
      title: "Greetings from Tokyo",
      content: "Dear friend,\n\nI hope this letter finds you well. I wanted to share with you the beautiful cherry blossoms I witnessed in Tokyo this spring. The sakura season here is truly magical, and I couldn't help but think of you and our shared love for nature.\n\nThe streets were lined with pink petals dancing in the gentle breeze, and families gathered under the blooming trees for hanami picnics. There's something so peaceful about this tradition - taking time to appreciate the fleeting beauty of the blossoms.\n\nI've been reflecting on our conversations about mindfulness and being present in the moment. The cherry blossoms remind me that beauty is often temporary, which makes it all the more precious.\n\nI'd love to hear about the seasons in your part of the world. What natural wonders have caught your attention lately?\n\nWith warm regards,\nAkira",
      sender: "friend",
      dateSent: "2024-03-15",
      isRead: true,
      status: "read",
      hasBeenRepliedTo: true
    },
    {
      id: "2",
      title: "Spring reflections",
      content: "Dear Akira,\n\nThank you for your beautiful letter about the cherry blossoms! Your description transported me right to Tokyo. I could almost smell the spring air and feel the gentle breeze you wrote about.\n\nHere in my city, spring has arrived with a burst of color too. The local park where I often walk has been transformed into a canvas of tulips, daffodils, and flowering trees. I've been taking my morning walks there, trying to practice the mindfulness you often write about.\n\nYour words about the temporary nature of beauty really resonated with me. It's made me more aware of the small moments of wonder in my daily life - the way sunlight filters through leaves, the sound of birds in the morning, the smile of a stranger.\n\nI've been reading more about Japanese philosophy and culture since our correspondence began. The concept of mono no aware - the bittersweet awareness of the impermanence of all things - seems to capture exactly what you described about the cherry blossoms.\n\nThank you for inspiring me to see the world through new eyes.\n\nWith gratitude,\nYour friend",
      sender: "user",
      dateSent: "2024-03-22",
      isRead: true,
      status: "delivered"
    },
    {
      id: "3",
      title: "Photography adventures",
      content: "Dear friend,\n\nI was so moved by your letter about spring in your city! It sounds like you've truly embraced the art of mindful observation. Your description of the morning light filtering through leaves painted such a vivid picture in my mind.\n\nI'm delighted that you've been exploring Japanese philosophy. Mono no aware is indeed a central concept in how we view beauty and life. It's wonderful to know that our letters have sparked this interest in you.\n\nI wanted to share some exciting news - I've been working on a photography project capturing the changing seasons in different neighborhoods of Tokyo. Each photograph tells a story of transformation and impermanence. I've been thinking of you as I frame each shot, wondering what stories the light and shadows would tell to someone seeing them for the first time.\n\nPerhaps in my next letter, I can share some of these photographs with you. I think you would appreciate the interplay of nature and urban life that defines much of Tokyo's character.\n\nI've also been curious about your interests in literature and architecture. Are there any buildings or spaces in your city that inspire you? I'd love to hear about the places that bring you joy.\n\nLooking forward to your next letter,\nAkira",
      sender: "friend",
      dateSent: "2024-04-03",
      isRead: true,
      status: "read",
      hasBeenRepliedTo: true
    },
    {
      id: "4",
      title: "City architecture and hidden gems",
      content: "Dear Akira,\n\nYour photography project sounds absolutely fascinating! I would love to see your photographs of Tokyo's changing seasons. The way you describe the interplay between nature and urban life makes me want to explore my own city with fresh eyes.\n\nSpeaking of architecture, there's a beautiful old library in the historic district of my city that has become my favorite refuge. Built in the 1920s, it has these magnificent arched windows that cast the most incredible patterns of light across the reading rooms throughout the day. I often find myself there not just for the books, but for the peaceful atmosphere and the way the light changes as the hours pass.\n\nThere's also a small bridge over the river that runs through the city center. It's not particularly famous or grand, but there's something about the way it connects two different neighborhoods - two different worlds, really - that I find deeply moving. I often pause there during my walks, watching the water flow beneath and people crossing back and forth.\n\nYour letters have taught me to notice these details that I might have overlooked before. Thank you for that gift of awareness.\n\nI'm curious about your neighborhood in Tokyo. What are the sounds, smells, and sights that define your daily experience?\n\nWith appreciation,\nYour friend",
      sender: "user",
      dateSent: "2024-04-12",
      isRead: true,
      status: "delivered"
    },
    {
      id: "5",
      title: "Seasonal transitions and daily rituals",
      content: "Dear friend,\n\nYour descriptions of the library and the bridge filled me with such warmth! I can picture you in that historic library, surrounded by the dancing patterns of light. There's something so beautiful about finding sanctuary in unexpected places.\n\nYou asked about my neighborhood in Tokyo - it's a fascinating blend of old and new. In the morning, I'm awakened by the gentle chime of the temple bell just a few blocks away. The sound mingles with the distant hum of the city waking up. There's a small ramen shop on my corner where the elderly owner has been serving the same recipe for thirty years. The aroma of miso and ginger often drifts up to my window.\n\nWhat strikes me most is how the seasons transform even the most urban spaces. Right now, as we transition into summer, the hydrangeas are blooming in tiny gardens tucked between buildings. Children walk to school under umbrellas during the rainy season, and the sound of cicadas will soon fill the evening air.\n\nI've been thinking about impermanence again - how these daily rituals and seasonal changes remind us that life is always in motion, always transforming.\n\nI hope you're finding similar moments of beauty in your daily walks. What seasonal changes are you noticing in your part of the world?\n\nWith continuing friendship,\nAkira",
      sender: "friend",
      dateSent: "2024-04-25",
      isRead: true,
      status: "read",
      hasBeenRepliedTo: false
    }
  ]);
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
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

  // Get the most recent letter from friend that hasn't been replied to
  const getLatestUnrepliedFriendLetter = () => {
    const friendLetters = letters
      .filter(letter => letter.sender === 'friend' && !letter.hasBeenRepliedTo)
      .sort((a, b) => new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime());
    
    return friendLetters[0] || null;
  };

  // Check if a letter can be replied to
  const canReplyToLetter = (letter: Letter) => {
    if (letter.sender === 'user') return false; // Can't reply to own letters
    if (letter.hasBeenRepliedTo) return false; // Already replied to
    
    const latestUnrepliedLetter = getLatestUnrepliedFriendLetter();
    return latestUnrepliedLetter && latestUnrepliedLetter.id === letter.id;
  };

  // Get friend data from navigation state
  const friend = location.state?.friend as Friend;

  // Font combinations with Inter replacing Alata
  const headingClasses = "font-inter font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-inter font-medium tracking-wide text-foreground/80";

  const handleLetterClick = (letter: Letter) => {
    setSelectedLetter(letter);
    setShowLetterModal(true);
  };

  const handleCloseModal = () => {
    setShowLetterModal(false);
    setSelectedLetter(null);
  };

  const handleWriteLetter = () => {
    navigate('/write', { state: { recipient: friend } });
  };

  const handleReplyToLetter = (letter: Letter) => {
    // Mark the letter as replied to
    setLetters(prevLetters => 
      prevLetters.map(l => 
        l.id === letter.id ? { ...l, hasBeenRepliedTo: true } : l
      )
    );
    
    navigate('/reply', { state: { replyTo: letter, friend } });
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
        <div className="text-center">
          <h2 className={`text-2xl ${headingClasses} mb-4`}>Friend not found</h2>
          <Button onClick={() => navigate('/friends')} className="bg-primary hover:bg-primary/90 text-white font-inter">
            Back to Friends
          </Button>
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
              <span className={`${bodyClasses}`}>{friend.lettersExchanged} letters exchanged</span>
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
          {letters.map((letter) => (
            <div
              key={letter.id}
              className={`bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6 cursor-pointer hover:shadow-xl transition-all duration-300 ${
                letter.sender === 'user' ? 'ml-12' : 'mr-12'
              }`}
              onClick={() => handleLetterClick(letter)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${letter.sender === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {letter.sender === 'user' ? (
                      <User className="h-4 w-4 text-blue-600" />
                    ) : (
                      <img className="h-4 w-4" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Friend" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${headingClasses}`}>
                      {letter.title}
                    </h3>
                    <p className={`text-sm ${accentClasses}`}>
                      {letter.sender === 'user' ? 'You' : friend.name} • {formatDate(letter.dateSent)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={letter.status === 'delivered' ? 'default' : 'secondary'} className="text-xs">
                    {letter.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLetterClick(letter);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <p className={`${bodyClasses} line-clamp-3 mb-4`}>
                {letter.content.split('\n')[0]}
              </p>
              
              <div className="flex items-center justify-between">
                <span className={`text-sm ${accentClasses}`}>
                  Click to read full letter
                </span>
                {canReplyToLetter(letter) && (
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
                {letter.sender === 'friend' && letter.hasBeenRepliedTo && (
                  <Badge variant="secondary" className="text-xs">
                    Replied
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Letter Reading Modal */}
      {showLetterModal && selectedLetter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border-none max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${selectedLetter.sender === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {selectedLetter.sender === 'user' ? (
                      <User className="h-5 w-5 text-blue-600" />
                    ) : (
                      <img className="h-5 w-5" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Friend" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold ${headingClasses}`}>
                      {selectedLetter.title}
                    </h3>
                    <p className={`text-sm ${accentClasses}`}>
                      {selectedLetter.sender === 'user' ? 'You' : friend.name} • {formatDate(selectedLetter.dateSent)}
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
                  Sent on {formatDate(selectedLetter.dateSent)}
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
                {selectedLetter.sender === 'friend' && selectedLetter.hasBeenRepliedTo && (
                  <Badge variant="secondary" className="text-xs">
                    Already Replied
                  </Badge>
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
