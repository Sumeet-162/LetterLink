import { createBrowserRouter } from "react-router-dom";
import Landing from "@/pages/Landing";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import WriteLetter from "@/pages/WriteLetter";
import Inbox from "@/pages/Inbox";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/write",
    element: <WriteLetter />,
  },
  {
    path: "/inbox",
    element: <Inbox />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
