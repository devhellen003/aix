import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Modals } from 'src/components/modals/Modals';
import { TransactionsToasts } from 'src/components/TransactionsToasts';
import { AppChainProvider } from 'src/providers/AppChainProvider';
import { AuthProvider } from 'src/providers/AuthProvider';
import { ModalsProvider } from 'src/providers/ModalsProvider';
import { NftGeneratorProvider } from 'src/providers/NftGeneratorProvider';
import { TransactionsProvider } from 'src/providers/TransactionsProvider';
import 'src/styles/index.css';
import { router } from 'src/router';

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '9a5549efdeb169133be9f26cfd7200b2';

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com',
};

// 3. Create modal
const metadata = {
  name: 'My Website',
  description: 'My Website description',
  url: 'https://mywebsite.com',
  icons: ['https://avatars.mywebsite.com/'],
};

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [mainnet],
  projectId,
});

const rootEl = document.getElementById('root') as HTMLElement;

const queryClient = new QueryClient();

ReactDOM.createRoot(rootEl).render(
  <QueryClientProvider client={queryClient}>
    <AppChainProvider>
      <ModalsProvider>
        <TransactionsProvider>
          <AuthProvider>
            <NftGeneratorProvider>
              <Modals />
              <RouterProvider router={router} />
              <TransactionsToasts />
            </NftGeneratorProvider>
          </AuthProvider>
        </TransactionsProvider>
      </ModalsProvider>
    </AppChainProvider>
  </QueryClientProvider>,
);
