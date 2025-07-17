import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PenTool, Send, Users, Globe, Clock, MapPin, User, Heart, BookOpen } from "lucide-react";
import Navigation from "@/components/Navigation";
import "@/styles/fonts.css";

const WriteLetter = () => {
  const [letterData, setLetterData] = useState({
    title: "",
    content: ""
  });

  // New targeting options
  const [selectedRegion, setSelectedRegion] = useState("worldwide");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("any");
  const [selectedGender, setSelectedGender] = useState("any");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [relationshipStatus, setRelationshipStatus] = useState("any");
  const [preferredWritingStyle, setPreferredWritingStyle] = useState("any");

  // Font combinations with Inter replacing Alata
  const headingClasses = "font-inter font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-inter font-medium tracking-wide text-foreground/80";

  const maxContentLength = 2000; // Increased for compose letter
  const contentProgress = (letterData.content.length / maxContentLength) * 100;

  // Available options
  const regions = [
    { value: "worldwide", label: "Worldwide" },
    { value: "north-america", label: "North America" },
    { value: "south-america", label: "South America" },
    { value: "europe", label: "Europe" },
    { value: "asia", label: "Asia" },
    { value: "africa", label: "Africa" },
    { value: "oceania", label: "Oceania" },
    { value: "custom", label: "Select Specific Countries" }
  ];

  const countries = [
    "United States", "Canada", "United Kingdom", "Germany", "France", "Japan", 
    "Australia", "Brazil", "India", "China", "South Korea", "Italy", "Spain", 
    "Netherlands", "Sweden", "Norway", "Denmark", "Switzerland", "Austria", 
    "Belgium", "Portugal", "Ireland", "Finland", "New Zealand", "Singapore"
  ];

  const ageGroups = [
    { value: "any", label: "Any Age" },
    { value: "18-25", label: "18-25 years" },
    { value: "26-35", label: "26-35 years" },
    { value: "36-45", label: "36-45 years" },
    { value: "46-55", label: "46-55 years" },
    { value: "56-65", label: "56-65 years" },
    { value: "65+", label: "65+ years" }
  ];

  const interests = [
    "Travel", "Food", "Culture", "Literature", "Art", "Philosophy", "Nature", 
    "Photography", "Music", "History", "Sports", "Technology", "Science", 
    "Architecture", "Fashion", "Movies", "Writing", "Cooking", "Fitness", 
    "Meditation", "Languages", "Dancing", "Gaming", "Gardening", "Crafts"
  ];

  const languages = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", 
    "Japanese", "Korean", "Chinese", "Arabic", "Russian", "Hindi", 
    "Dutch", "Swedish", "Norwegian", "Danish", "Finnish"
  ];

  const writingStyles = [
    { value: "any", label: "Any Style" },
    { value: "casual", label: "Casual & Friendly" },
    { value: "formal", label: "Formal & Professional" },
    { value: "poetic", label: "Poetic & Creative" },
    { value: "philosophical", label: "Deep & Philosophical" },
    { value: "storytelling", label: "Storytelling & Narrative" }
  ];

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const handleCountryToggle = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const mockRecipients = [
    { country: "Japan", distance: "6,800 km", deliveryTime: "18 hours", age: "28", interests: ["Photography", "Nature"] },
    { country: "Brazil", distance: "3,200 km", deliveryTime: "8 hours", age: "34", interests: ["Travel", "Food"] },
    { country: "Germany", distance: "1,500 km", deliveryTime: "3 hours", age: "42", interests: ["Literature", "Art"] }
  ];

  // Generate matched recipients based on user preferences
  const getMatchedRecipients = () => {
    if (selectedRegion === "worldwide" && selectedAgeGroup === "any" && selectedGender === "any" && 
        selectedInterests.length === 0 && selectedLanguages.length === 0 && relationshipStatus === "any" && 
        preferredWritingStyle === "any") {
      return []; // No recipients shown if no preferences selected
    }

    // Filter recipients based on preferences
    let filteredRecipients = [...mockRecipients];

    // Filter by region
    if (selectedRegion !== "worldwide") {
      if (selectedRegion === "custom" && selectedCountries.length > 0) {
        filteredRecipients = filteredRecipients.filter(recipient => 
          selectedCountries.includes(recipient.country)
        );
      } else if (selectedRegion === "asia") {
        filteredRecipients = filteredRecipients.filter(recipient => 
          ["Japan", "China", "South Korea", "India", "Singapore"].includes(recipient.country)
        );
      } else if (selectedRegion === "europe") {
        filteredRecipients = filteredRecipients.filter(recipient => 
          ["Germany", "France", "Italy", "Spain", "Netherlands", "Sweden", "Norway", "Denmark", "Switzerland", "Austria", "Belgium", "Portugal", "Ireland", "Finland", "United Kingdom"].includes(recipient.country)
        );
      } else if (selectedRegion === "south-america") {
        filteredRecipients = filteredRecipients.filter(recipient => 
          ["Brazil", "Argentina", "Chile", "Colombia", "Peru"].includes(recipient.country)
        );
      }
    }

    // Filter by age group
    if (selectedAgeGroup !== "any") {
      filteredRecipients = filteredRecipients.filter(recipient => {
        const age = parseInt(recipient.age);
        switch (selectedAgeGroup) {
          case "18-25": return age >= 18 && age <= 25;
          case "26-35": return age >= 26 && age <= 35;
          case "36-45": return age >= 36 && age <= 45;
          case "46-55": return age >= 46 && age <= 55;
          case "56-65": return age >= 56 && age <= 65;
          case "65+": return age >= 65;
          default: return true;
        }
      });
    }

    // Filter by interests (if any selected)
    if (selectedInterests.length > 0) {
      filteredRecipients = filteredRecipients.filter(recipient => 
        recipient.interests.some(interest => selectedInterests.includes(interest))
      );
    }

    return filteredRecipients.slice(0, 3); // Show max 3 recipients
  };

  const matchedRecipients = getMatchedRecipients();
  const hasPreferences = selectedRegion !== "worldwide" || selectedAgeGroup !== "any" || 
                         selectedGender !== "any" || selectedInterests.length > 0 || 
                         selectedLanguages.length > 0 || relationshipStatus !== "any" || 
                         preferredWritingStyle !== "any";

  const handleSubmit = () => {
    console.log("Letter submitted:", letterData);
    console.log("Targeting preferences:", {
      region: selectedRegion,
      countries: selectedCountries,
      ageGroup: selectedAgeGroup,
      gender: selectedGender,
      interests: selectedInterests,
      languages: selectedLanguages,
      relationshipStatus,
      writingStyle: preferredWritingStyle
    });
    // This would connect to Supabase when implemented
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
              Compose Letter
            </h2>
            <img className="h-16 w-16" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-wivGjUfNhuwRixEHMGAh1N2xFhKbzH.png" alt="" />
          </div>
          <p className={`text-lg text-foreground/80 ${bodyClasses}`}>
            Send your thoughts to a specific person around the world with targeted delivery preferences
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Letter Writing Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
              <div className="flex items-center gap-3 mb-6">
                <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-lp9vjuXTCqeB9yhVXBoBmyqdy8e9jv%20(1).png" alt="Write" />
                <h3 className={`text-lg font-semibold ${headingClasses}`}>
                  Your Letter
                </h3>
              </div>

              <div className="space-y-6">
                {/* Letter Title */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${headingClasses}`}>
                    Letter Title
                  </label>
                  <input
                    type="text"
                    placeholder="Give your letter a meaningful title..."
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-primary/20 focus:border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-spectral"
                    value={letterData.title}
                    onChange={(e) => setLetterData({...letterData, title: e.target.value})}
                  />
                </div>

                {/* Letter Content */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className={`block text-sm font-medium ${headingClasses}`}>
                      Your Letter
                    </label>
                    <span className={`text-xs ${bodyClasses} text-foreground/60 ${letterData.content.length > maxContentLength ? 'text-red-500' : ''}`}>
                      {letterData.content.length}/{maxContentLength} words
                    </span>
                  </div>
                  <textarea
                    placeholder="Dear fellow letter writer,

I hope this letter finds you well. I wanted to share..."
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-primary/20 focus:border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-spectral leading-relaxed text-base min-h-[400px]"
                    value={letterData.content}
                    onChange={(e) => setLetterData({...letterData, content: e.target.value})}
                    maxLength={maxContentLength}
                  />
                  <div className="w-full bg-primary/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${letterData.content.length > maxContentLength ? 'bg-red-500' : 'bg-primary'}`}
                      style={{ width: `${Math.min(contentProgress, 100)}%` }}
                    />
                  </div>
                  {contentProgress > 90 && (
                    <p className="text-sm text-amber-600">
                      You're approaching the character limit!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Targeting Options */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
              <div className="flex items-center gap-3 mb-6">
                <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Target" />
                <h3 className={`text-lg font-semibold ${headingClasses}`}>
                  Delivery Preferences
                </h3>
              </div>

              <div className="space-y-6">
                {/* Region Selection */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${headingClasses}`}>
                    <MapPin className="inline w-4 h-4 mr-2" />
                    Target Region
                  </label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Country Selection (if custom region selected) */}
                  {selectedRegion === "custom" && (
                    <div className="space-y-3">
                      <label className={`block text-sm font-medium ${headingClasses}`}>
                        Select Specific Countries
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 bg-primary/5 backdrop-blur-sm rounded-lg border border-primary/20">
                        {countries.map(country => (
                          <div key={country} className="flex items-center space-x-2">
                            <Checkbox
                              id={country}
                              checked={selectedCountries.includes(country)}
                              onCheckedChange={() => handleCountryToggle(country)}
                            />
                            <label htmlFor={country} className={`text-sm ${bodyClasses} cursor-pointer`}>
                              {country}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Age Group Selection */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${headingClasses}`}>
                    <User className="inline w-4 h-4 mr-2" />
                    Age Group
                  </label>
                  <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                    <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40">
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageGroups.map(group => (
                        <SelectItem key={group.value} value={group.value}>
                          {group.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Preference */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${headingClasses}`}>
                    <Heart className="inline w-4 h-4 mr-2" />
                    Gender Preference
                  </label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40">
                      <SelectValue placeholder="Select gender preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Gender</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Interests Selection */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${headingClasses}`}>
                    <BookOpen className="inline w-4 h-4 mr-2" />
                    Shared Interests (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map(interest => (
                      <Badge
                        key={interest}
                        variant={selectedInterests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Language Preference */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${headingClasses}`}>
                    <Globe className="inline w-4 h-4 mr-2" />
                    Language Preference
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {languages.map(language => (
                      <Badge
                        key={language}
                        variant={selectedLanguages.includes(language) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => handleLanguageToggle(language)}
                      >
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Relationship Status */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${headingClasses}`}>
                    <Heart className="inline w-4 h-4 mr-2" />
                    Relationship Status
                  </label>
                  <Select value={relationshipStatus} onValueChange={setRelationshipStatus}>
                    <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40">
                      <SelectValue placeholder="Select relationship status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Status</SelectItem>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="relationship">In a Relationship</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Writing Style Preference */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${headingClasses}`}>
                    <PenTool className="inline w-4 h-4 mr-2" />
                    Preferred Writing Style
                  </label>
                  <Select value={preferredWritingStyle} onValueChange={setPreferredWritingStyle}>
                    <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40">
                      <SelectValue placeholder="Select writing style" />
                    </SelectTrigger>
                    <SelectContent>
                      {writingStyles.map(style => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Send Button */}
              <div className="flex justify-center pt-6 border-t border-primary/20 mt-6">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-inter font-medium rounded-lg shadow-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!letterData.title || !letterData.content || letterData.content.length < 50 || matchedRecipients.length === 0}
                  onClick={handleSubmit}
                >
                  <Send className="w-5 h-5" />
                  {matchedRecipients.length === 0 ? "No Recipients Found" : "Send Letter"}
                </Button>
              </div>
            </div>

            {/* Writing Tips */}
            <div className="bg-primary/5 backdrop-blur-sm rounded-lg shadow-letter border border-primary/20 p-6">
              <h3 className={`text-lg font-semibold ${headingClasses} mb-4 text-primary`}>
                Writing Tips
              </h3>
              <ul className={`space-y-2 text-sm ${bodyClasses} text-foreground/80`}>
                <li>• Share something personal about your culture or daily life</li>
                <li>• Ask thoughtful questions to encourage responses</li>
                <li>• Describe your surroundings, local traditions, or current season</li>
                <li>• Share a book, song, or experience that moved you recently</li>
                <li>• Be genuine and authentic - the best connections come from honesty</li>
              </ul>
            </div>
          </div>          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Potential Recipients Preview */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
              <div className="flex items-center gap-3 mb-4">
                <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Recipients" />
                <h3 className={`text-lg font-semibold ${headingClasses}`}>
                  Potential Recipients
                </h3>
              </div>

              {!hasPreferences ? (
                <div className="text-center py-8">
                  <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className={`text-base font-medium ${headingClasses} mb-2`}>
                    Set Your Preferences
                  </h4>
                  <p className={`text-sm ${bodyClasses} text-foreground/60`}>
                    Select your delivery preferences to see matched recipients
                  </p>
                </div>
              ) : matchedRecipients.length === 0 ? (
                <div className="text-center py-8">
                  <div className="p-4 rounded-full bg-amber-100 w-fit mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-amber-600" />
                  </div>
                  <h4 className={`text-base font-medium ${headingClasses} mb-2`}>
                    No Matches Found
                  </h4>
                  <p className={`text-sm ${bodyClasses} text-foreground/60`}>
                    Try adjusting your preferences to find recipients
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matchedRecipients.map((recipient, index) => (
                    <div key={index} className="bg-primary/5 backdrop-blur-sm rounded-lg p-4 space-y-2 border border-primary/20">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className={`font-medium ${accentClasses}`}>{recipient.country}</span>
                      </div>
                      <div className="space-y-1 text-sm text-foreground/80">
                        <p>Distance: {recipient.distance}</p>
                        <p>Delivery: {recipient.deliveryTime}</p>
                        <p>Age: {recipient.age}</p>
                        <div className="flex flex-wrap gap-1">
                          {recipient.interests.map(interest => (
                            <Badge key={interest} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-center">
                    <p className={`text-xs ${bodyClasses} text-foreground/60`}>
                      Found {matchedRecipients.length} matching recipient{matchedRecipients.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Information */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
              <div className="flex items-center gap-3 mb-4">
                <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NohBtZSgbbGjRMUlI8hWYra0AByga7%20(1).png" alt="Delivery" />
                <h3 className={`text-lg font-semibold ${headingClasses}`}>
                  How Delivery Works
                </h3>
              </div>
              <div className="space-y-3 text-sm text-foreground/80">
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className={`font-medium ${accentClasses}`}>Local (0-100km):</span>
                    10 minutes
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className={`font-medium ${accentClasses}`}>Regional (100-1000km):</span>
                    1 hour
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className={`font-medium ${accentClasses}`}>International (1000km+):</span>
                    6-24 hours
                  </p>
                </div>
                <p className={`text-xs italic pt-2 border-t border-primary/20 ${bodyClasses}`}>
                  The further your letter travels, the more anticipation builds for both you and your recipient.
                </p>
              </div>
            </div>

            {/* Ready to Send */}
            <div className="bg-primary/5 backdrop-blur-sm rounded-lg shadow-letter border border-primary/20 p-6">
              <div className="text-center space-y-3">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <h3 className={`font-semibold ${headingClasses}`}>
                  {!hasPreferences ? "Set Preferences First" : 
                   matchedRecipients.length === 0 ? "No Recipients Found" : 
                   "Ready to Send?"}
                </h3>
                <p className={`text-sm ${bodyClasses} text-foreground/80`}>
                  {!hasPreferences ? "Select your delivery preferences to find recipients" :
                   matchedRecipients.length === 0 ? "Try adjusting your preferences to find potential recipients" :
                   `Your letter will be sent to ${matchedRecipients.length} matched recipient${matchedRecipients.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteLetter;