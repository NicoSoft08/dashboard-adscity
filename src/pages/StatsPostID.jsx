import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import { fetchPostById } from '../routes/post';
import { Loading } from '../customs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import PostStatistics from '../utils/charts/PostStatistics';

export default function StatsPostID() {
    const { post_id } = useParams();
    const { language } = useContext(LanguageContext);
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const result = await fetchPostById(post_id);
            if (result.success) {
                setPost(result.data);
                setLoading(false);
            }
        };

        if (post_id) {
            fetchData();
        }
    }, [post_id]);


    const handleBack = () => {
        navigate(`/posts/${post_id}`);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className='manage-post'>
            <div className="head">
                <div className="back">
                    <FontAwesomeIcon icon={faChevronLeft} title='Go Back' onClick={handleBack} />
                </div>
                <div className="title">
                    <h2>{language === 'FR' ? "Annonces" : "Ads"} /</h2>
                    <p>{post?.details.title}</p>
                </div>
            </div>

            <PostStatistics post={post} />
        </div>
    );
};
