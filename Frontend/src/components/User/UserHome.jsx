import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./userhome.css";

const Userhome = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState({});
  const [bookingDetails, setBookingDetails] = useState({});

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let response = await axios.get('http://localhost:3000/users-getcars', {
        headers: { Authorisation: `Bearer ${token}` }
      });
      
      const availableCars = response.data.filter(car => !car.booked || !car.booked.user);
      setCars(availableCars);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cars. Please try again later.');
      console.error('Error fetching cars:', err);
      if (err.response && err.response.data === 'login') {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookingDetailsChange = (carId, field, value) => {
    setBookingDetails(prev => ({
      ...prev,
      [carId]: {
        ...prev[carId],
        [field]: value
      }
    }));
  };

  async function bookCars(id) {
    if (bookingInProgress[id]) return;
    
    const details = bookingDetails[id] || {};
    if (!details.duration || !details.startDate) {
      alert('Please select both start date and duration');
      return;
    }

    try {
      setBookingInProgress(prev => ({ ...prev, [id]: true }));
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('email');
      
      let result = await axios.post('http://localhost:3000/book-car',
        { 
          id,
          duration: details.duration,
          startDate: details.startDate
        },
        { headers: { Authorisation: `Bearer ${token}` } }
      );
      
      if (result.data.acknowledged) {
        alert('Booking request sent successfully!');
      
        setCars(prevCars => prevCars.map(car => {
          if (car._id === id) {
            return {
              ...car,
              requests: [
                ...car.requests,
                {
                  email: userEmail,
                  duration: details.duration,
                  startDate: details.startDate
                }
              ]
            };
          }
          return car;
        }));
      } else {
        alert('Failed to send booking request. Please try again.');
      }
    } catch (err) {
      console.error('Error booking car:', err);
      alert('Failed to book car. Please try again later.');
      if (err.response && err.response.data === 'login') {
        window.location.href = '/login';
      }
    } finally {
      setBookingInProgress(prev => ({ ...prev, [id]: false }));
    }
  }

  if (loading && !cars.length) {
    return (
      <div className="cards-container">
        <div className="loading">Loading available cars...</div>
      </div>
    );
  }

  return (
    <div className="cards-container">
      <div className="page-header">
        <h1>Available Rental Cars</h1>
        <p>Choose from our selection of premium vehicles for your journey</p>
      </div>

      {cars.length === 0 ? (
        <div className="no-cars">No cars available for rent at the moment. Please check back later.</div>
      ) : (
        <div className="cards-grid">
          {cars.map((car) => {
            const hasRequested = car.requests?.some(req => 
              typeof req === 'object' 
                ? req.email === localStorage.getItem('email')
                : req === localStorage.getItem('email')
            );

            return (
              <div key={car._id} className="card">
                <div className="card-img-container">
                  {car.image ? (
                    <img src={`http://localhost:3000${car.image}`} alt={car.carName} />
                  ) : (
                    <img src="https://via.placeholder.com/280x180?text=No+Image" alt="No car image" />
                  )}
                </div>
                <div className="card-content">
                  <h5>{car.carName}</h5>

                  <div className="car-details">
                    <div className="car-detail">
                      <i className="fas fa-calendar-alt">📅</i> {car.buildYear}
                    </div>
                    <div className="car-detail">
                      <i className="fas fa-car">🚗</i> {car.model}
                    </div>
                    <div className="car-detail">
                      <i className="fas fa-rupee-sign">₹</i> {car.price}/day
                    </div>
                    <div className="car-detail">
                      <i className="fas fa-hashtag">#</i> {car.carNumber}
                    </div>
                  </div>

                  {!hasRequested && (
                    <>
                      <div className="booking-inputs">
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={bookingDetails[car._id]?.startDate || ''}
                          onChange={(e) => handleBookingDetailsChange(car._id, 'startDate', e.target.value)}
                          className="date-input"
                          placeholder="Start Date"
                        />
                        <input
                          type="number"
                          min="1"
                          value={bookingDetails[car._id]?.duration || ''}
                          onChange={(e) => handleBookingDetailsChange(car._id, 'duration', e.target.value)}
                          className="duration-input"
                          placeholder="Days"
                        />
                      </div>

                      {bookingDetails[car._id]?.duration && (
                        <div className="total-cost">
                          Total Cost: ₹{car.price * bookingDetails[car._id].duration}
                        </div>
                      )}
                    </>
                  )}

                  <button
                    className={`book-btn ${hasRequested ? 'requested' : ''}`}
                    onClick={() => bookCars(car._id)}
                    disabled={bookingInProgress[car._id] || hasRequested}
                  >
                    {bookingInProgress[car._id] ? 'Processing...' : 
                      hasRequested ? 'Request Sent' : 'Book Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Userhome;