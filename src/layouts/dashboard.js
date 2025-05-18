import React, { useContext, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../firebaseConfig';
import { fetchNotifications } from '../routes/user';
import { Loading, Toast } from '../customs';
import { userSidebarData } from '../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import '../styles/dashboard.scss';


const authUrl = process.env.REACT_APP_AUTH_URL;

export default function DashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, userData } = useContext(AuthContext);
    const { language } = useContext(LanguageContext);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        let isMounted = true;

        // Check authentication
        if (!currentUser) {
            console.error("❌ Utilisateur non connecté.");
            window.location.href = `${authUrl}/signin`;
            return;
        }

        // Log analytics with minimal data
        try {
            logEvent(analytics, 'page_view', {
                page_path: '/user/dashboard',
                user_type: 'authenticated' // Avoid sending actual UIDs
            });
        } catch (error) {
            console.error("❌ Erreur d'analytics:", error);
        }

        // Validate user ID format (assuming Firebase UID format)
        const userID = currentUser.uid;
        if (!userID || typeof userID !== 'string' || userID.length < 10) {
            console.error("❌ ID utilisateur invalide");
            return;
        }

        const getNotifications = async () => {
            try {
                const idToken = await currentUser.getIdToken(true);

                const result = await fetchNotifications(userID, idToken);

                if (isMounted) {
                    if (result && result.success) {
                        setNotifications(result?.data?.unReadNotifs || []);
                        // Set loading state
                        setIsLoading(false);
                    } else {
                        // Handle unsuccessful response
                        console.warn("⚠️ Réponse invalide lors de la récupération des notifications");
                        setNotifications([]);
                        // Set loading state
                        setIsLoading(false);
                    }
                }
            } catch (error) {
                console.error("❌ Erreur lors de la récupération des notifications :", error);
                if (isMounted) {
                    setToast({ show: true, type: 'error', message: 'Impossible de charger les notifications. Veuillez réessayer.' });
                    setNotifications([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        getNotifications();
        return () => { isMounted = false };
    }, [currentUser, navigate]);

    const identityDocument = userData?.documents?.identityDocument;
    const selfie = userData?.documents?.selfie;
    const userHasDocument = Boolean(identityDocument && selfie);

    return (
        <div className='user-home'>
            <Header />

            {isLoading && <Loading />}

            <div className={`dashboard ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="content">
                    <nav className="sidebar">
                        <ul>
                            {userSidebarData(language, userData?.profileType, userHasDocument).map(({ id, name, icon, path }) => (
                                <li key={id} className={location.pathname.includes(path) ? "active" : ""}>
                                    <Link to={path}>
                                        <FontAwesomeIcon icon={icon} />
                                        {!isCollapsed && <span className='label'>{name}</span>}
                                        {id === "notifications" && notifications.length > 0 && (
                                            <span className="badge">{notifications.length}</span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                            <FontAwesomeIcon icon={faBars} />
                        </button>
                    </nav>
                    <div className="main-content">
                        <Outlet />
                        <div className="footer">
                            <p>© 2025 AdsCity DashBoard by AdsCity</p>
                        </div>
                    </div>
                </div>
            </div>
            <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ show: false, type: '', message: '' })} />
        </div>
    );
};