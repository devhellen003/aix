import React, { lazy } from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { NetworkAttention } from 'src/components/NetworkAttention';
import { PleaseSignInGuard } from 'src/components/PleaseSignInGuard';
import { ReferralWatcher } from 'src/components/ReferralWatcher';
import { ConversationsProvider } from 'src/providers/ConversationsProvider';
import { StakesProvider } from 'src/providers/StakesProvider';
import { SwapProvider } from 'src/providers/SwapProvider';
import { MainLayout } from './layout/MainLayout';

const AffiliateProgram = lazy(() =>
  import('src/pages/affiliate-program').then(({ AffiliateProgram }) => ({
    default: AffiliateProgram,
  })),
);
const Conversations = lazy(() =>
  import('src/pages/conversations/conversations').then(({ Conversations }) => ({
    default: Conversations,
  })),
);
const Dashboard = lazy(() =>
  import('src/pages/dashboard/dashboard').then(({ Dashboard }) => ({ default: Dashboard })),
);
const Exchange = lazy(() =>
  import('src/pages/exchange/exchange').then(({ Exchange }) => ({ default: Exchange })),
);
const KnowledgeBaseId = lazy(() =>
  import('src/pages/my-bots/[botId]/[knowledgeBaseId]/knowledgeBaseId').then(
    ({ KnowledgeBaseId }) => ({ default: KnowledgeBaseId }),
  ),
);
const BotId = lazy(() =>
  import('src/pages/my-bots/[botId]/botId').then(({ BotId }) => ({ default: BotId })),
);
const MyBots = lazy(() =>
  import('src/pages/my-bots/my-bots').then(({ MyBots }) => ({ default: MyBots })),
);
const NewBot = lazy(() =>
  import('src/pages/my-bots/new-bot/new-bot').then(({ NewBot }) => ({ default: NewBot })),
);
const NotFound = lazy(() =>
  import('src/pages/not-found').then(({ NotFound }) => ({ default: NotFound })),
);
const Pricing = lazy(() =>
  import('src/pages/pricing/pricing').then(({ Pricing }) => ({ default: Pricing })),
);
const Staking = lazy(() =>
  import('src/pages/staking').then(({ Staking }) => ({ default: Staking })),
);
const BotsProvider = lazy(() =>
  import('src/providers/BotsProvider').then(({ BotsProvider }) => ({ default: BotsProvider })),
);

const NftGenerator = lazy(() =>
  import('src/pages/nft-generator/nft-generator').then(({ NftGenerator }) => ({
    default: NftGenerator,
  })),
);

const NftGeneratorSettings = lazy(() =>
  import('src/pages/nft-generator/nft-generator_settings').then(({ NftGeneratorSettings }) => ({
    default: NftGeneratorSettings,
  })),
);

const Migration = lazy(() =>
  import('src/pages/migration/migration').then(({ Migration }) => ({
    default: Migration,
  })),
);

const TeamVerification = lazy(() =>
  import('src/pages/team-verification').then(({ TeamVerification }) => ({
    default: TeamVerification,
  })),
);

const BuildAgent = lazy(() =>
  import('src/pages/build-agent/build-agent').then(({ BuildAgent }) => ({
    default: BuildAgent,
  })),
);

const AiMarketplace = lazy(() =>
  import('src/pages/ai-marketplace/ai-marketplace').then(({ AiMarketplace }) => ({
    default: AiMarketplace,
  })),
);

const AGI = lazy(() =>
  import('src/pages/agi/agi').then(({ AGI }) => ({
    default: AGI,
  })),
);

const AIMarketplaceToolName = lazy(() =>
  import('src/pages/ai-marketplace/[toolName]/toolName').then(({ ToolName }) => ({
    default: ToolName,
  })),
);

const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <>
        <ReferralWatcher />
        <MainLayout />
      </>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/staking" replace />,
      },
      {
        path: 'exchange',
        element: (
          <SwapProvider>
            <Exchange />
          </SwapProvider>
        ),
      },
      {
        path: 'conversations',
        children: [
          {
            index: true,
            element: (
              <PleaseSignInGuard>
                <BotsProvider>
                  <ConversationsProvider>
                    <Conversations />
                  </ConversationsProvider>
                </BotsProvider>
              </PleaseSignInGuard>
            ),
          },
        ],
      },
      {
        path: 'dashboard',
        element: (
          <PleaseSignInGuard>
            <BotsProvider>
              <Dashboard />
            </BotsProvider>
          </PleaseSignInGuard>
        ),
      },
      {
        path: 'staking',
        element: (
          <StakesProvider>
            <NetworkAttention />
            <Staking />
          </StakesProvider>
        ),
      },
      {
        path: 'affiliate-program',
        element: (
          <PleaseSignInGuard>
            <AffiliateProgram />
          </PleaseSignInGuard>
        ),
      },
      {
        path: 'product-suite',
        element: (
          <PleaseSignInGuard>
            <NetworkAttention />
            <Pricing />
          </PleaseSignInGuard>
        ),
      },
      {
        path: 'my-bots',
        element: (
          <PleaseSignInGuard>
            <BotsProvider />
          </PleaseSignInGuard>
        ),
        children: [
          {
            index: true,
            element: <MyBots />,
          },
          {
            path: 'new-bot',
            element: <NewBot />,
          },
          {
            path: ':botId',
            children: [
              {
                index: true,
                element: <BotId />,
              },
              {
                path: ':knowledgeBaseId',
                element: <KnowledgeBaseId />,
              },
            ],
          },
        ],
      },
      {
        path: 'team-verification',
        element: <TeamVerification />,
      },
      {
        path: 'ai-marketplace',
        children: [
          {
            index: true,
            element: <AiMarketplace />,
          },
          {
            path: ':toolName',
            element: <AIMarketplaceToolName />,
          },
        ],
      },
      {
        path: 'migration',
        element: (
          <StakesProvider>
            <Migration />
          </StakesProvider>
        ),
      },
      {
        path: 'agi',
        element: <AGI />,
      },
      {
        path: 'nft-generator',
        element: <PleaseSignInGuard />,
        children: [
          {
            index: true,
            element: <NftGenerator />,
          },
          {
            path: 'settings',
            element: <NftGeneratorSettings />,
          },
        ],
      },
      {
        path: 'build-agent',
        element: <BuildAgent />,
      },
      {
        path: '*',
        element: <NotFound />, // A component to display when no routes match
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
