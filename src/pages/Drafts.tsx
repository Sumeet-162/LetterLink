import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Edit, Trash2, Send, Clock, FileText, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Navigation from '@/components/Navigation';
import LetterDialog from '@/components/LetterDialog';
import { draftsAPI, api } from '@/services/api';
import "@/styles/fonts.css";

interface Draft {
  _id: string;
  recipient: {
    _id: string;
    username: string;
    name: string;
    profilePicture?: string;
  };
  subject: string;
  preview: string;
  content?: string; // Added for when editing
  type: 'letter' | 'reply';
  replyTo?: string;
  originalLetter?: {
    _id: string;
    subject: string;
    createdAt: string;
  };
  lastSaved: string;
  createdAt: string;
  deliveryDelay: number;
}

export default function Drafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"subject" | "lastSaved">("lastSaved");

  // Font combinations
  const headingClasses = "font-inter font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-inter font-medium tracking-wide text-foreground/80";

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await draftsAPI.getDrafts();
      setDrafts(response);
    } catch (err) {
      setError('Failed to load drafts. Please try again.');
      console.error('Error fetching drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleEditDraft = async (draft: Draft) => {
    try {
      // Fetch full draft content for editing
      const fullDraft = await draftsAPI.getDraftById(draft._id);
      setEditingDraft({
        ...draft,
        content: fullDraft.content
      });
      setDialogOpen(true);
    } catch (error) {
      console.error('Error fetching full draft:', error);
      // Fallback to using preview if full content fetch fails
      setEditingDraft({
        ...draft,
        content: draft.preview
      });
      setDialogOpen(true);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;

    try {
      await draftsAPI.deleteDraft(draftId);
      setDrafts(drafts.filter(d => d._id !== draftId));
    } catch (err) {
      console.error('Error deleting draft:', err);
      alert('Failed to delete draft. Please try again.');
    }
  };

  const handleSendDraft = async (draft: Draft) => {
    try {
      await api.sendDraft(draft._id);
      console.log('Draft sent successfully!');
      fetchDrafts(); // Refresh the drafts list
    } catch (err) {
      console.error('Error sending draft:', err);
      alert('Failed to send draft. Please try again.');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingDraft(null);
    fetchDrafts(); // Refresh drafts after editing
  };

  const handleSendLetter = async (data: { subject: string; content: string }) => {
    // This will be handled by the LetterDialog component
    // Just close the dialog and refresh drafts
    handleDialogClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    return type === 'reply' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
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
            <h2 className={`text-3xl lg:text-4xl text-foreground ${headingClasses}`}>
              Draft Letters
            </h2>
            <img className="h-16 w-16" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-41VuJyzNNZgPR1AGHHuXQxblDuWYfP.png" alt="Drafts" />
          </div>
          <p className={`text-lg text-foreground/80 ${bodyClasses}`}>
            Continue writing your saved drafts or review your unfinished letters
          </p>
          
          {/* Stats and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span className={accentClasses}>
                  {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            {/* Search and Sort */}
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search drafts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 border-primary/20 focus:border-primary/40"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "subject" | "lastSaved")}
                className="px-3 py-2 border border-primary/20 rounded-md bg-background text-foreground focus:border-primary/40 outline-none"
              >
                <option value="lastSaved">Sort by Last Saved</option>
                <option value="subject">Sort by Subject</option>
              </select>
            </div>
          </div>
        </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {drafts.length === 0 && !loading && !error && (
        <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none">
          <div className="mx-auto w-24 h-24 mb-4">
            <img 
              src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-G24mFU0VK1QSV0KWXpUBfC11OI4L3O.png" 
              alt="No drafts" 
              className="w-full h-full opacity-50"
            />
          </div>
          <h3 className={`text-xl mb-2 ${headingClasses}`}>No Drafts Yet</h3>
          <p className={`text-muted-foreground mb-6 ${bodyClasses}`}>
            Your draft letters will appear here when you save them.
          </p>
          <Button 
            onClick={() => window.location.href = '/write-letter'}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Write Your First Letter
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft) => (
          <Card key={draft._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">
                    {draft.subject || 'Untitled Draft'}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {draft.recipient && (
                      <span>To: {draft.recipient.name}</span>
                    )}
                    {draft.type === 'reply' && !draft.recipient && (
                      <span>Reply to letter</span>
                    )}
                    {draft.type === 'letter' && !draft.recipient && (
                      <span>New letter</span>
                    )}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className={getTypeColor(draft.type)}>
                  {draft.type === 'reply' ? 'Reply' : 'New'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {draft.preview || 'No content written yet...'}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Clock className="h-3 w-3" />
                <span>Last saved: {formatDate(draft.lastSaved)}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditDraft(draft)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleSendDraft(draft)}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteDraft(draft._id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingDraft && (
        <LetterDialog
          isOpen={dialogOpen}
          onClose={handleDialogClose}
          onSend={handleSendLetter}
          recipientId={editingDraft.recipient._id}
          recipientName={editingDraft.recipient.name}
          type={editingDraft.type === 'reply' ? 'reply' : 'letter'}
          replyToId={editingDraft.replyTo}
          existingDraftId={editingDraft._id}
          initialSubject={editingDraft.subject}
          initialContent={editingDraft.content || editingDraft.preview}
          title={editingDraft.type === 'reply' ? 'Reply to Letter' : 'Edit Letter'}
          description={editingDraft.type === 'reply' ? 'Continue your reply' : 'Continue writing your letter'}
        />
      )}
      </div>
    </div>
  );
}
