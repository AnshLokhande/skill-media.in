import { motion } from 'framer-motion';

export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
        className="w-16 h-16 relative"
      >
        {/* Logo shape */}
        <div className="absolute inset-0">
          <div className="w-full h-2 bg-red-500 rounded-full absolute top-1/2 -translate-y-1/2" />
          <div className="h-full w-2 bg-red-500 rounded-full absolute left-1/2 -translate-x-1/2" />
        </div>
      </motion.div>
      <div className="text-2xl font-bold text-white">WAITING FOR NEXT ROUND</div>
      <div className="w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear"
          }}
          className="w-24 h-full bg-red-500"
        />
      </div>
    </div>
  );
}

