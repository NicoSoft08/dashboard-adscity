import React from 'react';
import './CardList.scss';


export default function CardList({ children }) {
    return (
        <div className='card-list'>
            {children}
        </div>
    );
};