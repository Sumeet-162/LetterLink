import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, MapPin, Clock, Heart, User } from "lucide-react";
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

const ReplyLetter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [originalLetter, setOriginalLetter] = useState<Letter | null>(null);
  const [replyTitle, setReplyTitle] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Font combinations with Inter replacing Alata
  const headingClasses = "font-inter font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-inter font-medium tracking-wide text-foreground/80";

  useEffect(() => {
    // Get the original letter from the location state
    if (location.state?.replyTo) {
      const letter = location.state.replyTo as Letter;
      setOriginalLetter(letter);
      setReplyTitle(`Re: ${letter.title}`);
    } else {
      // If no letter to reply to, redirect to inbox
      navigate('/inbox');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    // Update word count
    const words = replyContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [replyContent]);

  const handleSendReply = async () => {
    if (!replyContent.trim() || !originalLetter) return;

    setIsSending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Handle successful reply
      console.log("Reply sent:", {
        originalLetterId: originalLetter.id,
        replyTitle,
        replyContent,
        recipientCountry: originalLetter.senderCountry
      });
      
      // Navigate back to inbox with success message
      navigate('/inbox', { 
        state: { 
          message: "Your reply has been sent successfully!" 
        }
      });
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatLetterContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className={`${bodyClasses} mb-3 leading-relaxed text-sm`}>
        {paragraph}
      </p>
    ));
  };

  if (!originalLetter) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl ${headingClasses} mb-4`}>Loading...</h2>
          <p className={`${bodyClasses}`}>Preparing your reply...</p>
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
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/inbox')}
              className="flex items-center gap-2 text-foreground/80 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Inbox
            </Button>
            <h2 className={`text-3xl lg:text-4xl text-foreground ${headingClasses}`}>
              Reply to Letter
            </h2>
            <img className="h-16 w-16" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-C11jyRrHOs8lCOeNpdk3Qr3hLD3Oxt.png" alt="" />
          </div>
          <p className={`text-lg text-foreground/80 ${bodyClasses}`}>
            Craft a thoughtful response to continue the conversation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Original Letter (Left Side) */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
              <div className="flex items-center gap-3 mb-4">
                <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Globe" />
                <h3 className={`text-lg font-semibold ${headingClasses}`}>
                  Original Letter
                </h3>
              </div>
              
              <Card className="shadow-letter border-none bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Letter Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-foreground/60" />
                        <span className={`text-sm ${accentClasses}`}>From {originalLetter.senderCountry}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-foreground/60" />
                        <span className={`text-xs ${bodyClasses} text-foreground/80`}>
                          Journey: {originalLetter.deliveryTime}
                        </span>
                      </div>
                    </div>

                    {/* Letter Title */}
                    <h4 className={`text-xl font-semibold ${headingClasses} line-clamp-2`}>
                      {originalLetter.title}
                    </h4>

                    {/* Interests */}
                    <div className="flex flex-wrap gap-2">
                      {originalLetter.senderInterests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>

                    {/* Letter Content */}
                    <div className="border-t border-primary/20 pt-4 max-h-96 overflow-y-auto">
                      <div className="prose max-w-none">
                        {formatLetterContent(originalLetter.content)}
                      </div>
                    </div>

                    {/* Letter Footer */}
                    <div className="border-t border-primary/20 pt-3">
                      <div className="flex items-center justify-between text-xs text-foreground/80">
                        <span>Received {originalLetter.receivedAt}</span>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>Reply with care</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reply Form (Right Side) */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
              <div className="flex items-center gap-3 mb-4">
                <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-LbbTlDq23FfQOaE1hGPNvZopMasIkn.png" alt="Write" />
                <h3 className={`text-lg font-semibold ${headingClasses}`}>
                  Your Reply
                </h3>
              </div>

              <form className="space-y-6">
                {/* Reply Title */}
                <div className="space-y-2">
                  <Label htmlFor="reply-title" className={`text-sm font-medium ${headingClasses}`}>
                    Subject
                  </Label>
                  <Input
                    id="reply-title"
                    value={replyTitle}
                    onChange={(e) => setReplyTitle(e.target.value)}
                    className="bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 font-spectral"
                    placeholder="Re: Letter title..."
                  />
                </div>

                {/* Reply Content */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reply-content" className={`text-sm font-medium ${headingClasses}`}>
                      Your Message
                    </Label>
                    <span className={`text-xs ${bodyClasses} text-foreground/60`}>
                      {wordCount} words
                    </span>
                  </div>
                  <Textarea
                    id="reply-content"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 font-spectral min-h-[400px] resize-none"
                    placeholder="Dear friend,&#10;&#10;Thank you for your wonderful letter. I was touched by your thoughts about..."
                  />
                </div>

                {/* Writing Tips */}
                <div className="bg-primary/5 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                  <h4 className={`text-sm font-medium ${headingClasses} mb-2 text-primary`}>
                    Writing Tips for Replies
                  </h4>
                  <ul className={`text-xs ${bodyClasses} space-y-1 text-foreground/80`}>
                    <li>• Reference specific parts of their letter that resonated with you</li>
                    <li>• Share your own experiences related to their stories</li>
                    <li>• Ask thoughtful questions to continue the conversation</li>
                    <li>• Be genuine and let your personality shine through</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/inbox')}
                    className="border-primary/20 hover:bg-primary/10 font-inter"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSendReply}
                    disabled={!replyContent.trim() || isSending}
                    className="bg-primary hover:bg-primary/90 font-inter flex items-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Recipient Info */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-foreground/60" />
                <div>
                  <p className={`text-sm font-medium ${headingClasses}`}>
                    Sending to
                  </p>
                  <p className={`text-xs ${bodyClasses} text-foreground/80`}>
                    Anonymous writer in {originalLetter.senderCountry}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyLetter;
