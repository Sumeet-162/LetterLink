import { useState } from "react";
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
import { X, Heart, Reply, Share2, MapPin, Clock, Send, Users, Globe, Shuffle } from "lucide-react";
import Navigation from "@/components/Navigation";
import "@/styles/fonts.css";

interface Letter {
  id: string;
  title: string;
  content: string;
  senderCountry: string;
  senderInterests: string[];
  status: "in-transit" | "delivered" | "sent-in-transit";
  deliveryTime: string;
  timeRemaining?: string;
  receivedAt?: string;
  isRead: boolean;
}

const Inbox = () => {
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [isRandomMatchModalOpen, setIsRandomMatchModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [randomMatchTitle, setRandomMatchTitle] = useState("");
  const [randomMatchContent, setRandomMatchContent] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [letters] = useState<Letter[]>([
    {
      id: "1",
      title: "Autumn Reflections from Tokyo",
      content: "Dear friend,\n\nI hope this letter finds you well. As I write this, the autumn leaves in Tokyo are painting the city in the most beautiful shades of red and gold. There's something magical about this season here - the way the light filters through the maple trees in Ueno Park reminds me of watercolor paintings.\n\nI've been thinking a lot about the concept of 'mono no aware' - the bittersweet awareness of the impermanence of all things. It's deeply embedded in Japanese culture, and perhaps it's why we cherish moments like these autumn days so deeply.\n\nWhat does autumn mean to you where you are? I'd love to hear about the seasons in your part of the world.\n\nWith warm regards from across the ocean,\nA fellow letter writer",
      senderCountry: "Japan",
      senderInterests: ["Philosophy", "Nature", "Photography"],
      status: "delivered",
      deliveryTime: "18 hours",
      receivedAt: "2 hours ago",
      isRead: false
    },
    {
      id: "2",
      title: "Notes from a Small Café in Prague",
      content: "Hello there,\n\nI'm writing this from my favorite little café in Prague's old town. The cobblestone streets are wet from this morning's rain, and there's a gentle warmth from the coffee and the sound of conversations in multiple languages around me.\n\nI've been reading Kafka lately (seems appropriate given the location), and his words about Prague being a city with claws that won't let you go really resonates with me. This city has a way of getting under your skin - the architecture tells stories of centuries past, and every corner seems to hold secrets.\n\nDo you have a place that feels like home to your soul? I'm curious about the corners of the world that speak to your heart.\n\nCheers,\nYour correspondent",
      senderCountry: "Czech Republic",
      senderInterests: ["Literature", "Architecture", "Travel"],
      status: "delivered",
      deliveryTime: "6 hours",
      receivedAt: "1 day ago",
      isRead: true
    },
    {
      id: "3",
      title: "Greetings from the Land Down Under",
      content: "G'day mate!\n\nI'm writing this while watching the sunset over Bondi Beach. The waves are perfect today, and there's something about the ocean that always makes me feel connected to the wider world. It's funny to think that this same water touches shores all around the globe, connecting all of us in ways we might not even realize.\n\nI've been surfing since I was a kid, and every time I'm out there on my board, I feel this incredible sense of freedom and connection to nature. Do you have any activities that make you feel truly alive and connected to the world around you?",
      senderCountry: "Australia",
      senderInterests: ["Nature", "Sports", "Travel"],
      status: "delivered",
      deliveryTime: "22 hours",
      receivedAt: "3 hours ago",
      isRead: false
    },
    {
      id: "4",
      title: "My Journey Through Italy",
      content: "I wanted to share my incredible journey through the Italian countryside. The rolling hills of Tuscany, the ancient streets of Rome, the romantic canals of Venice - each city told a different story, yet they all felt connected by this common thread of history and culture that runs through the entire country.\n\nThe food, oh the food! I've never tasted pasta so fresh, wine so rich, or gelato so perfectly creamy. But beyond the culinary delights, it was the people who made this trip truly special. Their warmth, their passion for life, their ability to find joy in the simple moments - it's something I'll carry with me forever.",
      senderCountry: "United States",
      senderInterests: ["Travel", "Food", "Culture"],
      status: "sent-in-transit",
      deliveryTime: "12 hours",
      timeRemaining: "8 hours 15 minutes",
      isRead: false
    },
    {
      id: "5",
      title: "Thoughts on Modern Art",
      content: "I've been exploring the local art scene here in Berlin, and I'm constantly amazed by the creativity and boldness of the artists I encounter. There's something about this city that seems to nurture artistic expression in all its forms - from street art that transforms entire neighborhoods to avant-garde installations that challenge our perceptions of reality.\n\nLast week, I visited a gallery where the artist had created an entire room that responded to visitors' movements with light and sound. It made me think about how art can be not just something we observe, but something we participate in and co-create.",
      senderCountry: "Germany",
      senderInterests: ["Art", "Culture", "Philosophy"],
      status: "sent-in-transit",
      deliveryTime: "6 hours",
      timeRemaining: "2 hours 30 minutes",
      isRead: false
    },
    {
      id: "6",
      title: "Midnight Musings from Mumbai",
      content: "It's past midnight here in Mumbai, and the city is still very much alive. The sounds of traffic, street vendors, and distant music create this incredible symphony that I've grown to love. There's an energy here that's unlike anywhere else I've been - it's chaotic and beautiful, overwhelming and inspiring all at once.\n\nI've been thinking about how cities shape us, and how we shape them in return. Every person who walks these streets leaves their mark, adds their story to the collective narrative of this place. What stories do the streets of your city tell?",
      senderCountry: "India",
      senderInterests: ["Culture", "Philosophy", "Urban Life"],
      status: "sent-in-transit",
      deliveryTime: "15 hours",
      timeRemaining: "12 hours 45 minutes",
      isRead: false
    }
  ]);

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

  const deliveredLetters = letters.filter(letter => letter.status === "delivered");
  const premiumLetters = letters.filter(letter => letter.status === "sent-in-transit");
  const unreadCount = deliveredLetters.filter(letter => !letter.isRead).length;

  // For the "Discover Stories" concept, we want exactly 6 letters:
  // 3 available (delivered) letters in the first row
  // 3 premium/locked letters in the second row
  const availableLetters = deliveredLetters.slice(0, 3);
  const lockedLetters = premiumLetters.slice(0, 3);

  const markAsRead = (letterId: string) => {
    // This would update the letter status in backend
    console.log("Marking letter as read:", letterId);
  };

  const handleReadLetter = (letter: Letter) => {
    setSelectedLetter(letter);
    setIsLetterModalOpen(true);
    markAsRead(letter.id);
  };

  const handleReplyToLetter = () => {
    setIsLetterModalOpen(false);
    navigate('/reply', { state: { replyTo: selectedLetter } });
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Handle successful send
      console.log("Random match letter sent:", {
        title: randomMatchTitle,
        content: randomMatchContent,
        interests: selectedInterests
      });
      
      // Reset form and close modal
      setRandomMatchTitle("");
      setRandomMatchContent("");
      setSelectedInterests([]);
      setIsRandomMatchModalOpen(false);
      
      // Show success message (you can implement toast notification here)
      alert("Your letter has been sent to 3 random recipients with similar interests!");
      
    } catch (error) {
      console.error("Error sending random match letter:", error);
    } finally {
      setIsSending(false);
    }
  };

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
            Six new letters from around the world, delivered fresh every 24 hours
          </p>
          
          {/* Additional Details */}
          <div className="border-t border-primary/20 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-uZIeLePaAt8YfYlabqbjKfSz1T3ESJ.png" alt="" />
                <div>
                  <p className={`text-sm font-medium ${headingClasses}`}>
                    Today's Selection
                  </p>
                  <p className={`text-xs text-foreground/80`}>
                    Stories from 6 different peoples
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-jZvuQMZCi8XuT0afzKwdnQXwS7maTf.png" alt="" />
                  <div>
                    <p className={`text-xs font-medium text-foreground`}>
                      Next refresh: 16h 42m
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-1ZcsBwwKPF9lpnaWTFwUAmxkHIeKXD.png" alt="" />
                  <div>
                    <p className={`text-xs font-medium text-foreground`}>
                      3 premium stories locked
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Letters Grid */}
        <div className="max-w-6xl mx-auto">
          {/* First Row - 3 Available Letters */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {availableLetters.map((letter, index) => (
              <Card 
                key={letter.id} 
                className="shadow-letter border-none bg-white/95 backdrop-blur-sm hover:shadow-vintage transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                onClick={() => setSelectedLetter(letter)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Letter Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <img className="h-6 w-6" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Globe" />
                        <span className={`text-sm ${accentClasses}`}>From {letter.senderCountry}</span>
                      </div>
                      {!letter.isRead && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className={`text-xs ${bodyClasses} text-green-600`}>New</span>
                        </div>
                      )}
                    </div>

                    {/* Letter Title */}
                    <h3 className={`text-lg font-semibold ${headingClasses} line-clamp-2`}>
                      {letter.title}
                    </h3>

                    {/* Letter Preview */}
                    <p className={`text-sm ${bodyClasses} line-clamp-3 opacity-80`}>
                      {letter.content.split('\n')[0]}
                    </p>

                    {/* Interests */}
                    <div className="flex flex-wrap gap-2">
                      {letter.senderInterests.slice(0, 2).map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>

                    {/* Journey Time */}
                    <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                      <span className={`text-xs ${bodyClasses} opacity-70`}>
                        Journey: {letter.deliveryTime}
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

          {/* Second Row - 3 Premium/Locked Letters */}
          <div className="grid md:grid-cols-3 gap-6">
            {lockedLetters.map((letter, index) => (
              <Card 
                key={letter.id} 
                className="shadow-letter border-none bg-white/95 backdrop-blur-sm hover:shadow-vintage transition-all duration-300 hover:scale-[1.02] cursor-pointer relative overflow-hidden"
              >
                {/* Lock Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                      <img className="h-6 w-6" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-1ZcsBwwKPF9lpnaWTFwUAmxkHIeKXD.png" alt="Lock" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${headingClasses}`}>
                        Premium Letter
                      </p>
                      <p className={`text-xs ${bodyClasses} opacity-70`}>
                        Unlock with Premium or reply to all letters above
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-primary/10 border-primary/30 hover:bg-primary/20 font-inter text-xs"
                    >
                      Unlock
                    </Button>
                  </div>
                </div>

                {/* Blurred Letter Content */}
                <CardContent className="p-6 opacity-40">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <img className="h-6 w-6" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Globe" />
                        <span className={`text-sm ${accentClasses}`}>From {letter.senderCountry}</span>
                      </div>
                    </div>

                    <h3 className={`text-lg font-semibold ${headingClasses} line-clamp-2`}>
                      {letter.title}
                    </h3>

                    <p className={`text-sm ${bodyClasses} line-clamp-3`}>
                      {letter.content.split('\n')[0]}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {letter.senderInterests.slice(0, 2).map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                      <span className={`text-xs ${bodyClasses} opacity-70`}>
                        Journey: {letter.deliveryTime}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Refresh Timer */}
          <div className="text-center mt-12">
            <Card className="shadow-letter border-none bg-white/95 backdrop-blur-sm inline-block">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-jZvuQMZCi8XuT0afzKwdnQXwS7maTf.png" alt="Clock" />
                  <div>
                    <p className={`text-sm font-medium ${headingClasses}`}>
                      Next Stories In
                    </p>
                    <p className={`text-lg font-bold ${headingClasses} text-primary`}>
                      16h 42m 18s
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
                    Send your letter to 3 random recipients worldwide based on shared interests
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
                      {selectedLetter.title}
                    </DialogTitle>
                    <div className="flex items-center gap-4 text-sm text-foreground/80">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>From {selectedLetter.senderCountry}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Journey: {selectedLetter.deliveryTime}</span>
                      </div>
                      {selectedLetter.receivedAt && (
                        <span>Received {selectedLetter.receivedAt}</span>
                      )}
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
                          A letter from {selectedLetter.senderCountry}
                        </p>
                        <p className={`text-xs text-foreground/80`}>
                          Shared interests: {selectedLetter.senderInterests.join(', ')}
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