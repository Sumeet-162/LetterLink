import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Clock, MapPin, Eye, Reply, Archive, Calendar } from "lucide-react";

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

  const deliveredLetters = letters.filter(letter => letter.status === "delivered");
  const transitLetters = letters.filter(letter => letter.status === "in-transit");
  const unreadCount = deliveredLetters.filter(letter => !letter.isRead).length;

  const markAsRead = (letterId: string) => {
    // This would update the letter status in Supabase
    console.log("Marking letter as read:", letterId);
  };

  return (
    <div className="min-h-screen bg-gradient-paper p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card className="shadow-vintage">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-heading">Your Inbox</CardTitle>
            <p className="text-muted-foreground">
              Letters from around the world, delivered at the speed of distance
            </p>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                {unreadCount} unread letter{unreadCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Letters List */}
          <div className="lg:col-span-1 space-y-6">
            {/* In Transit Letters */}
            {transitLetters.length > 0 && (
              <Card className="shadow-letter">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-heading text-lg">
                    <Clock className="h-5 w-5 text-accent" />
                    In Transit ({transitLetters.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {transitLetters.map((letter) => (
                    <div
                      key={letter.id}
                      className="p-4 rounded-lg bg-accent/5 border border-accent/20 cursor-pointer hover:bg-accent/10 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-accent" />
                          <span className="font-medium text-sm">{letter.senderCountry}</span>
                        </div>
                        <h3 className="font-heading font-semibold text-sm line-clamp-2">
                          {letter.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Arrives in {letter.timeRemaining}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {letter.senderInterests.slice(0, 2).map((interest) => (
                            <Badge key={interest} variant="outline" className="text-xs">
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
            <Card className="shadow-letter">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  Delivered ({deliveredLetters.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deliveredLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-vintage ${
                      selectedLetter?.id === letter.id
                        ? 'bg-primary/10 border-primary/30'
                        : letter.isRead
                        ? 'bg-secondary/30 border-border'
                        : 'bg-letter-paper border-vintage-red/30'
                    }`}
                    onClick={() => {
                      setSelectedLetter(letter);
                      if (!letter.isRead) {
                        markAsRead(letter.id);
                      }
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{letter.senderCountry}</span>
                        </div>
                        {!letter.isRead && (
                          <div className="w-2 h-2 rounded-full bg-accent" />
                        )}
                      </div>
                      <h3 className={`font-heading font-semibold text-sm line-clamp-2 ${
                        letter.isRead ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {letter.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Received {letter.receivedAt}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {letter.senderInterests.slice(0, 2).map((interest) => (
                          <Badge key={interest} variant="outline" className="text-xs">
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
          <div className="lg:col-span-2">
            {selectedLetter ? (
              <Card className="shadow-letter bg-letter-paper min-h-[600px]">
                <CardHeader className="border-b border-vintage-red/20">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h2 className="font-heading font-semibold text-xl">
                            {selectedLetter.title}
                          </h2>
                          <p className="text-muted-foreground">
                            From {selectedLetter.senderCountry} • Travel time: {selectedLetter.deliveryTime}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {selectedLetter.senderInterests.map((interest) => (
                          <Badge key={interest} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed font-body">
                      {selectedLetter.content}
                    </div>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div className="flex justify-center">
                    <Button variant="letter" size="lg">
                      <Reply className="h-4 w-4 mr-2" />
                      Write a Response
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-vintage min-h-[600px] flex items-center justify-center">
                <CardContent className="text-center space-y-4">
                  <div className="p-8 rounded-full bg-muted/30 w-fit mx-auto">
                    <Eye className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-heading text-xl font-semibold">
                      Select a Letter to Read
                    </h3>
                    <p className="text-muted-foreground">
                      Choose a delivered letter from your inbox to read its contents
                    </p>
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