import axios from 'axios';

export default function useJobRecommendation(setRecommendations, setLoading, setError) {
    const handleJobRecommendation = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/recommendations`, null, {
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

    return { handleJobRecommendation };
}