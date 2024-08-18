import { motion, AnimatePresence } from 'framer-motion';
import LoadingAnimation from './LoadingAnimation';
import JobItem from './JobItem';
import useJobRecommendation from '../hooks/useJobRecommendation';
import styles from '../styles/JobRecommendationCard.module.css';

export default function JobRecommendationCard({
    userData,
    recommendations,
    setRecommendations,
    loading,
    setLoading,
    error,
    setError
}) {
    const { handleJobRecommendation } = useJobRecommendation(setRecommendations, setLoading, setError);

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={styles.card}
        >
            <h3>AI求人提案</h3>
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
                            <ul className={styles.recommendationsList}>
                                {recommendations.map((job, index) => (
                                    <JobItem key={job.id} job={job} index={index} />
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
                    className={styles.errorMessage}
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
                {loading ? 'AIが探しています...' : 'もう一度提案してもらう'}
            </motion.button>
        </motion.div>
    );
}