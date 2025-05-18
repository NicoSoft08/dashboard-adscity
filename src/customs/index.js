import React, { useContext, useEffect, useRef, useState } from "react";
import { Dots } from "react-activity";
import { letterWhiteBgBlue, textBlueWithoutBg } from "../config";
import { translations } from "../langs/translations";
import { LanguageContext } from "../contexts/LanguageContext";
import "react-activity/dist/library.css";
import '../styles/customs.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faChevronLeft, faChevronRight, faExclamationCircle, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";

export const Loading = () => {
    const { language } = useContext(LanguageContext)
    const t = translations[language] || translations.FR;

    return (
        <div className="loading-modal">
            <div className="loading-container">
                <img src={letterWhiteBgBlue} alt="AdsCity" className="loading-logo" />
                <div className="loading-header">
                    <img src={textBlueWithoutBg} alt="AdsCity" className="loading-text" />
                </div>
                <span className="loading-span">
                    {t.loading}
                </span>
                <div className="loading-spinner"></div>
            </div>
        </div>
    );
};

export const Spinner = () => {
    return <Dots />
};


export const Toast = ({ type = 'info', message, show, onClose, duration = 3000 }) => {
    const [progress, setProgress] = useState(100);
    useEffect(() => {
        if (show) {
            let interval = null;

            const startTime = Date.now();
            interval = setInterval(() => {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(duration - elapsedTime, 0);
                setProgress((remainingTime / duration) * 100);

                if (remainingTime <= 0) {
                    clearInterval(interval);
                    onClose();
                }
            }, 50);

            return () => clearInterval(interval);
        }
    }, [show, onClose, duration]);

    const renderIcon = () => {
        switch (type) {
            case 'success':
                return faCheckCircle;
            case 'error':
                return faExclamationCircle;
            case 'info':
                return faInfoCircle;
            default:
                return faInfoCircle;
        }
    };

    return (
        show && (
            <div className={`toast ${type}`}>
                <FontAwesomeIcon className="toast-icon" icon={renderIcon()} />
                <div className="toast-message">
                    <p>{message}</p>
                </div>
                <span className="close" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></span>
                <div className="toast-progress-bar">
                    <div className="progress" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        )
    );
}

export const Modal = ({ onShow, onHide, isHide, hideText, title, children, isNext, onNext, nextText }) => {
    if (!onShow) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onHide}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h4 className="modal-title">{title}</h4>
                    <button className="close-button" onClick={onHide}>
                        &times;
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                <div className={`modal-footer ${isNext ? "space-between" : "flex-end"}`}>
                    {isNext ? (
                        <button className="modal-button next" onClick={onNext}>
                            {nextText}
                        </button>
                    ) : null}
                    {isHide ? (
                        <button className="modal-button hide" onClick={onHide}>
                            {hideText}
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};


export const Menu = ({ onClose, isOpen, options }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="menu" ref={menuRef}>
            {options.map((option, index) => (
                <div key={index} className="menu-item" onClick={option.action}>
                    <FontAwesomeIcon icon={option.icon} />
                    <span>{option.label}</span>
                </div>
            ))}
        </div>
    )
}

export const Pagination = ({ currentPage, elements, elementsPerPage, paginate }) => {
    const totalPages = Math.ceil(elements.length / elementsPerPage);

    // Définir les numéros de page visibles
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, startPage + 2);
    const pageNumbers = [];

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="pagination">
            {/* Bouton précédent */}
            <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="page-btn"
            >
                <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            {/* Affichage des pages */}
            {pageNumbers.map((page) => (
                <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                >
                    {page}
                </button>
            ))}

            {/* Bouton suivant */}
            <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="page-btn"
            >
                <FontAwesomeIcon icon={faChevronRight} />
            </button>
        </div>
    );
}