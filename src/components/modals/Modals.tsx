import { AddKnowledgeBaseModal } from 'src/components/modals/AddKnowledgeBaseModal';
import { ConfirmModal } from 'src/components/modals/ConfirmModal';
import { ConnectTgModal } from 'src/components/modals/ConnectTgModal';
import { EnterAffiliateCredentialsModal } from 'src/components/modals/EnterAffiliateCredentialsModal';
import { LaunchpadParticipateModal } from 'src/components/modals/LaunchpadParticipateModal';
import { LoaderModal } from 'src/components/modals/LoaderModal';
import { NftMintModal } from 'src/components/modals/NftMintModal';
import { SetUpTelegramIntegrationModal } from 'src/components/modals/SetUpTelegramIntegrationModal';
import { SetUpWebIntegrationModal } from 'src/components/modals/SetUpWebIntegrationModal';
import { StakesModal } from 'src/components/modals/StakesModal';
import { SuccessModal } from 'src/components/modals/SuccessModal';
import { SwapSelectTokenModal } from 'src/components/modals/SwapSelectTokenModal';
import { XCTariffsModal } from 'src/components/modals/XCTariffsModal';
import { XOTariffsModal } from 'src/components/modals/XOTariffsModal';
import { XTTariffsModal } from 'src/components/modals/XTTariffsModal';
import { useModal } from 'src/providers/ModalsProvider';
import { ModalSettings } from 'src/types/modal';

const renderModal = (modal: ModalSettings) => {
  switch (modal.modalKey) {
    case 'stakes':
      return <StakesModal {...modal} />;
    case 'loader':
      return <LoaderModal {...modal} />;
    case 'confirm':
      return <ConfirmModal {...modal} />;
    case 'success':
      return <SuccessModal {...modal} />;
    case 'join-affiliate':
      return <EnterAffiliateCredentialsModal {...modal} />;
    case 'xc-tariffs':
      return <XCTariffsModal {...modal} />;
    case 'xo-tariffs':
      return <XOTariffsModal {...modal} />;
    case 'xt-tariffs':
      return <XTTariffsModal {...modal} />;
    case 'add-knowledge':
      return <AddKnowledgeBaseModal {...modal} />;
    case 'web-integration':
      return <SetUpWebIntegrationModal {...modal} />;
    case 'telegram-integration':
      return <SetUpTelegramIntegrationModal {...modal} />;
    case 'connect-tg':
      return <ConnectTgModal {...modal} />;
    case 'swap-select-token':
      return <SwapSelectTokenModal {...modal} />;
    case 'launch-participate':
      return <LaunchpadParticipateModal {...modal} />;
    case 'mint-nft':
      return <NftMintModal {...modal} />;
    default:
      return null;
  }
};

export const Modals = () => {
  const modal = useModal();
  return modal ? renderModal(modal) : null;
};
