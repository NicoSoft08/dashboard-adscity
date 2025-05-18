import React, { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Spinner, Toast } from '../customs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faFont, faImage, faVideo } from '@fortawesome/free-solid-svg-icons';
import { uploadStatusMedia } from '../routes/storage';
import { createNewStatus } from '../routes/status';
import '../styles/NewStatus.scss';

const MAX_FILE_SIZE_MB = 30; // 30MB maximum file size

export default function NewStatus() {
    const { currentUser } = useContext(AuthContext);
    const [statusType, setStatusType] = useState('text');
    const [text, setText] = useState('');
    const [media, setMedia] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [backgroundColor, setBackgroundColor] = useState('#4CAF50');
    const [fontStyle, setFontStyle] = useState('default');
    const [privacy, setPrivacy] = useState('all');
    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const backgroundColors = [
        '#4CAF50', '#2196F3', '#F44336', '#FF9800',
        '#9C27B0', '#3F51B5', '#009688', '#795548'
    ];

    const fontStyles = [
        { name: 'default', label: 'Défaut' },
        { name: 'bold', label: 'Gras' },
        { name: 'italic', label: 'Italique' },
        { name: 'handwritten', label: 'Manuscrit' }
    ];

    const handleBack = () => {
        navigate('/status');
    };

    // Function to validate file size
    const validateFileSize = (file) => {
        const fileSizeMB = file.size / (1024 * 1024);
        return fileSizeMB <= MAX_FILE_SIZE_MB;
    };

    // Function to validate file types
    const validateFile = (file) => {
        // Define allowed extensions
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'mp4'];
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'video/mp4'];

        // Get file extension
        const fileExtension = file.name.split('.').pop().toLowerCase();

        // Check extension and MIME type
        const isValidType = allowedExtensions.includes(fileExtension) && allowedMimeTypes.includes(file.type);

        // Check file size
        const isValidSize = validateFileSize(file);

        return {
            isValid: isValidType && isValidSize,
            reason: !isValidType ? 'type' : !isValidSize ? 'size' : null
        };
    };

    const sanitizeFileName = (fileName) => {
        // Remove special characters and spaces
        return fileName
            .replace(/[^\w\s.-]/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase();
    };

    // Handle media selection
    const handleMediaSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileType = file.type.split('/')[0];
        if (fileType !== 'image' && fileType !== 'video') {
            alert('Veuillez sélectionner une image ou une vidéo');
            return;
        }

        setMedia(file);
        setStatusType(fileType);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setMediaPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // Handle media upload
    const uploadMedia = async () => {
        if (!media) return null;

        // Validate file before uploading
        const validation = validateFile(media);
        if (!validation.isValid) {
            const errorMessage = validation.reason === 'type'
                ? 'Type de fichier non pris en charge. Utilisez JPG, PNG ou MP4.'
                : 'Fichier trop volumineux. Maximum 10MB.';

            setToast({
                show: true,
                type: 'error',
                message: errorMessage,
            });
            return null;
        }

        // Sanitize the filename
        const sanitizedFileName = sanitizeFileName(media.name);
        const mediaWithSanitizedName = new File([media], sanitizedFileName, { type: media.type });

        setIsUploading(true);

        try {

            const idToken = await currentUser.getIdToken();
            const response = await uploadStatusMedia(mediaWithSanitizedName, currentUser.uid, idToken);

            if (!response.success) {
                throw new Error(response.message || 'Error uploading media');
            }

            setIsUploading(false);
            return response.publicUrl;
        } catch (error) {
            console.error('Error uploading media:', error);
            setIsUploading(false);
            return null;
        }
    };

    // Create status
    const createStatus = async () => {
        if (statusType === 'text' && !text.trim()) {
            alert('Veuillez entrer du texte pour votre statut');
            return;
        }

        if ((statusType === 'image' || statusType === 'video') && !media) {
            alert('Veuillez sélectionner un média pour votre statut');
            return;
        }

        try {
            let publicUrl = null;

            if (statusType !== 'text') {
                publicUrl = await uploadMedia();
                if (!publicUrl) return;
            }

            setIsUploading(true);

            const statusData = {
                type: statusType,
                content: {
                    text: text.trim(),
                    mediaURL: publicUrl
                },
                backgroundColor: statusType === 'text' ? backgroundColor : null,
                fontStyle: statusType === 'text' ? fontStyle : 'default',
                privacy
            };

            const userID = currentUser.uid;
            const idToken = await currentUser.getIdToken();

            const response = await createNewStatus(statusData, userID, idToken);
            if (response.success) {
                navigate('/user/dashboard/status');
                setToast({
                    show: true,
                    type: 'success',
                    message: 'Statut créé avec succès !',
                });
                setIsUploading(false);
            } else {
                setToast({
                    show: true,
                    type: 'error',
                    message: 'Erreur lors de la création du statut. Veuillez réessayer.',
                });
                setIsUploading(false);
            }
        } catch (error) {
            console.error('Error creating status:', error);
            setToast({
                show: true,
                type: 'error',
                message: 'Erreur lors de la création du statut. Veuillez réessayer.',
            });
            setIsUploading(false);
        }
    };

    return (
        <div className="status-creator">
            <div className="creator-header">
                <div className="back">
                    <FontAwesomeIcon icon={faChevronLeft} title='Go Back' onClick={handleBack} />
                </div>
                <h2>Ajout de statut</h2>
            </div>

            <div className="creator-content">
                {/* Type selector */}
                <div className="type-selector">
                    <button
                        className={`type-button ${statusType === 'text' ? 'active' : ''}`}
                        onClick={() => setStatusType('text')}
                    >
                        <FontAwesomeIcon icon={faFont} />
                        <span>Texte</span>
                    </button>

                    <button
                        className={`type-button ${statusType === 'image' ? 'active' : ''}`}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <FontAwesomeIcon icon={faImage} />
                        <span>Image</span>
                    </button>

                    <button
                        className={`type-button ${statusType === 'video' ? 'active' : ''}`}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <FontAwesomeIcon icon={faVideo} />
                        <span>Vidéo</span>
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*,video/*"
                        onChange={handleMediaSelect}
                    />
                </div>

                {/* Preview area */}
                <div
                    className={`status-preview ${statusType === 'text' ? 'text-preview' : 'media-preview'}`}
                    style={statusType === 'text' ? { backgroundColor } : {}}
                >
                    {statusType === 'text' ? (
                        <div className={`preview-text ${fontStyle}`}>
                            {text || 'Tapez votre texte ici...'}
                        </div>
                    ) : mediaPreview ? (
                        statusType === 'image' ? (
                            <img src={mediaPreview} alt="Preview" />
                        ) : (
                            <video src={mediaPreview} controls />
                        )
                    ) : (
                        <div className="no-media">
                            <FontAwesomeIcon icon={statusType === 'image' ? faImage : faVideo} />
                            <p>Cliquez pour sélectionner un {statusType === 'image' ? 'une image' : 'une vidéo'}</p>
                        </div>
                    )}
                </div>

                {/* Text input */}
                <div className="text-input-container">
                    <textarea
                        className="status-text-input"
                        placeholder={statusType === 'text' ? 'Que voulez-vous partager?' : 'Ajouter une légende (optionnel)'}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={statusType === 'text' ? 4 : 2}
                        maxLength={500}
                    ></textarea>
                    <div className="text-counter">{text.length}/500</div>
                </div>

                {/* Style options for text status */}
                {statusType === 'text' && (
                    <div className="style-options">
                        <div className="color-picker">
                            <label>Couleur de fond:</label>
                            <div className="color-options">
                                {backgroundColors.map(color => (
                                    <div
                                        key={color}
                                        className={`color-option ${backgroundColor === color ? 'selected' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setBackgroundColor(color)}
                                    ></div>
                                ))}
                            </div>
                        </div>

                        <div className="font-picker">
                            <label>Style de texte:</label>
                            <div className="font-options">
                                {fontStyles.map(style => (
                                    <button
                                        key={style.name}
                                        className={`font-option ${fontStyle === style.name ? 'selected' : ''}`}
                                        onClick={() => setFontStyle(style.name)}
                                    >
                                        {style.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Privacy options */}
                <div className="privacy-options">
                    <label>Qui peut voir ce statut:</label>
                    <select
                        value={privacy}
                        onChange={(e) => setPrivacy(e.target.value)}
                        className="privacy-selector"
                    >
                        <option value="public">Public</option>
                        <option value="to_follower">Mes abonnés</option>
                        <option value="without_follower">Sans mes abonnés</option>
                    </select>
                </div>

                {/* Action buttons */}
                <div className="action-buttons">
                    <button
                        className="cancel-button"
                        onClick={() => navigate('/user/dashboard/status')}
                    >
                        Annuler
                    </button>
                    <button
                        className="create-button"
                        onClick={createStatus}
                        disabled={isUploading}
                    >
                        {isUploading ? <Spinner /> : 'Publier le statut'}
                    </button>
                </div>
            </div>
            <Toast type={toast.type} message={toast.message} show={toast.show} onClose={() => setToast({ show: false })} />
        </div>
    );
};
