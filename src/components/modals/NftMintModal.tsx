import { Icon } from '@iconify/react';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import debug from 'debug';
import { BrowserProvider, ethers } from 'ethers';
import { FC, useState } from 'react';
import { AIXNFTAbi } from 'src/abi';
import { ExecuteButton } from 'src/components/ExecuteButton';
import { Modal } from 'src/components/UI/Modal';
import { useNftsApi } from 'src/hooks/useNftsApi';
import { useAppChain } from 'src/providers/AppChainProvider';
import { useSetModal } from 'src/providers/ModalsProvider';
import { useNftGeneratorImages } from 'src/providers/NftGeneratorProvider';
import { useTransactions } from 'src/providers/TransactionsProvider';
import { NftMintModalSettings } from 'src/types/modal';
import { UncheckedJsonRpcSigner } from 'src/utils/UncheckedJsonRpcSigner';

type Step = {
  id: 'metadata' | 'mint';
  name: string;
  status: 'waiting' | 'processing' | 'done';
};

const STEPS: Step[] = [
  {
    id: 'metadata',
    name: 'Upload metadata',
    status: 'waiting',
  },
  {
    id: 'mint',
    name: 'Mint',
    status: 'waiting',
  },
];

const log = debug('components:NftMintModal');

export const NftMintModal: FC<NftMintModalSettings> = () => {
  const setModal = useSetModal();
  const [{ selectedImage }] = useNftGeneratorImages();
  const [{ chainConfig }] = useAppChain();
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { trackTx, trackError } = useTransactions();
  const { sendNFTMetadata } = useNftsApi();

  const [steps, setSteps] = useState<Step[]>(STEPS);

  function setStepStatus(
    stepId: (typeof STEPS)[number]['id'],
    status: 'waiting' | 'processing' | 'done',
  ) {
    setSteps((prevState) => {
      const stateCopy = prevState.map((el) => ({ ...el }));
      const i = stateCopy.findIndex((el) => el.id === stepId);

      stateCopy[i].status = status;

      return stateCopy;
    });
  }

  async function handleMint() {
    setStepStatus('metadata', 'processing');
    try {
      const id = await sendNFTMetadata();

      setStepStatus('metadata', 'done');
      setStepStatus('mint', 'processing');

      if (!id) return;

      await mint(id);
      setStepStatus('mint', 'done');
    } catch (e) {
      console.error(e);
      return;
    }
  }

  async function mint(tokenId: string) {
    if (!walletProvider) return;
    if (!isConnected) return;
    if (!address) return;

    log('Minting NFT', tokenId);

    let tx;

    try {
      // const signer = await new BrowserProvider(walletProvider).getSigner();
      const signer = new UncheckedJsonRpcSigner(new BrowserProvider(walletProvider), address);
      const contract = new ethers.Contract(chainConfig.contracts.AIX_NFT, AIXNFTAbi, signer);

      setModal({ modalKey: 'loader', title: 'Confirm your transaction in the wallet' });

      tx = await contract.mintNFT(tokenId, address);

      log('Set loader');

      setModal({
        modalKey: 'loader',
        title: 'Minting NFT...',
        txHash: tx.txHash,
      });

      trackTx(tx);

      log('tx', tx);
      await tx.wait();
      setModal({ modalKey: 'success', title: 'NFT Minted', txHash: tx.hash });

      log('NFT successfully generated.');
    } catch (e: any) {
      trackError(e, tx);
      setModal({ modalKey: 'mint-nft' });
      throw e;
    }
  }

  return (
    <Modal size="md">
      <div className="modal-title">Mint NFT</div>
      <div className="flex flex-col">
        <div className="max-w-64 mx-auto w-full mb-10">
          <div className="rounded-2xl col-span-1 relative pt-[110%] overflow-hidden ">
            <div
              className="absolute left-0 top-0 h-full w-full z-10 p-4"
              style={{ background: `url('${selectedImage}') center / cover no-repeat` }}
            ></div>
          </div>
        </div>
        {steps.map((el) => (
          <div
            key={el.id}
            className="p-3 bg-[#17191B] bg-opacity-5 rounded-xl flex items-center mb-4 gap-4"
          >
            <Icon
              className={`${el.status === 'done' ? 'text-purple-600' : 'text-[#17191B] text-opacity-20'} text-xl`}
              icon={
                el.status === 'waiting'
                  ? 'fa6-solid:circle-arrow-down'
                  : el.status === 'processing'
                    ? 'fa6-solid:circle-notch'
                    : 'fa6-solid:circle-check'
              }
            />
            {el.name}
          </div>
        ))}
        <ExecuteButton className="w-full mt-6" label="Mint" onClick={handleMint} />
      </div>
    </Modal>
  );
};
