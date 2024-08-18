import { motion } from 'framer-motion';
import styles from '../styles/JobItem.module.css';

export default function JobItem({ job, index }) {
    return (
        <motion.li
            className={styles.jobItem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <div className={styles.jobHeader}>
                <div className={styles.jobRank}>{index + 1}</div>
                <div className={styles.jobInfo}>
                    <h4 className={styles.jobTitle}>{job.job_title}</h4>
                    <span className={styles.jobId}>求人ID: {job.id}</span>
                </div>
                <div className={styles.jobSimilarity}>{job.similarity}% マッチ</div>
            </div>
            <div className={styles.jobReasons}>
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
    );
}