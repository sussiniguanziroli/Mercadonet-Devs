import React from 'react'

const NewsBanner = () => {
    return (
        <>
        {/* MOBILE */}
        <aside className='news-banner hiddenInDesktop'>
            <img src="https://placehold.co/900x300" alt="banner" />
        </aside>

        {/* DESKTOP */}
        <aside className='news-banner hiddenInMobile'>
            <img src="https://placehold.co/900x300" alt="banner" />
        </aside>
        </>
    )
}

export default NewsBanner