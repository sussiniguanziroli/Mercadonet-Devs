// src/pages/LandingRegistroProveedor.jsx
// (Asumiendo ubicación y que existe un archivo de constantes)

import React from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes
import Header from '../../components/header/Header'; // Ajusta ruta si es necesario
import CustomStepper from '../../components/registroProveedor/assetsRegistro/CustomStepper'; // Ajusta ruta

// Constantes (Idealmente importadas)
// import { STEPS_REGISTRO } from '../../components/registroProveedor/constants';
const STEPS_PREVIEW = [
    "Tipo de Card", "Datos Generales", "Datos Personalizados", "Plan", "Resumen"
]; // Usar constante importada si existe

const LandingRegistroProveedor = () => {
    const navigate = useNavigate();

    return (
        <>
            <Header />

            <main className='main-landing'>

                {/* Sección Hero */}
                <section className='landing-registro-proveedor'>
                    <h1>Conviértete en Proveedor con MercadoNet y deja tu huella en Latinoamérica</h1>
                    <h2>Haz que tu empresa sea visible para compradores de toda la región y crece sin límites.</h2>
                    <button onClick={() => navigate('/registrar-mi-empresa/flujo')}>
                        Crear mi perfil de Proveedor
                    </button>
                </section>

                {/* Sección Vista Previa de Pasos */}
                <section className='steps-graph'>
                    <div className="paso-a-paso">
                        <p>El paso a paso para configurar tu Empresa:</p>
                        <div className="progreso">
                            {/* Stepper como vista previa */}
                            <CustomStepper
                                activeStep={-1} // Sin paso activo inicial
                                steps={STEPS_PREVIEW}
                                sx={{ backgroundColor: 'transparent', padding: 0, boxShadow: 'none', color: 'white' }} // Sobrescribe estilos base del stepper para que se integre al fondo oscuro
                            />
                        </div>
                    </div>
                </section>

                {/* Sección de Features */}
                <section className='features-section'>
                    {/* Usar alt descriptivo o alt="" para decorativas */}
                    <div>
                        <img src="https://i.ibb.co/hRCBsYrw/image-6.png" alt="Visibilidad Regional" />
                    </div>
                    <div>
                        <img src="https://i.ibb.co/jkXR3Qbn/image-9.png" alt="Proceso Sencillo" />
                    </div>
                    <div>
                        <img src="https://i.ibb.co/0p5YGp9x/image-8.png" alt="Mercado en Crecimiento" />
                    </div>
                </section>
            </main>
            {/* Aquí podría ir un Footer si no es global */}
        </>
    );
};

export default LandingRegistroProveedor;
