// src/components/registros/Login.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaGoogle } from "react-icons/fa";
import { auth } from '../../firebase/config'; // Adjust path if needed
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const Login = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Por favor, introduce tu contraseña.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuario inició sesión con éxito:', user.uid);
      setLoading(false);
      if (navigate) {
        navigate('/'); // Redirect to landing page
      }
    } catch (err) {
      setLoading(false);
      console.error("Error en el inicio de sesión:", err.code, err.message);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Correo electrónico o contraseña incorrectos.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido.');
      } else {
        setError('Ocurrió un error durante el inicio de sesión. Inténtalo de nuevo.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Usuario inició sesión con Google:', user.uid);
      setLoading(false);
      if (navigate) {
        navigate('/'); // Redirect to landing page
      }
    } catch (err) {
      setLoading(false);
      console.error("Error en el inicio de sesión con Google:", err.code, err.message);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('El proceso de inicio de sesión con Google fue cancelado.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('Ya existe una cuenta con este correo electrónico usando un método de inicio de sesión diferente.');
      }
      else {
        setError('Ocurrió un error al iniciar sesión con Google. Inténtalo de nuevo.');
      }
    }
  };


  const handleBack = () => {
    setStep(1);
    setError('');
    setPassword('');
  };

  return (
    <div className="container">
      <h2 className="title">Inicio de sesión</h2>
      <p className="text">
        ¿Eres un nuevo usuario?{' '}
        <span className="link" onClick={toggleForm}>
          Crear una cuenta
        </span>
      </p>

      {error && <p className="error-message" style={{color: 'red', textAlign: 'center', marginBottom: '10px'}}>{error}</p>}

      <div className="form-wrapper">
        {step === 1 && (
          <form className="form form-email fade-in" onSubmit={handleEmailSubmit}>
            <label htmlFor="email-login">Dirección de correo electrónico</label>
            <input
              type="email"
              id="email-login"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-describedby={error && step === 1 ? "email-error-login" : undefined}
            />
            {error && step === 1 && <span id="email-error-login" style={{ display: 'none' }}>{error}</span>}
            <button type="submit" className="button" disabled={loading}>
              Continuar
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="form form-password fade-in" onSubmit={handleLoginSubmit}>
            <label htmlFor="password-login">Introduce tu contraseña</label>
            <input
              type="password"
              id="password-login"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-describedby={error && step === 2 ? "password-error-login" : undefined}
            />
            {error && step === 2 && <span id="password-error-login" style={{ display: 'none' }}>{error}</span>}
            <div className="button-group">
              <button type="button" className="button back-button" onClick={handleBack} disabled={loading}>
                Volver
              </button>
              <button type="submit" className="button" disabled={loading}>
                {loading ? 'Iniciando...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>
        )}
      </div>

      {step === 1 && (
        <div className="social-buttons fade-in" style={{marginTop: '10px'}}>
          <p style={{textAlign: 'center', marginBottom: '10px'}}>O</p>
          <button className="google" onClick={handleGoogleSignIn} disabled={loading} style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
            <FaGoogle /> {loading ? 'Conectando...' : 'Continuar con Google'}
          </button>
          {/* Facebook and Apple buttons can be implemented similarly later */}
          {/* <button className="facebook" disabled={loading}>Continuar con Facebook</button> */}
          {/* <button className="apple" disabled={loading}>Continuar con Apple</button> */}
        </div>
      )}

      <NavLink className='volver-btn' to="/"><p className='volver-btn'>Volver al inicio</p></NavLink>
    </div>
  );
};

export default Login;
