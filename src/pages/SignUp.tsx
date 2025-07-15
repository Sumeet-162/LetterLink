import { useState } from "react";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimateSvg } from "@/components/ui/AnimateSvg";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token
        localStorage.setItem('token', data.token);
        // Navigate to profile completion for new users
        navigate('/profile');
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert("Failed to connect to server");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed" 
        style={{
          backgroundImage: `url("https://raw.githubusercontent.com/Sumeet-162/letterlink-images/refs/heads/main/letterlinkjpg.jpg")`,
          opacity: 0.85
        }}
      />
      <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-letter border-none relative z-10">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-4">
            <AnimateSvg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              className="mx-auto"
              path="M10,30 Q10,10 30,10 Q50,10 50,30 Q50,10 70,10 Q90,10 90,30 Q90,50 50,80 Q10,50 10,30 Z"
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
          <CardTitle className="text-3xl font-alata">Create Account</CardTitle>
          <CardDescription className="text-lg">
            Join our community of letter writers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pl-10 py-6 bg-white/50 border-2 border-primary/20 focus:border-primary transition-colors"
                  required
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
              <div className="relative">
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 py-6 bg-white/50 border-2 border-primary/20 focus:border-primary transition-colors"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
              <div className="relative">
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 py-6 bg-white/50 border-2 border-primary/20 focus:border-primary transition-colors"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
              <div className="relative">
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 py-6 bg-white/50 border-2 border-primary/20 focus:border-primary transition-colors"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                type="submit" 
                className="w-full py-6 bg-primary hover:bg-primary/90 text-white text-lg font-alata"
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="text-center">
                <div className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/signin")}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
