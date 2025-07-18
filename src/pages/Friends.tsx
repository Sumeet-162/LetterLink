import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Mail, Heart, Search, Globe, MessageSquare, UserPlus, CheckCircle, Clock, Send, Loader2, Package, Timer, Truck, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import { friendsAPI, api } from "@/services/api";
import "@/styles/fonts.css";

interface Friend {
  _id: string;
  username: string;
  name: string;
  country: string;
  timezone?: string;
  profilePicture?: string;
  lastSeen?: string;
  letterCount: number;
  lastActivity: string;
  lastActivityType: "sent" | "delivered" | "received" | "replied";
  lastLetter?: {
    _id: string;
    subject: string;
    createdAt: string;
  };
}

interface SearchResult {
  _id: string;
  username: string;
  name: string;
  country: string;
  timezone?: string;
  profilePicture?: string;
  bio?: string;
  interests: string[];
  languages?: string[];
  writingStyle?: string;
  preferredLetterStyle?: string;
  lastSeen?: string;
  isFriend: boolean;
  letterCount: number;
}

const Friends = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<{
    received: any[];
    sent: any[];
  }>({ received: [], sent: [] });
  const [pendingFriendLetters, setPendingFriendLetters] = useState<any[]>([]);
  const [inTransitLetters, setInTransitLetters] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [pendingLettersLoading, setPendingLettersLoading] = useState(true);
  const [inTransitLoading, setInTransitLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [showInTransit, setShowInTransit] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [showLetterDialog, setShowLetterDialog] = useState(false);
  const [processingAcceptReject, setProcessingAcceptReject] = useState(false);

  // Load friends from API
  useEffect(() => {
    const loadFriends = async () => {
      try {
        setLoading(true);
        setError(null);
        const friendsData = await friendsAPI.getFriends();
        setFriends(friendsData);
      } catch (err) {
        // For now, just show empty state instead of error
        // This handles cases where backend isn't running gracefully
        setFriends([]);
        setError(null);
        console.error('Error loading friends:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, []);

  // Load friend requests
  useEffect(() => {
    const loadFriendRequests = async () => {
      try {
        setRequestsLoading(true);
        const requestsData = await api.getFriendRequests();
        setFriendRequests(requestsData);
      } catch (err) {
        console.error('Error loading friend requests:', err);
        setFriendRequests({ received: [], sent: [] });
      } finally {
        setRequestsLoading(false);
      }
    };

    loadFriendRequests();
  }, []);

  // Load pending friend letters (delivered letters waiting for accept/reject)
  useEffect(() => {
    const loadPendingFriendLetters = async () => {
      try {
        setPendingLettersLoading(true);
        const response = await api.getPendingFriendLetters();
        setPendingFriendLetters(response || []);
      } catch (err) {
        console.error('Error loading pending friend letters:', err);
        setPendingFriendLetters([]);
      } finally {
        setPendingLettersLoading(false);
      }
    };

    loadPendingFriendLetters();
    
    // Set up polling to update pending friend letters every minute
    const interval = setInterval(loadPendingFriendLetters, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load in-transit letters
  useEffect(() => {
    const loadInTransitLetters = async () => {
      try {
        setInTransitLoading(true);
        const response = await api.getInTransitLetters();
        setInTransitLetters(response.inTransitLetters || []);
      } catch (err) {
        console.error('Error loading in-transit letters:', err);
        setInTransitLetters([]);
      } finally {
        setInTransitLoading(false);
      }
    };

    loadInTransitLetters();
    
    // Set up polling to update in-transit letters every minute
    const interval = setInterval(loadInTransitLetters, 60000);
    return () => clearInterval(interval);
  }, []);

  // Search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim() || searchTerm.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      try {
        setSearchLoading(true);
        console.log('Searching for:', searchTerm);
        const results = await friendsAPI.searchUsers(searchTerm);
        console.log('Search results:', results);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (err) {
        console.error('Error searching users:', err);
        setSearchResults([]);
        setShowSearchResults(false);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Font combinations with Inter replacing Alata
  const headingClasses = "font-inter font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-inter font-medium tracking-wide text-foreground/80";

  // Friends list is always all friends, search results are separate
  const filteredFriends = friends;

  const handleFriendClick = (friend: Friend) => {
    navigate('/friend-conversation', { state: { friend } });
  };

  const handleWriteToUser = (user: SearchResult) => {
    // Navigate to write letter to friend page with detailed user information
    const params = new URLSearchParams({
      friendId: user._id,
      username: user.username,
      name: user.name || user.username,
      country: user.country || '',
      timezone: user.timezone || '',
      bio: user.bio || '',
      interests: user.interests.join(','),
      languages: (user.languages || []).join(','),
      writingStyle: user.writingStyle || '',
      preferredLetterStyle: user.preferredLetterStyle || '',
      letterCount: user.letterCount.toString(),
      profilePicture: user.profilePicture || ''
    });
    
    navigate(`/write-letter-to-friend?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleReadLetter = (letter: any) => {
    setSelectedLetter(letter);
    setShowLetterDialog(true);
  };

  const handleAcceptLetter = async () => {
    if (!selectedLetter) return;
    
    try {
      setProcessingAcceptReject(true);
      await api.acceptFriendLetter(selectedLetter._id);
      
      // Close dialog
      setShowLetterDialog(false);
      setSelectedLetter(null);
      
      // Reload data
      const [friendsData, pendingData, inTransitData] = await Promise.all([
        friendsAPI.getFriends(),
        api.getPendingFriendLetters(),
        api.getInTransitLetters()
      ]);
      
      setFriends(friendsData);
      setPendingFriendLetters(pendingData || []);
      setInTransitLetters(inTransitData.inTransitLetters || []);
      
      console.log('Friend letter accepted successfully!');
    } catch (error) {
      console.error('Error accepting friend letter:', error);
      setError('Failed to accept letter. Please try again.');
    } finally {
      setProcessingAcceptReject(false);
    }
  };

  const handleRejectLetter = async () => {
    if (!selectedLetter) return;
    
    try {
      setProcessingAcceptReject(true);
      await api.rejectFriendLetter(selectedLetter._id);
      
      // Close dialog
      setShowLetterDialog(false);
      setSelectedLetter(null);
      
      // Reload data
      const [pendingData, inTransitData] = await Promise.all([
        api.getPendingFriendLetters(),
        api.getInTransitLetters()
      ]);
      
      setPendingFriendLetters(pendingData || []);
      setInTransitLetters(inTransitData.inTransitLetters || []);
      
      console.log('Friend letter rejected successfully!');
    } catch (error) {
      console.error('Error rejecting friend letter:', error);
      setError('Failed to reject letter. Please try again.');
    } finally {
      setProcessingAcceptReject(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      await api.acceptFriendRequest(requestId);
      // Reload friend requests and friends
      const [requestsData, friendsData] = await Promise.all([
        api.getFriendRequests(),
        friendsAPI.getFriends()
      ]);
      setFriendRequests(requestsData);
      setFriends(friendsData);
      // Show success message
      console.log('Friend request accepted successfully!');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setError('Failed to accept friend request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      await api.rejectFriendRequest(requestId);
      // Reload friend requests
      const requestsData = await api.getFriendRequests();
      setFriendRequests(requestsData);
      console.log('Friend request declined.');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      setError('Failed to decline friend request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleCheckReadyLetters = async () => {
    try {
      setInTransitLoading(true);
      // Process any ready letters
      await api.processReadyLetters();
      
      // Reload both in-transit letters and friend requests
      const [inTransitResponse, requestsData] = await Promise.all([
        api.getInTransitLetters(),
        api.getFriendRequests()
      ]);
      
      setInTransitLetters(inTransitResponse.inTransitLetters || []);
      setFriendRequests(requestsData);
      
      console.log('Checked for ready letters and updated displays');
    } catch (error) {
      console.error('Error checking ready letters:', error);
      setError('Failed to check for ready letters. Please try again.');
    } finally {
      setInTransitLoading(false);
    }
  };

  const handleAcceptFriendLetter = async (letterId: string) => {
    try {
      setProcessingRequest(letterId);
      await api.acceptFriendLetter(letterId);
      
      // Reload pending friend letters and friends
      const [pendingLetters, friendsData] = await Promise.all([
        api.getPendingFriendLetters(),
        friendsAPI.getFriends()
      ]);
      
      setPendingFriendLetters(pendingLetters || []);
      setFriends(friendsData);
      console.log('Friend letter accepted successfully!');
    } catch (error) {
      console.error('Error accepting friend letter:', error);
      setError('Failed to accept friend letter. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectFriendLetter = async (letterId: string) => {
    try {
      setProcessingRequest(letterId);
      await api.rejectFriendLetter(letterId);
      
      // Reload pending friend letters
      const pendingLetters = await api.getPendingFriendLetters();
      setPendingFriendLetters(pendingLetters || []);
      console.log('Friend letter rejected.');
    } catch (error) {
      console.error('Error rejecting friend letter:', error);
      setError('Failed to reject friend letter. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const getActivityStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Send className="h-4 w-4 text-primary" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "received":
        return <Mail className="h-4 w-4 text-primary" />;
      case "replied":
        return <MessageSquare className="h-4 w-4 text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-foreground/60" />;
    }
  };

  const getActivityStatusText = (status: string) => {
    switch (status) {
      case "sent":
        return "Letter sent";
      case "delivered":
        return "Letter delivered";
      case "received":
        return "Letter received";
      case "replied":
        return "Replied";
      default:
        return "No activity";
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-left bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-letter border-none mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h2 className={`text-3xl lg:text-4xl text-foreground ${headingClasses}`}>
              Your Letter Friends
            </h2>
            <img className="h-16 w-16" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-dTJR71ygG9JmLd5f9MjBgh4hpltu9N.png" alt="" />
          </div>
          <p className={`text-lg text-foreground/80 ${bodyClasses}`}>
            Connect with your pen pals from around the world
          </p>
        </div>

        {/* Incoming Letters Section - Shows both pending friend letters and in-transit letters */}
        {(!pendingLettersLoading || !inTransitLoading) && (pendingFriendLetters.length > 0 || inTransitLetters.length > 0) && (
          <div className="mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
              <div className="flex items-center gap-3 mb-6">
                <img className="h-16 w-16"src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-JCUgGETkeCMSw0WvOF4uLUF7CA5Yqh.png" alt="" />
                <h3 className={`text-xl font-semibold ${headingClasses}`}>
                  Incoming Letters
                </h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {pendingFriendLetters.length + inTransitLetters.length}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {/* Pending Friend Letters - Delivered letters waiting for accept/reject */}
                {pendingFriendLetters.map((letter: any) => (
                  <div 
                    key={`friend-letter-${letter._id}`}
                    className="bg-white/70 rounded-lg p-4 border border-primary/10"
                  >
                    <div className="flex items-center justify-between">
                      {/* Letter Info */}
                      <div className="flex items-center gap-4">
                        <img 
                          className="h-12 w-12" 
                          src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" 
                          alt="User" 
                        />
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className={`text-lg font-semibold ${headingClasses}`}>
                              From {letter.sender?.name || letter.sender?.username}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-primary/10 text-primary border-primary/20"
                            >
                              Friend Letter
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-foreground/70">
                            <div className="flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              {letter.sender?.country || 'Unknown'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {letter.subject}
                            </div>
                          </div>
                          <p className={`text-sm ${bodyClasses} text-foreground/60 mt-2`}>
                            📨 First letter from this user - Accept to become friends and read the letter
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handleAcceptFriendLetter(letter._id)}
                          className="bg-primary hover:bg-primary/90 text-white font-inter"
                          size="sm"
                          disabled={processingRequest === letter._id}
                        >
                          {processingRequest === letter._id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Accept & Read
                        </Button>
                        <Button
                          onClick={() => handleRejectFriendLetter(letter._id)}
                          variant="outline"
                          className="text-foreground/60 border-primary/20 hover:bg-primary/5 font-inter"
                          size="sm"
                          disabled={processingRequest === letter._id}
                        >
                          {processingRequest === letter._id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            "✕"
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* In-Transit Letters - Accepted but still traveling */}
                {inTransitLetters.map((letter: any) => (
                  <div 
                    key={`letter-${letter._id}`}
                    className="bg-white/70 rounded-lg p-4 border border-primary/10"
                  >
                    <div className="flex items-center justify-between">
                      {/* Letter Info */}
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          {letter.isReadyForDelivery ? (
                            <Package className="h-6 w-6 text-primary" />
                          ) : (
                            <Truck className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className={`text-lg font-semibold ${headingClasses}`}>
                              From {letter.sender?.name || letter.sender?.username}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-primary/10 text-primary border-primary/20"
                            >
                              {letter.isReadyForDelivery ? 'Delivered' : 'In Transit'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-foreground/70">
                            <div className="flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              {letter.senderCountry} → {letter.recipientCountry}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Sent {new Date(letter.sentAt).toLocaleDateString()}
                            </div>
                          </div>
                          <p className={`text-sm ${bodyClasses} text-foreground/60 mt-2`}>
                            {letter.isReadyForDelivery ? 
                              '📬 Letter has arrived! Will appear in your friends list.' :
                              '📮 Letter is traveling to you...'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Delivery Status */}
                      <div className="flex flex-col items-end gap-2">
                        {letter.isReadyForDelivery ? (
                          <button 
                            onClick={() => handleReadLetter(letter)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors"
                          >
                            <Mail className="h-4 w-4" />
                            <span className={`text-sm font-medium`}>
                              Read
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
                            <Timer className="h-4 w-4" />
                            <span className={`text-sm font-medium ${accentClasses}`}>
                              {letter.remainingTime}
                            </span>
                          </div>
                        )}
                        <span className={`text-xs ${bodyClasses} text-foreground/60`}>
                          {letter.estimatedDeliveryText}
                        </span>
                        {!letter.isReadyForDelivery && (
                          <span className={`text-xs ${bodyClasses} text-foreground/50`}>
                            Arrives: {new Date(letter.deliveryDate).toLocaleDateString()} at {new Date(letter.deliveryDate).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state for incoming letters */}
        {!pendingLettersLoading && !inTransitLoading && pendingFriendLetters.length === 0 && inTransitLetters.length === 0 && (
          <div className="mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
              <div className="flex items-center gap-3 mb-4">
                <img className="h-16 w-16" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-JCUgGETkeCMSw0WvOF4uLUF7CA5Yqh.png" alt="" />
                <h3 className={`text-xl font-semibold ${headingClasses}`}>
                  Incoming Letters
                </h3>
              </div>
              <div className="text-center py-8">
                <img className="h-16 w-16 mx-auto mb-4" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-lp9vjuXTCqeB9yhVXBoBmyqdy8e9jv%20(1).png" alt="No letters" />
                <p className={`${bodyClasses} text-foreground/70 mb-2`}>
                  No incoming letters at the moment
                </p>
                <p className={`text-sm ${bodyClasses} text-foreground/60`}>
                  Check back later or send someone a letter to start a conversation!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className={`${bodyClasses}`}>Loading your friends...</p>
          </div>
        )}

        {/* Friends List - Always visible */}
        {!loading && (
          <div className="space-y-0">
            {filteredFriends.length > 0 ? (
              <div className="space-y-0">
                {filteredFriends.map((friend) => (
                  <div 
                    key={friend._id}
                    className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6 group hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => handleFriendClick(friend)}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left Side - Friend Info */}
                      <div className="flex items-center gap-4">
                        <img className="h-12 w-12" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Friend" />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-xl font-semibold ${headingClasses}`}>
                              {friend.name || friend.username}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-foreground/80">
                              <Globe className="h-4 w-4" />
                              {friend.country || 'Unknown'}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4 text-primary" />
                              <span className={`${bodyClasses}`}>
                                {friend.letterCount || 0} letters exchanged
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`${bodyClasses}`}>
                                Active {friend.lastSeen ? new Date(friend.lastSeen).toLocaleDateString() : 'recently'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Center - Username and Timezone */}
                      <div className="flex flex-col items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className="text-sm bg-primary/10 text-primary px-3 py-1"
                        >
                          @{friend.username}
                        </Badge>
                        {friend.timezone && (
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                          >
                            {friend.timezone}
                          </Badge>
                        )}
                      </div>

                      {/* Right Side - Activity Status */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {getActivityStatusIcon(friend.lastActivityType)}
                          <span className={`${accentClasses}`}>
                            {getActivityStatusText(friend.lastActivityType)}
                          </span>
                        </div>
                        <span className={`text-xs ${bodyClasses} text-foreground/60`}>
                          {friend.lastActivity ? new Date(friend.lastActivity).toLocaleDateString() : 'No activity'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-12 text-center">
                <img className="h-16 w-16 mx-auto mb-4" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="No friends" />
                <h3 className={`text-xl font-semibold ${headingClasses} mb-2`}>
                  No friends yet
                </h3>
                <p className={`${bodyClasses} mb-4`}>
                  Friends are automatically created when you exchange letters with someone. Start by writing your first letter to make new connections!
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/write')}
                    className="bg-primary hover:bg-primary/90 text-white font-inter"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Write Your First Letter
                  </Button>
                  <Button 
                    onClick={() => setSearchTerm("people")}
                    variant="outline"
                    className="font-inter"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Find People
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-red-500" />
              <p className={`text-red-700 ${bodyClasses}`}>{error}</p>
              <Button
                onClick={() => setError(null)}
                variant="ghost"
                size="sm"
                className="ml-auto text-red-600 hover:text-red-700"
              >
                ✕
              </Button>
            </div>
          </div>
        )}

        {/* Friend Requests Section */}
        {!requestsLoading && friendRequests.received.length > 0 && (
          <div className="mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
              <div className="flex items-center gap-3 mb-6">
                <UserPlus className="h-6 w-6 text-primary" />
                <h3 className={`text-xl font-semibold ${headingClasses}`}>
                  Friend Requests
                </h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {friendRequests.received.length}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {friendRequests.received.map((request: any) => (
                  <div 
                    key={request._id}
                    className="bg-white/70 rounded-lg p-4 border border-primary/10"
                  >
                    <div className="flex items-center justify-between">
                      {/* Request Info */}
                      <div className="flex items-center gap-4">
                        <img 
                          className="h-12 w-12" 
                          src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" 
                          alt="User" 
                        />
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className={`text-lg font-semibold ${headingClasses}`}>
                              {request.sender?.name || request.sender?.username}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-primary/5 text-primary"
                            >
                              @{request.sender?.username}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-foreground/70">
                            <div className="flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              {request.sender?.country || 'Unknown'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(request.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handleAcceptRequest(request._id)}
                          className="bg-primary hover:bg-primary/90 text-white font-inter"
                          size="sm"
                          disabled={processingRequest === request._id}
                        >
                          {processingRequest === request._id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(request._id)}
                          variant="outline"
                          className="text-foreground/60 border-primary/20 hover:bg-primary/5 font-inter"
                          size="sm"
                          disabled={processingRequest === request._id}
                        >
                          {processingRequest === request._id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            "✕"
                          )} Decline
                        </Button>
                      </div>
                    </div>
                    
                    {/* Letter Preview if exists */}
                    {request.letter && (
                      <div className="mt-4 p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                        <h5 className={`text-sm font-semibold ${headingClasses} mb-2`}>
                          Included Message:
                        </h5>
                        <p className={`text-sm ${bodyClasses} text-foreground/80 line-clamp-3`}>
                          {request.letter.content}
                        </p>
                        {request.letter.content.length > 150 && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-primary font-inter mt-2"
                            onClick={() => {
                              // Add logic to view full letter if needed
                              alert('Full letter view - to be implemented');
                            }}
                          >
                            Read full message →
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sent Friend Requests Section */}
        {!requestsLoading && friendRequests.sent.length > 0 && (
          <div className="mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
              <div className="flex items-center gap-3 mb-6">
                <Send className="h-6 w-6 text-blue-500" />
                <h3 className={`text-xl font-semibold ${headingClasses}`}>
                  Sent Requests
                </h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {friendRequests.sent.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {friendRequests.sent.map((request: any) => (
                  <div 
                    key={request._id}
                    className="bg-white/70 rounded-lg p-4 border border-primary/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img 
                          className="h-10 w-10" 
                          src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" 
                          alt="User" 
                        />
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className={`text-base font-semibold ${headingClasses}`}>
                              {request.recipient?.name || request.recipient?.username}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              @{request.recipient?.username}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-foreground/60">
                            <Clock className="h-3 w-3" />
                            Sent {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-primary/10 text-primary"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {requestsLoading && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className={`${bodyClasses}`}>Loading friend requests...</p>
          </div>
        )}

        {/* Search and Stats - Moved to bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
              <div className="flex items-center gap-3 mb-4">
                <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-Js3QRraQ1c9f64QX7dLFJjZkvkdHIj.png" alt="Search" />
                <h3 className={`text-lg font-semibold ${headingClasses}`}>
                  Find Friends
                </h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/60" />
                <Input
                  placeholder="Search for people by name, username, country, or interests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40"
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                )}
              </div>
            </div>

            {/* Search Results Section - Separate from friends list */}
            {showSearchResults && (
              <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold ${headingClasses}`}>
                    Search Results {searchLoading && <Loader2 className="h-4 w-4 animate-spin inline ml-2" />}
                  </h3>
                  <Button
                    onClick={clearSearch}
                    variant="outline"
                    size="sm"
                    className="font-inter"
                  >
                    Clear Search
                  </Button>
                </div>
                
                {searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map((user) => (
                      <div 
                        key={user._id}
                        className="bg-white/50 backdrop-blur-sm rounded-lg border border-primary/10 p-4 group hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          {/* Left Side - User Info */}
                          <div className="flex items-center gap-4">
                            <img className="h-10 w-10" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="User" />
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className={`text-lg font-semibold ${headingClasses}`}>
                                  {user.name || user.username}
                                </h3>
                                <div className="flex items-center gap-1 text-sm text-foreground/80">
                                  <Globe className="h-3 w-3" />
                                  {user.country || 'Unknown'}
                                </div>
                                {user.isFriend && (
                                  <Badge className="bg-primary/10 text-primary text-xs">
                                    Friend
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-primary" />
                                  <span className={`${bodyClasses}`}>
                                    {user.letterCount} letters exchanged
                                  </span>
                                </div>
                                {user.interests.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-3 w-3 text-pink-500" />
                                    <span className={`${bodyClasses}`}>
                                      {user.interests.slice(0, 2).join(', ')}
                                      {user.interests.length > 2 && '...'}
                                    </span>
                                  </div>
                                )}
                                {user.languages && user.languages.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-primary text-xs">🌐</span>
                                    <span className={`${bodyClasses} text-primary`}>
                                      {user.languages.slice(0, 2).join(', ')}
                                      {user.languages.length > 2 && '...'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Center - Username and Bio */}
                          <div className="flex-1 max-w-sm mx-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant="secondary" 
                                className="text-xs bg-primary/10 text-primary"
                              >
                                @{user.username}
                              </Badge>
                              {user.timezone && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {user.timezone}
                                </Badge>
                              )}
                            </div>
                            {user.bio && (
                              <p className={`text-xs ${bodyClasses} text-foreground/70 line-clamp-2`}>
                                {user.bio}
                              </p>
                            )}
                          </div>

                          {/* Right Side - Action Button */}
                          <div className="flex flex-col items-end gap-1">
                            {user.isFriend ? (
                              <Button
                                onClick={() => handleFriendClick(user as any)}
                                variant="outline"
                                size="sm"
                                className="font-inter"
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                View Letters
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleWriteToUser(user)}
                                className="bg-primary hover:bg-primary/90 text-white font-inter"
                                size="sm"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Write Letter
                              </Button>
                            )}
                            <span className={`text-xs ${bodyClasses} text-foreground/60`}>
                              {user.lastSeen ? `Active ${new Date(user.lastSeen).toLocaleDateString()}` : 'Recently active'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto mb-4 text-foreground/40" />
                    <h3 className={`text-lg font-semibold ${headingClasses} mb-2`}>
                      No users found
                    </h3>
                    <p className={`${bodyClasses} text-foreground/70`}>
                      Try searching with different terms like names, countries, or interests.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
            <div className="flex items-center gap-3 mb-4">
              <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-WaLIdwjgmqnfE0GndCGu1R9ReZOal5.png" alt="Stats" />
              <h3 className={`text-lg font-semibold ${headingClasses}`}>
                Your Network
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${bodyClasses}`}>Total Friends</span>
                <span className={`text-lg font-semibold ${headingClasses}`}>{friends.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${bodyClasses}`}>Letters Exchanged</span>
                <span className={`text-lg font-semibold ${headingClasses}`}>
                  {friends.reduce((sum, friend) => sum + (friend.letterCount || 0), 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${bodyClasses}`}>Countries</span>
                <span className={`text-lg font-semibold ${headingClasses}`}>
                  {new Set(friends.map(f => f.country)).size}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Letter Reading Dialog */}
      <Dialog open={showLetterDialog} onOpenChange={setShowLetterDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className={`text-xl ${headingClasses}`}>
                Letter from {selectedLetter?.sender?.name || selectedLetter?.sender?.username}
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  onClick={handleAcceptLetter}
                  disabled={processingAcceptReject}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {processingAcceptReject ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleRejectLetter}
                  disabled={processingAcceptReject}
                  variant="outline"
                  className="border-primary/20 text-foreground/60 hover:bg-primary/5"
                >
                  {processingAcceptReject ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          {selectedLetter && (
            <div className="space-y-4 mt-4">
              {/* Letter Header */}
              <div className="border-b pb-4">
                <h3 className={`text-lg font-semibold ${headingClasses} mb-2`}>
                  {selectedLetter.subject}
                </h3>
                <div className="flex items-center gap-4 text-sm text-foreground/70">
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {selectedLetter.senderCountry} → {selectedLetter.recipientCountry}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Sent {new Date(selectedLetter.sentAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {/* Letter Content */}
              <div className={`${bodyClasses} whitespace-pre-wrap leading-relaxed`}>
                {selectedLetter.content}
              </div>
              
              {/* Footer */}
              <div className="border-t pt-4 text-center">
                <p className={`text-sm ${bodyClasses} text-foreground/60`}>
                  💌 Accept this letter to become friends with {selectedLetter.sender?.name || selectedLetter.sender?.username}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Friends;
