import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/dashboard';
import Panel from './pages/Panel';
import Status from './pages/Status';
import NewStatus from './pages/NewStatus';
import Verification from './pages/Verification';
import ManageFavorites from './pages/ManageFavorites';
import ManagePosts from './pages/ManagePosts';
import ManagePostID from './pages/ManagePostID';
import EditPostID from './pages/EditPostID';
import StatsPostID from './pages/StatsPostID';
import ManagePayments from './pages/ManagePayments';
import ManageNotifications from './pages/ManageNotifications';
import UserProfile from './pages/UserProfile';
import AccessDenied from './pages/AccessDenied';
import NotFoundPage from './pages/NotFoundPage';

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route element={<DashboardLayout />}>
                    <Route path="/panel" element={<Panel />} />
                    <Route path="/status" element={<Status />} />
                    <Route path="/status/new" element={<NewStatus />} />
                    <Route path="/documents" element={<Verification />} />
                    <Route path="/favoris" element={<ManageFavorites />} />
                    <Route path="/posts" element={<ManagePosts />} />
                    <Route path='/posts/:post_id' element={<ManagePostID />} />
                    <Route path='/posts/:post_id/edit' element={<EditPostID />} />
                    <Route path='/posts/:post_id/statistics' element={<StatsPostID />} />
                    <Route path="/payments" element={<ManagePayments />} />
                    <Route path="/notifications" element={<ManageNotifications />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path='/access-denied' element={<AccessDenied />} />
                    <Route path='*' element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Router>
    );
};
