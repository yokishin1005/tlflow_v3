import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function MyPage() {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
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

        fetchData();
    }, []);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!userData) {
        return <p>Loading...</p>;
    }

    const radarData = userData.spi ? [
        userData.spi.extraversion,
        userData.spi.agreebleness,
        userData.spi.conscientiousness,
        userData.spi.neuroticism,
        userData.spi.openness,
    ] : [];
    
    return (
        <div className="mypage-container">
            <header className="header">
                <div className="logo-container">
                    <img src="/images/TF_logo.png" alt="Talent Flow Logo" className="logo" />
                    <h1>Talent Flow</h1>
                </div>
            </header>
            
            <div className="content">
                <aside className="sidebar">
                    <img src="/images/profile.png" alt="Profile" className="profile-image" />
                    <ul className="profile-info">
                        <li><strong>氏名:</strong> {userData.employee_info.name}</li>
                        <li><strong>社員番号:</strong> {userData.employee_info.id}</li>
                        <li><strong>部署:</strong> {userData.departments.map(d => d.department_name).join(', ')}</li>
                    </ul>
                </aside>

                <main className="main-content">
                    <div className="section-container">
                        <div className="section psychographic">
                            <h2>サイコグラフィック特性</h2>
                            <RadarChart data={radarData} labels={['創造力', 'リーダーシップ', '分析力', '協調性', '実行力']} />
                        </div>

                        <div className="section career">
                            <h2>キャリア情報</h2>
                            <p><strong>評価履歴:</strong></p>
                            <ul className="evaluation-list">
                                {userData.evaluations.map((evaluation, index) => (
                                    <li key={index}>
                                        {evaluation.year}: {evaluation.evaluation}
                                        <br />
                                        <strong>コメント:</strong> {evaluation.comment}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="section skills">
                        <h2>スキル情報</h2>
                        <div className="skills-container">
                            {userData.skills.map((skill, index) => (
                                <span key={index} className="skill-card">{skill.skill_name}</span>
                            ))}
                        </div>
                    </div>

                    <div className="buttons">
                        <button onClick={() => alert('評価・コメント閲覧')}>評価・コメント閲覧</button>
                        <button onClick={() => router.push('/job_recommendation')}>求人推薦システム</button>
                    </div>
                </main>
            </div>

            <style jsx>{`
                .mypage-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    width: 100vw;
                    background-color: #f7f7f7;
                    overflow: hidden;
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
                    overflow: hidden;
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
                    display: flex;
                    flex-direction: column;
                }
                .section-container {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 20px;
                    flex: 0 0 auto;
                }
                .section {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .section.psychographic,
                .section.career {
                    flex: 1;
                    max-height: 300px;
                    overflow-y: auto;
                }
                .section.skills {
                    margin-bottom: 20px;
                }
                h2 {
                    font-size: 24px;
                    color: #333;
                    margin-bottom: 10px;
                }
                .skills-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .skill-card {
                    padding: 10px 15px;
                    background-color: #e9ecef;
                    border-radius: 5px;
                    font-size: 14px;
                    color: #495057;
                }
                .buttons {
                    display: flex;
                    justify-content: space-between;
                    margin-top: auto;
                }
                button {
                    padding: 10px 20px;
                    background-color: #FFA500;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                }
                button:hover {
                    background-color: #ff8c00;
                }
                .evaluation-list {
                    max-height: 200px;
                    overflow-y: auto;
                }
            `}</style>
        </div>
    );
}

function RadarChart({ data, labels }) {
    const chartSize = 200;
    const center = chartSize / 2;
    const maxValue = 80;

    const points = data.map((value, index) => {
        const angle = ((Math.PI * 2) / data.length) * index;
        const x = center + (Math.cos(angle) * (value / maxValue) * (center - 20));
        const y = center + (Math.sin(angle) * (value / maxValue) * (center - 20));
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={chartSize} height={chartSize}>
            <circle cx={center} cy={center} r={center - 20} stroke="#ccc" fill="none" />
            {labels.map((label, index) => {
                const angle = ((Math.PI * 2) / labels.length) * index;
                const x = center + Math.cos(angle) * (center - 20);
                const y = center + Math.sin(angle) * (center - 20);
                return <line key={index} x1={center} y1={center} x2={x} y2={y} stroke="#ccc" />;
            })}
            {labels.map((label, index) => {
                const angle = ((Math.PI * 2) / labels.length) * index;
                const x = center + Math.cos(angle) * (center - 10);
                const y = center + Math.sin(angle) * (center - 10);
                return <text key={index} x={x} y={y} fontSize="10" textAnchor="middle">{label}</text>;
            })}
            <polygon points={points} fill="rgba(255, 165, 0, 0.5)" stroke="rgba(255, 165, 0, 1)" strokeWidth="2" />
        </svg>
    );
}