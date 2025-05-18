import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { IconNotAllowed } from '../config/images';

const frontendURL = process.env.REACT_APP_FRONTEND_URL;

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        padding: '20px',
    },
    img: {
        width: '100px',
    },
    title: {
        fontSize: '2em',
        color: '#dc3545',
    },
    message: {
        fontSize: '1.2em',
        color: '#6c757d',
        marginBottom: '20px',
    },
    link: {
        color: '#417abc',
        textDecoration: 'none',
    }
};

export default function AccessDenied() {
    const { language } = useContext(LanguageContext);

    return (
        <div style={styles.container}>
            <img src={IconNotAllowed} style={styles.img} alt='access-denied' />
            <h1 style={styles.title}>
                {language === 'FR' ? "Accès Refusé" : "Access Denied"}
            </h1>
            <p style={styles.message}>
                {language === 'FR'
                    ? "Vous n'avez pas l'autorisation d'accéder à cette page."
                    : "You do not have permission to access this page."
                }
            </p>
            <a href={frontendURL} style={styles.link}>
                {language === 'FR' ? "Retour à l'accueil" : "Back to Home"}
            </a>
        </div>
    );
};
