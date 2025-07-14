import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Clock, Globe, Heart, Users, ArrowRight } from "lucide-react";

const Landing = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Mail,
      title: "Thoughtful Letters",
      description: "Write meaningful letters about yourself, your culture, or your interests."
    },
    {
      icon: Clock,
      title: "Delayed Delivery",
      description: "Letters travel based on real-world distance - adding anticipation to every connection."
    },
    {
      icon: Globe,
      title: "Cultural Exchange",
      description: "Connect with people from around the world who share your passions."
    },
    {
      icon: Heart,
      title: "Anonymous & Safe",
      description: "Build genuine connections without revealing personal information."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-paper">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="relative container mx-auto px-6 py-16 lg:py-24">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-heading font-semibold text-foreground leading-tight">
                LetterLink
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground font-heading italic">
                Where words travel at the speed of meaning
              </p>
            </div>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Rediscover the lost art of letter writing. Connect with kindred spirits 
              around the world through thoughtful, delayed correspondence that arrives 
              based on real geographical distance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button variant="letter" size="lg" className="text-lg px-8 py-3">
                Start Writing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-semibold text-foreground">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the magic of slow communication in our fast-paced digital world
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-letter hover:-translate-y-2 ${
                  hoveredFeature === index ? 'bg-gradient-vintage' : 'bg-card'
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit transition-all duration-300 group-hover:bg-primary/20">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-heading">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How Distance Works */}
      <section className="py-16 lg:py-24 bg-gradient-vintage">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl lg:text-4xl font-heading font-semibold text-foreground">
                Letters Travel at Real Speed
              </h2>
              <p className="text-lg text-muted-foreground">
                The further your letter travels, the longer it takes to arrive
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center shadow-vintage">
                <CardHeader>
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="font-heading">Local Delivery</CardTitle>
                  <p className="text-2xl font-semibold text-primary">10 minutes</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Letters within 100km arrive quickly, like a local message
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-vintage">
                <CardHeader>
                  <Globe className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle className="font-heading">Regional Delivery</CardTitle>
                  <p className="text-2xl font-semibold text-accent">1-6 hours</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Cross-country letters take time to travel, building anticipation
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-vintage">
                <CardHeader>
                  <Users className="h-12 w-12 text-postal-stamp mx-auto mb-4" />
                  <CardTitle className="font-heading">International</CardTitle>
                  <p className="text-2xl font-semibold text-postal-stamp">12-24 hours</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Global connections take a full day, making them truly special
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <Card className="max-w-2xl mx-auto text-center shadow-letter bg-gradient-paper">
            <CardHeader className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-heading font-semibold text-foreground">
                  Ready to Send Your First Letter?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join a community of thoughtful writers from around the world. 
                  Your next meaningful connection is just a letter away.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button variant="letter" size="lg" className="text-lg px-8 py-3">
                  Create Account
                  <Mail className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="vintage" size="lg" className="text-lg px-8 py-3">
                  Sign In
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;