import React, { useContext, useEffect, useRef, useState } from 'react';
import { faCheck, faCheckCircle, faEllipsisH, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { deleteNotification, deteleteAllNotifications, fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../../routes/user';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../firebaseConfig';
import { letterWhiteBgBlue } from '../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formateDate, parseTimestamp } from '../../func';
import { Modal, Pagination, Spinner, Toast } from '../../customs';
import { LanguageContext } from '../../contexts/LanguageContext';
import '../../styles/Notifications.scss';

const NotificationItem = ({ userID, notification, setNotifications, language }) => {
    const sentAt = parseTimestamp(notification?.timestamp);
    const menuRef = useRef(null);
    const { currentUser } = useContext(AuthContext);
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const options = [
        {
            label: language === 'FR' ? 'Marquer comme lu' : 'Mark as read',
            icon: faCheck, // Vous pouvez utiliser une icône appropriée comme une coche
            action: () => handleMarkAsRead(notification?.id)
        },
        {
            label: language === 'FR' ? 'Supprimer' : 'Delete',
            icon: faTrash, // Vous pouvez utiliser une icône appropriée comme une poubelle
            action: () => handleDelete(notification?.id)
        }
    ];


    const handleMenuClick = (e, isRead) => {
        if (isRead) return;
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleMarkAsRead = async (notificationID) => {
        setShowMenu(!showMenu);

        try {
            const idToken = await currentUser.getIdToken();
            const hasRead = await markNotificationAsRead(userID, idToken, notificationID);
            if (hasRead.success) {
                setToast({
                    show: true,
                    type: 'info',
                    message: language === 'FR'
                        ? 'Notification marquée comme lue'
                        : 'Notification marked as read'
                })
                logEvent(analytics, 'mark_notification_as_read');
                // Mettre à jour localement
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif.id === notificationID ? { ...notif, isRead: true } : notif
                    )
                );
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleDelete = async () => {
        setShowMenu(!showMenu);
        setConfirm(true);
    };

    // Confirmer la suppression
    const confirmDelete = async () => {
        const notificationID = notification?.id;
        try {
            setLoading(true);
            const result = await deleteNotification(userID, notificationID);
            if (result.success) {
                setToast({
                    show: true,
                    type: 'success',
                    message: language === 'FR'
                        ? 'Notification supprimée'
                        : 'Notification deleted'
                });
                logEvent(analytics, 'delete_notification');
                setNotifications((prev) => prev.filter((notif) => notif.id !== notificationID));
                setConfirm(false);
            }
        } catch (error) {
            console.error(error);
            setToast({
                show: true,
                type: 'error',
                message: language === 'FR'
                    ? 'Une erreur est survenue'
                    : 'An error occurred'
            })
            setConfirm(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            key={notification.id}
            className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
        >
            <div className="avatar-container">
                <img
                    src={letterWhiteBgBlue}
                    alt={'moderation team'}
                    className="user-avatar"
                />
                <div className="username-wrapper">
                    <h3>AdsCity Moderation</h3>
                    <span className="verified-badge" title='Compte vérifié'>
                        <FontAwesomeIcon icon={faCheckCircle} />
                    </span>
                </div>
                <span className="more-options" title="Plus d'options" onClick={handleMenuClick}>
                    <FontAwesomeIcon icon={faEllipsisH} />
                </span>
                {showMenu &&
                    <div className="options-menu" ref={menuRef}>
                        {options.map((option, index) => (
                            <div key={index} className="options-menu-item" onClick={option.action}>
                                <FontAwesomeIcon icon={option.icon} />
                                <span>{option.label}</span>
                            </div>
                        ))}
                    </div>
                }
            </div>
            <div className="notification-content">
                <p className='title'>{notification.title}</p>
                <p className='type'>
                    {notification.type === 'ad_approval' && notification.message}
                    {notification.type === 'ad_refusal' && notification.message}
                    {notification.type === 'verification_status' && notification.message}
                </p>
                <span className="timestamp">
                    {formateDate(sentAt, language)}
                </span>
            </div>
            <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />

            {confirm && (
                <Modal title={"Suppression de la notification"} onShow={confirm} onHide={() => setConfirm(false)}>
                    <p>
                        {language === 'FR'
                            ? "Êtes-vous sûr de vouloir supprimer cette notification ?"
                            : "Are you sure you want to delete this notification ?"
                        }
                    </p>
                    <div className="ad-details-buttons">
                        <button className="modal-button approve-button" onClick={confirmDelete}>
                            {loading ? <Spinner /> : <><FontAwesomeIcon icon={faCheck} /> language === 'FR' ? "Confirmer" : "Confirm"</>}
                        </button>
                        <button className="modal-button reject-button" onClick={() => setConfirm(false)}>
                            <FontAwesomeIcon icon={faTimes} /> {language === 'FR' ? "Annuler" : "Cancel"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default function NotificationList() {
    const menuRef = useRef(null);
    const { currentUser } = useContext(AuthContext);
    const { language } = useContext(LanguageContext);
    const [notifications, setNotifications] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [notifPerPage] = useState(5);

    useEffect(() => {
        let isMounted = true;

        const getNotifications = async () => {
            try {
                const userID = currentUser.uid;
                const idToken = await currentUser.getIdToken();
                const result = await fetchNotifications(userID, idToken);
                if (isMounted && result) {
                    setNotifications(result?.data.notifications || []);
                }
            } catch (error) {
                console.error("❌ Erreur lors de la récupération des notifications :", error);
            }
        }

        getNotifications();

        return () => {
            isMounted = false;
        };
    }, [currentUser]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const indexOfLastPost = currentPage * notifPerPage;
    const indexOfFirstPost = indexOfLastPost - notifPerPage;
    const currentNotifications = notifications.slice(indexOfFirstPost, indexOfLastPost);

    const options = [
        {
            label: language === 'FR' ? 'Marquer tout comme lu' : 'Mark all as read',
            icon: faCheck, // Vous pouvez utiliser une icône appropriée comme une coche
            action: () => handleMarkAllAsRead()
        },
        {
            label: language === 'FR' ? 'Supprimer tout' : 'Delete all',
            icon: faTrash, // Vous pouvez utiliser une icône appropriée comme une poubelle
            action: () => handleDeleteAll()
        }
    ];

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleMarkAllAsRead = async () => {
        setShowMenu(!showMenu);

        const userID = currentUser.uid;

        try {
            const result = await markAllNotificationsAsRead(userID);
            if (result.success) {
                setToast({
                    show: true,
                    type: 'info',
                    message: language === 'FR'
                        ? 'Toutes les notifications ont été marquées comme lues.'
                        : 'All notifications have been marked as read.'
                });
                logEvent(analytics, 'mark_all_notifications_as_read');
            } else {
                setToast({ show: true, type: 'error', message: result.message });
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour des notifications :', error);
            setToast({
                show: true,
                type: 'error',
                message: language === 'FR'
                    ? 'Erreur technique, réessayez plus tard.'
                    : 'Technical error, please try again later.'
            });
        }
    }

    const handleDeleteAll = async () => {
        setShowMenu(!showMenu);
        setConfirm(true);
    };

    const confirmDeleteAll = async () => {
        try {
            setLoading(true);

            const userID = currentUser.uid;

            const result = await deteleteAllNotifications(userID);
            if (result.success) {
                setToast({
                    show: true,
                    type: 'success',
                    message: language === 'FR'
                        ? 'Toutes les notifications ont été supprimées.'
                        : 'All notifications have been deleted.'
                });
                logEvent(analytics, 'delete_all_notifications');
                setNotifications([]);
                setConfirm(false);
            }
        } catch (error) {
            console.error(error);
            setToast({
                show: true, type: 'error',
                message: language === 'FR'
                    ? 'Une erreur est survenue'
                    : 'An error occurred'
            });
            setConfirm(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='notification-list'>
            <div className="head">
                <h2>Notifications</h2>
                <span className="more-options" title={language === 'FR' ? 'Plus d\'options' : 'More options'}>
                    <FontAwesomeIcon icon={faEllipsisH} onClick={handleMenuClick} />
                </span>
                {showMenu &&
                    <div className="options-menu" ref={menuRef}>
                        {options.map((option, index) => (
                            <div key={index} className="options-menu-item" onClick={option.action}>
                                <FontAwesomeIcon icon={option.icon} />
                                <span>{option.label}</span>
                            </div>
                        ))}
                    </div>
                }
            </div>
            {currentNotifications.length > 0
                ?
                currentNotifications.map((notification, index) => (
                    <NotificationItem
                        key={index}
                        userID={currentUser?.uid}
                        notification={notification}
                        setNotifications={setNotifications}
                        language={language}
                    />
                ))
                : <p>
                    {language === 'FR' ? "Vous n'avez pas de notifications." : "You don't have any notifications."}
                </p>
            }

            {notifications.length > notifPerPage && (
                <Pagination
                    currentPage={currentPage}
                    elements={notifications}
                    elementsPerPage={notifPerPage}
                    paginate={paginate}
                />
            )}


            {confirm && (
                <Modal title={language === 'FR'
                    ? "Suppression de toutes les notifications"
                    : "Deletion of all notifications"
                } onShow={confirm} onHide={() => setConfirm(false)}>
                    <p>
                        {language === 'FR'
                            ? "Êtes-vous sûr de vouloir supprimer toutes les notifications ?"
                            : "Are you sure you want to delete all notifications ?"
                        }
                    </p>
                    <div className="ad-details-buttons">
                        <button className="modal-button approve-button" onClick={confirmDeleteAll}>
                            {loading ? <Spinner /> : <><FontAwesomeIcon icon={faCheck} /> language === 'FR' ? "Confirmer" : "Confirm"</>}
                        </button>
                        <button className="modal-button reject-button" onClick={() => setConfirm(false)}>
                            <FontAwesomeIcon icon={faTimes} /> {language === 'FR' ? "Annuler" : "Cancel"}
                        </button>
                    </div>
                </Modal>
            )}

            <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
};