import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import formFields from '../json/formFields.json';
import { fetchPostById, updatePost } from '../routes/post';
import { logClientAction } from '../routes/api';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../firebaseConfig';
import { Loading, Spinner, Toast } from '../customs';
import InputField from '../components/input-field/InputField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faCircleXmark, faCloudUpload } from '@fortawesome/free-solid-svg-icons';
import { uploadImage } from '../routes/storage';
import '../styles/EditPostID.scss';

export default function EditPostID() {
    const { currentUser, userData } = useContext(AuthContext);
    const { post_id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ details: {}, images: [] });
    const [fields, setFields] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [postID, setPostID] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const result = await fetchPostById(post_id);
            if (result.success) {
                const postDetails = result.data;
                const { subcategory } = postDetails || {};

                setPostID(postDetails.postID);
                setFormData({ images: postDetails.images || [] });

                const categoryFields = formFields.fields[subcategory] || [];
                setFields(categoryFields);

                const initialFormData = { ...postDetails };
                categoryFields.forEach(field => {
                    if (!(field.name in initialFormData.details)) {
                        initialFormData.details[field.name] =
                            field.type === "checkbox" ? [] :
                                field.type === "file" ? [] : "";
                    }
                });

                setFormData(initialFormData);
            }
            setLoading(false);
        };

        if (post_id) fetchData();
    }, [post_id]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        setFormData(prev => {
            let newValue = value;
            if (type === "checkbox") {
                newValue = checked ? [...(prev.details?.[name] || []), value] :
                    prev.details?.[name]?.filter(v => v !== value) || [];
            }
            if (type === "file") {
                newValue = files ? [...files] : [];
            }

            return {
                ...prev,
                details: { ...prev.details, [name]: newValue }
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const isValidForm = () => {
            return fields.every(field => {
                if (field.required) {
                    const value = formData.details?.[field.name];
                    return value !== undefined && value !== '';
                }
                return true;
            });
        };
        if (!isValidForm()) {
            setToast({ show: true, message: 'Veuillez remplir tous les champs obligatoires.', type: 'error' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            const { details, images } = formData;
            const updatedData = { details, images };
            const result = await updatePost(postID, updatedData, currentUser?.uid);
            if (result.success) {
                setToast({ show: true, message: result.message, type: 'success' });
                logEvent(analytics, 'update_post');
                await logClientAction(
                    currentUser?.uid,
                    'Mise à jour de l\'annonce',
                    "Vous avez mis à jour l'annonce avec succès.",
                )
                setTimeout(() => {
                    setToast({ show: false, message: '', type: '' });
                    navigate('/user/dashboard/posts');
                }, 2000);
            } else {
                setToast({ show: true, message: result.error, type: 'error' });
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'annonce:', error);
            setToast({ show: true, message: 'Erreur lors de la mise à jour de l\'annonce', type: 'error' });
        }
        setLoading(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        handleImageUpload(files);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        handleImageUpload(files);
    };

    const handleImageUpload = async (filesArray) => {
        if (!filesArray || filesArray.length === 0) return;

        const maxPhotos = getUserPlanMaxPhotos();
        const currentImages = formData.images || [];
        if (currentImages.length + filesArray.length > maxPhotos) {
            setToast({ show: true, message: `Maximum ${maxPhotos} images autorisées.`, type: 'error' });
            return;
        }

        setIsUploading(true);
        setToast({ show: true, message: 'Téléchargement en cours...', type: 'info' });

        try {
            const userID = currentUser?.uid;
            const uploadPromises = filesArray.map(file => uploadImage(file, userID));
            const results = await Promise.all(uploadPromises);

            const uploadedImages = results.filter(res => res.success).map(res => res.imageUrl);
            if (uploadedImages.length) {
                const newImages = [...currentImages, ...uploadedImages].slice(0, maxPhotos);
                setFormData(prev => ({ ...prev, images: newImages }));
            } else {
                setToast({ show: true, message: 'Échec du téléchargement.', type: 'error' });
            }
            setToast({ show: true, message: 'Téléchargement terminé.', type: 'success' });
        } catch (error) {
            console.error("Erreur lors de l'upload :", error);
            setToast({ show: true, message: 'Une erreur est survenue.', type: 'error' });
        }

        setIsUploading(false);
    };

    const handleRemoveImage = async (index) => {
        if (window.confirm("Supprimer cette image ?")) {
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }));
        }
    };

    const getUserPlanMaxPhotos = () => {
        if (!userData?.plans) return 3;
        const userPlan = Object.values(userData.plans).find(plan => plan.max_photos !== undefined);
        return userPlan ? userPlan.max_photos : 3;
    };

    if (loading) return <Loading />;

    return (
        <div className='edit-post-id'>
            <div className="head">
                <FontAwesomeIcon icon={faChevronLeft} title='Go Back' onClick={() => navigate('/user/dashboard/posts')} />
                <h2>Modifier: {post_id.toUpperCase()}</h2>
            </div>

            <form onSubmit={handleSubmit} className="edit-form">
                <div className="image-upload-form">
                    <div className="upload-instructions">
                        Cliquez ou glissez jusqu'à {getUserPlanMaxPhotos()} images
                    </div>

                    <div
                        className={`upload-area ${isUploading ? 'uploading' : ''}`}
                        onClick={() => fileInputRef.current.click()}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        tabIndex={0}
                        role="button"
                        onKeyPress={(e) => e.key === 'Enter' && fileInputRef.current.click()}
                    >
                        <FontAwesomeIcon icon={faCloudUpload} className="upload-icon" />
                        <p className="upload-text">{isUploading ? 'Téléchargement...' : 'Cliquez ou glissez vos images ici'}</p>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileSelect}
                        />
                    </div>

                    <div className="image-upload-grid">
                        {formData.images && formData.images.map((image, index) => (
                            <div className="image-container" key={index}>
                                <img src={image} alt={`upload-${index}`} className="uploaded-image" />
                                <FontAwesomeIcon
                                    icon={faCircleXmark}
                                    className="remove-icon"
                                    onClick={() => handleRemoveImage(index)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {fields.map(({ name, label, type, multiple, placeholder, options, required }) => (
                    <InputField
                        key={name}
                        label={label}
                        name={name}
                        placeholder={placeholder}
                        type={type}
                        required={required}
                        multiple={multiple}
                        options={options}
                        value={formData.details?.[name] || (type === "checkbox" ? [] : "")}
                        onChange={handleChange}
                    />
                ))}

                <button type="submit" disabled={loading || isUploading}>
                    {loading ? <Spinner /> : "Enregistrer"}
                </button>
            </form>

            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, ...toast })} />
        </div>
    );
};
