// components/ConnectWallet.tsx

'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/context/PrivyWalletContext';

const ConnectWallet = () => {
  const { address, isConnected, login, openAccountModal } = useWallet();

  return (
    <div>
      {!isConnected ? (
        <motion.button
          onClick={login}
          className="relative flex items-center space-x-2 px-4 py-2 rounded-xl font-medium overflow-hidden group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 group-hover:opacity-100 opacity-90" />
          <span className="relative text-black">Connect Wallet</span>
        </motion.button>
      ) : (
        <motion.button
          onClick={openAccountModal}
          className="relative flex items-center space-x-2 px-4 py-2 rounded-xl font-medium overflow-hidden group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 group-hover:opacity-100 opacity-90" />
          <span className="relative text-black">
            {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
          </span>
        </motion.button>
      )}
    </div>
  );
};

export default ConnectWallet;