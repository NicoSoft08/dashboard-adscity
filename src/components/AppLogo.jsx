import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AppLogo.css';

const frontendUrl = process.env.REACT_APP_FRONTEND_URL;

export default function AppLogo({ source }) {
    return (
        <Link
            to={`${frontendUrl}`}
            className='app-logo'
            title='AdsCity'
        >
            <div className="logo">
                <img src={source} alt="adscity" />
            </div>
        </Link>
    );
};
