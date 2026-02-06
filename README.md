# Car Connect

## Overview
Car Connect is a web application developed as a final project for COM S 3190 - Construction of User Interfaces at Iowa State University. The project is created by Martin Kochadampally and Matthew Gathman, two Computer Science students. This website aims to help users explore car models, view detailed specifications, favorite cars, and leave reviews, providing a user-friendly platform for car enthusiasts and buyers.

## Features
- **User Authentication**: Login and Signup functionality for personalized user experiences.
- **Car Listings**: Browse cars with filters for make, year, or price.
- **Favorites System**: Save favorite cars to user profiles with full CRUD operations.
- **Reviews**: Rate and comment on car listings with full CRUD operations.

## Tech Stack
- **Frontend**: React, Bootstrap
- **Backend**: Node.js, Express, MongoDB
- **Design Tools**: Figma (wireframes), Excalidraw
- **Other Tools**: GitLab, Postman (API testing), REST API

## Project Setup
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd JK_5_Final
   ```
2. **Backend Setup**:
   - Navigate to the `Backend` folder.
   - Install dependencies:
     ```bash
     npm install
     ```
   - Set up MongoDB database and configure connection in the backend.
   - Start the backend server:
     ```bash
     nodemon cars.js
     ```
3. **Frontend Setup**:
   - Navigate to the `Frontend/JK_5_Final` folder.
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the frontend development server:
     ```bash
     npm run dev
     ```
4. **Access the App**:
   - Open your browser and go to `http://localhost:8080` (or the port specified by Vite).

## File Structure
- `Frontend/JK_5_Final`
  - `src/`
    - `assets/` - 
    - `components/` - Page components (Navbar, CarCard, ReviewForm)
- `Backend/` - Backend logic (Node.js, Express, MySQL)
- `Documents/` - Wireframes, SAD, demo video

## Data Example
Sample car data structure:
```json
{
  "id": 1,
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "price": 27500,
  "color": "Midnight Black",
  "image_url": "https://example-image.jpg",
  "specs": {
    "engine": "2.5L 4-cylinder",
    "mpg": "32 city / 41 highway",
    "features": [
      "Apple CarPlay",
      "Heated Seats"
    ]
  },
  "description": "The 2023 Toyota Camry blends style and efficiency with a sleek Midnight Black finish, a fuel-saving 2.5L engine, and tech like Apple CarPlay and heated seats—perfect for daily drives and long trips.",
  "author": "example@gmail.com"
}
```

## Contributing
This project is a student assignment, but feedback is welcome! Please reach out to us at:
- Martin Kochadampally: martink5@iastate.edu
- Matthew Gathman: mattgath@iastate.edu

## Acknowledgments
- COM S 3190 instructors and TAs for guidance.
- Iowa State University Computer Science Department for the learning opportunity.
