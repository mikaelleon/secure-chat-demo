import { useState } from "react";
import AuthPage from "./AuthPage";
import ChatLayout from "./ChatLayout";

const Index = () => {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <AuthPage onLogin={() => setAuthenticated(true)} />;
  }

  return <ChatLayout onLogout={() => setAuthenticated(false)} />;
};

export default Index;
