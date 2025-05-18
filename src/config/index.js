import { faBell, faBullhorn, faChartLine, faCirclePlay, faFolder, faHeartCircleCheck, faUserCircle } from '@fortawesome/free-solid-svg-icons';

export const textBlueWithoutBg = require('../assets/icons/blue-no-bg.png');
export const letterWhiteBgBlue = require('../assets/icons/logo-letter-bg.png');
export const letterBlueBgWhite = require('../assets/icons/logo-letter-light.png');
export const textWhiteBgBlue = require('../assets/icons/logo-text-bg.png');
export const textBlueBgWhite = require('../assets/icons/logo-text-light.png');
export const textWhiteWithoutBg = require('../assets/icons/white-no-bg.png');

export const IconAvatar = require('../imgs/user-avatar.png');

export const countries = [
    // {
    //     name: "Côte d'Ivoire",
    //     code: "CI",
    //     dialCode: "+255",
    //     flag: require("../assets/flags/ci.png")
    // },
    // {
    //     name: "France",
    //     code: "FR",
    //     dialCode: "+33",
    //     flag: require("../assets/flags/fr.png")
    // },
    {
        name: "Russie",
        code: "RU",
        dialCode: "+7",
        flag: require("../assets/flags/ru.png")
    }
];

export const userSidebarData = (language, userPlan, hasDocument) => {
    const items = [
        { id: 'panel', name: language === 'FR' ? 'Panel' : 'Panel', icon: faChartLine, path: '/panel' },
        { id: 'posts', name: language === 'FR' ? 'Annonces' : 'Ads', icon: faBullhorn, path: '/posts' },
        { id: 'favoris', name: language === 'FR' ? 'Favoris' : 'Favorites', icon: faHeartCircleCheck, path: "/favoris" },
        { id: 'notifications', name: language === 'FR' ? 'Notifications' : 'Notifications', icon: faBell, path: "/notifications", badge: 0 },
        { id: 'profile', name: language === 'FR' ? 'Profile' : 'Profile', icon: faUserCircle, path: "/profile" },
    ];

    // Add status item only for paid plans
    if (userPlan && userPlan === 'Particulier') {
        items.splice(3, 0, {
            id: 'status',
            name: language === 'FR' ? 'Statuts' : 'Status',
            icon: faCirclePlay,
            path: "/status"
        });
    }

    // Add document item only if user has a document
    if (hasDocument) {
        items.splice(4, 0, {
            id: 'documents',
            name: language === 'FR' ? 'Document' : 'Document',
            icon: faFolder,
            path: "/documents",
            badge: 0
        });
    }

    return items;
};