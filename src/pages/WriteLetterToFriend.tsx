import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PenTool, Send, User, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { api } from "@/services/api";
import "@/styles/fonts.css";

const WriteLetterToFriend = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const friendId = searchParams.get('friendId');
  const friendUsername = searchParams.get('username');
  const friendName = searchParams.get('name');

  // Letter content state
  const [letterData, setLetterData] = useState({
    subject: "",
    content: ""
  });

  // Friend data state
  const [friendData, setFriendData] = useState(null);
  const [loadingFriend, setLoadingFriend] = useState(true);

  // Form state management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Font combinations
  const headingClasses = "font-inter font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-inter font-medium tracking-wide text-foreground/80";

  const maxContentLength = 2000;
  const contentProgress = (letterData.content.length / maxContentLength) * 100;

  // Load friend data
  useEffect(() => {
    const loadFriendData = async () => {
      if (!friendId) {
        setSubmitError("Friend information missing. Please go back and try again.");
        setLoadingFriend(false);
        return;
      }

      try {
        // You can get friend profile data here if needed
        setFriendData({
          id: friendId,
          username: friendUsername,
          name: friendName
        });
      } catch (error) {
        console.error("Failed to load friend data:", error);
        setSubmitError("Failed to load friend information.");
      } finally {
        setLoadingFriend(false);
      }
    };

    loadFriendData();
  }, [friendId, friendUsername, friendName]);

  const handleSubmit = async () => {
    // Reset previous states
    setSubmitError(null);
    setSubmitSuccess(false);
    
    // Validate form
    if (!letterData.subject.trim()) {
      setSubmitError("Please enter a letter subject.");
      return;
    }
    
    if (!letterData.content.trim()) {
      setSubmitError("Please write your letter content.");
      return;
    }
    
    if (letterData.content.length < 50) {
      setSubmitError("Letter content should be at least 50 characters long.");
      return;
    }

    if (!friendId) {
      setSubmitError("Friend information missing. Please go back and try again.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send friend request letter
      const response = await api.sendFriendRequest({
        recipientId: friendId,
        subject: letterData.subject,
        content: letterData.content
      });
      
      console.log("Friend request sent successfully:", response);
      setSubmitSuccess(true);
      
      // Show success message and redirect
      setTimeout(() => {
        navigate('/friends');
      }, 2000);
      
    } catch (error) {
      console.error("Failed to send friend request:", error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : "Failed to send friend request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLetterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loadingFriend) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
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
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/friends')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Friends
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friendData?.username}`} />
              <AvatarFallback>
                {friendData?.name ? friendData.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className={`text-3xl ${headingClasses}`}>
                Write Letter to {friendData?.name || friendData?.username}
              </h1>
              <p className={`text-lg text-gray-600 ${bodyClasses}`}>
                Send a friend request with a personal letter
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Friend request sent successfully! You'll be redirected to the friends page.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Letter Composition Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${headingClasses}`}>
              <PenTool className="h-5 w-5" />
              Compose Your Letter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Subject Field */}
            <div className="space-y-2">
              <Label htmlFor="subject" className={accentClasses}>
                Letter Subject
              </Label>
              <Input
                id="subject"
                placeholder="Enter a meaningful subject for your letter..."
                value={letterData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className={`${bodyClasses} text-base`}
                disabled={isSubmitting}
              />
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <Label htmlFor="content" className={accentClasses}>
                Letter Content
              </Label>
              <Textarea
                id="content"
                placeholder="Write your letter here... Share why you'd like to connect and what interests you about this person."
                value={letterData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                className={`${bodyClasses} text-base min-h-[300px] resize-none`}
                maxLength={maxContentLength}
                disabled={isSubmitting}
              />
              
              {/* Character Counter */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {letterData.content.length} / {maxContentLength} characters
                </span>
                <div className="w-24">
                  <Progress value={contentProgress} className="h-2" />
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className={`font-medium text-blue-900 mb-2 ${accentClasses}`}>
                Writing Tips for Friend Requests:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Introduce yourself and mention what interests you share</li>
                <li>• Be genuine and personal in your approach</li>
                <li>• Ask questions to start a meaningful conversation</li>
                <li>• Keep it respectful and friendly</li>
                <li>• Minimum 50 characters required</li>
              </ul>
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || letterData.content.length < 50 || !letterData.subject.trim()}
                className="px-8 py-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Friend Request
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WriteLetterToFriend;
