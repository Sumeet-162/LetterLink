import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Clock, MapPin, Eye, Reply, Archive, Calendar, PenTool, Plus, Globe, Heart } from "lucide-react";
import { AnimateSvg } from "@/components/ui/AnimateSvg";
import Navigation from "@/components/Navigation";
import "@/styles/fonts.css";

interface Letter {
  id: string;
  title: string;
  content: string;
  senderCountry: string;
  senderInterests: string[];
  status: "in-transit" | "delivered";
  deliveryTime: string;
  timeRemaining?: string;
  receivedAt?: string;
  isRead: boolean;
}

const Inbox = () => {
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
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
      content: "G'day mate!\n\nI'm writing this while watching the sunset over Bondi Beach. The waves are perfect today, and there's something about the ocean that always makes me feel connected to the wider world. It's funny to think that this same water touches shores all around the globe...",
      senderCountry: "Australia",
      senderInterests: ["Nature", "Sports", "Travel"],
      status: "in-transit",
      deliveryTime: "22 hours",
      timeRemaining: "4 hours 23 minutes",
      isRead: false
    }
  ]);

  // Font combinations matching Landing page
  const headingClasses = "font-alata font-semibold tracking-tight";
  const bodyClasses = "font-spectral text-muted-foreground leading-relaxed";
  const accentClasses = "font-alata font-medium tracking-wide";

  const deliveredLetters = letters.filter(letter => letter.status === "delivered");
  const transitLetters = letters.filter(letter => letter.status === "in-transit");
  const unreadCount = deliveredLetters.filter(letter => !letter.isRead).length;

  const markAsRead = (letterId: string) => {
    // This would update the letter status in backend
    console.log("Marking letter as read:", letterId);
  };

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-b border-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
            </div>
            <h1 className={`text-4xl lg:text-5xl text-foreground ${headingClasses}`}>
              Your Letter Inbox
            </h1>
            <p className={`text-xl max-w-2xl mx-auto ${bodyClasses}`}>
              Letters from around the world, delivered at the speed of distance
            </p>
            {unreadCount > 0 && (
              <div className="flex justify-center">
                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-2 text-sm font-alata">
                  {unreadCount} new letter{unreadCount !== 1 ? 's' : ''} waiting
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Sidebar with Letters List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-vintage border-none bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <Button 
                    variant="letter" 
                    size="lg"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-alata"
                    onClick={() => navigate('/write')}
                  >
                    <PenTool className="h-4 w-4 mr-2" />
                    Write Letter
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="flex-1 border-primary/20 hover:bg-primary/10 font-alata"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* In Transit Letters */}
            {transitLetters.length > 0 && (
              <Card className="shadow-letter border-none bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className={`flex items-center gap-2 text-xl ${accentClasses}`}>
                    <div className="p-2 rounded-full bg-accent/10">
                      <Clock className="h-5 w-5 text-accent" />
                    </div>
                    Letters in Transit
                  </CardTitle>
                  <p className={`text-sm ${bodyClasses}`}>
                    {transitLetters.length} letter{transitLetters.length !== 1 ? 's' : ''} on the way
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {transitLetters.map((letter) => (
                    <div
                      key={letter.id}
                      className="group p-4 rounded-lg bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20 hover:shadow-vintage transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-accent" />
                            <span className={`text-sm ${accentClasses}`}>{letter.senderCountry}</span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30">
                            {letter.timeRemaining} left
                          </Badge>
                        </div>
                        <h3 className={`font-semibold text-sm line-clamp-2 ${headingClasses}`}>
                          {letter.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {letter.senderInterests.slice(0, 2).map((interest) => (
                            <Badge key={interest} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Delivered Letters */}
            <Card className="shadow-letter border-none bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className={`flex items-center gap-2 text-xl ${accentClasses}`}>
                  <div className="p-2 rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  Delivered Letters
                </CardTitle>
                <p className={`text-sm ${bodyClasses}`}>
                  {deliveredLetters.length} letter{deliveredLetters.length !== 1 ? 's' : ''} waiting to be read
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {deliveredLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className={`group p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:shadow-vintage hover:-translate-y-1 ${
                      selectedLetter?.id === letter.id
                        ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 shadow-lg'
                        : letter.isRead
                        ? 'bg-gradient-to-r from-secondary/20 to-secondary/10 border-secondary/30 hover:bg-secondary/30'
                        : 'bg-gradient-to-r from-white to-letter-paper border-primary/20 hover:border-primary/40 shadow-md'
                    }`}
                    onClick={() => {
                      setSelectedLetter(letter);
                      if (!letter.isRead) {
                        markAsRead(letter.id);
                      }
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-primary" />
                          <span className={`text-sm ${accentClasses}`}>{letter.senderCountry}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {!letter.isRead && (
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          )}
                          <Badge variant="outline" className="text-xs">
                            {letter.receivedAt}
                          </Badge>
                        </div>
                      </div>
                      <h3 className={`font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors ${
                        letter.isRead ? 'text-muted-foreground' : headingClasses
                      }`}>
                        {letter.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {letter.senderInterests.slice(0, 3).map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Letter Reader */}
          <div className="lg:col-span-3">
            {selectedLetter ? (
              <Card className="shadow-letter border-none bg-white/95 backdrop-blur-sm min-h-[700px]">
                <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h2 className={`text-2xl ${headingClasses}`}>
                            {selectedLetter.title}
                          </h2>
                          <p className={`${bodyClasses} text-base`}>
                            From {selectedLetter.senderCountry} • Journey time: {selectedLetter.deliveryTime}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {selectedLetter.senderInterests.map((interest) => (
                          <Badge key={interest} className="bg-primary/10 text-primary border-primary/20">
                            <Heart className="h-3 w-3 mr-1" />
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10">
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-8">
                  <div className="prose prose-lg max-w-none">
                    <div className={`whitespace-pre-wrap text-foreground leading-relaxed ${bodyClasses} text-base`}>
                      {selectedLetter.content}
                    </div>
                  </div>
                  
                  <Separator className="my-8 bg-primary/10" />
                  
                  <div className="flex justify-center">
                    <Button 
                      variant="letter" 
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white font-alata text-lg px-8 py-6 shadow-lg hover:scale-105 transition-all duration-300"
                      onClick={() => navigate('/write')}
                    >
                      <Reply className="h-5 w-5 mr-2" />
                      Write a Response
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-vintage border-none bg-white/95 backdrop-blur-sm min-h-[700px] flex items-center justify-center">
                <CardContent className="text-center space-y-6">
                  <div className="flex justify-center mb-4">
                    <AnimateSvg
                      width="120"
                      height="120"
                      viewBox="0 0 100 100"
                      className="mx-auto"
                      path="M20,20 L80,20 L80,80 L20,80 Z M20,20 L50,50 L80,20 M20,30 L50,60 L80,30"
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
                  <div className="space-y-4">
                    <h3 className={`text-2xl ${headingClasses}`}>
                      Select a Letter to Read
                    </h3>
                    <p className={`text-lg max-w-md mx-auto ${bodyClasses}`}>
                      Choose a delivered letter from your inbox to read its heartfelt contents
                    </p>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-primary/20 hover:bg-primary/10 font-alata"
                      onClick={() => navigate('/write')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Write Your First Letter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;