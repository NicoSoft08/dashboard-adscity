import React, { useContext, useEffect, useState } from 'react';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/AccountLayout.scss';
import { Loading } from '../customs';

const authURL = process.env.REACT_APP_AUTH_URL;
const homeURL = process.env.REACT_APP_HOME_URL;

export default function AccountLayout() {
    const { currentUser, userRole, loading } = useContext(AuthContext);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!currentUser && !loading) {
            window.location.href = `${authURL}/signin?redirect=${window.location.href}`;
        } else if (userRole && userRole !== 'admin' && userRole !== 'user') {
            window.location.href = `${homeURL}/access-denied`;
        }
    }, [currentUser, userRole, loading]);


    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (loading) return <Loading />

    return (
        <div className="account-layout">
            <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

            <div className="layout-content">
                <Header toggleSidebar={toggleSidebar} />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};