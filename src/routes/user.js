const backendUrl = process.env.REACT_APP_BACKEND_URL;

const fetchMe = async () => {
    const response = await fetch(`${backendUrl}/api/users/me`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) throw new Error('Not authenticated');

    const data = await response.json();
    return data;
};

const fetchDataByUserID = async (userID, idToken) => {
    try {
        const response = await fetch(`${backendUrl}/api/users/${userID}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            }
        });

        const result = await response.json();
        return result;
    } catch (error) {
        throw error;
    }
};

const setUserOnlineStatus = async (userID, isOnline, idToken) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${backendUrl}/api/users/user/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                userID,
                isOnline,
                // Add a timestamp to prevent replay attacks
                timestamp: Date.now()
            }),
            // credentials: 'include',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error setting user online status:", error);
        // Don't throw the error during logout to prevent blocking the process
        if (isOnline) {
            throw error;
        }
        return { success: false };
    }
};

const fetchNotifications = async (userID, idToken) => {
    const response = await fetch(`${backendUrl}/api/users/${userID}/notifications`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
    });

    const result = await response.json();
    return result;
};

export {
    fetchMe,
    fetchDataByUserID,
    fetchNotifications,
    setUserOnlineStatus
}