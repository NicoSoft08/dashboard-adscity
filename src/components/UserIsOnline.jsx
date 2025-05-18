import React from 'react';
import '../styles/UserIsOnline.scss';

export default function UserIsOnline({ width, height, top, right, profileURL, isOnline }) {
    return (
        <div className="user-profile">
            <div className="profile-container" style={{ width: width, height: height }}>
                <img
                    src={profileURL} // Image par défaut si l'utilisateur n'a pas de photo de profil
                    alt="Profile"
                    className="profile-image"
                />
                {isOnline && <div className="online-indicator" style={{ top: top, right: right }} />}
            </div>
        </div>
    );
};
