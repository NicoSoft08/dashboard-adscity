import { faImages, faInfoCircle, faMapMarker, faTags } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import data from '../../json/data.json';
import { typeOfPrice } from '../../data/database';
// import '../../styles/Tabs.scss';

export default function Tab({ post }) {
    const [activeTab, setActiveTab] = useState('category');
    const [postData, setPostData] = useState(post || { details: { title: '', description: '' } });
    const [images, setImages] = useState(post?.images || []);

    useEffect(() => {
        setPostData(post || { details: { title: '', description: '' } });
    }, [post]); // Met à jour les données quand `post` change

    const tabs = [
        { id: 'category', label: 'Catégorie', icon: faTags },
        { id: 'details', label: 'Détails', icon: faInfoCircle },
        { id: 'location', label: 'Localisation', icon: faMapMarker },
        { id: 'photos', label: 'Photos', icon: faImages }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let updatedValue;

        if (type === 'checkbox') {
            const currentValues = postData.details?.[name] || [];
            updatedValue = checked
                ? [...currentValues, value]
                : currentValues.filter(v => v !== value);
        } else if (type === 'number') {
            updatedValue = value === '' ? '' : Number(value);
        } else {
            updatedValue = value;
        }

        setPostData((prev) => ({
            ...prev,
            details: {
                ...prev.details,
                [name]: updatedValue, // Mise à jour dynamique du champ
            },
        }));
    };

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        const newImages = files.map(file => URL.createObjectURL(file)); // Pour l'aperçu immédiat
        setImages(prevImages => [...prevImages, ...newImages]);
    };

    const handleRemoveImage = (index) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
    };

    const handleReplaceImage = (event, index) => {
        const file = event.target.files[0];
        if (!file) return;

        const newImageUrl = URL.createObjectURL(file);
        setImages(prevImages => prevImages.map((img, i) => (i === index ? newImageUrl : img)));
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'category':
                return (
                    <div className="tab-content">
                        <label>
                            Catégorie:
                        </label>
                        <input
                            type='text'
                            name='category'
                            value={postData?.category}
                            onChange={handleChange}
                            readOnly
                        />

                        <label>
                            Sous-catégorie:
                        </label>
                        <select name='subcategory' onChange={handleChange}>
                            {data.categories
                                .find(cat => cat.categoryName === postData?.category)?.container.map(
                                    (subcat) => (
                                        <option key={subcat.id} value={subcat.sousCategoryName}>
                                            {subcat.sousCategoryTitles.fr}
                                        </option>
                                    )
                                )
                            }
                        </select>
                    </div>
                );
            case 'details':
                return (
                    <div className="tab-content">
                        <label>
                            Titre:
                        </label>
                        <input
                            type='text'
                            name='title'
                            value={postData?.details?.title}
                            onChange={handleChange}
                        />

                        <label>
                            Description:
                        </label>
                        <textarea
                            type='text'
                            name='description'
                            value={postData?.details?.description}
                            onChange={handleChange}
                        />
                        {postData?.details.productName !== undefined
                            ?
                            <>
                                <label>
                                    Nom du produit:
                                </label>
                                <input
                                    type='text'
                                    name='productName'
                                    value={postData?.details.productName}
                                    onChange={handleChange}
                                />
                            </>
                            : null
                        }

                        <label>
                            Type de Prix:
                        </label>
                        <select name='price_type' onChange={handleChange}>
                            {typeOfPrice.fr.map((type, index) => (
                                <option key={index} value={type || postData?.details?.priceType}>
                                    {type}
                                </option>
                            ))}
                        </select>

                        <label>
                            Prix:
                        </label>
                        <input
                            type='number'
                            name='price'
                            value={postData?.details?.price}
                            onChange={handleChange}
                        />
                        {/* Other details */}
                    </div>
                );
            case 'location':
                return (
                    <div className="tab-content">
                        <label>
                            Pays:
                        </label>
                        <input
                            type='text'
                            name='country'
                            value={postData?.location?.country}
                            onChange={handleChange}
                            readOnly
                        />

                        <label>
                            Ville:
                        </label>
                        <input
                            type='text'
                            name='city'
                            value={postData?.location?.city}
                            onChange={handleChange}
                            readOnly
                        />

                        <label>
                            Adresse:
                        </label>
                        <input
                            type='text'
                            name='address'
                            value={postData?.location?.address}
                            onChange={handleChange}
                            readOnly
                        />
                    </div>
                );
            case 'photos':
                return (
                    <div className="image-grid">
                        {images.map((image, index) => (
                            <div key={index} className="image-wrapper">
                                <img src={image} alt={`photo-${index}`} className="review-image" />

                                {/* Supprimer une image */}
                                <button className="delete-btn" onClick={() => handleRemoveImage(index)}>❌</button>

                                {/* Champ caché pour remplacer une image */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleReplaceImage(e, index)}
                                    style={{ display: "none" }}
                                    id={`replace-input-${index}`}
                                />
                                <button className="replace-btn" onClick={() => document.getElementById(`replace-input-${index}`).click()}>
                                    🔄 Remplacer
                                </button>
                            </div>
                        ))}

                        {/* Ajout de nouvelles images */}
                        <div className="upload-wrapper">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                id="upload-input"
                                style={{ display: "none" }}
                            />
                            <button className="add-btn" onClick={() => document.getElementById("upload-input").click()}>
                                ➕ Ajouter des images
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="ad-tabs">
            <div className="tabs-header">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <FontAwesomeIcon icon={tab.icon} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            <div className="tab-content-container">
                {renderContent()}
            </div>
        </div>
    );
};
