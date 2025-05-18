import { format, formatDistanceToNow } from 'date-fns';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loading, Modal, Pagination, Spinner, Toast } from '../customs';
import { debounce } from 'lodash';
import data from '../json/data.json';
import { enUS, fr } from 'date-fns/locale';
import { fetchPostsByUserID } from '../routes/user';
import { deletePost, markAsSold, updatePost } from '../routes/post';
import { deletePostImagesFromStorage } from '../routes/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import Tab from '../utils/tabs/Tab';

const STATUS_ICONS = (language) => ({
    pending: language === 'FR' ? "🟠 En attente" : "🟠 Pendin",
    approved: language === 'FR' ? "🟢 Accepté" : "🟢 Approved",
    refused: language === 'FR' ? "🔴 Rejeté" : "🔴 Rejected",
    expired: language === 'FR' ? "⚫ Expiré" : "⚫ Expired",
    sold: language === 'FR' ? "✅ Vendu" : "✅ Sold",
});

const PostsFilter = ({ onFilterChange, onExport, language }) => {
    const [filters, setFilters] = useState({
        search: '',
        status: 'all', // 
        category: 'all', //
        city: '',
        startDate: "", // Date de début
        endDate: "",   // Date de fin
        views: '',
    });

    // Référence pour la fonction debounce
    const debouncedFilterChangeRef = useRef(null);

    // Initialisation de la fonction debounce
    useEffect(() => {
        debouncedFilterChangeRef.current = debounce((newFilters) => {
            onFilterChange(newFilters);
        }, 300);

        // Nettoyage lors du démontage du composant
        return () => {
            if (debouncedFilterChangeRef.current?.cancel) {
                debouncedFilterChangeRef.current.cancel();
            }
        };
    }, [onFilterChange]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validation des dates
        let updatedFilters = { ...filters, [name]: value };

        // S'assurer que la date de début n'est pas après la date de fin
        if (name === "startDate" && updatedFilters.endDate && updatedFilters.startDate > updatedFilters.endDate) {
            updatedFilters.endDate = updatedFilters.startDate;
        }

        // S'assurer que la date de fin n'est pas avant la date de début
        if (name === "endDate" && updatedFilters.startDate && updatedFilters.endDate < updatedFilters.startDate) {
            updatedFilters.startDate = updatedFilters.endDate;
        }

        setFilters(updatedFilters);

        // Appel de la fonction debounce
        if (debouncedFilterChangeRef.current) {
            debouncedFilterChangeRef.current(updatedFilters);
        }
    };


    return (
        <div className="filters">
            <input
                type="text"
                name="search"
                placeholder={language === 'FR' ? "Rechercher par titre ou ID" : "Search by title or ID"}
                value={filters.search}
                onChange={handleChange}
            />
            <select name="status" value={filters.status} onChange={handleChange}>
                <option value="all">{language === 'FR' ? "Toutes les statuts" : "All status"}</option>
                {Object.keys(STATUS_ICONS).map(status => (
                    <option key={status} value={status}>{STATUS_ICONS[status]}</option>
                ))}
            </select>
            <select name="category" value={filters.category} onChange={handleChange}>
                <option value="all">{language === 'FR' ? "Toutes les catégories" : "All categories"}</option>
                {data.categories.map(category => (
                    <option key={category.key} value={category.categoryName}>
                        {category.categoryTitles.fr}
                    </option>
                ))}
            </select>
            <input
                type="text"
                name="city"
                placeholder={language === 'FR' ? "Ville" : "City"}
                value={filters.city}
                onChange={handleChange}
            />
            <div className="date-range">
                <input
                    type="date"
                    name="startDate"
                    placeholder="Date de début"
                    value={filters.startDate}
                    onChange={handleChange}
                />
                <input
                    type="date"
                    name="endDate"
                    placeholder="Date de fin"
                    value={filters.endDate}
                    onChange={handleChange}
                />
            </div>
            <input
                type="number"
                name="views"
                placeholder={language === 'FR' ? "Nombre de vues minimum" : "Minimum views"}
                value={filters.views}
                onChange={handleChange}
            />
            <button onClick={onExport}>
                {language === 'FR' ? " Exporter en CSV" : " Export to CSV"}
            </button>
        </div>
    );
};

const PostRow = ({ index, post, onAction, language, setLoading }) => {

    return (
        <tr onClick={() => onAction(post)}>
            <td>{index + 1}</td>
            <td>{post.PostID}</td>
            <td><img src={post.images[0]} alt='' width={40} height={40} /></td>
            <td>{post.details?.title}</td>
            <td>{post.details?.price} RUB </td>
            <td>{STATUS_ICONS(language)[post.status] || "⚪ Inconnu"}</td>
            <td>{formatDistanceToNow(new Date(post.expiry_date), { locale: language === 'FR' ? fr : enUS, addSuffix: true })}</td>
        </tr>
    );
};

export default function ManagePosts() {
    const { currentUser } = useContext(AuthContext);
    const { language } = useContext(LanguageContext);
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [confirm, setConfirm] = useState({ willDelete: false, willUpdate: false, willMarkAsSold: false });
    const [postToEdit, setPostToEdit] = useState(null);
    const [postToMarkAsSold, setPostToMarkAsSold] = useState(null);
    const [postToDelete, setPostToDelete] = useState(null);
    const [editData, setEditData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [openFilter, setOpenFilter] = useState(false);
    const [postPerPage] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        // Add loading state
        setIsLoading(true);

        const fetchPosts = async () => {
            try {
                // Validate user is logged in
                if (!currentUser?.uid) {
                    setIsLoading(false);
                    return;
                }

                const userID = currentUser.uid;
                const idToken = await currentUser.getIdToken();

                try {
                    const data = await fetchPostsByUserID(userID, idToken);

                    if (isMounted && data) {
                        // Validate and set data
                        const postsArray = data.postsData?.allAds || [];
                        setPosts(postsArray);
                        setFilteredPosts(postsArray);

                        // Update loading state
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.error('Erreur lors de la récupération des annonces:', error);

                    if (isMounted) {
                        // Set error state for user feedback
                        setPosts([]);
                        setFilteredPosts([]);
                        setIsLoading(false);
                    }
                }
            } catch (error) {
                console.error('Erreur inattendue:', error);

                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchPosts();

        return () => {
            isMounted = false;
            controller.abort(); // Cancel any pending requests
        };
    }, [currentUser]);


    // 📍 Gestion du changement de page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const indexOfLastPost = currentPage * postPerPage;
    const indexOfFirstPost = indexOfLastPost - postPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

    const handleEditPost = (post) => {
        if (!post) return;
        setPostToEdit(post);
        setShowEditModal(true);
    };

    const handleConfirmEdit = () => {
        setConfirm({ ...confirm, willUpdate: true });
    };

    const confirmEditPost = async () => {
        if (!postToEdit || !editData) return;
        setIsLoading(true);

        try {
            // 🔥 Mettre à jour Firestore
            await updatePost(postToEdit.id, editData, currentUser?.uid);

            // 🔥 Mettre à jour l'affichage local
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postToEdit.id ? { ...post, ...editData } : post
                )
            );

            setToast({ show: true, type: 'success', message: "Annonce mise à jour avec succès !" });
        } catch (error) {
            // console.error("Erreur lors de la mise à jour :", error);
            setToast({ show: true, type: 'error', message: "Erreur lors de la mise à jour." });
        } finally {
            setShowEditModal(false);
            setConfirm({ ...confirm, willUpdate: false });
            setPostToEdit(null);
            setEditData(null);
            setIsLoading(false);
        }
    };

    const handleDeletePost = async (postID) => {
        if (!postID) return;

        setPostToDelete(postID);
        setConfirm({ ...confirm, willDelete: true });
    };

    const confirmDeletePost = async () => {
        if (!postToDelete) return;
        setIsLoading(true);

        try {
            // 🔥 Trouver l'annonce correspondante pour récupérer les images
            const postToRemove = posts.find(post => post.id === postToDelete);
            if (!postToRemove) {
                setToast({ show: true, type: 'error', message: "Annonce introuvable." });
                return;
            }

            // 🔥 Supprimer d'abord les images de Firebase Storage
            await deletePostImagesFromStorage(postToDelete);

            // 🔥 Ensuite, supprimer l'annonce de Firestore
            const result = await deletePost(postToDelete, currentUser?.uid);
            if (result.success) {
                setPosts((prev) => prev.filter((post) => post.id !== postToDelete));
                setToast({ show: true, type: 'info', message: result.message });
            } else {
                setToast({ show: true, type: 'error', message: result.message });
            }
        } catch (error) {
            // console.error("Erreur lors de la suppression de l'annonce :", error);
            setToast({ show: true, type: 'error', message: "Erreur lors de la suppression." });
        } finally {
            // Réinitialise le modal
            setConfirm({ ...confirm, willDelete: false });
            setPostToDelete(null);
            setIsLoading(false);
        }
    };

    const handleMarkAsSold = async (post) => {
        if (!post) return;
        setPostToMarkAsSold(post);
        setConfirm({ ...confirm, willMarkAsSold: true });
    };

    const confirmMarkAsSold = async () => {
        if (!postToMarkAsSold) return;
        setIsLoading(true);

        try {
            const result = await markAsSold(currentUser?.uid, postToMarkAsSold.id);
            if (result.success) {
                setPosts((prev) => prev.map(post =>
                    post.id === postToMarkAsSold.id ? { ...post, isSold: true } : post
                ));
                setToast({ show: true, type: 'info', message: result.message });
            } else {
                setToast({ show: true, type: 'error', message: result.message });
            }
        } catch (error) {
            // console.error("Erreur :", error);
            setToast({ show: true, type: 'error', message: "Une erreur est survenue." });
        } finally {
            setConfirm({ ...confirm, willMarkAsSold: false });
            setPostToMarkAsSold(null);
            setIsLoading(false);
        }
    };

    // 🚀 Gestion des actions (navigation)
    const handleAction = (post) => {
        if (post?.PostID) {
            navigate(`${post.PostID}`);
        }
    };

    // 🎯 Gestion des filtres
    const handleFilterChange = (filters) => {
        let filtered = posts.filter(post => {
            // Convertir la date d'expiration en objet Date pour la comparaison
            const expiryDate = post.expiry_date ? new Date(post.expiry_date) : null;
            const formattedExpiryDate = expiryDate ? format(expiryDate, "yyyy-MM-dd") : null;

            // Filtrage par recherche (titre ou ID)
            const searchMatch = filters.search === "" ||
                (post.details?.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
                    post.PostID?.toLowerCase().includes(filters.search.toLowerCase()));

            // Filtrage par statut
            const statusMatch = filters.status === "all" || post.status === filters.status;

            // Filtrage par catégorie
            const categoryMatch = filters.category === "all" || post.category === filters.category;

            // Filtrage par ville
            const cityMatch = filters.city === "" ||
                (post.location?.city?.toLowerCase().includes(filters.city.toLowerCase()));

            // Filtrage par plage de dates
            const startDateMatch = !filters.startDate || !formattedExpiryDate ||
                formattedExpiryDate >= filters.startDate;

            const endDateMatch = !filters.endDate || !formattedExpiryDate ||
                formattedExpiryDate <= filters.endDate;

            // Filtrage par nombre de vues
            const viewsMatch = filters.views === "" ||
                (post.stats?.views && post.stats.views >= Number(filters.views));

            return searchMatch && statusMatch && categoryMatch && cityMatch &&
                startDateMatch && endDateMatch && viewsMatch;
        });

        setFilteredPosts(filtered);
        setCurrentPage(1); // Réinitialiser à la première page lors du changement de filtres
    };

    // 📊 Exportation en CSV
    const handleExportCSV = async () => {
        try {
            // Fonction pour échapper les valeurs CSV
            const escapeCSV = (value) => {
                if (value === null || value === undefined) return '';
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            };

            // Créer le contenu CSV
            const headers = language === 'FR'
                ? ["ID", "Titre", "Prix", "Statut", "Annonceur", "Date d'expiration", "Vues", "Clicks", "Ville"]
                : ["ID", "Title", "Price", "Status", "Advertiser", "Expiry Date", "Views", "Clicks", "City"];
            const csvContent = [
                headers.join(","),
                ...filteredPosts.map(post => [
                    escapeCSV(post.PostID),
                    escapeCSV(post.details?.title || ""),
                    post.details?.price || 0,
                    escapeCSV(post.status || ""),
                    escapeCSV(post.userID || ""),
                    post.expiry_date ? format(new Date(post.expiry_date), "yyyy-MM-dd") : "",
                    post.stats?.views || 0,
                    post.stats?.clicks || 0,
                    escapeCSV(post.location?.city || "")
                ].join(","))
            ].join("\n");

            // Créer et télécharger le fichier
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `annonces_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setToast({
                show: true,
                type: 'success',
                message: language === 'FR'
                    ? 'Export réussi!'
                    : 'Export successful!'
            });
        } catch (error) {
            console.error("Erreur lors de l'exportation:", error);
            setToast({
                show: true,
                type: 'error',
                message: language === 'FR'
                    ? 'Erreur lors de l\'exportation'
                    : 'Error during export'
            });
        }
    };

    const options = [
        {
            label: 'Modifier',
            icon: '✏️',
            action: () => handleEditPost(postToEdit),
            disabled: postToEdit?.isSold, // Désactiver si vendue
        },
        {
            label: 'Marquer comme vendu',
            icon: '✅',
            action: () => handleMarkAsSold(postToEdit.id),
            disabled: postToEdit?.isSold, // Désactiver si vendue
        },
        {
            label: 'Supprimer',
            icon: '🗑️',
            action: () => handleDeletePost(postToEdit.id),
        },
    ];

    return (
        <div className='my-ads'>
            <div className="head">
                <h2>{language === 'FR' ? "Gestion des Annonces" : "Ads Management"} {filteredPosts.length}</h2>
                <div className="filters-container" onClick={() => setOpenFilter(!openFilter)}>
                    <FontAwesomeIcon icon={faFilter} />
                </div>
            </div>

            {/* Filtres */}
            {openFilter && (
                <PostsFilter onFilterChange={handleFilterChange} language={language} onExport={handleExportCSV} />
            )}

            {isLoading && <Loading />}

            <div className="ads-list">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ID</th>
                                <th>Image</th>
                                <th>{language === 'FR' ? "Titre" : "Title"}</th>
                                <th>{language === 'FR' ? "Prix" : "Price"}</th>
                                <th>{language === 'FR' ? "Statut" : "Status"}</th>
                                <th>{language === 'FR' ? "Expiration" : "Expiry Date"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPosts.length ? currentPosts.map((post, index) => (
                                <PostRow
                                    key={post.PostID || index}
                                    index={indexOfFirstPost + index}
                                    post={post}
                                    currentUser={currentUser}
                                    onAction={handleAction}
                                    setLoading={setIsLoading}
                                    language={language}
                                />
                            )) : (
                                <tr><td colSpan="12">
                                    {language === 'FR' ? "Aucune annonce trouvée" : "No ads found"}
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {posts.length > postPerPage && (
                    <Pagination currentPage={currentPage} elements={filteredPosts} elementsPerPage={postPerPage} paginate={paginate} />
                )}
            </div>

            {showMenu && (
                <Modal onShow={showMenu} onHide={() => setShowMenu(false)} title={"Actions"}>
                    <div className="modal-menu">
                        {options.map((option, index) => (
                            <div key={index} className="menu-item" onClick={option.action}>
                                {/* <FontAwesomeIcon icon={option.icon} /> */}
                                <span>{option.icon}</span>
                                <span>{option.label}</span>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}

            {showEditModal && postToEdit && (
                <Modal title={"Modification d'annonce"} onShow={showEditModal} onHide={() => setShowEditModal(false)}>
                    <div className='ad-details'>
                        <Tab post={postToEdit} key={postToEdit.id} />
                        <div className="ad-details-buttons">
                            <button className="modal-button approve-button" onClick={handleConfirmEdit}>
                                {isLoading ? <Spinner /> : 'Modifier'}
                            </button>
                            <button className="modal-button reject-button" onClick={() => setShowEditModal(false)}>
                                Annuler
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {confirm.willDelete && (
                <Modal title={"Suppression d'annonce"} onShow={confirm.willDelete} onHide={() => setConfirm({ ...confirm, willDelete: false })}>
                    <p>Êtes-vous sûr de vouloir supprimer cette annonce ?</p>
                    <div className="ad-details-buttons">
                        <button className="modal-button approve-button" onClick={confirmDeletePost}>
                            {isLoading ? <Spinner /> : 'Confirmer'}
                        </button>
                        <button className="modal-button reject-button" onClick={() => setConfirm({ ...confirm, willDelete: false })}>
                            Annuler
                        </button>
                    </div>
                </Modal>
            )}

            {confirm.willUpdate && (
                <Modal title={"Confirmation"} onShow={confirm.willUpdate} onHide={() => setConfirm({ ...confirm, willUpdate: false })}>
                    <p>Voulez-vous confirmer la mise à jour de cette annonce ?</p>
                    <div className="ad-details-buttons">
                        <button className="modal-button approve-button" onClick={confirmEditPost}>
                            {isLoading ? <Spinner /> : 'Confirmer'}
                        </button>
                        <button className="modal-button reject-button" onClick={() => setConfirm({ ...confirm, willUpdate: false })}>
                            Annuler
                        </button>
                    </div>
                </Modal>
            )}

            {confirm.willMarkAsSold && postToMarkAsSold && (
                <Modal title={"Confirmer la vente"} onShow={confirm.willMarkAsSold} onHide={() => setConfirm({ ...confirm, willMarkAsSold: false })}>
                    <p>Êtes-vous sûr de vouloir marquer cette annonce comme vendue ?</p>
                    <div className="ad-details-buttons">
                        <button className="modal-button approve-button" onClick={confirmMarkAsSold}>
                            {isLoading ? <Spinner /> : 'Confirmer'}
                        </button>
                        <button className="modal-button reject-button" onClick={() => setConfirm({ ...confirm, willMarkAsSold: false })}>
                            Annuler
                        </button>
                    </div>
                </Modal>
            )}
            <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
};
