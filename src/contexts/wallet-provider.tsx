"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  signer: JsonRpcSigner | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

export const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signerInstance = await provider.getSigner();
        setAddress(accounts[0]);
        setSigner(signerInstance);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this feature.");
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setSigner(null);
  }, []);

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        if (typeof window.ethereum !== "undefined") {
          const provider = new BrowserProvider(window.ethereum);
          provider.getSigner().then(setSigner);
        }
      } else {
        disconnectWallet();
      }
    };

    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, [disconnectWallet]);

  return (
    <WalletContext.Provider
      value={{
        isConnected: !!address,
        address,
        signer,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
