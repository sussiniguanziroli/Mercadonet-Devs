// src/components/registros/Login.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FaGoogle } from "react-icons/fa";
import { auth, db } from '../../firebase/config'; // Import db
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; // Firestore imports

const Login = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get location object

  const from = location.state?.from?.pathname || "/"; // Path to redirect to after login

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
      // Firestore profile check/creation is usually done at registration or first Google sign-in.
      // If you want to ensure profile exists on every email login, you can add a getDoc check here too.
      // For now, assuming profile is created at registration.
      setLoading(false);
      if (navigate) {
        navigate(from, { replace: true }); // Navigate to 'from' or default to "/"
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

      // Check if user profile already exists in Firestore, create if not
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        console.log('Creando nuevo perfil de usuario en Firestore para usuario de Google.');
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0], // Use part of email if displayName is null
          photoURL: user.photoURL || '', // Google provides this
          createdAt: serverTimestamp(),
          isProveedor: false,             // Default value
          authProvider: "google"
        });
        console.log('Perfil de usuario de Google creado en Firestore');
      } else {
        console.log('Perfil de usuario de Google ya existe en Firestore.');
        // Optionally update lastLogin or other fields if needed
      }

      setLoading(false);
      if (navigate) {
        navigate(from, { replace: true }); // Navigate to 'from' or default to "/"
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
        </div>
      )}

      <NavLink className='volver-btn' to="/"><p className='volver-btn'>Volver al inicio</p></NavLink>
    </div>
  );
};

export default Login;
