import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Cars from './components/Cars';
import CarDetail from './components/CarDetail';
import UserCars from './components/UserCars';
import PostCar from './components/PostCar';
import EditCar from './components/EditCar';
import Favorites from './components/Favourites';
import Reviews from './components/Reviews';
import LoginSignup from './components/LoginSignup';
import UserManagement from './components/UserManagement';

function App() {
  const [step, setStep] = useState("login");
  const [selectedCar, setSelectedCar] = useState(null); 
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setStep("home"); 
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setStep("login");
  };

  const renderStep = () => {
    switch (step) {
      case "home":
        return <Home setStep={setStep} user={user} />;
      case "cars":
        return <Cars setStep={setStep} setSelectedCar={setSelectedCar} />;
      case "login":
        return <LoginSignup setStep={setStep} setUser={setUser} />;
      case "carDetail":
        return <CarDetail user={user} car={selectedCar} setStep={setStep} />;
      case "posts":
        return <UserCars user={user} setStep={setStep}/>
      case "editCar":
        return <EditCar user={user} setStep={setStep}/>
      case "newPost":
        return <PostCar user={user} setStep={setStep} setSelectedCar={setSelectedCar}/>;
      case "favorites":
        return <Favorites user={user} setStep={setStep} setSelectedCar={setSelectedCar} />;
      case "reviews":
        return <Reviews user={user} />;
      case "manageAccount":
        return <UserManagement user={user} setUser={setUser} setStep={setStep} />;
      default:
        return <Home setStep={setStep} user={user} />;
    }
  };

  const martinsPages = ["home", "cars", "carDetail", "favorites", "posts", "newPost, editCar"];
  let devName = "Matthew Gathman";
  let devEmail = "mattgath@iastate.edu";

  if (martinsPages.includes(step)) {
    devName = "Martin Kochadampally";
    devEmail = "martink5@iastate.edu";
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 w-full">
      {step !== "login" && <Navbar setStep={setStep} user={user} onLogout={handleLogout} />}
      <main className="flex-grow">
        {renderStep()}
      </main>
      <Footer name={devName} email={devEmail} />
    </div>
  );
}

export default App;