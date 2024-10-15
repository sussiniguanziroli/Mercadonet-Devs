import React, { useState } from 'react'
import ProveedoresListContainer from './ProveedoresContainer';
import FiltrosComponent from './FiltrosComponent';
import { NavLink } from 'react-router-dom';
import HeaderCustomProveedores from './HeaderCustomProveedores';
import SearchBox from './SearchBox';

const Proveedores = () => {

    const [isMenuVisible, setIsMenuVisible] = useState(false);

    return (
        <div className='proveedores-desktop'>
            <HeaderCustomProveedores/>
            <main className='main-proveedores'>
                <SearchBox />
                <div className='secondary-proveedores'>
                    <section className='proveedores-filter-section'>
                        <div>
                            {/* Menu desplegable en mobile */}
                            <FiltrosComponent />
                        </div>
                    </section>
                    <div>
                        <ProveedoresListContainer />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Proveedores