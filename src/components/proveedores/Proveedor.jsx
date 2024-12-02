import React, { useEffect, useState } from 'react'
import CardDesktop from './CardDesktop';
import CardMobile from './CardMobile';
import CardMobileV2 from './CardMobileV2';
import CardDesktopV2 from './CardDesktopV2';


const Proveedor = ({ proveedor }) => {

    return (
        <>
            <CardMobile proveedor={proveedor}/>
            <CardDesktop proveedor={proveedor}/>
            <CardMobileV2 />
            <CardDesktopV2 />
        </>
    )
}

export default Proveedor