import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./OwnerRequests.css"; 
const OwnerRequests = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/owner-requests', {
        headers: { Authorisation: `Bearer ${token}` }
      });

      setCars(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch requests. Please try again later.');
      console.error('Error fetching requests:', err);
      if (err.response && err.response.data === 'login') {

        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (carId, request) => {
    try {
      setActionInProgress(prev => ({ ...prev, [carId]: true }));
      const token = localStorage.getItem('token');

      const response = await axios.post('http://localhost:3000/approve-request',
        { 
          carId, 
          userEmail: request.email,
          duration: request.duration,
          startDate: request.startDate
        },
        { 
          headers: {
            'Authorisation': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert('Request approved successfully!');

        setCars(prevCars => prevCars.map(car => {
          if (car._id === carId) {
            return {
              ...car,
              booked: {
                user: request.email,
                duration: request.duration,
                startDate: request.startDate,
                date: new Date()
              },
              requests: car.requests.filter(r => r.email !== request.email)
            };
          }
          return car;
        }));
      } else {
        alert(response.data.message || 'Failed to approve request. Please try again.');
      }
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Failed to approve request. Please try again later.');
    } finally {
      setActionInProgress(prev => ({ ...prev, [carId]: false }));
    }
  };

  if (loading && cars.length === 0) {
    return <div className="loading">Loading your requests...</div>;
  }

  const carsWithRequests = cars.filter(car => car.requests && car.requests.length > 0);

  return (
    <div className="owner-requests-container">
      {error && <div className="error-message">{error}</div>}

      <h2 className="page-header">Car Rental Requests</h2>
      
      {carsWithRequests.length === 0 ? (
        <p className="no-requests">You don't have any car rental requests</p>
      ) : (
        <div className="cars-grid">
          {carsWithRequests.map((car) => (
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
                
                <div className="requests-section">
                  <h4>Requests ({car.requests.length})</h4>
                  {car.requests.map((request, index) => (
                    <div key={index} className="request-item">
                      <div className="request-details">
                        <span className="user-email">{request.email}</span>
                        <div className="booking-info">
                          <p><strong>Start Date:</strong> {new Date(request.startDate).toLocaleDateString()}</p>
                          <p><strong>Duration:</strong> {request.duration} day(s)</p>
                          <p><strong>Total Amount:</strong> Rs {car.price * request.duration}</p>
                        </div>
                      </div>
                      <button
                        className="approve-btn"
                        onClick={() => handleApproveRequest(car._id, request)}
                        disabled={actionInProgress[car._id]}
                      >
                        {actionInProgress[car._id] ? 'Processing...' : 'Approve'}
                      </button>
                    </div>
                  ))}
                </div>
                
                {car.booked && car.booked.user && (
                  <div className="booked-info">
                    <h4>Booked By</h4>
                    <p>{car.booked.user}</p>
                    <p><strong>Start Date:</strong> {new Date(car.booked.startDate).toLocaleDateString()}</p>
                    <p><strong>Duration:</strong> {car.booked.duration} day(s)</p>
                    <p><strong>Total Amount:</strong> Rs {car.price * car.booked.duration}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerRequests;
