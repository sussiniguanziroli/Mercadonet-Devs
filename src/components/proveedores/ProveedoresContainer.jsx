import React, { useEffect, useState } from 'react'
import ProveedoresList from './ProveedoresList'
import {db} from '../../firebase/config'
import { collection, query, getDocs } from "firebase/firestore";

const ProveedoresListContainer = () => {

    const [proveedores, setProveedores] = useState([]);

    // Obtener proveedores desde Firebase
    useEffect(() => {
        const obtenerProveedores = async () => {
            try {
                const q = query(collection(db, 'proveedores'));
                const snapshot = await getDocs(q);
                const proveedoresFirebase = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProveedores(proveedoresFirebase);
            } catch (error) {
                console.error("Error obteniendo los proveedores: ", error);
            }
        };

        obtenerProveedores();
    }, []);

    console.log(proveedores);

  return (
    <main className='proveedores-list-container'>
        <ProveedoresList/>
    </main>
  )
}

export default ProveedoresListContainer