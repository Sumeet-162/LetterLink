import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, Send, Loader2, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { draftsAPI, api } from "@/services/api";

interface LetterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: { subject: string; content: string }) => Promise<void>;
  recipientId?: string;
  recipientName?: string;
  type?: 'letter' | 'reply';
  replyToId?: string;
  initialSubject?: string;
  initialContent?: string;
  existingDraftId?: string;
  title?: string;
  description?: string;
  maxContentLength?: number;
}

const LetterDialog: React.FC<LetterDialogProps> = ({
  isOpen,
  onClose,
  onSend,
  recipientId,
  recipientName,
  type = 'letter',
  replyToId,
  initialSubject = '',
  initialContent = '',
  existingDraftId,
  title = 'Write Letter',
  description = 'Compose your letter',
  maxContentLength = 2000
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [content, setContent] = useState(initialContent);
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftId, setDraftId] = useState(existingDraftId);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const { toast } = useToast();

  // Font classes
  const headingClasses = "font-inter font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-inter font-medium tracking-wide text-foreground/80";

  const contentProgress = (content.length / maxContentLength) * 100;
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

  // Initialize content from props
  useEffect(() => {
    setSubject(initialSubject);
    setContent(initialContent);
    setDraftId(existingDraftId);
    
    // Enable auto-save after a short delay to prevent immediate saves
    const enableTimer = setTimeout(() => {
      setAutoSaveEnabled(true);
    }, 2000);
    
    return () => clearTimeout(enableTimer);
  }, [initialSubject, initialContent, existingDraftId]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !recipientId || (!subject.trim() && !content.trim()) || isSavingDraft) return;

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      if (!isSavingDraft) {
        saveAsDraft(true); // Auto-save
      }
    }, 5000); // Auto-save after 5 seconds of inactivity

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [subject, content, recipientId, isSavingDraft, autoSaveEnabled]);

  const saveAsDraft = async (isAutoSave = false) => {
    if (!recipientId || (!subject.trim() && !content.trim())) {
      if (!isAutoSave) {
        toast({
          title: "Cannot save draft",
          description: "Please enter a subject or content before saving.",
          variant: "destructive"
        });
      }
      return;
    }

    setIsSavingDraft(true);

    try {
      const draftData = {
        recipientId,
        subject: subject.trim(),
        content: content.trim(),
        type,
        ...(replyToId && { replyTo: replyToId })
      };

      let savedDraft;
      if (draftId) {
        // Update existing draft
        savedDraft = await draftsAPI.updateDraft(draftId, {
          subject: draftData.subject,
          content: draftData.content
        });
      } else {
        // Create new draft
        savedDraft = await draftsAPI.createDraft(draftData);
        setDraftId(savedDraft._id);
      }

      setLastSaved(new Date());
      
      if (!isAutoSave) {
        toast({
          title: "Draft saved!",
          description: "Your letter has been saved to drafts.",
        });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      if (!isAutoSave) {
        toast({
          title: "Error saving draft",
          description: "Failed to save your letter. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both subject and content.",
        variant: "destructive"
      });
      return;
    }

    if (content.length < 50) {
      toast({
        title: "Content too short",
        description: "Please write at least 50 characters.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      // If we have an existing draft, send it as a draft
      if (draftId) {
        // First update the draft with current content
        await draftsAPI.updateDraft(draftId, {
          subject: subject.trim(),
          content: content.trim()
        });
        
        // Then send the draft
        await api.sendDraft(draftId);
        
        toast({
          title: "Letter sent!",
          description: "Your letter has been sent successfully.",
        });
      } else {
        // Use the regular onSend method for new letters
        await onSend({ subject: subject.trim(), content: content.trim() });
      }
      
      onClose();
    } catch (error) {
      console.error('Error sending letter:', error);
      toast({
        title: "Failed to send",
        description: "There was an error sending your letter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    onClose();
  };

  const handleSaveAsDraftAndClose = async () => {
    await saveAsDraft(false);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`text-2xl ${headingClasses}`}>
            {title}
            {recipientName && (
              <span className={`text-lg font-normal ${accentClasses} ml-2`}>
                to {recipientName}
              </span>
            )}
          </DialogTitle>
          <p className={`${bodyClasses} text-foreground/80`}>
            {description}
          </p>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject" className={`${accentClasses}`}>
              Subject
            </Label>
            <Input
              id="subject"
              placeholder="Enter letter subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`${bodyClasses} text-base`}
              disabled={isSending}
            />
          </div>

          {/* Content Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="content" className={`${accentClasses}`}>
                Letter Content
              </Label>
              <div className="flex items-center gap-4 text-xs text-foreground/60">
                <span>{wordCount} words</span>
                <span className={content.length > maxContentLength ? 'text-red-500' : ''}>
                  {content.length}/{maxContentLength} characters
                </span>
              </div>
            </div>
            <Textarea
              id="content"
              placeholder="Write your letter here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${bodyClasses} text-base min-h-[300px] resize-none`}
              maxLength={maxContentLength}
              disabled={isSending}
            />
            
            {/* Progress bar */}
            <div className="w-full bg-primary/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  content.length > maxContentLength ? 'bg-red-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(contentProgress, 100)}%` }}
              />
            </div>
            
            {/* Content feedback */}
            <div className="flex justify-between items-center text-xs">
              <div>
                {content.length < 50 ? (
                  <span className="text-amber-600">
                    Minimum 50 characters required ({50 - content.length} more needed)
                  </span>
                ) : (
                  <span className="text-green-600">
                    ✓ Good length for a meaningful letter
                  </span>
                )}
              </div>
              {contentProgress > 90 && (
                <span className="text-amber-600">
                  Approaching character limit!
                </span>
              )}
            </div>
          </div>

          {/* Auto-save status */}
          {lastSaved && (
            <div className="flex items-center gap-2 text-xs text-foreground/60">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-primary/20">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSaveAsDraftAndClose}
                disabled={isSavingDraft || isSending || (!subject.trim() && !content.trim())}
                className="border-primary/20 hover:bg-primary/10"
              >
                {isSavingDraft ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </>
                )}
              </Button>
              {draftId && (
                <span className="text-xs text-foreground/60 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Draft saved
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleClose} disabled={isSending}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={
                  !subject.trim() || 
                  !content.trim() || 
                  content.length < 50 || 
                  isSending ||
                  isSavingDraft
                }
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Letter
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LetterDialog;
