import React from 'react';
import { motion } from 'framer-motion';

const FormAnimation = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
  >
    {children}
  </motion.div>
);

FormAnimation.Button = ({ children, ...props }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    {...props}
  >
    {children}
  </motion.button>
);

export default FormAnimation;