import WalletConnectProvider from "@walletconnect/web3-provider";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ethers } from "ethers";
import Web3Modal, { IProviderOptions } from "web3modal";
import Web3 from "web3";

const networkNames = {
  1: "ETH Mainnet",
  42: "Kovan Testnet",
  3: "Ropsten Testnet",
  4: "Rinkeby Testnet",
  5: "Göerli Testnet",
};


const chainUrls = {
  1: {
    rpc: "https://mainnet.infura.io/v3/d96fbcc2473445f091831576efa0255f",
    explorer: "https://etherscan.io/",
    chainId: 1,
    name: networkNames[1],
  },
  3: {
    rpc: "https://ropsten.infura.io/v3/d96fbcc2473445f091831576efa0255f",
    explorer: "https://ropsten.etherscan.io/",
    chainId: 3,
    name: networkNames[3],
  },
  4: {
    rpc: "https://rinkeby.infura.io/v3/d96fbcc2473445f091831576efa0255f",
    explorer: "https://rinkeby.etherscan.io/",
    chainId: 4,
    name: networkNames[4],
  },
  5: {
    rpc: "https://kovan.infura.io/v3/d96fbcc2473445f091831576efa0255f",
    explorer: "https://kovan.etherscan.io/",
    chainId: 5,
    name: networkNames[5],
  },
  42: {
    rpc: "https://goerli.infura.io/v3/d96fbcc2473445f091831576efa0255f",
    explorer: "https://goerli.etherscan.io/",
    chainId: 42,
    name: networkNames[42],
  },
};


const getRPCUrl = (chainId: number) => chainUrls[chainId || 1].rpc;


const Web3Context = createContext({
  account: null,
  provider: null,
  providerChainId: null,
  loading: false,
  connectWeb3: () => {},
});

export const useWeb3Context = () => useContext(Web3Context);

const providerOptions: IProviderOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        1: getRPCUrl(1),
        3: getRPCUrl(3),
        4: getRPCUrl(4),
        5: getRPCUrl(5),
        42: getRPCUrl(42),
      },
    },
  },
};

const web3Modal =
  typeof window !== "undefined" &&
  new Web3Modal({
    cacheProvider: true,
    providerOptions,
  });

const Web3ContextProvider: React.FC = ({ children }) => {
  const [{ account, providerChainId, provider }, setWeb3State] =
    useState({
      account: null,
      provider: null,
      providerChainId: null,
    });

  const [loading, setLoading] = useState(true);

  const setProvider = useCallback(
    async (
      prov,
      initialCall
    ) => {
      try {
        setLoading(true);
        if (prov) {
          const provider = new ethers.providers.Web3Provider(
            new Web3(prov).currentProvider
          );
          const chainId = parseInt(prov.chainId, 16);
          const account = initialCall
            ? await provider.getSigner().getAddress()
            : null;

          setWeb3State(webState => ({
            ...webState,
            providerChainId: chainId,
            provider,
            account: account || webState.account,
          }));
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const connectWeb3 = useCallback(async () => {
    const modalProvider = await web3Modal.connect();
    await setProvider(modalProvider, true);
    modalProvider.on("chainChanged", () => setProvider(modalProvider));
    modalProvider.on("accountsChanged", async (newAcc: string[]) =>
      setWeb3State(prev => ({ ...prev, account: newAcc[0] }))
    );
  }, [setProvider]);

  useEffect(() => {
    if (window.ethereum) window.ethereum.autoRefreshOnNetworkChange = false;
    web3Modal.cachedProvider ? connectWeb3() : setLoading(false);
  }, [connectWeb3]);

  return (
    <Web3Context.Provider
      value={{ account, providerChainId, provider, loading, connectWeb3 }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3ContextProvider;
