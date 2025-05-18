import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { IconAvatar, letterBlueBgWhite } from '../config';
import AppLogo from './AppLogo';
import UserIsOnline from './UserIsOnline';
import '../styles/Header.scss';

export default function Header() {
    const { currentUser, userRole, userData } = useContext(AuthContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Déterminer l'image de profil à afficher
    const profileImage =
        currentUser && userRole === 'user'
            ? userData?.profilURL || IconAvatar // Si profilURL est null, utiliser l'image par défaut
            : IconAvatar;


    return (
        <header>
            <div className="container">
                <div className="logo">
                    <AppLogo source={letterBlueBgWhite} />
                </div>
                <div className="actions">
                    <div className='display-name'>{userData?.firstName} {userData?.lastName}</div>
                    <div className="user-icon" onClick={toggleDropdown}>
                        <UserIsOnline
                            width={'40px'}
                            height={'40px'}
                            top={'30px'}
                            right={'-4px'}
                            profileURL={profileImage}
                            isOnline={userData?.isOnline}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};