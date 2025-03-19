import React, { useState } from "react";
import "./AddCar.css"; 
import axios from 'axios';

const AddCar = () => {
  const [formData, setFormData] = useState({
    carName: "",
    buildYear: "",
    model: "",
    carNumber: "",
    image: null,
    price: "",
  });

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("carName", formData.carName);
    formDataToSend.append("buildYear", formData.buildYear);
    formDataToSend.append("model", formData.model);
    formDataToSend.append("carNumber", formData.carNumber);
    formDataToSend.append("image", formData.image);
    formDataToSend.append("price", formData.price);
    
    const token = localStorage.getItem('token');
    try {
      let result = await axios.post('http://localhost:3000/owner-addcar', formDataToSend, {
        headers: {
          'content-type': 'multipart/form-data',
          Authorisation: `Bearer ${token}`
        }
      });
      alert(result.data);
      if (result.data === 'inserted') {
      
        setFormData({
          carName: "",
          buildYear: "",
          model: "",
          carNumber: "",
          image: null,
          price: "",
        });
      }
    } catch (error) {
      alert('Failed to add car. Please try again.');
    }
  };

  return (
    <div className="add-car-container">
      <h2 className="form-title">Add New Car</h2>
      <form className="add-car-form" onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label>Car Name</label>
          <input type="text" name="carName" value={formData.carName} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Car Number</label>
          <input 
            type="text" 
            name="carNumber" 
            value={formData.carNumber} 
            onChange={handleChange} 
            placeholder="e.g., KA-01-AB-1234"
            required 
          />
        </div>

        <div className="form-group">
          <label>Build Year</label>
          <input type="number" name="buildYear" value={formData.buildYear} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Model</label>
          <input type="text" name="model" value={formData.model} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Upload Image</label>
          <input type="file" name="image" onChange={handleChange} accept="image/*" required />
        </div>

        <div className="form-group">
          <label>Price (Rs/day)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required />
        </div>

        <button type="submit" className="submit-btn">Add Car</button>
      </form>
    </div>
  );
};

export default AddCar;
