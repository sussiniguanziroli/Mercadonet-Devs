import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../../firebase/config'; // Asegúrate de tener bien configurada tu Firebase
import { addDoc, collection } from 'firebase/firestore';
import AgregarProveedor from './AgregarProveedor';



const AdminPanel = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    

    // Función para iniciar sesión
    const handleLogin = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setLoggedIn(true);
            setLoginError('');
        } catch (error) {
            setLoginError('Error en el login: ' + error.message);
        }
    };

    

    if (!loggedIn) {
        return (
            <div className="login-container">
                <h2>Iniciar sesión de administrador</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                    {loginError && <p>{loginError}</p>}
                </form>
            </div>
        );
    }

    return (
        <main>
            <AgregarProveedor />
        </main>
    );
};

export default AdminPanel;
