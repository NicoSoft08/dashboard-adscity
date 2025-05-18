import React from 'react';
import { Icon404 } from '../config/images';

import '../styles/NotFoundPage.scss';

const frontendURL = process.env.REACT_APP_FRONTEND_URL;

export default function NotFoundPage() {
    const handleNavigate = window.location.href.includes(frontendURL) ? window.location.href : `${frontendURL}/`;
    return (
        <div className='not-found-page'>
            <img src={Icon404} style={{ width: '100px' }} alt="Page non trouvée" className="error-image" />
            <h1>404</h1>
            <h2>Page Non Trouvée</h2>
            <p>La page que vous cherchez n'existe pas ou a été déplacée.</p>
            <button onClick={handleNavigate}>Retour à l'accueil</button>
        </div>
    );
};
