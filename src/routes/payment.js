const backendUrl = process.env.REACT_APP_BACKEND_URL;

const fetchUserPaymentInfo = async (userID) => {
    const response = await fetch(`${backendUrl}/api/payments/collect/${userID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const result = await response.json();
    // console.log(result);
    return result;
};

export {
    fetchUserPaymentInfo,
}