// src/components/registros/Register.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // useNavigate for redirection
import { auth } from '../../firebase/config'; // Adjust path if needed
import { createUserWithEmailAndPassword } from "firebase/auth";

const Register = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, introduce tu correo electrónico.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, introduce un correo electrónico válido.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Por favor, introduce una contraseña.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuario registrado con éxito:', user);
      console.log('UID del usuario:', user.uid);
      setLoading(false);
      navigate('/'); // Redirect to landing page

    } catch (err) {
      setLoading(false);
      console.error("Error en el registro:", err.code, err.message);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está en uso. Intenta iniciar sesión.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil. Debe tener al menos 6 caracteres.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido.');
      } else {
        setError('Ocurrió un error durante el registro. Inténtalo de nuevo más tarde.');
      }
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
    setPassword(''); // Clear password when going back to email step
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

      {error && <p className="error-message" style={{color: 'red', textAlign: 'center', marginBottom: '10px'}}>{error}</p>}

      <div className="form-wrapper">
        {step === 1 && (
          <form className="form form-email fade-in" onSubmit={handleEmailSubmit}>
            <label htmlFor="email-register">Dirección de correo electrónico</label>
            <input
              type="email"
              id="email-register"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-describedby={error && step === 1 ? "email-error-register" : undefined}
            />
            {error && step === 1 && <span id="email-error-register" style={{ display: 'none' }}>{error}</span>}
            <button type="submit" className="button" disabled={loading}>
              Continuar
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="form form-password fade-in" onSubmit={handleRegisterSubmit}>
            <label htmlFor="password-register">Crea una contraseña</label>
            <input
              type="password"
              id="password-register"
              placeholder="•••••••• (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-describedby={error && step === 2 ? "password-error-register" : undefined}
            />
            {error && step === 2 && <span id="password-error-register" style={{ display: 'none' }}>{error}</span>}
            <div className="button-group">
              <button type="button" className="button back-button" onClick={handleBack} disabled={loading}>
                Volver
              </button>
              <button type="submit" className="button" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>
          </form>
        )}
      </div>
      <NavLink className='volver-btn' to="/"><p className='volver-btn'>Volver al inicio</p></NavLink>
    </div>
  );
};

export default Register;
