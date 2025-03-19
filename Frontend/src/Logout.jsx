import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Logout = ({ setIsAuthenticated }) => {
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    }
  }, [setIsAuthenticated]);

  return <Navigate to="/login" replace />;
};

export default Logout;