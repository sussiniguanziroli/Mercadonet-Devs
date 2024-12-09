import React from 'react'
import { IoLocationOutline } from 'react-icons/io5'

const CardDesktop = ({ proveedor }) => {
    return (
        <div className='proveedor-item-desktop hiddenInMobile'>
            <div className='carousel-box'>
                <img src={proveedor.logo} alt={proveedor.nombre} />
            </div>
            <div className='info-box'>
                <div className='titles-box'>
                    <img className='small-logo' src={proveedor.logo} alt={proveedor.nombre} />
                    <h3>{proveedor.nombre}</h3>
                    <p><IoLocationOutline />{proveedor.ubicacionDetalle}</p>
                    <img className="verificado" src='https://i.ibb.co/BsSRKwy/Verificado-HD.jpg' />
                </div>
                <div className='tags-box alineado-auto'>

                    <p className='tag-mayorista'>MAYORISTA</p>

                </div>
                <div className='texts-box'>
                    <p className='description'>{proveedor.descripcion}</p>
                    <div className='marcas alineado-auto'>
                        <h4>Marcas:</h4>
                        {proveedor.marca.map((marca) => <p>{marca},</p>)}
                    </div>
                    {proveedor.extras && proveedor.extras.length > 0 && (
                        <div className='extras alineado-auto'>
                            <h4>Servicios y Capacidades</h4>
                            {proveedor.extras.map((extra, index) => (
                                <p key={index} className='tag-extra'>{extra},</p>
                            ))}
                        </div>
                    )}

                </div>
            </div>
            <div className='buttons-box'>
                <button>Sitio Web</button>
                <button>WhatsApp</button>
                <button>Teléfono</button>
                <button>Email</button>
            </div>
        </div>
    )
}

export default CardDesktop

//<div className='title-img'>
//<img src={proveedor.imagen} alt={proveedor.name} />
//<div className='title-location'>
//<h2>{proveedor.nombre}</h2>
//<strong><IoLocationOutline className='icon' />
// {proveedor.ubicacionDetalle}</strong>
//</div>
//</div>
//<p className='descripcion'>{proveedor.description}</p>
