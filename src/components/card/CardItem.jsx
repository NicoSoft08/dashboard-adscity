import React, { useContext, useEffect, useRef, useState } from 'react';
import { Toast } from '../../customs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBalanceScale, faBan, faCalendarDay, faClone, faEllipsisV, faExclamationTriangle, faFlag, faGavel, faQuestionCircle, faShareFromSquare } from '@fortawesome/free-solid-svg-icons';
import { Menu, Truck } from 'lucide-react';
import { IconAvatar } from '../../config';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../firebaseConfig';
import { format, isToday, isYesterday } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import { AuthContext } from '../../contexts/AuthContext';
import { getViewCount, incrementClickCount, incrementViewCount, updateContactClick, updateInteraction, updateShareCount } from '../../routes/api';
import { toggleFavorites } from '../../routes/user';
import { reportPost } from '../../routes/post';
import { fetchProfileByUserID } from '../../routes/storage';
import './CardItem.scss';

export default function CardItem({ post, onToggleFavorite }) {
    const { currentUser, userData } = useContext(AuthContext);
    const { language } = useContext(LanguageContext);
    const { id, PostID, UserID, userID, details = {}, images = [], location = {}, category, subcategory, isActive, moderated_at, isSold, expiry_date } = post;
    const [showMenu, setShowMenu] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [profilURL, setProfilURL] = useState(null);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [currentImage, setCurrentImage] = useState(images?.length > 0 ? images[0] : "");
    const navigate = useNavigate();
    const cardRef = useRef(null);
    const reportRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (reportRef.current && !reportRef.current.contains(event.target)) {
                setReportSuccess(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!currentUser || !currentUser.uid || !id) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting) {
                    const success = await incrementViewCount(id, currentUser?.uid);
                    if (success) {
                        await getViewCount(id);
                    }

                    observer.disconnect(); // Arrêter l'observation après enregistrement
                }
            },
            { threshold: 0.5 } // Déclenche si 50% de l'annonce est visible
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, [currentUser, id]);

    // Charger le nombre de vues au montage
    useEffect(() => {
        getViewCount(id);
    }, [id]);

    useEffect(() => {
        if (currentUser && userData?.adsSaved?.includes(post.id)) {
            setIsFavorite(true);
        }

        const fetchProfilURL = async () => {
            try {
                const response = await fetchProfileByUserID(userID);
                if (response && response.profilURL) {
                    setProfilURL(response.profilURL);
                } else {
                    setProfilURL(null); // Assurer que la valeur est bien gérée
                }
            } catch (error) {
                setProfilURL(null);
                throw error;
            }
        };

        if (userID) {
            fetchProfilURL();
        }
    }, [userID, currentUser, userData, post]);

    const reportReasons = [
        {
            id: 1,
            label: language === 'FR'
                ? 'Contenu inapproprié'
                : 'Inappropriate content',
            icon: faBan,
            action: () => handleReportWithReason(post.id,
                language === 'FR'
                    ? 'Contenu inapproprié'
                    : 'Inappropriate content'
            )
        },
        {
            id: 2,
            label: language === 'FR'
                ? 'Produit illégal'
                : 'Illegal product',
            icon: faGavel,
            action: () => handleReportWithReason(post.id,
                language === 'FR'
                    ? 'Produit illégal'
                    : 'Illegal product'
            )
        },
        {
            id: 3,
            label: language === 'FR'
                ? 'Annonce frauduleuse'
                : 'Fraudulent advertisement',
            icon: faExclamationTriangle,
            action: () => handleReportWithReason(post.id,
                language === 'FR'
                    ? 'Annonce frauduleuse'
                    : 'Fraudulent advertisement'
            )
        },
        {
            id: 4,
            label: language === 'FR'
                ? 'Violation des règles du site'
                : 'Violation of site rules',
            icon: faBalanceScale,
            action: () => handleReportWithReason(post.id,
                language === 'FR'
                    ? 'Violation des règles du site'
                    : 'Violation of site rules'
            )
        },
        {
            id: 5,
            label: language === 'FR'
                ? 'Produit contrefait'
                : 'Counterfeit product',
            icon: faClone,
            action: () => handleReportWithReason(post.id,
                language === 'FR'
                    ? 'Produit contrefait'
                    : 'Counterfeit product'
            )
        },
        {
            id: 6,
            label: language === 'FR'
                ? 'Informations trompeuses'
                : 'Misleading information',
            icon: faQuestionCircle,
            action: () => handleReportWithReason(post.id,
                language === 'FR'
                    ? 'Informations trompeuses'
                    : 'Misleading information'
            )
        },
    ];

    const options = [
        {
            label: language === 'FR'
                ? 'Signaler l\'annonce'
                : 'Report the ad',
            icon: faFlag,
            action: () => handleReportAd(post.id)
        },
        {
            label: language === 'FR'
                ? 'Partager'
                : 'Share',
            icon: faShareFromSquare,
            action: () => handleShareAd(post.PostID)
        },
        // {
        //     label: 'Masquer',
        //     icon: faEyeSlash,
        //     action: () => handleHideAd(post.id)
        // },
    ];

    const handleMouseEnter = () => {
        if (images.length > 1) {
            setCurrentImage(images[1]); // Passer à la deuxième image si disponible
        }
    };

    const handleMouseLeave = () => {
        setCurrentImage(images.length > 0 ? images[0] : ""); // Revenir à l’image principale
    };

    const handleReportWithReason = async (postID, reasonLabel) => {
        if (!currentUser) {
            setToast({
                show: true,
                type: 'error',
                message: language === 'FR'
                    ? 'Vous devez être connecté pour signaler une annonce.'
                    : 'You must be logged in to report an ad.'
            });
            return;
        };

        try {
            const userID = currentUser.uid;

            const result = await reportPost(postID, userID, reasonLabel);

            if (result.success) {
                setToast({
                    show: true,
                    type: 'success',
                    message: language === 'FR'
                        ? 'Votre signalement a été envoyé avec succès.'
                        : 'Your report has been successfully sent.'
                });
                setReportSuccess(true);
                logEvent(analytics, 'report_ad', {
                    postID: postID,
                    userID: userID,
                    reason: reasonLabel
                });
            } else {
                setToast({
                    show: true,
                    type: 'error',
                    message: language === 'FR'
                        ? 'Une erreur est survenue lors du signalement de l\'annonce.'
                        : 'An error occurred while reporting the ad.'
                });
                setReportSuccess(false);
            }
            setShowReportModal(false);
        } catch (error) {
            console.error('Erreur lors du signalement de l\'annonce :', error);
            setToast({
                show: true,
                type: 'error',
                message: language === 'FR'
                    ? 'Une erreur est survenue lors du signalement de l\'annonce.'
                    : 'An error occurred while reporting the ad.'
            });
        }
    };

    const handleReportAd = () => {
        setShowReportModal(true);
        setShowMenu(false);
    };

    const handleShareAd = async (PostID) => {
        const shareLink = `${window.location.origin}/posts/${category}/${subcategory}/${PostID}`;

        try {
            // More captivating title and text
            await navigator.share({
                title: language === 'FR'
                    ? '✨ Annonce exceptionnelle sur AdsCity! ✨'
                    : '✨ Exceptional ad on AdsCity! ✨',
                text: language === 'FR'
                    ? '🔥 J\'ai trouvé cette offre incroyable que vous devez absolument voir! Cliquez pour découvrir tous les détails.'
                    : '🔥 I found this incredible offer that you must absolutely see! Click to discover all the details.',
                url: shareLink
            }).then(async () => {
                const postID = id;
                const userID = currentUser?.uid;
                if (!userID) return null;
                await updateShareCount(postID, userID);
            });

            await navigator.clipboard.writeText(shareLink);
            setToast({
                show: true,
                type: 'success',
                message: language === 'FR'
                    ? 'Le lien a été copié dans le presse-papiers.'
                    : 'The link has been copied to the clipboard.'
            });
            logEvent(analytics, 'share_link');
        } catch (error) {
            console.error('Erreur lors de la copie dans le presse-papiers :', error);
            setToast({
                show: true,
                type: 'error',
                message: language === 'FR'
                    ? 'Une erreur est survenue lors de la copie du lien dans le presse-papiers.'
                    : 'An error occurred while copying the link to the clipboard.'
            });
        }
    };


    // const handleHideAd = (postID) => {
    //     console.log(`Masquer l'annonce avec l'ID : ${postID}`);
    // };


    const formatPostedAt = (posted_at) => {
        const date = new Date(posted_at);

        if (isToday(date)) {
            return language === 'FR'
                ? `Auj. ${format(date, 'HH:mm', { locale: fr })}`
                : `Today ${format(date, 'HH:mm', { locale: enUS })}`;
        }

        if (isYesterday(date)) {
            return language === 'FR'
                ? `Hier ${format(date, 'HH:mm', { locale: fr })}`
                : `Yesterday ${format(date, 'HH:mm', { locale: enUS })}`;
        }

        let formattedDate = language === 'FR'
            ? format(date, 'd MMMM HH:mm', { locale: fr })
            : format(date, 'MMMM d HH:mm', { locale: enUS });

        return formattedDate;
    };

    const handlePostClick = async (url) => {
        const postID = id;
        navigate(url, { state: { id: postID } });

        const userID = currentUser?.uid;
        if (!userID) return null;

        try {
            await updateInteraction(postID, userID, category); // Fonction pour mettre à jour adsViewed, categoriesViewed, et totalAdsViewed
            await incrementClickCount(postID, userID);

        } catch (error) {
            throw error;
        }
    };

    const handleMenuClick = () => {
        setShowMenu(!showMenu);
    };

    const handleProfileClick = async (url) => {
        navigate(url, { state: { id: userID } });

        if (!currentUser) return null;

        const { city } = userData;

        await updateContactClick(userID, city);

        logEvent(analytics, 'view_profile', {
            userID: userID,
            postID: id,
            city: city
        });
    };

    const handleToggleFavorite = async (postID) => {
        if (!currentUser) {
            setToast({
                show: true,
                type: 'error',
                message: language === 'FR'
                    ? 'Vous devez être connecté pour ajouter aux favoris.'
                    : 'You must be logged in to add to favorites.',
            });
            return;
        }

        try {
            const userID = currentUser?.uid;
            const result = await toggleFavorites(postID, userID);
            logEvent(analytics, 'favorite_ad', {
                postID: postID,
                userID: userID,
                isFavorite: result.isFavorite,
            });
            if (result.success) {
                setIsFavorite(true);
                setToast({
                    show: true,
                    type: result.isFavorite ? 'success' : 'info',
                    message: language === 'FR'
                        ? result.isFavorite
                            ? 'Annonce ajoutée aux favoris !'
                            : 'Annonce retirée des favoris.'
                        : result.isFavorite
                            ? 'Ad added to favorites!'
                            : 'Ad removed from favorites.',
                });

                // Si la prop onToggleFavorite est définie, l'appeler
                if (onToggleFavorite && !result.isFavorite) {
                    onToggleFavorite(postID);
                }
            } else {
                setToast({
                    show: true,
                    type: 'error',
                    message: language === 'FR'
                        ? 'Erreur lors de la mise à jour des favoris.'
                        : 'Error updating favorites.',
                });
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour des favoris:', error);
            setToast({
                show: true,
                type: 'error',
                message: language === 'FR'
                    ? 'Une erreur s\'est produite.'
                    : 'An error occurred.',
            });
        }
    };

    // Vérifier si l'annonce a expiré
    function parseTimestamp(timestamp) {
        return new Date(timestamp?._seconds * 1000 + timestamp?._nanoseconds / 1000000);
    };

    const moderatedAtDate = parseTimestamp(moderated_at);

    // Déterminer l'image de profil à afficher
    const profileImage = profilURL ?? IconAvatar;

    const post_id = PostID?.toLowerCase();
    const user_id = UserID?.toLowerCase();

    if (!isActive) return null;

    const checkExpiryDate = (expiryDateString) => {
        // Si pas de date d'expiration, retourner null
        if (!expiryDateString) return null;

        // Convertir la chaîne de date en objet Date
        const expiryDate = new Date(expiryDateString);
        const currentDate = new Date();

        // Vérifier si la date est valide
        if (isNaN(expiryDate.getTime())) return null;

        // Comparer avec la date actuelle
        if (expiryDate <= currentDate) {
            // La date a expiré
            return null;
        }

        // La date n'a pas expiré, retourner la date d'expiration
        return expiryDateString;
    };

    const expiryDate = checkExpiryDate(expiry_date);
    if (moderatedAtDate > expiryDate) return null;

    return (
         <div ref={cardRef} className={`card-container ${isActive ? 'active' : 'inactive'}`} key={id}>
            {isSold && <span className="sold-badge">
                {language === 'FR'
                    ? 'VENDU' : 'SOLD'
                }
            </span>}
            {/* Image de l'annonce */}
            <div
                onClick={() => handlePostClick(`/posts/${category}/${subcategory}/${post_id}`)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <img
                    title={`Annonce: ${details.title}`}
                    src={currentImage}
                    alt={details.title}
                    className="card-image"
                // onError={() => setCurrentImage(PlaceholderImage)} // Gérer les erreurs de chargement
                />
                {/*  <div className="badge-sponsored">Sponsorisé</div> */}
            </div>

            {/* Contenu de l'annonce */}
            <div className="card-content">
                <h2 className="card-title" title={`${details?.title}`}>
                    {details?.title?.length > 50
                        ? `${details.title.substring(0, 50)}...`
                        : details.title
                    }
                </h2>
                <p className="card-price">{details.price} RUB {details.delievery && <span title={language === 'FR' ? 'Possibilité de livraison' : 'Possibility of delivery'}><Truck className='delievery-icon' size={14} /></span>} </p>
                <p className="card-city">{location.city}, {location.country}</p>
                <div onClick={() => handleProfileClick(`/users/user/${user_id}/profile/show`)} className="announcer">
                    <img src={profileImage} alt="avatar" className="avatar" />
                </div>
                <div className="card-footer">
                    <span className="card-date">
                        <FontAwesomeIcon icon={faCalendarDay} color={"gray"} />
                        {formatPostedAt(moderatedAtDate)}
                    </span>
                </div>
            </div>

            {/* Icons pour les actions */}
            <div className="card-actions">
                <button
                    className="options-button"
                    title={language === 'FR' ? 'Options' : 'Options'}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClick();
                    }}
                >
                    <FontAwesomeIcon icon={faEllipsisV} color='#343a40' />
                </button>
                <button
                    className={`like-button ${isFavorite ? 'active' : ''}`}
                    title={isActive ? (isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris') : 'Inactif - indisponible'}
                    onClick={(e) => { e.stopPropagation(); isActive && handleToggleFavorite(post.id); }}
                >
                    {isFavorite ? '❤️' : '🤍'}
                </button>
            </div>

            {reportSuccess && (
                <div className="report-success" ref={reportRef} aria-live="polite">
                    <div className="content">
                        <p className="message">
                            {language === 'FR'
                                ? "Signalement enregistré !"
                                : "Report submitted!"
                            }
                        </p>
                        <p className='text'>
                            {language === 'FR'
                                ? "Merci ! Un modérateur vérifiera bientôt l'annonce"
                                : "Thank you! A moderator will review the post soon."
                            }
                        </p>
                    </div>
                </div>
            )}

            <Menu options={options} isOpen={showMenu} onClose={() => setShowMenu(false)} />
            <Menu options={reportReasons} isOpen={showReportModal} onClose={() => setShowReportModal(false)} />
            <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
};
