import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Edit3, Trash2, Send, Clock, FileText, Eye } from "lucide-react";
import Navigation from "@/components/Navigation";
import "@/styles/fonts.css";

interface Draft {
  id: string;
  title: string;
  recipient?: string;
  content: string;
  lastEdited: string;
  wordCount: number;
  isComplete: boolean;
  tags: string[];
  originalLetter?: {
    id: string;
    title: string;
    content: string;
    sender: string;
    dateSent: string;
  };
  friend?: {
    id: string;
    name: string;
    country: string;
    interests: string[];
  };
}

const Drafts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "title">("recent");
  const [completedDrafts, setCompletedDrafts] = useState<string[]>([]);
  
  // Load completed drafts from localStorage on component mount
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedDrafts') || '[]');
    setCompletedDrafts(completed);
  }, []);

  const [allDrafts] = useState<Draft[]>([
    {
      id: "1",
      title: "Re: Letter to Maria about Barcelona",
      recipient: "Maria",
      content: "Dear Maria, Thank you for your wonderful letter about your trip to Barcelona. I'm so glad you enjoyed the Sagrada Familia - it truly is breathtaking! I wanted to share my own experience when I visited there last summer...",
      lastEdited: "2 hours ago",
      wordCount: 187,
      isComplete: false,
      tags: ["Travel", "Personal"],
      originalLetter: {
        id: "letter-1",
        title: "My Barcelona Adventure",
        content: "Dear friend, I just returned from the most amazing trip to Barcelona! The architecture, the food, the culture - everything was incredible. I spent hours at the Sagrada Familia, and I couldn't stop thinking about our conversations about art and spirituality...",
        sender: "Maria",
        dateSent: "2024-01-15"
      },
      friend: {
        id: "friend-1",
        name: "Maria",
        country: "Spain",
        interests: ["Travel", "Architecture", "Art"]
      }
    },
    {
      id: "2",
      title: "Re: Thoughts on mindfulness",
      recipient: "Akira",
      content: "Dear Akira, Your letter about mindfulness really resonated with me. I've been trying to incorporate more mindful practices into my daily routine, and I wanted to share some insights I've discovered...",
      lastEdited: "1 day ago",
      wordCount: 156,
      isComplete: false,
      tags: ["Philosophy", "Personal Growth"],
      originalLetter: {
        id: "letter-2",
        title: "Finding Peace in Daily Life",
        content: "My dear friend, I've been reflecting on our last conversation about finding peace in our busy lives. I wanted to share some thoughts on mindfulness that have been helping me lately...",
        sender: "Akira",
        dateSent: "2024-01-10"
      },
      friend: {
        id: "friend-2",
        name: "Akira",
        country: "Japan",
        interests: ["Philosophy", "Mindfulness", "Nature"]
      }
    },
    {
      id: "3",
      title: "Re: Thank you for the recipe",
      recipient: "Grandma Rose",
      content: "Dear Grandma Rose, Thank you so much for sharing your famous apple pie recipe! I tried making it last weekend, and it turned out wonderfully. The whole house smelled amazing, and it brought back so many memories of our time together in the kitchen...",
      lastEdited: "3 days ago",
      wordCount: 423,
      isComplete: false,
      tags: ["Family", "Gratitude"],
      originalLetter: {
        id: "letter-3",
        title: "Family Recipe to Share",
        content: "My dearest grandchild, I was going through my recipe box today and found the apple pie recipe you've been asking about. I thought it was time to share this family treasure with you...",
        sender: "Grandma Rose",
        dateSent: "2024-01-05"
      },
      friend: {
        id: "friend-3",
        name: "Grandma Rose",
        country: "USA",
        interests: ["Cooking", "Family", "Traditions"]
      }
    }
  ]);

  // Filter out completed drafts (both from localStorage and hardcoded isComplete)
  const drafts = allDrafts.filter(draft => 
    !completedDrafts.includes(draft.id) && !draft.isComplete
  );

  // Font combinations with Inter replacing Alata
  const headingClasses = "font-inter font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-inter font-medium tracking-wide text-foreground/80";

  const filteredDrafts = drafts.filter(draft =>
    draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort drafts based on selected criteria
  const sortedDrafts = [...filteredDrafts].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "recent":
      default:
        return new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime();
    }
  });

  const handleEditDraft = (draft: Draft) => {
    // If it's a reply draft with original letter context, go to reply page
    if (draft.originalLetter && draft.friend) {
      navigate('/reply', { 
        state: { 
          replyTo: draft.originalLetter, 
          friend: draft.friend,
          existingDraft: draft 
        } 
      });
    } else {
      // If it's a new letter draft, go to write page
      navigate('/write', { state: { draft } });
    }
  };

  const handleDeleteDraft = (draftId: string) => {
    // Add to completed drafts list
    const newCompletedDrafts = [...completedDrafts, draftId];
    setCompletedDrafts(newCompletedDrafts);
    localStorage.setItem('completedDrafts', JSON.stringify(newCompletedDrafts));
  };

  const handleSendDraft = (draft: Draft) => {
    navigate('/write', { state: { draft, autoSend: true } });
  };

  const handlePreviewDraft = (draft: Draft) => {
    setSelectedDraft(draft);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedDraft(null);
  };

  const getCompletionColor = (isComplete: boolean) => {
    return isComplete ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800";
  };

  const handleClearCompleted = () => {
    setCompletedDrafts([]);
    localStorage.removeItem('completedDrafts');
  };

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-left bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-letter border-none mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className={`text-3xl lg:text-4xl text-foreground ${headingClasses}`}>
                Your Drafts
              </h2>
              <img className="h-16 w-16" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="" />
            </div>
            {completedDrafts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCompleted}
                className="border-primary/20 hover:bg-primary/10 text-primary"
              >
                Restore All Drafts
              </Button>
            )}
          </div>
          <p className={`text-lg text-foreground/80 ${bodyClasses}`}>
            Continue your unfinished letters and thoughts. Every draft is a step toward meaningful connection.
          </p>
        </div>

        {/* Search and Stats */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <Input
                placeholder="Search drafts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 font-spectral"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${accentClasses}`}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "recent" | "title")}
                className="px-3 py-1 text-sm border border-primary/20 rounded-md bg-white/50 backdrop-blur-sm focus:border-primary/40 focus:outline-none font-spectral"
              >
                <option value="recent">Recent</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div className={`text-2xl font-semibold ${headingClasses}`}>
                {drafts.length}
              </div>
              <div className={`${accentClasses}`}>Active Drafts</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-semibold ${headingClasses}`}>
                {drafts.reduce((sum, draft) => sum + draft.wordCount, 0)}
              </div>
              <div className={`${accentClasses}`}>Total Words</div>
            </div>
          </div>
        </div>

        {/* Drafts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedDrafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className={`font-semibold text-foreground ${headingClasses} group-hover:text-primary transition-colors`}>
                      {draft.title}
                    </h3>
                    <p className={`text-sm ${accentClasses} flex items-center gap-1`}>
                      <Clock className="h-3 w-3" />
                      {draft.lastEdited}
                    </p>
                  </div>
                </div>
                <Badge className={getCompletionColor(draft.isComplete)}>
                  {draft.isComplete ? "Complete" : "Draft"}
                </Badge>
              </div>

              {draft.recipient && (
                <div className={`text-sm ${bodyClasses} mb-2`}>
                  <strong>To:</strong> {draft.recipient}
                </div>
              )}

              <p className={`text-sm ${bodyClasses} mb-4 line-clamp-3`}>
                {draft.content}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {draft.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs border-primary/20 text-foreground/70"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className={`${accentClasses}`}>
                  {draft.wordCount} words
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewDraft(draft)}
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditDraft(draft)}
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDraft(draft.id)}
                    className="border-red-200 hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {draft.isComplete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendDraft(draft)}
                      className="border-green-200 hover:bg-green-50 text-green-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedDrafts.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-8 max-w-md mx-auto">
              <FileText className="h-16 w-16 mx-auto mb-4 text-primary/60" />
              <h3 className={`text-lg font-semibold ${headingClasses} mb-2`}>
                {searchTerm ? "No drafts found" : 
                 completedDrafts.length > 0 ? "All drafts completed!" : "No drafts yet"}
              </h3>
              <p className={`${bodyClasses} mb-4`}>
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : completedDrafts.length > 0 
                    ? "Great job! All your drafts have been sent. You can restore them using the button above or write new letters."
                    : "Start writing your first letter to create a draft"
                }
              </p>
              <Button
                onClick={() => navigate('/write')}
                className="bg-primary hover:bg-primary/90 text-white font-inter"
              >
                {completedDrafts.length > 0 ? "Write New Letter" : "Write Your First Letter"}
              </Button>
            </div>
          </div>
        )}

        {/* Draft Preview Modal */}
        {showPreview && selectedDraft && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border-none max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className={`text-xl font-semibold ${headingClasses}`}>
                        {selectedDraft.title}
                      </h3>
                      <p className={`text-sm ${accentClasses}`}>
                        {selectedDraft.recipient ? `To: ${selectedDraft.recipient}` : "Draft letter"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClosePreview}
                    className="text-foreground/60 hover:text-foreground"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="prose max-w-none">
                  <div className={`${bodyClasses} whitespace-pre-wrap`}>
                    {selectedDraft.content}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-primary/20 flex justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className={`${accentClasses}`}>
                    {selectedDraft.wordCount} words
                  </span>
                  <span className={`${accentClasses}`}>
                    Last edited: {selectedDraft.lastEdited}
                  </span>
                  <div className="flex gap-2">
                    {selectedDraft.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs border-primary/20 text-foreground/70"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClosePreview}
                    className="border-primary/20 hover:bg-primary/10 font-inter"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      handleClosePreview();
                      handleEditDraft(selectedDraft);
                    }}
                    className="bg-primary hover:bg-primary/90 text-white font-inter"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Draft
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Drafts;
