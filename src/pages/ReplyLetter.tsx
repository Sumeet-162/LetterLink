import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send } from "lucide-react";
import Navigation from "@/components/Navigation";
import LetterDialog from "@/components/LetterDialog";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated, getCurrentUserId } from "@/utils/auth";

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
  createdAt: string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
      // Open the dialog immediately
      setIsDialogOpen(true);
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

  const handleSendReply = async (data: { subject: string; content: string }) => {
    const result = await api.replyToLetter({
      letterId: originalLetter!._id,
      subject: data.subject,
      content: data.content,
      deliveryDelay: 0 // Send immediately
    });

    toast({
      title: "Reply sent successfully!",
      description: "Your reply has been sent to your friend.",
    });

    // Navigate back to friend conversation
    navigate('/friend-conversation', { 
      state: { 
        friend,
        message: "Your reply has been sent successfully!",
        refreshConversation: true
      }
    });

    return result;
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    navigate('/friend-conversation', { state: { friend } });
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
              onClick={() => navigate('/friend-conversation', { state: { friend } })}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Conversation
            </Button>
            <h1 className="text-3xl font-semibold">Reply to Letter</h1>
          </div>
          <p className="text-lg text-gray-600">
            Craft a thoughtful response to continue the conversation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Original Letter */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Original Letter</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">From: {friend?.name} ({friend?.country})</p>
                <p className="text-sm text-gray-600">
                  Sent: {originalLetter && new Date(originalLetter.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <h4 className="text-xl font-semibold">{originalLetter?.subject}</h4>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{originalLetter?.content}</p>
              </div>
            </div>
          </div>

          {/* Reply Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Your Reply</h3>
            <p className="text-gray-600 mb-4">Click below to compose your reply using our letter dialog.</p>
            
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Compose Reply
            </Button>
          </div>
        </div>
      </div>

      {/* Letter Dialog */}
      <LetterDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSend={handleSendReply}
        recipientId={originalLetter?.sender?._id}
        recipientName={friend?.name}
        type="reply"
        replyToId={originalLetter?._id}
        initialSubject={replyTitle}
        title="Reply to Letter"
        description={`Reply to ${friend?.name}'s letter`}
      />
    </div>
  );
};

export default ReplyLetter;
