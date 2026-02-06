import React, { useEffect, useState } from 'react';

function Cars({ setStep, setSelectedCar }) {
  const [cars, setCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
      getCars();
  }, []);
  function getCars() {
      fetch("http://127.0.0.1:8080/getCars")
          .then((response) => response.json())
          .then((data) => {
              setCars(data);
          })
          .catch((error) => {
              console.error("Error fetching Cars:", error);
          });
  }

    // Filter cars based on search term
    const filteredCars = cars.filter((car) => {
      const term = searchTerm.toLowerCase();
      return (
        car.make.toLowerCase().includes(term) ||
        car.model.toLowerCase().includes(term) ||
        car.year.toString().includes(term)
      );
    });
  
    return (
      <div className="bg-white min-h-screen py-12 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Browse Cars
        </h2>
  
        <div className="max-w-md mx-auto mb-10">
          <input
            type="text"
            placeholder="Search by make, model, or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
          />
        </div>
  
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {filteredCars.map((car, index) => (
            <div
              key={index}
              className="bg-gray-100 shadow rounded-lg overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={car.image_url}
                alt={`${car.make} ${car.model}`}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {car.year} {car.make} {car.model}
                </h3>
                <p className="text-gray-600">
                  {car.price.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </p>
                <button
                  onClick={() => {
                    setSelectedCar(car);
                    setStep("carDetail");
                  }}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
  
        {filteredCars.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No cars found.</p>
        )}
      </div>
    );
}

export default Cars;