import React, { useEffect, useState } from 'react';
import { BiWifi, BiWifiOff } from 'react-icons/bi';
import { useNetworkStore } from '../../store/networkStore';

export const NetworkStatus: React.FC = () => {
  const { isOnline } = useNetworkStore();
  const [showNotification, setShowNotification] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowNotification(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Show reconnected message briefly
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        setWasOffline(false);
      }, 3000);
    }
  }, [isOnline, wasOffline]);

  if (!showNotification) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 ${
        isOnline
          ? 'bg-green-500/90 backdrop-blur-sm'
          : 'bg-red-500/90 backdrop-blur-sm'
      }`}
    >
      {isOnline ? (
        <>
          <BiWifi className="text-white text-xl" />
          <span className="text-white text-sm font-medium">Conexión restaurada</span>
        </>
      ) : (
        <>
          <BiWifiOff className="text-white text-xl" />
          <span className="text-white text-sm font-medium">Sin conexión a internet</span>
        </>
      )}
    </div>
  );
};
