import React, { useState, useEffect } from 'react';

function Reviews({ user, cars }) {
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [localCars, setLocalCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [starRating, setStarRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCar, setFilterCar] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:8080/getCars")
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Cars fetched:", data);
        if (Array.isArray(data) && data.length > 0) {
          setLocalCars(data);
        } else {
          console.warn("No cars data received or empty array");
        }
      })
      .catch(error => {
        console.error("Error fetching cars:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch('http://127.0.0.1:8080/reviews')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Reviews fetched:", data);
        if (localCars && localCars.length > 0) {
          processReviews(data);
        }
      })
      .catch(error => {
        console.error('Error fetching reviews:', error);
        setAllReviews([]);
      });
  }, [localCars]);

  useEffect(() => {
    if (!allReviews || allReviews.length === 0) {
      setFilteredReviews([]);
      return;
    }
    
    let results = [...allReviews];
    
    if (filterCar !== "all") {
      results = results.filter(review => 
        review.carId === filterCar
      );
    }
    
    if (searchTerm) {
      results = results.filter(review => 
        (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.text && review.text.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.author && review.author.name && review.author.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.carName && review.carName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    results.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      return 0;
    });
    
    setFilteredReviews(results);
  }, [allReviews, filterCar, searchTerm, sortBy]);

  const processReviews = (reviews) => {
    if (!Array.isArray(reviews)) {
      console.error("Reviews data is not an array:", reviews);
      return;
    }
    
    const processedReviews = reviews.map(review => {
      const carId = review.carId?.toString() || '';
      const matchingCar = localCars.find(car => car.id?.toString() === carId);
      
      const carName = matchingCar 
        ? `${matchingCar.year} ${matchingCar.make} ${matchingCar.model}` 
        : 'Unknown Car';
      
      return {
        ...review,
        carName: carName,
        rating: review.ratings // Map ratings to rating for frontend
      };
    });
    
    setAllReviews(processedReviews);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!selectedCar || !reviewTitle || !starRating) {
      alert("Please complete all required fields");
      return;
    }
    
    if (!user || !user._id || !user.email) {
      alert("You must be logged in to submit a review");
      return;
    }
    
    try {
      const userIdToSend = typeof user._id === 'object' && user._id.$oid 
        ? user._id.$oid 
        : String(user._id);
      
      const reviewData = {
        userId: userIdToSend,
        userEmail: user.email,
        carId: selectedCar,
        title: reviewTitle,
        text: reviewText,
        ratings: starRating
      };
      
      let response;
      
      if (isEditing) {
        console.log("Submitting edit for review:", editingReviewId);
        response = await fetch(`http://127.0.0.1:8080/reviews/${editingReviewId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userEmail: user.email,
            updates: {
              title: reviewTitle,
              text: reviewText,
              ratings: starRating
            }
          })
        });
      } else {
        console.log("Submitting new review:", reviewData);
        response = await fetch('http://127.0.0.1:8080/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reviewData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }
      
      fetchAllReviews();
      resetForm();
      alert(isEditing ? 'Review updated successfully!' : 'Review submitted successfully!');
      
    } catch (error) {
      console.error(isEditing ? 'Error updating review:' : 'Error submitting review:', error);
      alert(`Failed: ${error.message}`);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!user || !user._id || !user.email) {
      alert("You must be logged in to delete a review");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }
    
    try {
      console.log("Deleting review:", reviewId);
      const response = await fetch(`http://127.0.0.1:8080/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userEmail: user.email
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }
      
      setAllReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
      alert('Review deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(`Failed to delete review: ${error.message}`);
    }
  };

  const handleEditReview = (review) => {
    if (!user || !user._id) {
      alert("You must be logged in to edit a review");
      return;
    }
    
    setIsEditing(true);
    setEditingReviewId(review._id);
    setSelectedCar(review.carId);
    setReviewTitle(review.title);
    setReviewText(review.text || "");
    setStarRating(review.rating);
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const resetForm = () => {
    setSelectedCar("");
    setReviewTitle("");
    setReviewText("");
    setStarRating(0);
    setIsEditing(false);
    setEditingReviewId(null);
  };

  const fetchAllReviews = () => {
    fetch('http://127.0.0.1:8080/reviews')
      .then(response => response.json())
      .then(data => {
        processReviews(data);
      })
      .catch(error => {
        console.error('Error fetching reviews:', error);
      });
  };

  const getCarOptions = () => {
    if (!localCars || localCars.length === 0) {
      return [];
    }
    
    return localCars
      .map(car => ({
        id: car.id?.toString(),
        name: `${car.year || ''} ${car.make || ''} ${car.model || ''}`.trim()
      }))
      .filter(car => car.id && car.name);
  };
  
  const carOptions = getCarOptions();

  const isUserReview = (review) => {
    if (!user || !user._id || !review.author) return false;
    
    const userId = typeof user._id === 'object' && user._id.$oid
      ? user._id.$oid
      : String(user._id);
      
    const reviewAuthorId = typeof review.author._id === 'object' && review.author._id.$oid
      ? review.author._id.$oid
      : String(review.author._id);
      
    return userId === reviewAuthorId;
  };

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '20px', color: '#333'}}>
      <h1 style={{fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#333'}}>
        Car Reviews
      </h1>
      
      {isLoading && (
        <p style={{textAlign: 'center', padding: '10px', color: '#666'}}>Loading cars data...</p>
      )}
      
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px'}}>
        <div style={{marginBottom: '10px', flex: '1', marginRight: '10px'}}>
          <input 
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', color: '#333'}}
          />
        </div>
        
        <div style={{marginBottom: '10px', marginRight: '10px'}}>
          <label style={{marginRight: '10px', fontWeight: '500', color: '#333'}}>Filter by car:</label>
          <select 
            style={{padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: 'white', color: '#333'}}
            value={filterCar}
            onChange={(e) => setFilterCar(e.target.value)}
          >
            <option value="all">All Cars</option>
            {carOptions.map(car => (
              <option key={car.id} value={car.id}>{car.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{marginRight: '10px', fontWeight: '500', color: '#333'}}>Sort by:</label>
          <select 
            style={{padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: 'white', color: '#333'}}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Newest First</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>
      
      {user ? (
        <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px'}}>
          <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#333'}}>
            {isEditing ? 'Edit Review' : 'Write a Review'}
          </h2>
          <form onSubmit={handleSubmitReview}>
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333'}}>Select Car</label>
              <select 
                style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', color: '#333'}}
                value={selectedCar}
                onChange={(e) => setSelectedCar(e.target.value)}
                required
                disabled={isEditing}
              >
                <option value="">-- Select a car --</option>
                {carOptions.map(car => (
                  <option key={car.id} value={car.id}>{car.name}</option>
                ))}
              </select>
            </div>
            
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333'}}>Review Title*</label>
              <input 
                type="text"
                style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', color: '#333'}}
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Summarize your experience"
                required
              />
            </div>
            
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333'}}>Star Rating*</label>
              <div style={{display: 'flex'}}>
                {[1, 2, 3, 4, 5].map(star => (
                  <label key={star} style={{cursor: 'pointer', fontSize: '32px', padding: '0 5px'}}>
                    <input
                      type="radio"
                      name="rating"
                      value={star}
                      style={{display: 'none'}}
                      checked={starRating === star}
                      onChange={() => setStarRating(star)}
                      required
                    />
                    <span style={{
                      color: starRating >= star ? '#ffc107' : '#e4e5e9'
                    }}>★</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333'}}>Review</label>
              <textarea
                style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '100px', color: '#333'}}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this car"
              ></textarea>
            </div>
            
            <div style={{display: 'flex', gap: '10px'}}>
              <button 
                type="submit" 
                style={{backgroundColor: '#ff9800', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}
              >
                {isEditing ? 'Update Review' : 'Submit Review'}
              </button>
              
              {isEditing && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  style={{backgroundColor: '#f5f5f5', color: '#333', padding: '10px 20px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer', fontWeight: 'bold'}}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div style={{backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '30px'}}>
          <p style={{fontWeight: 'bold', marginBottom: '10px'}}>You need to log in to write a review</p>
          <button 
            style={{backgroundColor: '#2196f3', color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}
            onClick={() => alert("Please log in to write a review")}
          >
            Log In
          </button>
        </div>
      )}
      
      <div>
        <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#333'}}>
          User Reviews {filteredReviews.length > 0 ? `(${filteredReviews.length})` : ''}
        </h2>
        
        {filteredReviews.length === 0 ? (
          <p style={{fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '20px'}}>
            {searchTerm || filterCar !== "all" ? "No reviews match your search criteria." : "No reviews yet. Be the first to review!"}
          </p>
        ) : (
          filteredReviews.map((review) => (
            <div key={review._id} style={{backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div>
                  <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '5px', color: '#333'}}>{review.title}</h3>
                  <p style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
                    Car: <span style={{fontWeight: '500'}}>{review.carName}</span> • 
                    By: <span style={{fontWeight: '500'}}>{review.author?.name || 'Anonymous'}</span> •
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                </div>
                
                {isUserReview(review) && (
                  <div style={{display: 'flex', gap: '8px'}}>
                    <button 
                      onClick={() => handleEditReview(review)}
                      style={{backgroundColor: '#2196f3', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '14px'}}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteReview(review._id)}
                      style={{backgroundColor: '#f44336', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '14px'}}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              <div style={{display: 'flex', marginBottom: '15px'}}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star}
                    style={{
                      fontSize: '24px',
                      color: star <= (review.rating || 0) ? "#ffc107" : "#e4e5e9"
                    }}
                  >★</span>
                ))}
              </div>
              
              {review.text && <p style={{color: '#333', lineHeight: '1.5'}}>{review.text}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Reviews;