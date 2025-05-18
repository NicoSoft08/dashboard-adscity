import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { translations } from '../langs/translations';
import { LanguageContext } from '../contexts/LanguageContext';
import { Modal, Spinner, Toast } from '../customs';
import { facebook, instagram, whatsapp } from '../config/images';
import { updateSocialLinks } from '../routes/api';
import '../styles/Settings.scss';

export default function Settings() {
    const { currentUser, userData, logout } = useContext(AuthContext);
    const { language, setLanguage } = useContext(LanguageContext);
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const t = translations[language] || translations.FR;
    const [socialInfo, setSocialInfo] = useState({
        facebook: "",
        whatsapp: "",
        instagram: "",
    });

    const handleSocialInputChange = (e) => {
        const { name, value } = e.target;
        setSocialInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleOpen = () => setOpen(true);

    const handleLogout = async () => {
        setIsLoading(true);

        try {
            const response = await logout();

            setToast({
                show: true,
                message: response.message,
                type: response.success ? 'success' : 'error',
            });

            if (response.success) {
                navigate('/');
                setOpen(false);
            }
        } catch (error) {
            setToast({
                show: true,
                message: "Erreur lors de la déconnexion. Veuillez réessayer.",
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccountDeletion = async () => {
        setShowModal(true); // Ouvre le Modal
    }

    const closeModal = () => {
        setShowModal(false); // Ferme le Modal
    };

    const handleSocialInfoUpdate = async () => {
        // Vérifier si au moins un champ est rempli
        const hasAtLeastOneValue = Object.values(socialInfo).some(value => value.trim() !== "");

        if (!hasAtLeastOneValue) {
            setToast({
                type: 'error',
                show: true,
                message: "Veuillez entrer au moins un réseau social avant d'enregistrer.",
            });
            return;
        }

        const result = await updateSocialLinks(currentUser?.uid, socialInfo);

        if (result.success) {
            setToast({
                type: 'info',
                show: true,
                message: result.message,
            });
        } else {
            setToast({
                type: 'error',
                show: true,
                message: result.message,
            });
        };
    };

    // Composant de toggle de langue
    const LanguageToggle = () => {
        const toggleLanguage = () => {
            setLanguage(language === 'FR' ? 'EN' : 'FR');
            // translate();
        };

        return (
            <div className="language-toggle">
                <span className={language === 'FR' ? 'active' : ''}>FR</span>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={language === 'EN'}
                        onChange={toggleLanguage}
                    />
                    <span className="slider round"></span>
                </label>
                <span className={language === 'EN' ? 'active' : ''}>EN</span>
            </div>
        );
    };

    return (
        <div className='user-settings'>
        <h2>{t.settings}</h2>

        {/* PERSONNALISATION POUR LES COMPTES  ENTREPRISES ET PROFESSIONNELS */}
        {currentUser && (userData.profileType === 'Professionnel' || userData.profileType === 'Entreprise') && (
            <section className="social-network">
                <h2>Réseaux sociaux</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className='social-network-form'>
                        <img src={facebook} alt="faceook" />
                        <input
                            name='facebook'
                            value={socialInfo.facebook}
                            onChange={handleSocialInputChange}
                            placeholder="Facebook"
                        />
                    </div>
                    <div className='social-network-form'>
                        <img src={instagram} alt="instagram" />
                        <input
                            name='instagram'
                            value={socialInfo.instagram}
                            onChange={handleSocialInputChange}
                            placeholder="Instagram"
                        />
                    </div>
                    <div className='social-network-form'>
                        <img src={whatsapp} alt="whatsapp" />
                        <input
                            name='whatsapp'
                            value={socialInfo.whatsapp}
                            onChange={handleSocialInputChange}
                            placeholder="Whatsapp"
                        />
                    </div>

                    <button onClick={handleSocialInfoUpdate}>Enregistrer</button>
                </form>
            </section>
        )}

        {/* <section className="security-info">
            <h2>Sécurité</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                <input
                    type="password"
                    value={securityInfo.password}
                    onChange={(e) =>
                        setSecurityInfo({
                            ...securityInfo,
                            password: e.target.value
                        })
                    }
                    placeholder="Nouveau mot de passe"
                />
                <button onClick={handleSecurityInfoUpdate}>
                    {isLoading ? <Spinner /> : "Enregistrer"}
                </button>
            </form>
        </section> */}

        {/* <section className="preference-zone">
            <h2>{t.preference}</h2>
            <div className="preference-item">
                <span>{t.language}</span>
                <LanguageToggle />
            </div>
        </section> */}

        <section className="help-zone">
            <h2>{t.support}</h2>
            <button onClick={() => navigate('/contact-us')} className='help-button'>{t.supp_client}</button>
            <button onClick={() => navigate('/help-center/faq')} className='help-button'>FAQs</button>
        </section>

        <section className="danger-zone">
            <h2>{t.danger_zone}</h2>
            <button className="logout" onClick={handleOpen}>{t.logout}</button>
            <button onClick={handleAccountDeletion} className="delete-button">
                {t.delete_account}
            </button>
        </section>

        {open &&
            <Modal
                title={t.logout}
                onShow={() => setOpen(true)}
                onHide={() => setOpen(false)}
                onNext={handleLogout}
                isNext={true}
                isHide={false}
                nextText={isLoading ? <Spinner /> : t.yes}
                hideText={t.cancel}
            >
                <p>{t.logout_confirm}</p>
            </Modal>
        }

        {showModal && (
            <Modal
                title={t.delete_title}
                onShow={() => setShowModal(true)}
                onHide={closeModal}
                isNext={false}

            >
                <p>{t.delete_alert}</p>
            </Modal>
        )}

        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} />
    </div>
    );
};
