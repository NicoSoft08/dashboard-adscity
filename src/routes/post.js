const backendUrl = process.env.REACT_APP_BACKEND_URL;

const reportPost = async (postID, userID, reason) => {
    const response = await fetch(`${backendUrl}/api/posts/post/${postID}/report`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID, reason })
    });

    const result = await response.json();
    return result;
};

const updatePost = async (postID, updatedData, userID) => {
    try {
        const response = await fetch(`${backendUrl}/api/posts/${postID}/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ updatedData, userID }),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'annonce:', error);
        return null;
    };
};

const deletePost = async (postID, userID) => {
    try {
        const response = await fetch(`${backendUrl}/api/posts/${postID}/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userID }),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'annonce:', error);
        return null;
    };
};

const markAsSold = async (userID, postID) => {
    try {
        const response = await fetch(`${backendUrl}/api/posts/${postID}/mark/sold`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userID }),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'annonce:', error);
        return null;
    };
};

const fetchPostById = async (post_id) => {
    try {
        const response = await fetch(`${backendUrl}/api/posts/${post_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
};

export { reportPost, updatePost, deletePost, markAsSold, fetchPostById };