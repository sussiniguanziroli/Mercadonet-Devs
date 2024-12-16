import React, { useState } from 'react';

const Login = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1); // Controla el paso del formulario

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setStep(2); // Avanza al paso de la contraseña
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log('Inicio de sesión con:', { email, password });
  };

  const handleBack = () => {
    setStep(1); // Vuelve al paso anterior
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
            <p>O</p>
          </form>
        )}

        

        {/* Paso 2: Contraseña */}
        {step === 2 && (
          <form className="form form-password fade-in" onSubmit={handleLoginSubmit}>
            <label htmlFor="password">Introduce tu contraseña</label>
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
                Iniciar sesión
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Botones de redes sociales */}
      {step === 1 && (
        <div className="social-buttons fade-in">
          <button className="google">Continuar con Google</button>
          <button className="facebook">Continuar con Facebook</button>
          <button className="apple">Continuar con Apple</button>
        </div>
      )}
    </div>
  );
};

export default Login;

