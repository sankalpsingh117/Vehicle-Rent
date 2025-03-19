import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./UserRequests.css"; 

const UserRequests = () => {
  const [requests, setRequests] = useState([]);
  const [bookedCars, setBookedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchBookedCars();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/user-requests', {
        headers: { Authorisation: `Bearer ${token}` }
      });
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to fetch your requests');
    }
  };

  const fetchBookedCars = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/user-booked-cars', {
        headers: { Authorisation: `Bearer ${token}` }
      });
      setBookedCars(response.data);
    } catch (err) {
      console.error('Error fetching booked cars:', err);
      setError('Failed to fetch your booked cars');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (carId) => {
    try {
      setActionInProgress(true);
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:3000/cancel-request/${carId}`, {
        headers: { Authorisation: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRequests(prev => prev.filter(car => car._id !== carId));
        alert('Request cancelled successfully');
      } else {
        alert(response.data.message || 'Failed to cancel request');
      }
    } catch (err) {
      console.error('Error cancelling request:', err);
      alert('Failed to cancel request. Please try again later.');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleCancelBooking = async (carId) => {
    try {
      setActionInProgress(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3000/user-cancel-booking/${carId}`, {}, {
        headers: { Authorisation: `Bearer ${token}` }
      });

      if (response.data.success) {
        setBookedCars(prev => prev.filter(car => car._id !== carId));
        alert('Booking cancelled successfully');
      } else {
        alert(response.data.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again later.');
    } finally {
      setActionInProgress(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your requests...</div>;
  }

  return (
    <div className="user-requests-container">
      {error && <div className="error-message">{error}</div>}

      <section className="booked-cars-section">
        <h2>Your Booked Cars</h2>
        {bookedCars.length === 0 ? (
          <p className="no-cars">No booked cars</p>
        ) : (
          <div className="cars-grid">
            {bookedCars.map((car) => (
              <div key={car._id} className="car-card">
                <div className="car-image">
                  {car.image ? (
                    <img src={`http://localhost:3000${car.image}`} alt={car.carName} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="car-details">
                  <h3>{car.carName}</h3>
                  <p><strong>Model:</strong> {car.model}</p>
                  <p><strong>Year:</strong> {car.buildYear}</p>
                  <p><strong>Car Number:</strong> {car.carNumber}</p>
                  <p><strong>Price:</strong> Rs {car.price}/day</p>
                  <div className="booking-info">
                    <p><strong>Start Date:</strong> {new Date(car.booked.startDate).toLocaleDateString()}</p>
                    <p><strong>Duration:</strong> {car.booked.duration} day(s)</p>
                    <p><strong>Total Cost:</strong> Rs {car.price * car.booked.duration}</p>
                  </div>
                  <button
                    onClick={() => handleCancelBooking(car._id)}
                    className="cancel-btn"
                    disabled={actionInProgress}
                  >
                    {actionInProgress ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="pending-requests-section">
        <h2>Your Pending Requests</h2>
        {requests.length === 0 ? (
          <p className="no-cars">No pending requests</p>
        ) : (
          <div className="cars-grid">
            {requests.map((car) => (
              <div key={car._id} className="car-card">
                <div className="car-image">
                  {car.image ? (
                    <img src={`http://localhost:3000${car.image}`} alt={car.carName} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="car-details">
                  <h3>{car.carName}</h3>
                  <p><strong>Model:</strong> {car.model}</p>
                  <p><strong>Year:</strong> {car.buildYear}</p>
                  <p><strong>Car Number:</strong> {car.carNumber}</p>
                  <p><strong>Price:</strong> Rs {car.price}/day</p>
                  <button
                    onClick={() => handleCancelRequest(car._id)}
                    className="cancel-btn"
                    disabled={actionInProgress}
                  >
                    {actionInProgress ? 'Cancelling...' : 'Cancel Request'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserRequests;
