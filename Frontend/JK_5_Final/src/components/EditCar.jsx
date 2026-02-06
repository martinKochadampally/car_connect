import React, { useState, useEffect } from "react";

function EditCar({ user, setStep, car }) {
  const [formData, setFormData] = useState({
    id: "",
    make: "",
    model: "",
    year: "",
    price: "",
    color: "",
    image_url: "",
    description: "",
    specs: {
      engine: "",
      mpg: "",
      features: [""],
    },
    author: user.email,
  });

  useEffect(() => {
    if (car) {
      setFormData({
        ...car,
        specs: {
          ...car.specs,
          features: car.specs?.features || [""],
        },
      });
    }
  }, [car]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("specs.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        specs: { ...prev.specs, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.specs.features];
    newFeatures[index] = value;
    setFormData((prev) => ({
      ...prev,
      specs: { ...prev.specs, features: newFeatures },
    }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      specs: { ...prev.specs, features: [...prev.specs.features, ""] },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedCar = {
      ...formData,
      year: parseInt(formData.year),
      price: parseFloat(formData.price),
    };

    try {
      const response = await fetch(`http://127.0.0.1:8080/updateCar/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCar),
      });

      if (!response.ok) throw new Error("Failed to update car");

      alert("Car successfully updated!");
      setStep("browse");
    } catch (error) {
      console.error("Error updating car:", error);
      alert("Failed to update car.");
    }
  };

  if (!user.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-500 text-lg">You must be logged in to edit cars.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 text-gray-900">
      <form onSubmit={handleSubmit} className="max-w-lg w-full space-y-6 bg-gray-100 p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Edit Car</h2>

        {["make", "model", "year", "price", "color", "image_url", "description"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 capitalize">{field.replace("_", " ")}</label>
            <input
              type={["year", "price"].includes(field) ? "number" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring focus:ring-orange-300"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700">Engine</label>
          <input
            type="text"
            name="specs.engine"
            value={formData.specs.engine}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">MPG</label>
          <input
            type="text"
            name="specs.mpg"
            value={formData.specs.mpg}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Features</label>
          {formData.specs.features.map((feature, index) => (
            <input
              key={index}
              type="text"
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 mb-2"
              placeholder={`Feature #${index + 1}`}
              required
            />
          ))}
          <button type="button" onClick={addFeature} className="text-sm text-blue-600 hover:underline">
            + Add Feature
          </button>
        </div>

        <div className="flex justify-between">
        <button
            type="button"
            onClick={() => setStep("posts")}
            className="w-[48%] bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
        >
            Cancel
        </button>

        <button
            type="submit"
            className="w-[48%] bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
        >
            Save Changes
        </button>
        </div>
      </form>
    </div>
  );
}

export default EditCar;