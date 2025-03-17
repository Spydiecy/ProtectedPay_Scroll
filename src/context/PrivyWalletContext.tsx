'use client'

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';

// Define chain
const scrollTestnet = {
  id: 534351,
  hexId: '0x82853',
  name: 'Scroll Sepolia',
  network: 'scroll-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.scroll.io']
    },
    public: {
      http: ['https://sepolia-rpc.scroll.io']
    }
  },
  blockExplorers: {
    default: {
      name: 'Scroll Sepolia Explorer',
      url: 'https://sepolia.scrollscan.com'
    }
  },
  testnet: true,
};

// Your Privy App ID - you'll need to replace this with your actual Privy App ID
const PRIVY_APP_ID = 'cm86f7f3q01f2gqyjnukxp4lf';

interface WalletContextType {
  address: string | null;
  balance: string | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
  provider: ethers.providers.Web3Provider | null;
  login: () => void;
  logout: () => void;
  openAccountModal: () => void;
  switchChain: (chainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: null,
  signer: null,
  isConnected: false,
  provider: null,
  login: () => {},
  logout: () => {},
  openAccountModal: () => {},
  switchChain: async () => {},
});

function WalletStateProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<Omit<WalletContextType, 'login' | 'logout' | 'openAccountModal' | 'switchChain'>>({
    address: null,
    balance: null,
    signer: null,
    isConnected: false,
    provider: null
  });

  const { user, authenticated, login, logout, ready } = usePrivy();
  const { wallets } = useWallets();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !ready || !authenticated) return;

    const initializeWallet = async () => {
      if (wallets.length === 0) return;
      
      // Get the first connected wallet
      const wallet = wallets[0];
      
      try {
        // Get the wallet's Ethereum provider
        const ethereumProvider = await wallet.getEthereumProvider();
        
        // Create an ethers provider
        const provider = new ethers.providers.Web3Provider(ethereumProvider);
        const signer = provider.getSigner();
        const address = wallet.address;
        
        // Get the balance
        const ethersBalance = await provider.getBalance(address);
        const balance = ethers.utils.formatEther(ethersBalance);
        
        setState({
          address,
          balance,
          signer,
          isConnected: true,
          provider
        });
      } catch (error) {
        console.error('Error initializing wallet:', error);
        setState({
          address: null,
          balance: null,
          signer: null,
          isConnected: false,
          provider: null
        });
      }
    };

    initializeWallet();
  }, [mounted, ready, authenticated, wallets]);

  const openAccountModal = () => {
    // Privy doesn't have a direct account modal, 
    // so we can use the user menu or implement a custom modal
    console.log('Account modal functionality to be implemented');
  };

  const switchChain = async (chainId: number) => {
    if (wallets.length === 0 || !state.provider) return;
    
    try {
      const wallet = wallets[0];
      await wallet.switchChain(chainId);
      
      // Refresh wallet state after chain switch
      const provider = state.provider;
      const signer = provider.getSigner();
      const address = wallet.address;
      
      // Get the balance
      const ethersBalance = await provider.getBalance(address);
      const balance = ethers.utils.formatEther(ethersBalance);
      
      setState(prev => ({
        ...prev,
        balance
      }));
    } catch (error) {
      console.error('Error switching chain:', error);
    }
  };

  if (!mounted) return null;

  return (
    <WalletContext.Provider 
      value={{
        ...state,
        login,
        logout,
        openAccountModal,
        switchChain
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function PrivyWalletProvider({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#22c55e',
          logo: '/logo.png'
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        supportedChains: [
          {
            id: scrollTestnet.id,
            name: scrollTestnet.name,
            rpcUrls: {
              default: {
                http: [scrollTestnet.rpcUrls.default.http[0]]
              }
            },
            nativeCurrency: scrollTestnet.nativeCurrency,
            blockExplorers: scrollTestnet.blockExplorers
          }
        ],
        defaultChain: {
          id: scrollTestnet.id,
          name: scrollTestnet.name,
          nativeCurrency: scrollTestnet.nativeCurrency,
          rpcUrls: {
            default: {
              http: [scrollTestnet.rpcUrls.default.http[0]]
            }
          },
          blockExplorers: scrollTestnet.blockExplorers
        }
      }}
    >
      <WalletStateProvider>{children}</WalletStateProvider>
    </PrivyProvider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a PrivyWalletProvider');
  }
  return context;
} 