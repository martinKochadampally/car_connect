import React, { useState , useEffect} from 'react';

function Favorites({ user, setSelectedCar, setStep }) {
  const [favourites, setFavourites] = useState([]);
  
  if (!user.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-500 text-lg">You must be logged in to view favorites.</p>
      </div>
    );
  }

  useEffect(() => {
    if (user.email) {
      getFavourites();
    }}, [user.email]);
  
  async function getFavourites() {
    try {
      const url = `http://127.0.0.1:8080/users/${user.email}/favorites`;
      const response = await fetch(url);
      const carIDs = await response.json();
  
      const carPromises = carIDs.map((carID) =>
        fetch(`http://127.0.0.1:8080/getCar/${carID}`).then((res) => res.json())
      );
  
      const cars = await Promise.all(carPromises);
      setFavourites(cars);
    } catch (error) {
      console.error("Error fetching Favourites:", error);
    }
  }

  async function removeFromFavorites(carID) {
    const url = `http://127.0.0.1:8080/removeFave/${user.email}/${carID}`;
    try {
      const response = await fetch(url, {
        method: "PUT",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to remove favorite: ${text}`);
      }

      // Refresh favorites list after removing
      setFavourites(favourites.filter((car) => car.id !== carID));
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert(`Could not remove favorite: ${error.message}`);
    }
  }

  if (favourites.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-lg">You have not favorited any cars yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12 px-4">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
        Your Favourite Cars
      </h2>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {favourites.map((car, index) => (
          <div
            key={index}
            className="bg-gray-100 shadow rounded-lg overflow-hidden hover:shadow-xl transition"
          >
            <img src={car.image_url} alt={car.make + "-" + car.model} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">{car.year + " " + car.make + " " + car.model}</h3>
              <p className="text-gray-600">{car.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
              <div className="flex justify-between w-full mt-4">
              <button
                onClick={() => {
                  setSelectedCar(car);
                  setStep("carDetail");
                }}
                className="!mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
                View Details
              </button>
              <button
                  onClick={() => removeFromFavorites(car.id)}
                  className="!mt-4 bg-blue-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
              Unfavourite
              </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;