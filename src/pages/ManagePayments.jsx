import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Pagination } from '../customs';
import { formateDateTimestamp } from '../func';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { fetchUserPaymentInfo } from '../routes/payment';

const formatPaymentMethod = (paymentMethod) => {
    switch (paymentMethod) {
        case 'BankTransfer':
            return 'Virement bancaire';
        case 'MobileMoney':
            return 'Mobile Money';
        case 'Wallet':
            return 'Portefeuille';
        default:
            return paymentMethod;
    }
};

export default function ManagePayments() {
    const { currentUser } = useContext(AuthContext);
    const menuRef = useRef(null);
    const [payments, setPayments] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [paymentPerPage] = useState(5);

    const indexOfLastPost = currentPage * paymentPerPage;
    const indexOfFirstPost = indexOfLastPost - paymentPerPage;
    const currentPayments = payments.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        const fetchPayments = async () => {
            const userID = currentUser.uid;
            const result = await fetchUserPaymentInfo(userID);
            if (result.success) {
                setPayments(result.processingPayments);
            }
        };

        fetchPayments();
    }, [currentUser]);

    const paymentStatuses = {
        'completed': { color: '#34D399', label: 'Réussi' },
        'processing': { color: '#FBBF24', label: 'En cours' },
        'failed': { color: '#EF4444', label: 'Échoués' }
    };

    const options = [];

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    return (
        <div className='payment-intents'>
            <div className="head">
                <h2>Paiements</h2>
                <span className="more-options" title="Plus d'options">
                    <FontAwesomeIcon icon={faEllipsisH} onClick={handleMenuClick} />
                </span>
                {showMenu &&
                    <div className="options-menu" ref={menuRef}>
                        {options.map((option, index) => (
                            <div key={index} className="options-menu-item" onClick={option.action}>
                                <FontAwesomeIcon icon={option.icon} />
                                <span>{option.label}</span>
                            </div>
                        ))}
                    </div>
                }
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Plan</th>
                            <th>Montant</th>
                            <th>Méthode</th>
                            <th>Prestataire</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPayments.length > 0 ? (
                            currentPayments.map((payment, index) => (
                                <tr key={payment.id}>
                                    <td>{index + 1}</td>
                                    <td>{formateDateTimestamp(payment.createdAt?._seconds)}</td>
                                    <td>{payment.subscription}</td>
                                    <td>{payment.amount} RUB</td>
                                    <td>{formatPaymentMethod(payment.paymentMethod)}</td>
                                    <td>{payment.provider}</td>
                                    <td>
                                        <span
                                            style={{
                                                backgroundColor: paymentStatuses[payment.status].color,
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                color: 'white'
                                            }}
                                        >
                                            {paymentStatuses[payment.status].label}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">Vous n'avez aucun paiement.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {payments.length > paymentPerPage && (
                <Pagination
                    currentPage={currentPage}
                    elements={payments}
                    elementsPerPage={paymentPerPage}
                    paginate={paginate}
                />
            )}
        </div>
    );
};
