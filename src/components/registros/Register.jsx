import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';


const Register = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1); // Controla el paso del formulario

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setStep(2); // Avanza al paso de la contraseña
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    console.log('Registro con:', { email, password });
  };

  const handleBack = () => {
    setStep(1); // Vuelve al paso anterior
  };

  return (
    <div className="register-container">
      <h2 className="title">Crear una cuenta</h2>
      <p className="text">
        ¿Ya tienes una cuenta?{' '}
        <span className="link" onClick={toggleForm}>
          Inicia sesión
        </span>
      </p>

      <div className="form-wrapper">
        {/* Paso 1: Email */}
        {step === 1 && (
          <form className="form form-email fade-in" onSubmit={handleEmailSubmit}>
            <label htmlFor="email">Dirección de correo electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="button">
              Continuar
            </button>
          </form>
        )}

        {/* Paso 2: Contraseña */}
        {step === 2 && (
          <form className="form form-password fade-in" onSubmit={handleRegisterSubmit}>
            <label htmlFor="password">Crea una contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="button-group">
              <button type="button" className="button back-button" onClick={handleBack}>
                Volver
              </button>
              <button type="submit" className="button">
                Registrarse
              </button>
            </div>
          </form>
        )}
      </div>
      <NavLink className='volver-btn'  to="/"><p className='volver-btn'>Volver al inicio</p></NavLink>
    </div>
  );
};

export default Register;
