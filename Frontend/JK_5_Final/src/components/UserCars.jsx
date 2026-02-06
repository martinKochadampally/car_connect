import React, { useEffect, useState } from 'react';

function UserCars({ user , setStep}) {
  const [userCars, setUserCars] = useState([]);
  const [editingCar, setEditingCar] = useState(null);

  useEffect(() => { if (user.email) {
    getUserCars();
  }}, [user.email]);

  async function getUserCars() {
  try {
    const url = `http://127.0.0.1:8080/getCarsByEmail/${user.email}`;
    const response = await fetch(url, {method:"GET",});
    const cars = await response.json();
    setUserCars(cars);
  } catch (error) {
    console.error("Error fetching user's cars:", error);
  }
}

  const deleteCar = async (carId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8080/deleteCar/${carId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUserCars((prev) => prev.filter((car) => car.id !== carId));
        alert("Car deleted successfully");
      } else {
        alert("Failed to delete car");
      }
    } catch (err) {
      console.error("Error deleting car:", err);
    }
  };

  return (
    <div className="bg-white min-h-screen py-12 px-4">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
        Your Posts
      </h2>
      <div className="flex justify-center mb-6">
        <button
            onClick={() => setStep("newPost")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >+ New Post</button>
        </div>
      {userCars.length === 0 ? (
        <p className="text-center text-gray-500">You haven’t posted any cars yet.</p>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {userCars.map((car) => (
            <div key={car.id} className="bg-gray-100 shadow rounded-lg overflow-hidden hover:shadow-xl transition">
              <img src={car.image_url} alt={car.make + "-" + car.model} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">{car.year + " " + car.make + " " + car.model}</h3>
              <p className="text-gray-600">{car.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
              <div className="flex justify-between w-full mt-4">
                  <button
                    onClick={() => {
                      setEditingCar(car);
                      setStep("editCar");
                    }}
                    className="!mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCar(car.id)}
                    className="!mt-4 bg-blue-500 hover:bg-orange-600 text-white px-6 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserCars;