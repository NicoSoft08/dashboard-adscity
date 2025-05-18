const backendURL = process.env.REACT_APP_BACKEND_URL;

const getViewCount = async (postID) => {
    try {
        const response = await fetch(`${backendURL}/api/do/get/view/${postID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur lors de la récupération du nombre de vues:', error);
        throw error;
    }
};

const incrementViewCount = async (postID, userID) => {
    try {
        const response = await fetch(`${backendURL}/api/do/increment/view/${postID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userID }),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur lors de l\'incrémentation du nombre de vues:', error);
        throw error;
    }
};

const incrementClickCount = async (postID, userID) => {
    try {
        const response = await fetch(`${backendURL}/api/do/increment/click/${postID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userID }),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur lors de l\'incrémentation du nombre de clics:', error);
        throw error;
    }
};

const updateShareCount = async (postID, userID) => {
    try {
        const response = await fetch(`${backendURL}/api/do/increment/share/${postID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userID }),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur lors de l\'incrémentation du nombre de clics:', error);
        throw error;
    }
};

const updateInteraction = async (postID, userID, category) => {
    try {
        const response = await fetch(`${backendURL}/api/do/update/interaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postID, userID, category })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur lors de la mise à jour des interactions:', error);
        throw error;
    }
};

const updateContactClick = async (userID, city) => {
    try {
        const response = await fetch(`${backendURL}/api/do/update/contact-click`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userID, city })
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur lors de la mise à jour des favoris:', error);
        return false;
    }
};

const logClientAction = async (userID, action, details) => {
    try {
        const response = await fetch(`${backendURL}/api/do/log/${userID}/client/action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({action, details})
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error)
    }
};

const updateSocialLinks = async (userID, socialLinks) => {
    try {
        const response = await fetch(`${backendURL}/api/do/update/${userID}/social-links`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ socialLinks }),
        });

        const result = await response.json();
        // console.log(result);
        return result;
    } catch (error) {
        console.error('Erreur lors de la mise à jour des réseaux sociaux', error);
        throw error;
    }
};


export {
    getViewCount,
    incrementViewCount,
    incrementClickCount,
    updateShareCount,
    updateInteraction,
    updateContactClick,
    logClientAction,
    updateSocialLinks
};