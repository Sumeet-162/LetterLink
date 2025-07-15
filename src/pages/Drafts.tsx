import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Clock, Search, Edit3, Trash2, Send, Save, Eye } from "lucide-react";
import { AnimateSvg } from "@/components/ui/AnimateSvg";
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
}

const Drafts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [drafts] = useState<Draft[]>([
    {
      id: "1",
      title: "Letter to Maria about Barcelona",
      recipient: "Maria",
      content: "Dear Maria, I hope this letter finds you well. I wanted to tell you about my recent trip to Barcelona...",
      lastEdited: "2 hours ago",
      wordCount: 287,
      isComplete: false,
      tags: ["Travel", "Personal"]
    },
    {
      id: "2",
      title: "Thoughts on mindfulness",
      content: "I've been thinking a lot about mindfulness lately and how it affects our daily lives. There's something profound about being present...",
      lastEdited: "1 day ago",
      wordCount: 156,
      isComplete: false,
      tags: ["Philosophy", "Personal Growth"]
    },
    {
      id: "3",
      title: "Thank you note to grandmother",
      recipient: "Grandma Rose",
      content: "Dear Grandma Rose, I wanted to take a moment to thank you for the wonderful weekend we spent together...",
      lastEdited: "3 days ago",
      wordCount: 423,
      isComplete: true,
      tags: ["Family", "Gratitude"]
    }
  ]);

  // Font combinations matching Landing page
  const headingClasses = "font-alata font-semibold tracking-tight";
  const bodyClasses = "font-spectral text-muted-foreground leading-relaxed";
  const accentClasses = "font-alata font-medium tracking-wide";

  const filteredDrafts = drafts.filter(draft =>
    draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleEditDraft = (draft: Draft) => {
    navigate('/write', { state: { draft } });
  };

  const handleDeleteDraft = (draftId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete draft:", draftId);
  };

  const handleSendDraft = (draft: Draft) => {
    navigate('/write', { state: { draft, autoSend: true } });
  };

  const formatDate = (dateString: string) => {
    return dateString;
  };

  const getCompletionColor = (isComplete: boolean) => {
    return isComplete ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800";
  };

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-b border-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <AnimateSvg
                width="80"
                height="80"
                viewBox="0 0 100 100"
                className="mx-auto"
                path="M20,15 L80,15 L80,85 L20,85 Z M20,15 L50,45 L80,15 M25,25 L45,45 M75,25 L55,45"
                strokeColor="#4f46e5"
                strokeWidth={2.5}
                strokeLinecap="round"
                animationDuration={2}
                animationDelay={0}
                animationBounce={0.2}
                reverseAnimation={false}
                enableHoverAnimation={true}
                hoverAnimationType="pulse"
                hoverStrokeColor="#6366f1"
              />
            </div>
            <h1 className={`text-4xl lg:text-5xl text-foreground ${headingClasses}`}>
              Your Drafts
            </h1>
            <p className={`text-xl max-w-2xl mx-auto ${bodyClasses}`}>
              Continue writing your letters or save them for later
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Search Bar & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-vintage border-none bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search drafts by title, content, or recipient..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/50 border-primary/20 focus:border-primary"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-vintage border-none bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className={`text-2xl font-semibold ${headingClasses}`}>
                    {drafts.length}
                  </p>
                  <p className={`text-sm ${bodyClasses}`}>Total Drafts</p>
                  <div className="mt-2 flex justify-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                      {drafts.filter(d => !d.isComplete).length} In Progress
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      {drafts.filter(d => d.isComplete).length} Complete
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Drafts List */}
          <div className="space-y-4">
            {filteredDrafts.map((draft) => (
              <Card 
                key={draft.id}
                className="shadow-letter border-none bg-white/90 backdrop-blur-sm group hover:shadow-vintage transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/20">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className={`text-lg ${headingClasses}`}>
                          {draft.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Last edited {formatDate(draft.lastEdited)}
                          {draft.recipient && (
                            <>
                              <span>•</span>
                              <span>To: {draft.recipient}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${getCompletionColor(draft.isComplete)} text-xs`}
                    >
                      {draft.isComplete ? "Complete" : "In Progress"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Content Preview */}
                  <div className="space-y-2">
                    <p className={`text-sm line-clamp-2 ${bodyClasses}`}>
                      {draft.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{draft.wordCount} words</span>
                      <div className="flex gap-1">
                        {draft.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="text-xs bg-primary/10 text-primary"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="letter"
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white font-alata"
                      onClick={() => handleEditDraft(draft)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    
                    {draft.isComplete && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-200 hover:bg-green-50 text-green-700"
                        onClick={() => handleSendDraft(draft)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/20 hover:bg-primary/10"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 hover:bg-red-50 text-red-600"
                      onClick={() => handleDeleteDraft(draft.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredDrafts.length === 0 && (
            <Card className="shadow-vintage border-none bg-white/95 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="flex justify-center mb-6">
                  <AnimateSvg
                    width="120"
                    height="120"
                    viewBox="0 0 100 100"
                    className="mx-auto"
                    path="M20,15 L80,15 L80,85 L20,85 Z M30,30 L70,30 M30,45 L70,45 M30,60 L55,60"
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
                <h3 className={`text-2xl ${headingClasses} mb-4`}>
                  No drafts found
                </h3>
                <p className={`text-lg max-w-md mx-auto ${bodyClasses} mb-6`}>
                  {searchTerm ? "Try a different search term" : "Start writing a letter to create your first draft"}
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary/20 hover:bg-primary/10 font-alata"
                  onClick={() => navigate('/write')}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Write Your First Letter
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Drafts;
