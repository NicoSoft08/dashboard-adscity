const backendURL = process.env.REACT_APP_BACKEND_URL;

const uploadStatusMedia = async (media, userID, idToken) => {
    const formData = new FormData();
    formData.append('media', media);
    formData.append('userID', userID);

    try {
        const response = await fetch(`${backendURL}/api/storage/upload/status-media`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
            body: formData,
        })

        const result = await response.json();
        console.log('Result:', result);
        return result;
    } catch (error) {
        console.error('Erreur lors de l\'upload du média :', error);
        throw error;
        
    }
};

const fetchProfileByUserID = async (userID) => {
    try {
        const response = await fetch(`${backendURL}/api/storage/user/${userID}/profilURL`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur:', error);
        return null;
    }
};

const deletePostImagesFromStorage = async (postID) => {
    try {
        const response = await fetch(`${backendURL}/api/storage/delete/post-images/${postID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur lors de la suppression des images :', error);
        throw error;
    }
};

const uploadImage = async (file, userID, idToken) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userID', userID);

    const response = await fetch(`${backendURL}/api/storage/upload/image`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
        },
        body: formData,
    });

    const result = await response.json();
    return result;
};

const uploadProfilePhoto = async (file, userID, idToken) => {
    const formData = new FormData();
    formData.append('profilURL', file);
    formData.append('userID', userID);

    const response = await fetch(`${backendURL}/api/storage/upload/${userID}/profile`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
        body: formData,
    });

    const result = await response.json();
    return result;
};

const uploadCoverPhoto = async (file, userID, idToken) => {
    const formData = new FormData();
    formData.append('coverURL', file);
    formData.append('userID', userID);

    const response = await fetch(`${backendURL}/api/storage/upload/${userID}/cover`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
        body: formData,
    });

    const result = await response.json();
    return result;
};

export { 
    uploadStatusMedia,
    fetchProfileByUserID,
    deletePostImagesFromStorage,
    uploadImage,
    uploadProfilePhoto,
    uploadCoverPhoto,
};