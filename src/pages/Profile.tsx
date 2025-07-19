import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { API_CONFIG, apiCall } from "@/lib/api";
import Navigation from "@/components/Navigation";
import "@/styles/fonts.css";

const Profile = () => {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    relationshipStatus: "",
    writingStyle: "",
    country: "",
    timezone: "",
    bio: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Calculate profile completion percentage
  const calculateProgress = () => {
    const fields = [
      formData.name,
      formData.dateOfBirth,
      formData.gender,
      formData.relationshipStatus,
      formData.writingStyle,
      formData.country,
      formData.timezone,
      formData.bio,
    ];
    const filledFields = fields.filter(field => field.trim() !== "").length;
    const languagesComplete = selectedLanguages.length >= 1 ? 1 : 0;
    const interestsComplete = selectedInterests.length >= 3 ? 1 : 0;
    
    const totalFields = fields.length + 2; // +2 for languages and interests
    const completedFields = filledFields + languagesComplete + interestsComplete;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  // Font combinations with Inter replacing Alata
  const headingClasses = "font-inter font-semibold tracking-tight text-foreground";
  const bodyClasses = "font-spectral text-foreground/90 leading-relaxed";
  const accentClasses = "font-inter font-medium tracking-wide text-foreground/80";

  // Load existing profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }

        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.profile.update}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          
          setFormData({
            name: user.name || "",
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
            gender: user.gender || "",
            relationshipStatus: user.relationshipStatus || "",
            writingStyle: user.writingStyle || "",
            country: user.country || "",
            timezone: user.timezone || "",
            bio: user.bio || ""
          });
          setSelectedInterests(user.interests || []);
          setSelectedLanguages(user.languagesKnown || []);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const data = await apiCall(API_CONFIG.endpoints.profile.update, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          relationshipStatus: formData.relationshipStatus,
          writingStyle: formData.writingStyle,
          languagesKnown: selectedLanguages,
          country: formData.country,
          timezone: formData.timezone,
          bio: formData.bio,
          interests: selectedInterests
        })
      });

      setSuccess("Profile updated successfully!");
      // Navigate to dashboard after successful profile completion
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to connect to server");
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableInterests = [
    "Literature", "Travel", "Photography", "Cooking", "Music", "Art", "Philosophy",
    "History", "Science", "Nature", "Languages", "Cinema", "Technology", "Gardening",
    "Sports", "Writing", "Culture", "Architecture", "Astronomy", "Poetry",
    "Dance", "Theater", "Fashion", "Gaming", "Meditation", "Yoga", "Fitness",
    "Reading", "Journalism", "Psychology", "Sociology", "Environmental Science",
    "Economics", "Politics", "Volunteering", "Social Work", "Education", "Teaching",
    "Medicine", "Research", "Innovation", "Entrepreneurship", "Design", "Drawing",
    "Painting", "Sculpture", "Crafts", "Woodworking", "Metalworking", "Sewing",
    "Knitting", "Pottery", "Jewelry Making", "Collecting", "Antiques", "Vintage",
    "Music Production", "Singing", "Playing Instruments", "Podcasting", "Broadcasting"
  ];

  const availableLanguages = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese",
    "Korean", "Arabic", "Russian", "Hindi", "Bengali", "Turkish", "Dutch", "Swedish",
    "Norwegian", "Danish", "Finnish", "Polish", "Czech", "Hungarian", "Romanian", "Greek",
    "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay", "Tagalog", "Swahili", "Yoruba",
    "Hausa", "Amharic", "Zulu", "Afrikaans", "Gujarati", "Punjabi", "Tamil", "Telugu",
    "Marathi", "Urdu", "Persian", "Kurdish", "Uzbek", "Kazakh", "Mongolian", "Tibetan"
  ];

  const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];

  const relationshipOptions = [
    "Single", "In a relationship", "Married", "Divorced", "Widowed", "It's complicated", "Prefer not to say"
  ];

  const writingStyleOptions = [
    "Casual and friendly", "Formal and professional", "Deep and philosophical", 
    "Creative and artistic", "Humorous and light-hearted", "Poetic and expressive"
  ];

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina", "Brazil", "Bulgaria",
    "Cambodia", "Canada", "Chile", "China", "Colombia", "Costa Rica", "Croatia", "Czech Republic",
    "Denmark", "Dominican Republic", "Ecuador", "Egypt", "Estonia", "Ethiopia", "Finland", "France",
    "Georgia", "Germany", "Ghana", "Greece", "Guatemala", "Hungary", "Iceland", "India", "Indonesia",
    "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
    "Kuwait", "Latvia", "Lebanon", "Lithuania", "Luxembourg", "Malaysia", "Mexico", "Morocco", "Netherlands",
    "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
    "Romania", "Russia", "Saudi Arabia", "Serbia", "Singapore", "Slovakia", "Slovenia", "South Africa",
    "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Taiwan", "Thailand", "Turkey",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Venezuela", "Vietnam"
  ];

  const timezones = [
    "UTC-12:00 (Baker Island)",
    "UTC-11:00 (American Samoa)",
    "UTC-10:00 (Hawaii)",
    "UTC-09:00 (Alaska)",
    "UTC-08:00 (Los Angeles, Vancouver)",
    "UTC-07:00 (Denver, Phoenix)",
    "UTC-06:00 (Chicago, Mexico City)",
    "UTC-05:00 (New York, Toronto)",
    "UTC-04:00 (Santiago, Caracas)",
    "UTC-03:00 (São Paulo, Buenos Aires)",
    "UTC-02:00 (South Georgia)",
    "UTC-01:00 (Azores)",
    "UTC+00:00 (London, Dublin)",
    "UTC+01:00 (Paris, Berlin, Rome)",
    "UTC+02:00 (Cairo, Athens, Helsinki)",
    "UTC+03:00 (Moscow, Istanbul, Nairobi)",
    "UTC+04:00 (Dubai, Baku)",
    "UTC+05:00 (Karachi, Tashkent)",
    "UTC+05:30 (Mumbai, Delhi)",
    "UTC+06:00 (Dhaka, Almaty)",
    "UTC+07:00 (Bangkok, Jakarta)",
    "UTC+08:00 (Beijing, Singapore, Manila)",
    "UTC+09:00 (Tokyo, Seoul)",
    "UTC+10:00 (Sydney, Melbourne)",
    "UTC+11:00 (Solomon Islands)",
    "UTC+12:00 (Auckland, Fiji)"
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < 5) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests(selectedInterests.filter(i => i !== interest));
  };

  const toggleLanguage = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== language));
    } else if (selectedLanguages.length < 5) {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const removeLanguage = (language: string) => {
    setSelectedLanguages(selectedLanguages.filter(l => l !== language));
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
              Your Profile
            </h2>
            <img className="h-16 w-16" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-qT0qCttwF0fSi4qeWZj6vo2Za76keg.png" alt="" />
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${accentClasses}`}>Profile Completion</span>
              <span className={`text-sm font-medium ${accentClasses}`}>{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
          
          <p className={`text-lg text-foreground/80 ${bodyClasses}`}>
            Share your story and interests to connect with kindred spirits around the world.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Personal Information */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
            <div className="flex items-center gap-3 mb-6">
              <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-NzneqbRLSvSpxFnid3MW4HHav3vtzo.png" alt="User" />
              <h3 className={`text-lg font-semibold ${headingClasses}`}>
                Personal Information
              </h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className={`text-sm font-medium ${headingClasses}`}>Your Name *</Label>
                <Input
                  id="name"
                  placeholder="What should we call you?"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 font-spectral"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className={`text-sm font-medium ${headingClasses}`}>Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 font-spectral"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className={`text-sm font-medium ${headingClasses}`}>Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-primary/20 max-h-60 overflow-y-auto z-50">
                    {genderOptions.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationshipStatus" className={`text-sm font-medium ${headingClasses}`}>Relationship Status *</Label>
                <Select value={formData.relationshipStatus} onValueChange={(value) => setFormData({...formData, relationshipStatus: value})}>
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40">
                    <SelectValue placeholder="Select your relationship status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-primary/20 max-h-60 overflow-y-auto z-50">
                    {relationshipOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="writingStyle" className={`text-sm font-medium ${headingClasses}`}>Writing Style *</Label>
                <Select value={formData.writingStyle} onValueChange={(value) => setFormData({...formData, writingStyle: value})}>
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40">
                    <SelectValue placeholder="Select your writing style" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-primary/20 max-h-60 overflow-y-auto z-50">
                    {writingStyleOptions.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location & Languages */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
            <div className="flex items-center gap-3 mb-6">
              <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-dY7UJjMGBYLeRozGgfl3XmFvIJui9V.png" alt="Location" />
              <h3 className={`text-lg font-semibold ${headingClasses}`}>
                Location & Languages
              </h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="country" className={`text-sm font-medium ${headingClasses}`}>Country *</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-primary/20 max-h-60 overflow-y-auto z-50">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone" className={`text-sm font-medium ${headingClasses}`}>Timezone *</Label>
                <Select value={formData.timezone} onValueChange={(value) => setFormData({...formData, timezone: value})}>
                  <SelectTrigger className="bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40">
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-primary/20 max-h-60 overflow-y-auto z-50">
                    {timezones.map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className={`text-sm font-medium ${headingClasses}`}>Languages You Know * (Select at least 1, max 5)</Label>
                
                {selectedLanguages.length > 0 && (
                  <div className="space-y-2">
                    <p className={`text-sm font-medium ${accentClasses}`}>Selected Languages:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLanguages.map((language) => (
                        <Badge
                          key={language}
                          variant="default"
                          className="flex items-center gap-1 bg-primary text-white"
                        >
                          {language}
                          <X
                            className="h-3 w-3 cursor-pointer hover:bg-primary/80 rounded-full"
                            onClick={() => removeLanguage(language)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-primary/20 rounded-md p-3 bg-white/30">
                  {availableLanguages.map((language) => (
                    <Button
                      key={language}
                      type="button"
                      variant={selectedLanguages.includes(language) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleLanguage(language)}
                      disabled={!selectedLanguages.includes(language) && selectedLanguages.length >= 5}
                      className={`text-xs justify-start ${
                        selectedLanguages.includes(language) 
                          ? "bg-primary text-white hover:bg-primary/90" 
                          : "bg-white/50 text-foreground hover:bg-white/70"
                      }`}
                    >
                      {language}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
            <div className="flex items-center gap-3 mb-6">
              <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-WjC4MtrGSDHdSawB8oRzxQ92TZjQB1.png" alt="Bio" />
              <h3 className={`text-lg font-semibold ${headingClasses}`}>
                About You
              </h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio" className={`text-sm font-medium ${headingClasses}`}>Bio *</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself, your interests, or what you're hoping to share through letters..."
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="bg-white/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 font-spectral min-h-[120px] resize-none"
                rows={6}
              />
            </div>
          </div>

          {/* Interests Selection */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-letter border-none p-6">
            <div className="flex items-center gap-3 mb-6">
              <img className="h-8 w-8" src="https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/icons/image-TzoD7VStyBaazeXgQFVSjBPEpOqHGB.png" alt="Interests" />
              <h3 className={`text-lg font-semibold ${headingClasses}`}>
                Your Interests
              </h3>
            </div>
            
            <div className="space-y-4">
              <p className={`text-sm ${bodyClasses}`}>
                Select at least 3 interests to help us match you with like-minded pen pals (maximum 5):
              </p>
              
              {selectedInterests.length > 0 && (
                <div className="space-y-2">
                  <p className={`text-sm font-medium ${accentClasses}`}>Selected Interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="default"
                        className="flex items-center gap-1 bg-primary text-white"
                      >
                        {interest}
                        <X
                          className="h-3 w-3 cursor-pointer hover:bg-primary/80 rounded-full"
                          onClick={() => removeInterest(interest)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className={`text-sm font-medium ${accentClasses}`}>Available Interests:</p>
                <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
                  {availableInterests.map((interest) => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        selectedInterests.includes(interest)
                          ? "bg-primary text-white"
                          : "hover:bg-primary/10 hover:border-primary/40"
                      }`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Message */}
        {(selectedInterests.length < 3 || selectedLanguages.length < 1 || !formData.name || !formData.dateOfBirth || !formData.gender || !formData.relationshipStatus || !formData.writingStyle || !formData.country || !formData.timezone || !formData.bio) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className={`text-sm ${bodyClasses} text-amber-800`}>
              Please complete all required fields to continue:
            </p>
            <ul className={`text-sm ${bodyClasses} text-amber-800 mt-2 space-y-1`}>
              {!formData.name && <li>• Name is required</li>}
              {!formData.dateOfBirth && <li>• Date of birth is required</li>}
              {!formData.gender && <li>• Gender is required</li>}
              {!formData.relationshipStatus && <li>• Relationship status is required</li>}
              {!formData.writingStyle && <li>• Writing style is required</li>}
              {selectedLanguages.length < 1 && <li>• At least 1 language is required</li>}
              {!formData.country && <li>• Country is required</li>}
              {!formData.timezone && <li>• Timezone is required</li>}
              {!formData.bio && <li>• Bio is required</li>}
              {selectedInterests.length < 3 && <li>• At least 3 interests are required</li>}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          
          <div className="flex gap-4 w-full">
            <Button
              onClick={handleSubmit}
              disabled={loading || selectedInterests.length < 3 || selectedLanguages.length < 1 || !formData.name || !formData.dateOfBirth || !formData.gender || !formData.relationshipStatus || !formData.writingStyle || !formData.country || !formData.timezone || !formData.bio}
              className="w-full bg-primary hover:bg-primary/90 text-white font-inter"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
