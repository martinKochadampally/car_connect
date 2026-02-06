import React from 'react';

function CarDetail({ user, car, setStep }) {
    const addToFavorites = async () => {
        const url = `http://127.0.0.1:8080/putFaves/${user.email}/${car.id}`;
      
        try {
          const response = await fetch(url, {
            method: "PUT",
          });
      
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to add to Favorites: ${errorText}`);
          }
      
          const result = await response.json();
          console.log("Success:", result);
          alert("Successfully added to Favorites!");
        } catch (error) {
          console.error("Error:", error);
          alert(`Error updating favorites: ${error.message}`);
        }
    }
  if (!car) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">No car selected.</p>
        <button
          onClick={() => setStep("cars")}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back to Cars
        </button>
      </div>
    );
  }

  return (
      <div className="bg-white min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto bg-gray-100 p-6 rounded-lg shadow">
              <img
                  src={car.image_url}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-100 object-cover rounded mb-6"
              />

              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {car.make} {car.model}
              </h2>

              <p className="text-gray-700 mb-1">
                  <strong>Price:</strong> {car.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
              <p className="text-gray-700 mb-1">
                  <strong>Year:</strong> {car.year}
              </p>
              <p className="text-gray-700 mb-1">
                  <strong>Color:</strong> {car.color}
              </p>

              <div className="mt-4 mb-6">
                  <p className="text-gray-600 mb-2">{car.description}</p>

                  <div className="border-t border-gray-300 pt-4">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          Specifications
                      </h3>
                      <p className="text-gray-500">
                          <strong>Engine:</strong> {car.specs.engine}
                      </p>
                      <p className="text-gray-500">
                          <strong>MPG:</strong> {car.specs.mpg}
                      </p>
                      <div className="mt-2">
                          <h4 className="font-medium text-gray-700">
                              <strong>Features:</strong>
                          </h4>
                          <ul className="list-disc list-inside text-gray-700">
                              {car.specs.features.map((feature, idx) => (
                                  <li key={idx}>{feature}</li>
                              ))}
                          </ul>
                      </div>
                  </div>
              </div>

              <div className="flex justify-between w-full mt-4">
                  <button
                      onClick={() => setStep("cars")}
                      className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded"
                  >
                      Back
                  </button>
                  <button
                      onClick={() => addToFavorites()}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                  >
                      ♥ Add to Favorites
                  </button>
              </div>
          </div>
      </div>
  );
}

export default CarDetail;