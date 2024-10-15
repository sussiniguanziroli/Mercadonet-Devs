import React, { useState } from 'react'
import ProveedoresListContainer from './ProveedoresContainer';
import FiltrosComponent from './FiltrosComponent';
import HeaderCustomProveedores from './HeaderCustomProveedores';
import SearchBox from './SearchBox';
import NewsBanner from './NewsBanner';

const Proveedores = () => {

    const [isMenuHidden, setIsMenuHidden] = useState(true);

    const openFilters = () => {
        setIsMenuHidden(false);
    }

    console.log(isMenuHidden);

    return (
        <div className='proveedores-desktop'>
            <HeaderCustomProveedores />
            <main className='main-proveedores'>
                <SearchBox />
                <div className='secondary-proveedores'>
                    
                    <section className='proveedores-filter-section'>
                        <NewsBanner/>

                        <div>
                            <button className='filterBtn hiddenInDesktop' onClick={openFilters}>Filtrar</button>
                            {/* Menu desplegable en mobile */}
                            <FiltrosComponent setIsMenuHidden={setIsMenuHidden} isMenuHidden={isMenuHidden} />
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