import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, Navigate } from 'react-router-dom';
import Login from "./components/Login"; 
import Signup from "./components/Signup";
import UserHome from './components/User/UserHome';
import Navbar from './components/Navbar';
import UserAccount from './components/User/UserAccount';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import OwnerAccount from "./components/Owner/OwnerAccount";
import OwnerRequests from './components/Owner/Ownerrequests';
import UserRequests from './components/User/UserRequests';
import OwnerHome from './components/Owner/OwnerHome';
import AddCar from './components/Owner/AddCar';
import Logout from './Logout';
import './App.css';

function App() {
  const location = useLocation();
  const noNavbarPages = ["/login","/signup"];
  const [role, setRole] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
   
    const token = localStorage.getItem('token');
    if (token) {
      const userRole = localStorage.getItem('role');
      setRole(userRole);
      setIsAuthenticated(true);
    }
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <>
      {!noNavbarPages.includes(location.pathname) && <Navbar role={role} />}
      <Routes>
        <Route path="/login" element={<Login setRole={setRole} setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/home" element={
          <ProtectedRoute>
            {role === 'users' ? <UserHome /> : <OwnerHome />}
          </ProtectedRoute>
        } />
        
        <Route path="/requests" element={
          <ProtectedRoute>
            {role === 'users' ? <UserRequests /> : <OwnerRequests />}
          </ProtectedRoute>
        } />
        
        <Route path="/account" element={
          <ProtectedRoute>
            {role === 'users' ? <UserAccount /> : <OwnerAccount />}
          </ProtectedRoute>
        } /> 
        
        <Route path="/addcar" element={
          <ProtectedRoute>
            <AddCar />
          </ProtectedRoute>
        } />
        
        <Route path="/logout" element={<Logout setIsAuthenticated={setIsAuthenticated} />} />
    
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
