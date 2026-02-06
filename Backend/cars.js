var express = require("express");
var cors = require("cors");
var app = express();
var bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");

app.use(cors());
app.use(bodyParser.json());

const port = "8080";
const host = "localhost";
const url = "mongodb://127.0.0.1:27017";
const dbName = "secoms3190";
let db;
let client;

async function connectToDatabase() {
  try {
    client = new MongoClient(url);
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`App listening at http://${host}:${port}`);
    });
  })
  .catch(err => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  });

process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection');
  if (client) await client.close();
  process.exit(0);
});

app.post("/register", async (req, res) => {
    try {
        const existingUser = await db
            .collection("Users")
            .findOne({ email: req.body.email });
            
        if (existingUser) {
            return res.status(400).send({ error: "Email already in use" });
        }
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        
        const newUser = {
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            favorites: [],
            reviews: []
        };
        
        const result = await db.collection("Users").insertOne(newUser);
        
        const { password, ...userWithoutPassword } = newUser;
        res.status(201).send(userWithoutPassword);
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const user = await db
            .collection("Users")
            .findOne({ email: req.body.email });
            
        if (!user) {
            return res.status(401).send({ error: "Invalid email or password" });
        }
        
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).send({ error: "Invalid email or password" });
        }
        
        const { password, ...userWithoutPassword } = user;
        res.status(200).send(userWithoutPassword);
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    } 
});

app.get("/users/:id", async (req, res) => {
    try {
        console.log("Getting user with ID:", req.params.id);
        
        const userId = req.params.id;
        
        const user = await db
            .collection("Users")
            .findOne({ _id: userId });
            
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        
        const { password, ...userWithoutPassword } = user;
        res.status(200).send(userWithoutPassword);
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    } 
});

app.post("/reviews", async (req, res) => {
    try {
      console.log("Creating review with complete body:", JSON.stringify(req.body));
      const { userId, userEmail, carId, title, text, ratings } = req.body;
      
      if (!userId || !userEmail || !carId || !title || !ratings) {
        console.log("Missing required fields");
        return res.status(400).send({ error: "Missing required fields" });
      }
      
      const user = await db.collection("Users").findOne({ email: userEmail });
      if (!user) {
        console.log("User not found for email:", userEmail);
        return res.status(404).send({ error: "User not found" });
      }
      
      const review = {
        _id: new Date().getTime().toString(),
        carId,
        title,
        text,
        ratings,
        date: new Date().toISOString().split('T')[0]
      };
      
      const userIdForUpdate = user._id;
      const userResult = await db.collection("Users").updateOne(
        { _id: userIdForUpdate },
        { $push: { reviews: review } }
      );
      
      if (userResult.modifiedCount === 0) {
        console.log("Failed to add review to user");
        return res.status(500).send({ error: "Failed to add review to user" });
      }
      
      console.log("Review added to user:", user.email);
      res.status(201).send(review);
    } catch (error) {
      console.error("Error in review creation:", error);
      res.status(500).send({ error: "An internal server error occurred" });
    }
});

app.get("/reviews", async (req, res) => {
    try {
        console.log("Getting all reviews");
        
        const users = await db
            .collection("Users")
            .find({})
            .toArray();
            
        let allReviews = [];
        
        users.forEach(user => {
            if (user.reviews && user.reviews.length > 0) {
                const reviewsWithAuthor = user.reviews.map(review => ({
                    ...review,
                    author: {
                        _id: user._id,
                        name: user.name,
                        email: user.email
                    }
                }));
                
                allReviews = [...allReviews, ...reviewsWithAuthor];
            }
        });
        
        if (req.query.carId) {
            allReviews = allReviews.filter(review => review.carId === req.query.carId);
        }
        
        res.status(200).send(allReviews);
    } catch (error) {
        console.error("Error getting reviews:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

app.put("/reviews/:reviewId", async (req, res) => {
    try {
        console.log("PUT /reviews/:reviewId called");
        console.log("Review ID:", req.params.reviewId);
        console.log("Request body:", req.body);

        const { userEmail, updates } = req.body;
        const reviewId = req.params.reviewId;

        // Validate request
        if (!userEmail) {
            console.log("Missing userEmail");
            return res.status(400).send({ error: "User email is required" });
        }
        if (!updates || !updates.title || !updates.ratings) {
            console.log("Missing required fields in updates:", updates);
            return res.status(400).send({ error: "Title and ratings are required" });
        }

        // Find user by email
        console.log("Finding user with email:", userEmail);
        const user = await db.collection("Users").findOne({ email: userEmail });
        if (!user) {
            console.log("User not found");
            return res.status(404).send({ error: "User not found" });
        }
        console.log("User found:", user.email);

        // Check if review exists
        const review = user.reviews.find(review => review._id === reviewId);
        if (!review) {
            console.log("Review not found for ID:", reviewId);
            return res.status(404).send({ error: "Review not found" });
        }
        console.log("Review found:", review);

        // Prepare update
        const updatedReview = {
            ...review,
            title: updates.title,
            text: updates.text || review.text || "",
            ratings: updates.ratings,
            date: review.date // Preserve original date
        };

        // Update review in database
        console.log("Updating review in database");
        const result = await db.collection("Users").updateOne(
            { _id: user._id, "reviews._id": reviewId },
            { $set: { "reviews.$": updatedReview } }
        );

        if (result.modifiedCount === 0) {
            console.log("No reviews updated");
            return res.status(500).send({ error: "Failed to update review" });
        }

        console.log("Review updated successfully");
        res.status(200).send({ message: "Review updated successfully" });
    } catch (error) {
        console.error("Error in PUT /reviews/:reviewId:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

app.delete("/reviews/:reviewId", async (req, res) => {
    try {
        console.log("DELETE /reviews/:reviewId called");
        console.log("Review ID:", req.params.reviewId);
        console.log("Request body:", req.body);

        const { userEmail } = req.body;
        const reviewId = req.params.reviewId;

        // Validate request
        if (!userEmail) {
            console.log("Missing userEmail");
            return res.status(400).send({ error: "User email is required" });
        }

        // Find user by email
        console.log("Finding user with email:", userEmail);
        const user = await db.collection("Users").findOne({ email: userEmail });
        if (!user) {
            console.log("User not found");
            return res.status(404).send({ error: "User not found" });
        }
        console.log("User found:", user.email);

        // Check if review exists
        const review = user.reviews.find(review => review._id === reviewId);
        if (!review) {
            console.log("Review not found for ID:", reviewId);
            return res.status(404).send({ error: "Review not found" });
        }
        console.log("Review found:", review);

        // Delete review
        console.log("Deleting review from database");
        const result = await db.collection("Users").updateOne(
            { _id: user._id },
            { $pull: { reviews: { _id: reviewId } } }
        );

        if (result.modifiedCount === 0) {
            console.log("No reviews deleted");
            return res.status(404).send({ error: "Review not found or already deleted" });
        }

        console.log("Review deleted successfully");
        res.status(200).send({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error in DELETE /reviews/:reviewId:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
});

// Matrtin's Backends

app.get("/getCars", async (req, res) => {
    await client.connect();
    console.log("Connected to the MongoDB collection for GET");
    const query = {};
    const results = await db
        .collection("Cars")
        .find(query)
        .limit(100)
        .toArray();
    console.log(results);
    res.status(200);
    res.send(results);
}); 

app.get("/getCar/:id", async (req, res) => {
    await client.connect();
    const carId = parseInt(req.params.id); // Convert URL param to integer

    const result = await db
        .collection("Cars")
        .findOne({ id: carId });

    if (result) {
        res.status(200).send(result);
    } else {
        res.status(404).send({ error: "Car not found" });
    }
});

app.get("/getCarsByEmail/:email", async (req, res) => {
    try {
        await client.connect();
        const email = req.params.email;

        const result = await db.collection("Cars").find({ author: email }).toArray();

        if (result.length > 0) {
            res.status(200).send(result);
        } else {
            res.status(404).send({ error: "No cars found for this author" });
        }
    } catch (error) {
        console.error("Error fetching cars by email:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

app.post("/addCar", async (req, res) => {
    try {
        await client.connect();

        // Step 1: Find the highest car id in the collection
        const latestCar = await db
            .collection("Cars")
            .find({})
            .sort({ id: -1 })  // descending order
            .limit(1)
            .toArray();

        const newId = latestCar.length > 0 ? latestCar[0].id + 1 : 1;

        const newCar = {
            id: newId,
            make: req.body.make,
            model: req.body.model,
            year: req.body.year,
            price: req.body.price,
            color: req.body.color,
            description: req.body.description,
            image_url: req.body.image_url,
            specs: req.body.specs,
            author: req.body.author,
        };

        // Step 3: Insert into MongoDB
        const result = await db.collection("Cars").insertOne(newCar);
        res.status(200).send(result);
    } catch (error) {
        console.error("Could not add the new Car: " + error);
        res.status(500).send("Error adding new Car");
    } finally {
        await client.close();
    }
});


app.put("/updateCar/:id", async (req, res) => {
    try {
        await client.connect(); // Connect to MongoDB
        const carId = parseInt(req.params.id);

        const updateDoc = {
            $set: req.body,
        };
        const result = await db
            .collection("Cars")
            .updateOne({ id: carId }, updateDoc);
        if (result.modifiedCount === 0) {
            return res.status(404).send({ error: "No car found with that ID" });
        }
        res.status(200).send(result); 
    } catch (error) {
        console.error("Error updating car:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    } finally {
        await client.close();
    }
});

app.delete("/deleteCar/:id", async (req, res) => {
    try {
        console.log("Deleting car with ID:", req.params.id);
        const carId = parseInt(req.params.id);

        const result = await db
            .collection("Cars")
            .deleteOne({ id: carId });
        if (result.deletedCount === 0) {
            return res.status(404).send({ error: "No car found with that ID" });
        }
        res.status(200).send(result);
    } catch (error) {
        console.error("Error deleting Cars:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    } finally {
        await client.close();
    }
 });

 app.get("/users/:email/favorites", async (req, res) => {
    await client.connect();

    const userEmail = req.params.email;

    const user = await db
        .collection("Users")
        .findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.status(200).send(user.favorites);
 });

// app.get("/users/:email/favorites", async (req, res) => {
//     try {
//         console.log("PUT /users/:id called");
//         console.log("User ID:", req.params.id);
//         console.log("Request body:", req.body);

//         const { userEmail, name, password } = req.body;
//         const userId = req.params.id;

//         // Validate request
//         if (!userEmail) {
//             console.log("Missing userEmail");
//             return res.status(400).send({ error: "User email is required" });
//         }
//         if (!name && !password) {
//             console.log("No updates provided");
//             return res.status(400).send({ error: "Name or password must be provided" });
//         }

//         // Find user by email
//         console.log("Finding user with email:", userEmail);
//         const user = await db.collection("Users").findOne({ email: userEmail });
//         if (!user) {
//             console.log("User not found");
//             return res.status(404).send({ error: "User not found" });
//         }
//         console.log("User found:", user.email);

//         // Verify user ID matches
//         if (user._id.toString() !== userId) {
//             console.log("User ID mismatch");
//             return res.status(403).send({ error: "Unauthorized to update this user" });
//         }

//         // Prepare update
//         const updateFields = {};
//         if (name) updateFields.name = name;
//         if (password) {
//             const saltRounds = 10;
//             updateFields.password = await bcrypt.hash(password, saltRounds);
//         }

//         // Update user
//         console.log("Updating user in database");
//         const result = await db.collection("Users").updateOne(
//             { _id: new ObjectId(userId) },
//             { $set: updateFields }
//         );

//         if (result.modifiedCount === 0) {
//             console.log("No user updated");
//             return res.status(500).send({ error: "Failed to update user" });
//         }

//         console.log("User updated successfully");
//         const updatedUser = await db.collection("Users").findOne({ _id: new ObjectId(userId) });
//         const { password: _, ...userWithoutPassword } = updatedUser;
//         res.status(200).send({ message: "User updated successfully", user: userWithoutPassword });
//     } catch (error) {
//         console.error("Error in PUT /users/:id:", error);
//         res.status(500).send({ error: "An internal server error occurred" });
//     }
// });

app.put("/putFaves/:email/:carID", async (req, res) => {
    try {
        await client.connect();
        console.log("Connected to MongoDB for PUT favorites");

        const userEmail = req.params.email;
        const carID = parseInt(req.params.carID);

        const user = await db.collection("Users").findOne({ email: userEmail });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const car = await db.collection("Cars").findOne({ id: carID });
        if (!car) {
            return res.status(404).send({ error: "Car not found" });
        }

        const favorites = user.favorites || [];

        if (!favorites.includes(carID)) {
            favorites.push(carID);
        } else {
            return res.status(409).send({ error: "Car already in Favourites" });
        }

        const result = await db.collection("Users").updateOne(
            { email: userEmail },
            { $set: { favorites: favorites } }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).send({ error: "Failed to update favorites" });
        }

        res.status(200).send(favorites);
    } catch (error) {
        console.error("Error updating favorites:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    } finally {
        await client.close();
    }
});

app.put("/removeFave/:email/:carID", async (req, res) => {
    try {
        await client.connect();
        console.log("Connected to MongoDB for REMOVE favorite");

        const userEmail = req.params.email;
        const carID = parseInt(req.params.carID);

        const user = await db.collection("Users").findOne({ email: userEmail });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const result = await db.collection("Users").updateOne(
            { email: userEmail },
            { $pull: { favorites: carID } }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).send({ error: "Failed to remove car from favorites" });
        }

        // Return updated favorites
        const updatedUser = await db.collection("Users").findOne({ email: userEmail });
        res.status(200).send(updatedUser.favorites || []);
    } catch (error) {
        console.error("Error removing favorite:", error);
        res.status(500).send({ error: "An internal server error occurred" });
    } finally {
        await client.close();
    }
});

module.exports = app;