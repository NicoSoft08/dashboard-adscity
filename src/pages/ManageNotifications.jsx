import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { fetchNotifications } from '../routes/user';
import { Loading } from '../customs';
import NotificationList from '../components/notification/Notifications';

export default function ManageNotifications() {
    const { currentUser } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getNotifications = async () => {
            const userID = currentUser.uid;
            const idToken = await currentUser.getIdToken(true);
            setIsLoading(true);
            const result = await fetchNotifications(userID, idToken);
            if (result.success) {
                setNotifications(result?.data);
                setIsLoading(false);
            }
        }

        getNotifications();
    }, [currentUser]);

    return (
        <div>
            {isLoading && <Loading />}
            <NotificationList
                userID={currentUser.uid}
                notifications={notifications}
                setNotifications={setNotifications}
            />
        </div>
    );
};
