import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, Globe, Heart, Users, Edit3, Send, FileText, PenTool, MessageSquare } from "lucide-react";
import { AnimateSvg } from "@/components/ui/AnimateSvg";
import Navigation from "@/components/Navigation";
import "@/styles/fonts.css";

const Dashboard = () => {
  const navigate = useNavigate();

  // Font combinations matching Landing page
  const headingClasses = "font-alata font-semibold tracking-tight";
  const bodyClasses = "font-spectral text-muted-foreground leading-relaxed";
  const accentClasses = "font-alata font-medium tracking-wide";

  const recentActivity = [
    {
      type: "received",
      title: "Letter from Tokyo",
      time: "2 hours ago",
      country: "Japan",
      status: "unread"
    },
    {
      type: "sent",
      title: "Reply to Prague correspondent",
      time: "1 day ago",
      country: "Czech Republic",
      status: "delivered"
    },
    {
      type: "draft",
      title: "Letter about local festivals",
      time: "3 days ago",
      country: "Draft",
      status: "saved"
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="shadow-letter border-none bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className={`text-xl ${accentClasses}`}>Recent Activity</CardTitle>
                <p className={`text-sm ${bodyClasses}`}>
                  Your latest letter interactions
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all">
                    <div className="p-2 rounded-full bg-primary/10">
                      {activity.type === 'received' && <Mail className="h-4 w-4 text-primary" />}
                      {activity.type === 'sent' && <Send className="h-4 w-4 text-green-500" />}
                      {activity.type === 'draft' && <Edit3 className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold text-sm ${headingClasses}`}>
                        {activity.title}
                      </h4>
                      <p className={`text-xs ${bodyClasses}`}>
                        {activity.country} • {activity.time}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Writing Inspiration */}
            <Card className="shadow-letter border-none bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className={`text-xl ${accentClasses}`}>Writing Inspiration</CardTitle>
                <p className={`text-sm ${bodyClasses}`}>
                  Daily prompts to spark your creativity
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-accent/10">
                      <MessageSquare className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm ${headingClasses}`}>
                        Today's Prompt
                      </h4>
                      <p className={`text-sm ${bodyClasses} mt-2`}>
                        "Describe a tradition from your culture that brings your community together. What makes it special to you?"
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Globe className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm ${headingClasses}`}>
                        Cultural Exchange
                      </h4>
                      <p className={`text-sm ${bodyClasses} mt-2`}>
                        Share something unique about your local area that visitors might not know about.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-primary/20 hover:bg-primary/10 font-alata"
                  onClick={() => navigate('/write')}
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Start Writing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
