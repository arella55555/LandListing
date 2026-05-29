import React from 'react';
import HomeScreen from "../src/screens/Home/HomeScreen";
import SellerDashboard from "../src/screens/Sellers/SellerDashboard";
import { UserProvider, useUser } from "../src/contexts/UserContext";

const AppContent: React.FC = () => {
  const { role } = useUser();

  if (role === 'seller') {
    return <SellerDashboard />;
  }

  return <HomeScreen />;
};

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}