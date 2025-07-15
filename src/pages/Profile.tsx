import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Clock, Heart, X } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    timezone: "",
    bio: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load existing profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }

        const response = await fetch('http://localhost:5000/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          
          setFormData({
            name: user.name || "",
            country: user.country || "",
            timezone: user.timezone || "",
            bio: user.bio || ""
          });
          setSelectedInterests(user.interests || []);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleProceed = async () => {
    // If user has minimum required fields, update profile before proceeding
    if (selectedInterests.length >= 3 && formData.name && formData.country) {
      await handleSubmit();
    } else {
      // Navigate directly if minimum requirements aren't met
      navigate('/inbox');
    }
  };

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

      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          country: formData.country,
          timezone: formData.timezone,
          bio: formData.bio,
          interests: selectedInterests
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Profile updated successfully!");
        // Navigate to dashboard after successful profile completion
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (error) {
      setError("Failed to connect to server");
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableInterests = [
    "Literature", "Travel", "Photography", "Cooking", "Music", "Art", "Philosophy",
    "History", "Science", "Nature", "Languages", "Cinema", "Technology", "Gardening",
    "Sports", "Writing", "Culture", "Architecture", "Astronomy", "Poetry"
  ];

  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany", "France",
    "Japan", "Italy", "Spain", "Netherlands", "Sweden", "Norway", "Brazil",
    "Argentina", "Mexico", "India", "China", "South Korea", "New Zealand"
  ];

  const timezones = [
    "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:00", "UTC-08:00", "UTC-07:00",
    "UTC-06:00", "UTC-05:00", "UTC-04:00", "UTC-03:00", "UTC-02:00", "UTC-01:00",
    "UTC+00:00", "UTC+01:00", "UTC+02:00", "UTC+03:00", "UTC+04:00", "UTC+05:00",
    "UTC+06:00", "UTC+07:00", "UTC+08:00", "UTC+09:00", "UTC+10:00", "UTC+11:00", "UTC+12:00"
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <Card className="shadow-vintage">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-heading">Create Your Profile</CardTitle>
            <p className="text-muted-foreground">
              Tell us about yourself to connect with kindred spirits. Bio and timezone are optional.
            </p>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <Card className="shadow-letter">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  placeholder="What should we call you?"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-letter-paper border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                  <SelectTrigger className="bg-letter-paper border-border">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border max-h-60 overflow-y-auto z-50">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone (Optional)</Label>
                <Select value={formData.timezone} onValueChange={(value) => setFormData({...formData, timezone: value})}>
                  <SelectTrigger className="bg-letter-paper border-border">
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border max-h-60 overflow-y-auto z-50">
                    {timezones.map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">About You (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself, your culture, or what makes you unique..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="bg-letter-paper border-border min-h-[120px] resize-none"
                  maxLength={300}
                />
                <p className="text-sm text-muted-foreground text-right">
                  {formData.bio.length}/300 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Interests Selection */}
          <Card className="shadow-letter">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Heart className="h-5 w-5" />
                Your Interests
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select 3-5 interests to help us match you with like-minded people
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selected Interests */}
              {selectedInterests.length > 0 && (
                <div className="space-y-3">
                  <Label>Selected Interests ({selectedInterests.length}/5)</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer group"
                        onClick={() => removeInterest(interest)}
                      >
                        {interest}
                        <X className="h-3 w-3 ml-1 opacity-60 group-hover:opacity-100" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Interests */}
              <div className="space-y-3">
                <Label>Available Interests</Label>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                  {availableInterests
                    .filter(interest => !selectedInterests.includes(interest))
                    .map((interest) => (
                      <Badge
                        key={interest}
                        variant="outline"
                        className={`cursor-pointer transition-all hover:bg-accent hover:text-accent-foreground ${
                          selectedInterests.length >= 5 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:shadow-vintage'
                        }`}
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                </div>
              </div>

              {selectedInterests.length < 3 && (
                <p className="text-sm text-accent">
                  Please select at least 3 interests to continue
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Preview */}
        <Card className="shadow-letter bg-gradient-vintage">
          <CardHeader>
            <CardTitle className="font-heading">Profile Preview</CardTitle>
            <p className="text-muted-foreground">
              This is how other users will see your profile
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold font-heading">
                  {formData.name || "Your Name"}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {formData.country || "Your Country"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formData.timezone || "Your Timezone"}
                  </span>
                </div>
              </div>
            </div>

            {formData.bio && (
              <p className="text-sm text-muted-foreground italic">
                "{formData.bio}"
              </p>
            )}

            {selectedInterests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedInterests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm max-w-md">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm max-w-md">
              {success}
            </div>
          )}
          
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleProceed}
              disabled={loading}
            >
              Proceed to Letters
            </Button>
            <Button 
              variant="letter" 
              size="lg"
              onClick={handleSubmit}
              disabled={selectedInterests.length < 3 || !formData.name || !formData.country || loading}
            >
              {loading ? "Saving..." : "Save Details"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;