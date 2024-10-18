import React, { useState } from 'react'
import { db } from '../../firebase/config'; // Asegúrate de tener bien configurada tu Firebase
import { addDoc, collection } from 'firebase/firestore';

const AgregarProveedor = () => {
    // Estados para formulario de proveedores
    const [proveedor, setProveedor] = useState({
        contacto: {
            sitio_web: '',
            telefono: '',
            whatsapp: '',
            email: ''
        },
        descripcion: '',
        imagen: '',
        nombre: '',
        tags: [],
        marca: [],
        tipo: [],
        ubicacion: '',
        ubicacionDetalle: ''
    });

    const [tag, setTag] = useState('');
    const [tipo, setTipo] = useState('');
    const [marca, setMarca] = useState('');

    // Función para agregar un proveedor a Firebase
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const docRef = await addDoc(collection(db, 'proveedores'), proveedor);
            console.log("Proveedor añadido con ID: ", docRef.id);
            // Limpiar el formulario
            setProveedor({
                contacto: {
                    sitio_web: '',
                    telefono: '',
                    whatsapp: '',
                    email: ''
                },
                descripcion: '',
                imagen: '',
                nombre: '',
                tags: [],
                marca: [],
                tipo: [],
                ubicacion: '',
                ubicacionDetalle: ''
            });
        } catch (error) {
            console.error("Error añadiendo el proveedor: ", error);
        }
    };

    // Función para agregar tags y tipos
    const agregarTag = () => {
        setProveedor({ ...proveedor, tags: [...proveedor.tags, tag] });
        setTag(''); // Limpiar el campo de tag
    };

    const agregarTipo = () => {
        setProveedor({ ...proveedor, tipo: [...proveedor.tipo, tipo] });
        setTipo(''); // Limpiar el campo de tipo
    };

    const agregarMarca = () => {
        setProveedor({ ...proveedor, marcas: [...proveedor.marca, marca] });
        setMarca(''); // Limpiar el campo de marca
    };

  return (
    <div className="admin-panel">
            <h2>Panel de Administración - Cargar Proveedor</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre del Proveedor</label>
                    <input
                        type="text"
                        value={proveedor.nombre}
                        onChange={(e) => setProveedor({ ...proveedor,  nombre: e.target.value } )}
                        placeholder="Nombre"
                    />
                </div>
                <div>
                    <label>Sitio Web</label>
                    <input
                        type="text"
                        value={proveedor.contacto.sitio_web}
                        onChange={(e) => setProveedor({ ...proveedor, contacto: { ...proveedor.contacto, sitio_web: e.target.value } })}
                        placeholder="https://"
                    />
                </div>
                <div>
                    <label>Teléfono</label>
                    <input
                        type="text"
                        value={proveedor.contacto.telefono}
                        onChange={(e) => setProveedor({ ...proveedor, contacto: { ...proveedor.contacto, telefono: e.target.value } })}
                    />
                </div>
                <div>
                    <label>Email</label>
                    <input
                        type="text"
                        value={proveedor.contacto.email}
                        onChange={(e) => setProveedor({ ...proveedor, contacto: { ...proveedor.contacto, email: e.target.value } })}
                    />
                </div>
                <div>
                    <label>WhatsApp</label>
                    <input
                        type="text"
                        value={proveedor.contacto.whatsapp}
                        onChange={(e) => setProveedor({ ...proveedor, contacto: { ...proveedor.contacto, whatsapp: e.target.value } })}
                    />
                </div>
                <div>
                    <label>Descripción</label>
                    <textarea
                        value={proveedor.descripcion}
                        onChange={(e) => setProveedor({ ...proveedor, descripcion: e.target.value } )}
                        placeholder="Descripción del proveedor"
                    />
                </div>
                <div>
                    <label>Imagen (URL)</label>
                    <input
                        type="text"
                        value={proveedor.imagen}
                        onChange={(e) => setProveedor({ ...proveedor, imagen: e.target.value } )}
                        placeholder="https://"
                    />
                </div>
                <div>
                    <label>Ubicación</label>
                    <input
                        type="text"
                        value={proveedor.ubicacion}
                        onChange={(e) => setProveedor({ ...proveedor, ubicacion: e.target.value })}
                        placeholder="Ubicación"
                    />
                </div>
                <div>
                    <label>Ubicación Detallada</label>
                    <input
                        type="text"
                        value={proveedor.ubicacionDetalle}
                        onChange={(e) => setProveedor({ ...proveedor, ubicacionDetalle: e.target.value })}
                        placeholder="Corrientes Capital, Corrientes"
                    />
                </div>

                {/* Campos dinámicos para tags */}
                <div>
                    <label>Tags</label>
                    <input
                        type="text"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="Añadir tag"
                    />
                    <button type="button" onClick={agregarTag}>Agregar Tag</button>
                    <div>{proveedor.tags.map((t, index) => <span key={index}>{t}, </span>)}</div>
                </div>

                {/* Campos dinámicos para tipos */}
                <div>
                    <label>Tipos</label>
                    <input
                        type="text"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        placeholder="Añadir tipo"
                    />
                    <button type="button" onClick={agregarTipo}>Agregar Tipo</button>
                    <div>{proveedor.tipo.map((t, index) => <span key={index}>{t}, </span>)}</div>
                </div>

                <div>
                    <label>Marcas</label>
                    <input
                        type="text"
                        value={marca}
                        onChange={(e) => setMarca(e.target.value)}
                        placeholder="Añadir marca"
                    />
                    <button type="button" onClick={agregarMarca}>Agregar Marca</button>
                    <div>{proveedor.marca.map((m, index) => <span key={index}>{m}, </span>)}</div>
                </div>

                <button type="submit">Cargar Proveedor</button>
            </form>
        </div>
  )
}

export default AgregarProveedor