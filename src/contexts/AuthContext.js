import { createContext, useContext, useEffect, useState } from 'react';
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
        const checkAuth = async () => {
            setLoading(true);
            const user = await fetchMe();
            if (user) {
                setCurrentUser(user.data.uid);
                setUserData(user.data);
                setUserRole(user.data.role || null);
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        };

        checkAuth();
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