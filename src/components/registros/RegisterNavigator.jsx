import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const RegisterNavigator = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin((prevState) => !prevState);
  };

  return (
    <div className="navigator-container">
      <div className='forms-container'>
      {isLogin ? (
        <Login toggleForm={toggleForm} />
      ) : (
        <Register toggleForm={toggleForm} />
      )}
      </div>
      <div className='logo-container'>
            <img src="https://i.ibb.co/Z24ZXrp/Logo-Mercadonet.png" alt="Logo White" />
        </div>
    </div>
  );
};

export default RegisterNavigator;
