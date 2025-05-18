const backendURL = process.env.REACT_APP_BACKEND_URL;

const createNewStatus = async (statusData, userID, idToken) => {
    try {
        const response = await fetch(`${backendURL}/api/status/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ statusData, userID })
        });
        const data = await response.json();
        console.log('Statut créé avec succès :', data);
        return data;
    } catch (error) {
        console.error('Erreur lors de la création du statut :', error);
        throw error;
    }
};

export { createNewStatus };