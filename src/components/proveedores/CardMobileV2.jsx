import React from 'react'
import { IoLocationOutline } from 'react-icons/io5';
import Tags from './assets/Tags';

const CardMobileV2 = ({ proveedor }) => {

    const maxLength = 75;
    const truncatedDescription = proveedor.descripcion.length > maxLength
        ? proveedor.descripcion.slice(0, maxLength) + "...[ver más]"
        : proveedor.descripcion;

    const marcasLimitadas = proveedor.marca.slice(0, 5);

    return (

        <div className='proveedor-item hiddenInDesktop'>
            <div className='top-container'>
                <div className='titles-container'>

                    <div className='small-logo-box'>
                        <img className='small-logo' src={proveedor.logo} alt={proveedor.nombre} />
                    </div>
                    <h2>{proveedor.nombre}</h2>
                    <img className="verificado" src='https://i.ibb.co/BsSRKwy/Verificado-HD.jpg' />
                    <p><IoLocationOutline />{proveedor.ubicacionDetalle}</p>

                    <div className='tags-box alineado-auto'>
                        <Tags proveedor={proveedor} />
                    </div>
                </div>
                <button>Ver Detalles</button>
            </div>


            <div className='texts-box'>
                <p className='description'>{proveedor.descripcion}</p>
                {proveedor.marca && proveedor.marca.length > 0 && (
                    <div className='marcas alineado-auto'>
                        <h4>Marcas:</h4>
                        {proveedor.marca.map((marca) => <p>{marca},</p>)}
                    </div>
                )}
                {proveedor.extras && proveedor.extras.length > 0 && (
                    <div className='extras alineado-auto'>
                        <h4>Servicios y Capacidades: </h4>
                        {proveedor.extras.map((extra, index) => (
                            <p key={index} className='tag-extra'>{extra}</p>
                        ))}
                    </div>
                )}

            </div>


        </div>
    )
}

export default CardMobileV2