import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import debug from 'debug';
import { useMemo, useState } from 'react';
import { API_URL } from 'src/configs/api.config';
import { useAuth } from 'src/providers/AuthProvider';
import { useNftGeneratorImages, useNftGeneratorSettings } from 'src/providers/NftGeneratorProvider';
import { createApiService } from 'src/utils/axios';

const log = debug('hooks:useNftsApi');

type GenerateImagesResp = { urls: string[] } | { error: string };

export const useNftsApi = () => {
  const { address } = useWeb3ModalAccount();
  const { loggedIn, signOut } = useAuth();
  const [{ selectedImage }, setImagesState] = useNftGeneratorImages();
  const [{ name, description, id }, setSettingsState] = useNftGeneratorSettings();
  const [sendingData, setSendingData] = useState(false);

  const nftsApiInst = useMemo(() => {
    if (!address) return null;
    if (!loggedIn) return null;

    return createApiService(`${API_URL}/api`, address, signOut);
  }, [address, loggedIn]);

  async function generateImages(prompt: string) {
    if (!nftsApiInst) return null;

    setImagesState({
      generating: true,
      urls: null,
      selectedImage: null,
      error: false,
      errorMessage: null,
    });

    try {
      const resp = await nftsApiInst.post<GenerateImagesResp>('/generate_images', { prompt });

      if ('error' in resp.data) {
        setImagesState({
          generating: false,
          urls: null,
          selectedImage: null,
          error: true,
          errorMessage: resp.data.error,
        });
        return;
      }

      setImagesState({
        generating: false,
        urls: resp.data.urls,
        selectedImage: null,
        error: false,
        errorMessage: null,
      });
    } catch (e: any) {
      setImagesState({
        generating: false,
        urls: null,
        selectedImage: null,
        error: true,
        errorMessage: '',
      });
    }
  }

  async function sendNFTMetadata() {
    if (!nftsApiInst) return null;

    setSendingData(true);

    const data = {
      name,
      description,
      image_url: selectedImage,
    };

    log('NFT Metadata', data);

    try {
      const resp = await nftsApiInst.post<{ token_id: number; url: string }>('/nft_metadata', data);

      const id = String(resp.data.token_id);

      setSettingsState((prevState) => ({ ...prevState, id }));

      log('NFT id', id);

      return id;
    } catch (e) {
      console.error(e);
      throw Error('Failed to send NFT Metadata.');
    } finally {
      setSendingData(false);
    }
  }

  return {
    generateImages,
    sendNFTMetadata,
    sendingData,
  };
};
