import { differenceInHours, format, parseISO } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import React, { useMemo, useState } from 'react';
import FormData from '../../utils/form-data/FormData';
import './PostCard.scss';

const ImageGallery = ({ images = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (images.length === 0) {
        return <p>Aucune image disponible.</p>;
    }

    // 🔹 Aller à l'image suivante
    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    // 🔹 Aller à l'image précédente
    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    // 🔹 Sélectionner une image spécifique via la miniature
    const handleSelectImage = (index) => {
        setCurrentIndex(index);
    };

    return (
        <div className="image-gallery">
            <div className="main-image-container">
                <button className="nav-button left" onClick={handlePrev}>
                    ‹
                </button>

                <img
                    src={images[currentIndex]}
                    alt={`Slide ${currentIndex + 1}`}
                    className="main-image"
                />

                <button className="nav-button right" onClick={handleNext}>
                    ›
                </button>
            </div>

            <div className="thumbnails">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => handleSelectImage(index)}
                    >
                        <img src={img} alt={`Thumbnail ${index + 1}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

const PostTimelineProgress = ({ post, language }) => {

    const { posted_at, expiresAt, expiry_date, moderated_at } = post || {};
    const locale = language === 'FR' ? fr : enUS;

    const timelineData = useMemo(() => {
        // Use the appropriate date fields based on what's available
        const publishDateField = posted_at || moderated_at;
        const expireDateField = expiresAt || expiry_date;

        if (!publishDateField || !expireDateField) {
            return {
                isValid: false,
                message: language === 'FR' ?
                    "Dates de publication non disponibles" :
                    "Publication dates not available"
            };
        }

        try {
            const now = new Date();

            // Handle different possible formats for publish date
            let publishDate;
            if (typeof publishDateField === 'string') {
                // Try to parse as ISO string
                publishDate = parseISO(publishDateField);
            } else if (publishDateField._seconds) {
                // Handle Firestore timestamp
                publishDate = new Date(publishDateField._seconds * 1000);
            } else if (publishDateField.seconds) {
                // Alternative Firestore timestamp format
                publishDate = new Date(publishDateField.seconds * 1000);
            } else {
                // Try as Date object or timestamp
                publishDate = new Date(publishDateField);
            }

            // Handle different possible formats for expiry date
            let expireDate;
            if (typeof expireDateField === 'string') {
                // Try to parse as ISO string
                expireDate = parseISO(expireDateField);
            } else if (expireDateField._seconds) {
                // Handle Firestore timestamp
                expireDate = new Date(expireDateField._seconds * 1000);
            } else if (expireDateField.seconds) {
                // Alternative Firestore timestamp format
                expireDate = new Date(expireDateField.seconds * 1000);
            } else {
                // Try as Date object or timestamp
                expireDate = new Date(expireDateField);
            }

            // Check if dates are valid
            if (isNaN(publishDate.getTime()) || isNaN(expireDate.getTime())) {
                console.error("Invalid dates:", { publishDate, expireDate, publishDateField, expireDateField });
                return {
                    isValid: false,
                    message: language === 'FR' ?
                        "Dates de publication invalides" :
                        "Invalid publication dates"
                };
            }

            // Calculate total duration and elapsed time
            const totalDuration = differenceInHours(expireDate, publishDate);
            const elapsedTime = differenceInHours(now, publishDate);
            const remainingTime = differenceInHours(expireDate, now);

            // Calculate progress percentage
            let progressPercentage = Math.round((elapsedTime / totalDuration) * 100);

            // Ensure percentage is between 0 and 100
            progressPercentage = Math.max(0, Math.min(progressPercentage, 100));

            // Format dates for display
            const formattedPublishDate = format(publishDate, 'PPP', { locale });
            const formattedExpireDate = format(expireDate, 'PPP', { locale });

            // Determine status
            let status;
            let statusClass;

            if (now < publishDate) {
                status = language === 'FR' ? "Programmée" : "Scheduled";
                statusClass = "scheduled";
            } else if (now > expireDate) {
                status = language === 'FR' ? "Expirée" : "Expired";
                statusClass = "expired";
            } else {
                status = language === 'FR' ? "Active" : "Active";
                statusClass = "active";
            }

            // Calculate days for display
            const totalDays = Math.ceil(totalDuration / 24);
            const elapsedDays = Math.floor(elapsedTime / 24);
            const remainingDays = Math.ceil(remainingTime / 24);

            return {
                isValid: true,
                publishDate,
                expireDate,
                formattedPublishDate,
                formattedExpireDate,
                progressPercentage,
                totalDuration,
                elapsedTime,
                remainingTime,
                totalDays,
                elapsedDays,
                remainingDays,
                status,
                statusClass
            };
        } catch (error) {
            console.error("Error calculating post timeline:", error);
            return {
                isValid: false,
                message: language === 'FR' ?
                    "Erreur lors du calcul de la chronologie" :
                    "Error calculating timeline"
            };
        }
    }, [posted_at, expiresAt, expiry_date, moderated_at, language, locale]);

    if (!timelineData.isValid) {
        return (
            <div className="post-timeline-error">
                {timelineData.message}
            </div>
        );
    }


    return (
        <div className="post-timeline-progress">
            <div className="timeline-header">
                <div className="timeline-status">
                    <span className={`status-badge ${timelineData.statusClass}`}>
                        {timelineData.status}
                    </span>
                </div>
                <div className="timeline-dates">
                    <div className="publish-date">
                        <span className="date-label">
                            {language === 'FR' ? "Publiée le:" : "Published on:"}
                        </span>
                        <span className="date-value">{timelineData.formattedPublishDate}</span>
                    </div>
                    <div className="expire-date">
                        <span className="date-label">
                            {language === 'FR' ? "Expire le:" : "Expires on:"}
                        </span>
                        <span className="date-value">{timelineData.formattedExpireDate}</span>
                    </div>
                </div>
            </div>

            <div className="timeline-progress-container">
                <div
                    className="timeline-progress-bar"
                    style={{ width: `${timelineData.progressPercentage}%` }}
                >
                    <span className="progress-percentage">
                        {timelineData.progressPercentage}%
                    </span>
                </div>
            </div>

            <div className="timeline-markers">
                <div className="marker start">0%</div>
                <div className="marker quarter">25%</div>
                <div className="marker half">50%</div>
                <div className="marker three-quarter">75%</div>
                <div className="marker end">100%</div>
            </div>

            <div className="timeline-stats">
                <div className="stat-item">
                    <div className="stat-value">{timelineData.totalDays}</div>
                    <div className="stat-label">
                        {language === 'FR' ? "Jours totaux" : "Total days"}
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{timelineData.elapsedDays}</div>
                    <div className="stat-label">
                        {language === 'FR' ? "Jours écoulés" : "Days elapsed"}
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{timelineData.remainingDays}</div>
                    <div className="stat-label">
                        {language === 'FR' ? "Jours restants" : "Days remaining"}
                    </div>
                </div>
            </div>

            {/* Visual timeline representation */}
            <div className="timeline-visual">
                <div className="timeline-line"></div>
                <div className="timeline-point publish">
                    <div className="point-marker"></div>
                    <div className="point-label">
                        {language === 'FR' ? "Publication" : "Published"}
                    </div>
                </div>
                <div
                    className="timeline-point current"
                    style={{ left: `${timelineData.progressPercentage}%` }}
                >
                    <div className="point-marker"></div>
                    <div className="point-label">
                        {language === 'FR' ? "Aujourd'hui" : "Today"}
                    </div>
                </div>
                <div className="timeline-point expire">
                    <div className="point-marker"></div>
                    <div className="point-label">
                        {language === 'FR' ? "Expiration" : "Expires"}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function PostCard({ post, language }) {
    const { details, images, location, isSold } = post;
    return (
        <div className='post-card'>

            <ImageGallery images={images} />

            <div className="ad-details">
                <h2>{details.title}</h2>
                <p className="price">{details.price} RUB • {details.price_type}</p>
                <p className="description">{details.description}</p>
            </div>

            {isSold && <span className="sold-badge">VENDU</span>}

            <div className="specs">
                <FormData details={details} />
            </div>

            <div className="location">
                <p>{location.address}, {location.city}, {location.country}</p>
            </div>
            <PostTimelineProgress post={post} language={language} />
        </div>
    );
};
