import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { PenTool, Send, Users, Globe, Clock } from "lucide-react";

const WriteLetter = () => {
  const [letterData, setLetterData] = useState({
    title: "",
    content: ""
  });

  const maxContentLength = 1000;
  const contentProgress = (letterData.content.length / maxContentLength) * 100;

  const mockRecipients = [
    { country: "Japan", distance: "6,800 km", deliveryTime: "18 hours" },
    { country: "Brazil", distance: "3,200 km", deliveryTime: "8 hours" },
    { country: "Germany", distance: "1,500 km", deliveryTime: "3 hours" }
  ];

  const handleSubmit = () => {
    console.log("Letter submitted:", letterData);
    // This would connect to Supabase when implemented
  };

  return (
    <div className="min-h-screen bg-gradient-paper p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <Card className="shadow-vintage">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
              <PenTool className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-heading">Write Your Letter</CardTitle>
            <p className="text-muted-foreground">
              Share your thoughts, experiences, or stories with kindred spirits around the world
            </p>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Letter Writing Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-letter bg-letter-paper">
              <CardHeader>
                <CardTitle className="font-heading">Your Letter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Letter Title (Optional)</Label>
                  <Input
                    id="title"
                    placeholder="Give your letter a title..."
                    value={letterData.title}
                    onChange={(e) => setLetterData({...letterData, title: e.target.value})}
                    className="bg-background/50 border-border"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="content">Letter Content</Label>
                    <span className="text-sm text-muted-foreground">
                      {letterData.content.length}/{maxContentLength}
                    </span>
                  </div>
                  <Textarea
                    id="content"
                    placeholder="Dear fellow letter writer,

I hope this letter finds you well. I wanted to share..."
                    value={letterData.content}
                    onChange={(e) => setLetterData({...letterData, content: e.target.value})}
                    className="bg-background/50 border-border min-h-[400px] resize-none font-body leading-relaxed text-base"
                    maxLength={maxContentLength}
                  />
                  <Progress 
                    value={contentProgress} 
                    className="h-2"
                  />
                  {contentProgress > 90 && (
                    <p className="text-sm text-accent">
                      You're approaching the character limit!
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" size="lg">
                    Save Draft
                  </Button>
                  <Button 
                    variant="letter" 
                    size="lg"
                    disabled={letterData.content.length < 50}
                    onClick={handleSubmit}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Letter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Writing Tips */}
            <Card className="shadow-vintage bg-gradient-vintage">
              <CardHeader>
                <CardTitle className="text-lg font-heading">Writing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Share something personal about your culture or daily life</li>
                  <li>• Ask thoughtful questions to encourage responses</li>
                  <li>• Describe your surroundings, local traditions, or current season</li>
                  <li>• Share a book, song, or experience that moved you recently</li>
                  <li>• Be genuine and authentic - the best connections come from honesty</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Information */}
          <div className="space-y-6">
            <Card className="shadow-letter">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Users className="h-5 w-5" />
                  Your Recipients
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your letter will be sent to 3 people who share your interests
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRecipients.map((recipient, index) => (
                  <div key={index} className="p-4 rounded-lg bg-secondary/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="font-medium">{recipient.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Distance: {recipient.distance}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-accent">
                      <Clock className="h-3 w-3" />
                      <span>Arrives in: {recipient.deliveryTime}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-vintage">
              <CardHeader>
                <CardTitle className="text-lg font-heading">How Delivery Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">Local (0-100km):</span>
                    10 minutes
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <span className="font-medium">Regional (100-1000km):</span>
                    1 hour
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-postal-stamp" />
                    <span className="font-medium">International (1000km+):</span>
                    6-24 hours
                  </p>
                </div>
                <p className="text-xs italic pt-2 border-t border-border">
                  The further your letter travels, the more anticipation builds for both you and your recipient.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-vintage bg-accent/5">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="p-3 rounded-full bg-accent/10 w-fit mx-auto">
                    <Send className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-heading font-semibold">Ready to Send?</h3>
                  <p className="text-sm text-muted-foreground">
                    Your letter will begin its journey once you click send
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteLetter;