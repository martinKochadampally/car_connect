import React from 'react';


function Home({ setStep, user }) {
  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          {user ? `Welcome to Car Connect, ${user.name}!` : "Welcome to Car Connect!"}
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Discover, compare, and review cars easily. Whether you're shopping for a new ride or just love looking at the latest models, we've got you covered.
        </p>
        <button
          onClick={() => setStep("cars")}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded transition duration-300"
        >
          Browse Cars
        </button>
      </div>
    </div>
  );
}

export default Home;
