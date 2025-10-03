// components/LoadingOverlayCircle.tsx
import React, { useEffect, useState } from "react";

type LoadingOverlayProps = {
  show: boolean;
  success?: boolean;
  text?: string;
};

const LoadingOverlayCircle: React.FC<LoadingOverlayProps> = ({
  show,
  success = false,
  text,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (show) {
      // Si on commence une opération, reset success
      setShowSuccess(false);
    }
  }, [show]);

  useEffect(() => {
    if (success) {
      // attendre un tout petit peu avant de montrer le check pour l'animation
      const timer = setTimeout(() => setShowSuccess(true), 200);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-60 flex flex-col items-center justify-center z-50">
      {/* Cercle animé ou check */}
      <div className="w-20 h-20 relative mb-4">
        {!showSuccess ? (
          <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>

      {text && (
        <span className="text-white font-semibold text-lg transition-opacity duration-500">
          {text}
        </span>
      )}

      <style jsx>{`
        @keyframes animate-check-first {
          0% {
            width: 0;
          }
          100% {
            width: 50%;
          }
        }
        @keyframes animate-check-second {
          0% {
            width: 0;
          }
          100% {
            width: 50%;
          }
        }
        .animate-check-first {
          animation: animate-check-first 0.3s forwards;
        }
        .animate-check-second {
          animation: animate-check-second 0.3s 0.3s forwards;
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlayCircle;
