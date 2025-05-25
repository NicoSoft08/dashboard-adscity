import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { fetchMe } from '../routes/user';
import { Loading } from '../customs/index';


// Création du contexte d'authentification
export const AuthContext = createContext();

// Utilisation du contexte pour l'accéder facilement dans les composants
export const useAuth = () => {
    return useContext(AuthContext);
};

// Fournisseur de contexte d'authentification
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            setLoading(true);
            try {
                // 1. Tenter de lire le cookie authToken
                const authToken = Cookies.get('authToken');

                if (authToken) {
                    // 2. Récupérer les données complètes de l'utilisateur via votre API privée
                    const response = await fetchMe();

                    if (response?.success && response.data) {
                        // L'API a validé le token et renvoyé les données.
                        // On peut créer un objet 'user' basique si nécessaire, ou utiliser directement userData.
                        setCurrentUser({ uid: response.data.uid || null, email: response.data.email || null }); // ou seulement setUserData
                        setUserData(response.data);
                        setUserRole(response.data.role);
                    } else {
                        // L'API a rejeté le token (expiré, invalide, etc.)
                        // Nettoyer l'état d'authentification local et le cookie invalide.
                        setCurrentUser(null);
                        setUserData(null);
                        setUserRole(null);
                        Cookies.remove('authToken', { domain: '.adscity.net', path: '/' }); // Supprimer le cookie
                    }
                } else {
                    // Pas de cookie authToken, l'utilisateur n'est pas (ou plus) connecté.
                    setCurrentUser(null);
                    setUserData(null);
                    setUserRole(null);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération de la session:', error);
                setCurrentUser(null);
                setUserRole(null);
                setUserData(null);
                Cookies.remove('authToken', { domain: '.adscity.net', path: '/' });
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    if (loading) {
        return <Loading />
    }


    // Provide values and functions in the context
    const value = {
        currentUser,
        userData,
        loading,
        userRole,
        setUserRole, // Include this if you need to update role elsewhere
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};