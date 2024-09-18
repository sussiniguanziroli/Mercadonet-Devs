import React, { useEffect, useRef, useState } from 'react'
import contadores from './json/countup.json'
import CountUp from 'react-countup';

const Qsmnet = () => {

    const [isVisible, setIsVisible] = useState(false);
    const counterRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 } // El 50% del elemento debe ser visible
        );

        if (counterRef.current) {
            observer.observe(counterRef.current);
        }

        return () => observer.disconnect();
    }, []);




    return (
        <main className='que-es-mnet'>
            <section className='seccion-que-es'>
                <h1>¿Qué es Mercadonet?</h1>
                <p>Mercadonet es la primera plataforma dedicada a conectar compradores con proveedores, mayoristas y fabricantes de Argentina
                </p>
                <p>Nos especializamos en ofrecer un espacio donde pequeñas y medianas empresas pueden acceder a una amplia base de proveedores confiables, permitiendo a nuestros clientes concentrarse en sus ideas mientras nosotros facilitamos las conexiones estratégicas.
                </p>
                <p>Nuestro principal objetivo es fortalecer el mercado nacional e impulsar el crecimiento empresarial.
                </p>
            </section>
            <section className='seccion-imagen-containers'>
                <img  src="https://i.imgur.com/DWCcK3h.png" alt="containers bandera" />
            </section>
            <section className='seccion-simplificamos-mayorista'>
                <h1>Simplificamos el Comercio Mayorista</h1>
                <p>Nuestro compromiso es brindar a las empresas una herramienta poderosa para encontrar productos de calidad, negociando directamente con los fabricantes y mayoristas más reconocidos del país.
                </p>
                <p>En Mercadonet, trabajamos para simplificar y potenciar el comercio mayorista, uniendo oportunidades de negocio en un solo lugar.
                </p>
            </section>
            <section ref={counterRef} className='seccion-contador'>
                {isVisible && <div className='seccion-contador-render-condicional'>

                    {contadores.map((contador) => <div className='contadores'>
                        <strong>+<CountUp start={0} end={contador.numero} duration={4} /></strong>
                        <p>{contador.clase}</p>
                    </div>)}

                </div>}
            </section>
        </main>
    )
}

export default Qsmnet