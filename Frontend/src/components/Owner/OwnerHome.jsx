import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Link } from 'react-router-dom';
import "./OwnerHome.css"; 

const OwnerHome = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState({});

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let response = await axios.get('http://localhost:3000/owner-getcars', { 
        headers: { Authorisation: `Bearer ${token}` } 
      });
      setCars(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cars. Please try again later.');
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCar = async (carId) => {
    try {
      setActionInProgress(prev => ({ ...prev, [carId]: true }));
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:3000/owner-removecar/${carId}`, {
        headers: { Authorisation: `Bearer ${token}` }
      });
      
      if (response.data.success) {
     
        setCars(prevCars => prevCars.filter(car => car._id !== carId));
        alert('Car removed successfully!');
      } else {
        alert(response.data.message || 'Failed to remove car. Please try again.');
      }
    } catch (err) {
      console.error('Error removing car:', err);
      alert('Failed to remove car. Please try again later.');
    } finally {
      setActionInProgress(prev => ({ ...prev, [carId]: false }));
    }
  };

  const handleCancelBooking = async (carId) => {
    try {
      setActionInProgress(prev => ({ ...prev, [carId]: true }));
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3000/user-cancel-booking/${carId}`, {}, {
        headers: { Authorisation: `Bearer ${token}` }
      });
      
      if (response.data.success) {
     
        setCars(prevCars => prevCars.map(car => {
          if (car._id === carId) {
            return { ...car, booked: null };
          }
          return car;
        }));
        alert('Booking cancelled successfully!');
      } else {
        alert(response.data.message || 'Failed to cancel booking. Please try again.');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again later.');
    } finally {
      setActionInProgress(prev => ({ ...prev, [carId]: false }));
    }
  };

  if (loading && !cars.length) {
    return (
      <div className="cards-container">
        <div className="loading">Loading your cars...</div>
      </div>
    );
  }

  return (
    <div className="cards-container">
      <div className="page-header">
        <h1>Your Car Inventory</h1>
        <p>Manage your fleet of rental vehicles</p>
        <Link to="/addcar" className="add-car-btn">Add New Car</Link>
      </div>

      {cars.length === 0 ? (
        <div className="no-cars">You haven't added any cars yet. Add your first car to get started!</div>
      ) : (
        <div className="cards-grid">
          {cars.map((car) => (
            <div key={car._id} className="card">
              <div className="card-img-container">
                <img 
                  src={car.image ? `http://localhost:3000${car.image}` : "https://via.placeholder.com/280x180?text=Car+Image"} 
                  alt={car.carName} 
                  className="card-image" 
                />
              </div>
              <div className="card-content">
                <h5 className="card-title">{car.carName}</h5>
                
                <div className="car-details">
                  <div className="car-detail">
                    <i className="fas fa-calendar-alt">📅</i> {car.buildYear}
                  </div>
                  <div className="car-detail">
                    <i className="fas fa-car">🚘</i> {car.model}
                  </div>
                  <div className="car-detail">
                    <i className="fas fa-rupee-sign">₹</i> {car.price}/day
                  </div>
                  <div className="car-detail">
                    <i className="fas fa-hashtag">#</i> {car.carNumber}
                  </div>
                </div>

                {car.booked && (
                  <div className="booking-info">
                    <p><strong>Booked by:</strong> {car.booked.user}</p>
                    <p><strong>Start Date:</strong> {new Date(car.booked.startDate).toLocaleDateString()}</p>
                    <p><strong>Duration:</strong> {car.booked.duration} day(s)</p>
                    <p><strong>Total Amount:</strong> ₹{car.price * car.booked.duration}</p>
                    <button 
                      onClick={() => handleCancelBooking(car._id)}
                      className="cancel-booking-btn"
                      disabled={actionInProgress[car._id]}
                    >
                      {actionInProgress[car._id] ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={() => handleRemoveCar(car._id)} 
                  className="book-btn"
                  disabled={actionInProgress[car._id]}
                >
                  {actionInProgress[car._id] ? 'Processing...' : 'Remove Car'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerHome;
