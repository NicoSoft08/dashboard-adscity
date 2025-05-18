import React, { useContext, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { AuthContext } from '../contexts/AuthContext';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import '../styles/Verification.scss';

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Verification() {
    const { userData } = useContext(AuthContext);
    const [loading, setLoading] = useState({ identity: true, selfie: true });

    // Handle image loading state
    const handleImageLoaded = (type) => {
        setLoading(prev => ({ ...prev, [type]: false }));
    };

    // Handle image error
    const handleImageError = (type) => {
        setLoading(prev => ({ ...prev, [type]: false }));
        console.error(`Error loading ${type} image`);
    };

    // Check if a URL is for a PDF file
    const isPdfUrl = (url) => {
        if (!url) return false;
        return url.toLowerCase().includes('.pdf') ||
            url.toLowerCase().includes('application/pdf') ||
            url.includes('_document');  // Based on your URL pattern
    };

    // Format date function
    const formatDate = (dateValue) => {
        if (!dateValue) return 'Non spécifié';

        let date;

        // Handle Firestore Timestamp
        if (dateValue && typeof dateValue._seconds === 'number') {
            date = new Date(dateValue._seconds * 1000);
        }
        // Handle regular timestamp (seconds)
        else if (typeof dateValue === 'number') {
            date = new Date(dateValue * 1000);
        }
        // Handle string or Date object
        else {
            date = new Date(dateValue);
        }

        if (isNaN(date.getTime())) {
            return 'Date invalide';
        }

        return format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
    };

    // Get status badge class and text
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return { class: 'status-pending', text: 'En attente de vérification' };
            case 'approved':
                return { class: 'status-approved', text: 'Vérifié' };
            case 'rejected':
                return { class: 'status-rejected', text: 'Rejeté' };
            default:
                return { class: 'status-none', text: 'Non soumis' };
        }
    };

    const statusBadge = getStatusBadge(userData.verificationStatus);

    const hasDocuments = userData.documents &&
        (userData.documents.identityDocument || userData.documents.selfie);

    // Fallback for PDF rendering
    const renderDocumentPreview = (url) => {
        if (isPdfUrl(url)) {
            return (
                <div className="pdf-preview">
                    <div className="pdf-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <p>Document PDF</p>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-pdf-btn"
                    >
                        Voir le document
                    </a>
                </div>
            );
        }
        return (
            <img
                src={url}
                alt="Pièce d'identité"
                onLoad={() => handleImageLoaded('identity')}
                onError={() => handleImageError('identity')}
                style={{ display: loading.identity ? 'none' : 'block' }}
            />
        );
    };

    return (
        <div className='tab-content'>
            <div className="tab-name">Vérification de documents</div>

            <div className="verification-status">
                <span className={`status-badge ${statusBadge.class}`}>
                    {statusBadge.text}
                </span>

                {userData.verificationStatus === 'rejected' && userData.rejectionReason && (
                    <div className="rejection-reason">
                        <strong>Motif du rejet:</strong> {userData.rejectionReason}
                    </div>
                )}
            </div>

            {hasDocuments ? (
                <div className="documents-container">
                    {userData.documents.identityDocument && (
                        <div className="document-card">
                            <h3>Pièce d'identité</h3>
                            <div className="document-image-container">
                                {renderDocumentPreview(userData.documents.identityDocument)}
                            </div>
                            <div className="document-info">
                                <p>Document soumis le {formatDate(userData.updatedAt)}</p>
                            </div>
                        </div>
                    )}

                    {userData.documents.selfie && (
                        <div className="document-card">
                            <h3>Selfie</h3>
                            <div className="document-image-container">
                                {loading.selfie && <div className="loading-spinner">Chargement...</div>}
                                <img
                                    src={userData.documents.selfie}
                                    alt="Selfie avec pièce d'identité"
                                    onLoad={() => handleImageLoaded('selfie')}
                                    onError={() => handleImageError('selfie')}
                                    style={{ display: loading.selfie ? 'none' : 'block' }}
                                />
                            </div>
                            <div className="document-info">
                                <p>Photo soumise le {formatDate(userData.updatedAt)}</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="no-documents">
                    <p>Aucun document de vérification n'a été soumis.</p>
                </div>
            )}

            {userData?.verificationStatus === 'approved' && (
                <div className="verification-note success-note">
                    <p>Votre vérification a été approuvée.</p>
                    <p>Vous pouvez désormais créer des annonces dans les catégories sensibles. À noter que la vérification n'empêche en rien que votre compte soit signalé. Elle constitue une couche de sécurité supplémentaire.</p>
                </div>
            )}

            {userData.verificationStatus === 'pending' && (
                <div className="verification-note">
                    <p>Les documents sont en cours d'examen. Vous serez notifié une fois la vérification terminée.</p>
                </div>
            )}
        </div>
    );
};
