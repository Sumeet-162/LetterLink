import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Clock, Globe, Heart, Users, ArrowRight } from "lucide-react";
import { HandWrittenTitle } from "@/components/ui/hand-writing-text";
import { AnimateSvg } from "@/components/ui/AnimateSvg";
import { GetStartedButton } from "@/components/ui/get-started-button";
import { NavigationBar } from "@/components/ui/navigation-bar";
import WhisperText from "@/components/ui/whisper-text";
import "@/styles/fonts.css";

const Landing = () => {
  const navigate = useNavigate();
  // Font combinations for different sections
  const headingClasses = "font-alata font-semibold tracking-tight";
  const bodyClasses = "font-spectral text-muted-foreground leading-relaxed";
  const accentClasses = "font-alata font-medium tracking-wide";
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const scrollToTop = () => {
    const section = document.getElementById('header');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    const section = document.getElementById('how-it-works');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

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
      <header id="header" className="relative overflow-hidden h-screen flex items-center justify-center">
        <NavigationBar />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed" 
          style={{
            backgroundImage: `url("https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/letterlinkjpg.jpg")`,
            opacity: 0.85
          }}
        />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 mt-5">
          <div className="text-center space-y-6 sm:space-y-8 -mt-20">
            <div>
              <div onClick={scrollToTop} className="cursor-pointer">
                <HandWrittenTitle 
                  title="LetterLink" 
                  subtitle="Where words travel at the speed of meaning"
                />
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto px-4 -mt-8">
              <WhisperText
                text="Rediscover the lost art of letter writing. Connect with kindred spirits around the world through thoughtful, delayed correspondence that arrives based on real geographical distance."
                className={`text-lg sm:text-xl text-gray-800 leading-relaxed ${bodyClasses}`}
                delay={50}
                duration={0.3}
                x={0}
                y={0}
                triggerStart="top 80%"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center lg:ml-20">
                <GetStartedButton />
                <div className="flex flex-row items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-6 hover:scale-105 transition-transform duration-300 bg-white/80 backdrop-blur-sm"
                    onClick={scrollToHowItWorks}
                  >
                    Learn More
                  </Button> 
                  <AnimateSvg 
                    width="120"
                    height="120"
                    viewBox="0 0 127 101"
                    className="my-svg-animation relative overflow-visible   -mt-0 -mb-20 -ml-1 z-10"
                    path="M3 94.6748C27.4641 99.4874 46.3246 102.55 65.0444 83.8304C73.9796 74.8953 76.1503 62.8261 69.8444 51.4748C58.3692 30.8185 36.6188 61.9308 52.6 71.9193C81.897 90.2303 107.995 53.7887 112.155 28.3637C113.368 20.9544 114.609 12.5035 115 5.07481C115.339 -1.36878 117.032 6.28246 117.844 8.63037C119.35 12.9801 121.884 16.4674 123.356 20.7192C125.931 28.1593 122.746 21.3428 121.755 17.8748C118.913 7.92667 118.724 -1.31665 108.6 8.27481C106.563 10.205 95.3631 19.2352 97.3999 19.4748C103.175 20.1542 109.598 23.9571 115 24.2748C122.394 24.7098 126.464 27.2512 116.6 22.3192C113.382 20.71 110.214 19.6588 107 18.2304C101.703 15.8763 109.23 17.7389 109.844 18.2304C111.629 19.6579 116.523 20.3297 111.8 18.2304C110.584 17.6899 105.386 16.2748 107 16.2748C112.097 16.2748 118.803 21.3653 116.956 17.8748C115.403 14.9415 113.389 14.4872 110.2 14.6748C109.114 14.7386 105.166 17.8748 107 17.8748"
                    strokeColor="#000000"
                    strokeWidth={3}
                    strokeLinecap="round"
                    animationDuration={1.5}
                    animationDelay={0}
                    animationBounce={0.3}
                    reverseAnimation={false}
                    enableHoverAnimation={true}
                    hoverAnimationType="redraw"
                    hoverStrokeColor="#4f46e5"
                    mirrorY={true}
                  />
                </div>
              </div>
            </div>        
          </div>
        </div>
      </header>
          


      {/* Features Section */}
      <section id="how-it-works" className="py-20 lg:py-10 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-16 lg:mb-20">              <h2 className={`text-3xl lg:text-5xl text-foreground ${headingClasses}`}>
              <span className="flex items-center justify-center w-full">
                <AnimateSvg
                  width="100"
                  height="100"
                  viewBox="0 0 225 43"
                  className="my-svg-animation mt-10 pt-3 -mr-10"
                  path="M222.462 12.8345C177.074 10.0328 132.077 4.80881 86.6062 3.64623C60.4691 2.97796 -17.6945 1.02174 8.17755 4.79475C50.7028 10.9964 94.6534 10.7971 137.47 14.9675C154.059 16.5834 170.516 18.7493 187.021 21.0384C193.373 21.9193 198.334 23.4078 188.17 22.8432C142.806 20.323 97.6784 14.7225 52.3141 12.0141C47.4732 11.7251 33.1304 11.5843 37.7934 12.9165C54.8856 17.8 73.2224 19.7239 90.7081 22.433C111.764 25.6952 133.161 27.7326 154.042 32.0315C161.542 33.5757 171.588 34.0575 178.571 37.1999C190.929 42.7607 151.511 39.3406 137.962 39.0868C115.414 38.6643 92.8916 37.3627 70.3626 36.4616"
                  strokeColor="#000000"
                  strokeWidth={3}
                  strokeLinecap="round"
                  animationDuration={1.5}
                  animationDelay={0}
                  animationBounce={0.3}
                  reverseAnimation={false}
                  enableHoverAnimation={true}
                  hoverAnimationType="redraw"
                  hoverStrokeColor="#4f46e5"
                />
                <span
                className="-ml-10"
                >How It Works
                </span>
              </span>
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the magic of slow communication in our fast-paced digital world
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`group cursor-pointer transition-all duration-500 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-letter hover:-translate-y-2 border-none ${
                  hoveredFeature === index ? 'bg-gradient-vintage' : 'bg-white/80 backdrop-blur-sm'
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-6 p-4 rounded-full bg-primary/10 w-fit transition-all duration-500 group-hover:bg-primary/20 transform group-hover:scale-110">
                    <feature.icon className="h-8 w-8 text-primary transform transition-transform duration-500 group-hover:rotate-12" />
                  </div>
                  <CardTitle className={`text-2xl mb-2 ${accentClasses}`}>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-center text-lg ${bodyClasses}`}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How Distance Works */}
      <section id="delivery-times" className="py-20 lg:py-20 bg-gradient-vintage relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6 mb-16">
              <h2 className={`text-4xl lg:text-5xl text-foreground ${headingClasses}`}>
                Letters Travel at Real Speed
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              <div className="w-full flex justify-center mt-2 mb-2">
                <AnimateSvg
                  width="100"
                  height="100"
                  viewBox="0 0 100 100"
                  className="mx-auto"
                  path="M10,30 Q10,10 30,10 Q50,10 50,30 Q50,10 70,10 Q90,10 90,30 Q90,50 50,80 Q10,50 10,30 Z"
                  strokeColor="#e11d48"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  animationDuration={2}
                  animationDelay={0}
                  animationBounce={0.2}
                  reverseAnimation={false}
                  enableHoverAnimation={true}
                  hoverAnimationType="pulse"
                  hoverStrokeColor="#db2777"
                  mirrorX={false}
                  mirrorY={false}
                />
              </div>
                The further your letter travels, the longer it takes to arrive
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <Card className="text-center shadow-vintage hover:shadow-letter transition-all duration-500 hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-none">
                <CardHeader>
                  <Clock className="h-14 w-14 text-primary mx-auto mb-6 transform transition-transform hover:rotate-180 duration-[2000ms]" />
                  <CardTitle className="font-alata text-2xl mb-2">Local Delivery</CardTitle>
                  <p className="text-3xl font-semibold text-primary">10 minutes</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-lg">
                    Letters within 100km arrive quickly, like a local message
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-vintage hover:shadow-letter transition-all duration-500 hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-none">
                <CardHeader>
                  <Globe className="h-14 w-14 text-accent mx-auto mb-6 transform transition-transform hover:rotate-12 duration-500" />
                  <CardTitle className="font-alata text-2xl mb-2">Regional Delivery</CardTitle>
                  <p className="text-3xl font-semibold text-accent">1-6 hours</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-lg">
                    Cross-country letters take time to travel, building anticipation
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-vintage hover:shadow-letter transition-all duration-500 hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-none">
                <CardHeader>
                  <Users className="h-14 w-14 text-postal-stamp mx-auto mb-6 transform transition-transform hover:scale-110 duration-500" />
                  <CardTitle className="font-alata text-2xl mb-2">International</CardTitle>
                  <p className="text-3xl font-semibold text-postal-stamp">12-24 hours</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-lg">
                    Global connections take a full day, making them truly special
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}

      {/* Redesigned Call to Action Section */}
      <section id="write" className="py-24 lg:py-36 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{
            backgroundImage: `url("https://raw.githubusercontent.com/Sumeet-162/letterlink-images/728d96b640a70ec8de710be706b2ebb1c4109f09/footer.jpg")`,
            opacity: 0.85
          }}
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-10">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-3xl lg:text-4xl mb-10 font-alata font-semibold text-foreground drop-shadow-lg tracking-tight">
                Ready to Send Your First Letter?
              </h2>
              <div className="relative max-w-xl mx-auto transform hover:scale-105 transition-transform duration-300">
                <div className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-letter border-2 border-primary/20 rotate-1">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/50 to-transparent opacity-50 pointer-events-none rounded-lg"></div>
                  <div className="absolute -top-2 -right-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-full border-2 border-primary/20 flex items-center justify-center transform rotate-12">
                      <Mail className="w-6 h-6 text-primary/70" />
                    </div>
                  </div>
                  <p className="text-lg lg:text-xl text-foreground font-medium leading-relaxed">
                    Join a global community of thoughtful writers. <br className="hidden sm:inline" />
                    Your next meaningful connection is just a letter away.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-4">
              <Button 
                variant="letter" 
                size="lg" 
                className="text-lg px-8 py-6 font-alata shadow-lg hover:scale-105 transition-transform duration-300 bg-primary text-white border-2 border-primary hover:bg-primary/90"
                onClick={() => navigate("/signup")}
              >
                <span className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Create Account
                </span>
              </Button>
              <Button 
                variant="vintage" 
                size="lg" 
                className="text-lg px-8 py-6 font-alata shadow-lg hover:scale-105 transition-transform duration-300 bg-white/90 backdrop-blur-sm border-2 border-primary text-primary hover:bg-primary/10"
                onClick={() => navigate("/signin")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;