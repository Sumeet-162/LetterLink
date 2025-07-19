import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send, MapPin, Clock, User } from "lucide-react";
import Navigation from "@/components/Navigation";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated, getCurrentUserId } from "@/utils/auth";
import "@/styles/fonts.css";

interface Letter {
  _id: string;
  subject: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    name: string;
  };
  recipient: {
    _id: string;
    username: string;
    name: string;
  };
  status: "sent" | "delivered" | "read";
  type: "delivery" | "reply";
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  replyTo?: string;
}

interface Friend {
  _id: string;
  name: string;
  username: string;
  country: string;
  interests: string[];
  letterCount: number;
  lastActivity: string;
}

const ReplyLetter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [originalLetter, setOriginalLetter] = useState<Letter | null>(null);
  const [friend, setFriend] = useState<Friend | null>(null);
  const [replyTitle, setReplyTitle] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Font combinations
  const headingClasses = "font-inter font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-inter font-medium tracking-wide text-foreground/80";

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated()) {
      console.log('User not authenticated, redirecting to signin');
      toast({
        title: "Authentication Required",
        description: "Please log in to reply to letters.",
        variant: "destructive"
      });
      navigate('/signin');
      return;
    }

    const currentUserId = getCurrentUserId();
    console.log('Authenticated user ID:', currentUserId);

    if (location.state?.replyTo && location.state?.friend) {
      const letter = location.state.replyTo as Letter;
      const friendData = location.state.friend as Friend;
      console.log('Reply data from state:', { 
        letterId: letter._id, 
        friendName: friendData.name,
        letterSender: letter.sender,
        letterRecipient: letter.recipient,
        letterStatus: letter.status,
        currentUserId
      });
      setOriginalLetter(letter);
      setFriend(friendData);
      setReplyTitle(`Re: ${letter.subject}`);
    } else {
      console.log('No state provided - redirecting to inbox');
      toast({
        title: "No letter selected",
        description: "Please select a letter to reply to from your conversation.",
        variant: "destructive"
      });
      navigate('/inbox');
      return;
    }
  }, [location.state, navigate, toast]);

  useEffect(() => {
    const words = replyContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [replyContent]);

  const handleSendReply = async () => {
    if (!replyContent.trim() || !replyTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a subject and content for your reply.",
        variant: "destructive"
      });
      return;
    }

    if (wordCount < 10) {
      toast({
        title: "Reply too short",
        description: "Please write at least 10 words to send a meaningful reply.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    try {
      const result = await api.replyToLetter({
        letterId: originalLetter!._id,
        subject: replyTitle,
        content: replyContent,
        deliveryDelay: 0 // Send immediately
      });

      toast({
        title: "Reply sent successfully!",
        description: "Your reply has been sent and a friendship has been created. You can now continue the conversation from your Friends page.",
      });

      // Navigate back to inbox
      navigate('/inbox');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Failed to send reply",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!originalLetter || !friend) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
            <p>Preparing your reply...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/inbox')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Inbox
            </Button>
            <h1 className={`text-3xl ${headingClasses}`}>Reply to Letter</h1>
          </div>
          <p className={`text-lg ${bodyClasses} opacity-80`}>
            Craft a thoughtful response to continue the conversation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Original Letter Display */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className={`text-xl ${headingClasses}`}>Original Letter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sender Info */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-600" />
                  <span className={`font-medium ${accentClasses}`}>{friend?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  <span className={`text-sm ${accentClasses}`}>{friend?.country}</span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className={`text-sm ${accentClasses}`}>
                    {originalLetter && new Date(originalLetter.deliveredAt || originalLetter.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Friend's Interests */}
              {friend?.interests && friend.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {friend.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}

              <Separator />
              
              {/* Letter Subject */}
              <h4 className={`text-xl ${headingClasses} text-amber-800 break-words`}>{originalLetter?.subject}</h4>
              
              {/* Letter Content */}
              <div className="bg-white p-6 rounded-lg border border-amber-200 shadow-sm max-h-96 overflow-y-auto">
                <p className={`${bodyClasses} whitespace-pre-wrap leading-loose break-words`}>
                  {originalLetter?.content}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Reply Form */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className={`text-xl ${headingClasses}`}>Your Reply</CardTitle>
              <p className={`text-sm ${bodyClasses} opacity-70`}>
                Write a thoughtful response to continue this meaningful conversation
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reply Subject */}
              <div className="space-y-2">
                <Label htmlFor="replyTitle" className={`${accentClasses}`}>Subject</Label>
                <Input
                  id="replyTitle"
                  value={replyTitle}
                  onChange={(e) => setReplyTitle(e.target.value)}
                  placeholder="Re: Subject of your reply"
                  className="border-amber-200 focus:border-amber-400"
                />
              </div>

              {/* Reply Content */}
              <div className="space-y-2">
                <Label htmlFor="replyContent" className={`${accentClasses}`}>Message</Label>
                <Textarea
                  id="replyContent"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Share your thoughts, experiences, and continue the conversation in a meaningful way..."
                  className="min-h-[300px] border-amber-200 focus:border-amber-400 resize-none"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className={`${accentClasses} opacity-70`}>
                    {wordCount} words
                  </span>
                  <span className={`${accentClasses} opacity-70`}>
                    Minimum 10 words required
                  </span>
                </div>
              </div>

              {/* Send Button */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSendReply}
                  disabled={isSending || !replyContent.trim() || !replyTitle.trim() || wordCount < 10}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-2"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Reply...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Reply
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReplyLetter;
