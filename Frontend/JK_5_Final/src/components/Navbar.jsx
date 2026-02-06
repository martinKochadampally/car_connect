import React from 'react';

function Navbar({ setStep, user, onLogout }) {
  return (
    <nav className="bg-black text-white sticky w-full">
      <div className="w-full px-4 py-6 flex items-center justify-between">
        <div
          className="text-3xl font-bold cursor-pointer"
          onClick={() => setStep("home")}
        >
          Car Connect
        </div>

        <div className="flex items-center space-x-6 text-sm md:text-base">
          <span onClick={() => setStep("home")} className="cursor-pointer hover:text-orange-400">
            Home
          </span>
          <span onClick={() => setStep("cars")} className="cursor-pointer hover:text-orange-400">
            Cars
          </span>
          <span onClick={() => setStep("posts")} className="cursor-pointer hover:text-orange-400">
            Your Posts
          </span>
          <span onClick={() => setStep("favorites")} className="cursor-pointer hover:text-orange-400">
            Favorites
          </span>
          <span onClick={() => setStep("reviews")} className="cursor-pointer hover:text-orange-400">
            Reviews
          </span>
          {user ? (
            <>
              <span onClick={() => setStep("manageAccount")} className="cursor-pointer hover:text-orange-400">
                Manage Account
              </span>
              <span onClick={onLogout} className="cursor-pointer hover:text-orange-400">
                Logout
              </span>
            </>
          ) : (
            <span onClick={() => setStep("login")} className="cursor-pointer hover:text-orange-400">
              Login
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;