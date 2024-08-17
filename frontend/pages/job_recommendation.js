import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingAnimation = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="loading-container"
    >
        <div className="loading-spinner">
            <div className="circle circle1"></div>
            <div className="circle circle2"></div>
            <div className="circle circle3"></div>
        </div>
        <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
        >
            AIがあなたに最適な求人を探しています...
        </motion.p>
        <style jsx>{`
            .loading-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 200px;
            }
            .loading-spinner {
                position: relative;
                width: 80px;
                height: 80px;
            }
            .circle {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                opacity: 0.6;
                animation: bounce 2s infinite ease-in-out;
            }
            .circle1 {
                background-color: #FFA500;
                animation-delay: -0.5s;
            }
            .circle2 {
                background-color: #4CAF50;
                animation-delay: -0.3s;
            }
            .circle3 {
                background-color: #2196F3;
                animation-delay: -0.1s;
            }
            @keyframes bounce {
                0%, 100% { transform: scale(0.0); }
                50% { transform: scale(1.0); }
            }
            p {
                margin-top: 20px;
                font-size: 18px;
                color: #666;
            }
        `}</style>
    </motion.div>
);

export default function JobRecommendation() {
    const [userData, setUserData] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/users/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                setError('ユーザー情報の取得に失敗しました。');
            }
        };

        fetchUserData();
    }, []);

    const handleJobRecommendation = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/recommendations', null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            let recommendationsText = response.data.recommendations;
            const summaryStart = recommendationsText.lastIndexOf('\n\nこれらの推奨求人');
            if (summaryStart !== -1) {
                recommendationsText = recommendationsText.substring(0, summaryStart);
            }
    
            const recommendations = [];
            const lines = recommendationsText.split('\n\n').filter(line => line.trim() !== '');
    
            let currentJob = null;
            lines.forEach((line) => {
                if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                    if (currentJob) {
                        recommendations.push(currentJob);
                    }
                    const [title, id] = line.substring(3).split('（求人ID: ');
                    currentJob = {
                        job_title: title.trim(),
                        id: id.replace('）', '').trim(),
                        reasons: []
                    };
                } else if (line.startsWith('マッチング理由：')) {
                    // マッチング理由の処理
                } else if (currentJob) {
                    const [category, description] = line.split('：');
                    if (description) {
                        currentJob.reasons.push({
                            category: category.replace('・', '').trim(),
                            description: description.trim()
                        });
                    }
                }
            });
    
            if (currentJob) {
                recommendations.push(currentJob);
            }
    
            response.data.top_jobs.forEach((job, index) => {
                if (recommendations[index]) {
                    recommendations[index].similarity = job.similarity;
                }
            });
    
            setRecommendations(recommendations);
        } catch (error) {
            console.error('Failed to fetch job recommendations:', error);
            setError('求人推薦の取得に失敗しました。');
        }
        setLoading(false);
    };

    if (!userData) {
        return <LoadingAnimation />;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="job-recommendation-container"
        >
            <header className="header">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="logo-container"
                >
                    <img src="/images/TF_logo.png" alt="Talent Flow Logo" className="logo" />
                    <h1>Talent Flow</h1>
                </motion.div>
            </header>

            <div className="content">
                <motion.aside
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="sidebar"
                >
                    <img src="/images/profile.png" alt="Profile" className="profile-image" />
                    <ul className="profile-info">
                        <li><strong>氏名:</strong> {userData.employee_info.name}</li>
                        <li><strong>社員番号:</strong> {userData.employee_info.id}</li>
                        <li><strong>部署:</strong> {userData.departments[0].department_name}</li>
                    </ul>
                </motion.aside>

                <main className="main-content">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="card"
                    >
                        <h3>求人推薦結果</h3>
                        <AnimatePresence>
                            {loading ? (
                                <LoadingAnimation key="loading" />
                            ) : (
                                <motion.div
                                    key="content"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {recommendations.length > 0 ? (
                                        <ul className="recommendations-list">
                                            {recommendations.map((job, index) => (
                                                <motion.li
                                                    key={index}
                                                    className="job-item"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <div className="job-header">
                                                        <div className="job-rank">{index + 1}</div>
                                                        <div className="job-info">
                                                            <h4 className="job-title">{job.job_title}</h4>
                                                            <span className="job-id">求人ID: {job.id}</span>
                                                        </div>
                                                        <div className="job-similarity">{job.similarity}% マッチ</div>
                                                    </div>
                                                    <div className="job-reasons">
                                                        <h5>マッチング理由:</h5>
                                                        <ul>
                                                            {job.reasons.map((reason, idx) => (
                                                                <li key={idx}>
                                                                    <strong>{reason.category}:</strong> {reason.description}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>{userData.employee_info.name}さんに最適な求人を提案します</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="error-message"
                            >
                                {error}
                            </motion.p>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleJobRecommendation}
                            disabled={loading}
                        >
                            {loading ? 'AIが探しています...' : 'AIに探してもらう'}
                        </motion.button>
                    </motion.div>
                </main>
            </div>

            <style jsx global>{`
                .job-recommendation-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    width: 100vw;
                    background-color: #f7f7f7;
                }
                .header {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    padding: 10px 20px;
                    background-color: #fff;
                    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
                    color: black;
                }
                .logo-container {
                    display: flex;
                    align-items: center;
                }
                .logo {
                    width: 50px;
                    margin-right: 10px;
                }
                .content {
                    display: flex;
                    flex: 1;
                    overflow-y: hidden;
                }
                .sidebar {
                    flex: 0 0 250px;
                    background-color: #fff;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
                }
                .profile-image {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    object-fit: cover;
                    margin-bottom: 20px;
                }
                .profile-info {
                    list-style: none;
                    padding: 0;
                    width: 100%;
                    text-align: left;
                    color: black;
                }
                .profile-info li {
                    margin-bottom: 10px;
                    font-size: 14px;
                    color: black;
                }
                .main-content {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    color: black;
                }
                .card {
                    width: 100%;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                h2, h3 {
                    font-size: 24px;
                    color: #333;
                    margin-bottom: 10px;
                }
                p {
                    font-size: 16px;
                    color: #555;
                }
                ul {
                    list-style-type: none;
                    padding: 0;
                }
                .recommendations-list {
                    list-style-type: none;
                    padding: 0;
                }
                .job-item {
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    margin-bottom: 20px;
                    overflow: hidden;
                }
                .job-header {
                    display: flex;
                    align-items: center;
                    background-color: #f0f0f0;
                    padding: 15px;
                }
                .job-rank {
                    font-size: 24px;
                    font-weight: bold;
                    color: #FFA500;
                    margin-right: 15px;
                    min-width: 30px;
                }
                .job-info {
                    flex-grow: 1;
                }
                .job-title {
                    font-size: 18px;
                    font-weight: bold;
                    color: #333;
                    margin: 0 0 5px 0;
                }
                .job-id {
                    font-size: 14px;
                    color: #666;
                }
                .job-similarity {
                    font-size: 16px;
                    color: #4CAF50;
                    font-weight: bold;
                }
                .job-reasons {
                    padding: 15px;
                }
                .job-reasons h5 {
                    color: #666;
                    margin-top: 0;
                    margin-bottom: 10px;
                }
                .job-reasons ul {
                    list-style-type: none;
                    padding-left: 0;
                }
                .job-reasons li {
                    margin-bottom: 10px;
                    line-height: 1.5;
                }
                .job-reasons li strong {
                    color: #333;
                }
                .error-message {
                    color: red;
                    font-weight: bold;
                }
                button {
                    padding: 10px 20px;
                    background-color: #FFA500;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    margin-top: 10px;
                }
                button:hover {
                    background-color: #ff8c00;
                }
                button:disabled {
                    background-color: #cccccc;
                    cursor: not-allowed;
                }
            `}</style>
        </motion.div>
    );
}