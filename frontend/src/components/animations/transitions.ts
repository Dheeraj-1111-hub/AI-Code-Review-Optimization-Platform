import { Variants } from "framer-motion";

export const fadeReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const pageTransitions: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    x: 10,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export const hoverGlow: Variants = {
  initial: { boxShadow: "0 0 0 rgba(99, 102, 241, 0)" },
  hover: { 
    boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

export const aiPulse: Variants = {
  idle: { opacity: 1, scale: 1 },
  pulsing: {
    opacity: [1, 0.6, 1],
    scale: [1, 1.05, 1],
    boxShadow: [
      "0 0 0 rgba(104, 34, 265, 0)",
      "0 0 15px rgba(104, 34, 265, 0.5)",
      "0 0 0 rgba(104, 34, 265, 0)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
