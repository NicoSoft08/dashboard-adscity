import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { faEllipsisH, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Loading, Modal, Spinner } from '../customs';
import CardList from '../components/card/CardList';
import CardItem from '../components/card/CardItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getUserFavorites } from '../routes/user';
import '../styles/ManageFavorites.scss';

export default function ManageFavorites() {
    const { currentUser } = useContext(AuthContext);
    const [favoris, setFavoris] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!currentUser) {
            console.error("❌ Utilisateur non connecté.");
            navigate('/auth/signin');
        }

        const fetchFavoris = async () => {
            setLoading(true);
            const userID = currentUser?.uid;
            const idToken = await currentUser.getIdToken(true);
            const result = await getUserFavorites(userID, idToken);
            if (result.success) {
                setFavoris(result?.postsSaved);
                setLoading(false);
            }
        }

        if (currentUser) {
            fetchFavoris();
        }
    }, [currentUser, navigate]);

    const options = [
        {
            label: 'Supprimer tout',
            icon: faTrash, // Vous pouvez utiliser une icône appropriée comme une poubelle
            action: () => handleDeleteAll()
        }
    ];

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleDeleteAll = async () => {
        setShowMenu(!showMenu);
        setConfirm(true);
    };

    const confirmDeleteAll = async () => { };

    const handleRemoveFromFavorites = (postID) => {
        // Mettre à jour l'état pour retirer l'annonce supprimée
        setFavoris((prevFavoris) => prevFavoris.filter((post) => post.postID !== postID));
    };

    return (
        <div className='my-favoris'>
            {loading && <Loading />}
            <div className="head">
                <h2>Favoris</h2>
                <span className="more-options" title="Plus d'options">
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
            {favoris.length > 0 ?
                <CardList>
                    {favoris.map((item, index) => (
                        <CardItem
                            key={index}
                            post={item}
                            onToggleFavorite={() => handleRemoveFromFavorites(item.postID)}
                        />
                    ))}
                </CardList>
                :
                <p>Aucunes annonces dans vos favoris</p>
            }

            {confirm && (
                <Modal title={"Suppression de toutes les notifications"} onShow={confirm} onHide={() => setConfirm(false)}>
                    <p>Êtes-vous sûr de vouloir supprimer toutes les notifications ?</p>
                    <div className="ad-details-buttons">
                        <button className="modal-button approve-button" onClick={confirmDeleteAll}>
                            {loading ? <Spinner /> : 'Confirmer'}
                        </button>
                        <button className="modal-button reject-button" onClick={() => setConfirm(false)}>
                            Annuler
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};
