import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import WriteLetter from "./pages/WriteLetter";
import Inbox from "./pages/Inbox";
import ReplyLetter from "./pages/ReplyLetter";
import Dashboard from "./pages/Dashboard";
import Friends from "./pages/Friends";
import Drafts from "./pages/Drafts";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={
            <ProtectedRoute requireProfileCompletion={true}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/write" element={
            <ProtectedRoute requireProfileCompletion={true}>
              <WriteLetter />
            </ProtectedRoute>
          } />
          <Route path="/inbox" element={
            <ProtectedRoute requireProfileCompletion={true}>
              <Inbox />
            </ProtectedRoute>
          } />
          <Route path="/reply" element={
            <ProtectedRoute requireProfileCompletion={true}>
              <ReplyLetter />
            </ProtectedRoute>
          } />
          <Route path="/friends" element={
            <ProtectedRoute requireProfileCompletion={true}>
              <Friends />
            </ProtectedRoute>
          } />
          <Route path="/drafts" element={
            <ProtectedRoute requireProfileCompletion={true}>
              <Drafts />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
