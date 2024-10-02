import { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  NFT_GENERATOR_OPTIONS_CHAINS,
  NFT_GENERATOR_OPTIONS_MODELS,
  NFT_GENERATOR_OPTIONS_TYPES,
} from 'src/constants/nftGenerator';
import { FCC } from 'src/types/FCC';

interface INftGeneratorOptions {
  type: keyof typeof NFT_GENERATOR_OPTIONS_TYPES;
  model: keyof typeof NFT_GENERATOR_OPTIONS_MODELS;
  chain: keyof typeof NFT_GENERATOR_OPTIONS_CHAINS;
}

interface INftGeneratorSettings {
  name: string;
  symbol: 'AIX_NFT';
  description: string;
  id: string;
}

type INftGeneratorImagesState =
  | {
      generating: boolean;
      urls: string[] | null;
      selectedImage: string | null;
      error: false;
      errorMessage: null;
    }
  | {
      generating: false;
      urls: null;
      selectedImage: null;
      error: true;
      errorMessage: string;
    };

interface INftGeneratorProvider {
  options: [INftGeneratorOptions, Dispatch<SetStateAction<INftGeneratorOptions>>];
  prompt: [string, Dispatch<SetStateAction<string>>];
  settings: [INftGeneratorSettings, Dispatch<SetStateAction<INftGeneratorSettings>>];
  images: [INftGeneratorImagesState, Dispatch<SetStateAction<INftGeneratorImagesState>>];
}

const initNftGeneratorProviderCtx = {
  options: [
    {
      type: 'singleImage' as const,
      model: 'default' as const,
      chain: 'ethereum' as const,
    },
    () => {},
  ] as INftGeneratorProvider['options'],
  prompt: ['', () => {}] as INftGeneratorProvider['prompt'],
  settings: [
    { symbol: 'AIX_NFT', name: '', description: '', id: '' },
    () => {},
  ] as INftGeneratorProvider['settings'],
  images: [
    { generating: false, urls: null, selectedImage: null, error: false, errorMessage: null },
    () => {},
  ] as INftGeneratorProvider['images'],
};

const NftGeneratorProviderCtx = createContext<INftGeneratorProvider>(initNftGeneratorProviderCtx);

export const NftGeneratorProvider: FCC = ({ children }) => {
  const options = useState<INftGeneratorOptions>(initNftGeneratorProviderCtx.options[0]);
  const prompt = useState('');
  const settings = useState<INftGeneratorSettings>(initNftGeneratorProviderCtx.settings[0]);
  const images = useState<INftGeneratorImagesState>(initNftGeneratorProviderCtx.images[0]);

  return (
    <NftGeneratorProviderCtx.Provider value={{ options, prompt, settings, images }}>
      {children || <Outlet />}
    </NftGeneratorProviderCtx.Provider>
  );
};

export const useNftGenerator = () => useContext(NftGeneratorProviderCtx);
export const useNftGeneratorOptions = () => {
  const { options } = useContext(NftGeneratorProviderCtx);
  return options;
};
export const useNftGeneratorPrompt = () => {
  const { prompt } = useContext(NftGeneratorProviderCtx);
  return prompt;
};
export const useNftGeneratorSettings = () => {
  const { settings } = useContext(NftGeneratorProviderCtx);
  return settings;
};
export const useNftGeneratorImages = () => {
  const { images } = useContext(NftGeneratorProviderCtx);
  return images;
};
