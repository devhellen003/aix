import React, { createContext, Dispatch, useContext, useState } from 'react';
import { FCC } from 'src/types/FCC';
import { ModalState } from 'src/types/modal';

const initialModalState: ModalState = null;

const ModalStx = createContext<[ModalState, Dispatch<React.SetStateAction<ModalState>>]>([
  initialModalState,
  () => null,
]);

export const ModalsProvider: FCC = ({ children }) => {
  const value = useState<ModalState>(initialModalState);

  return <ModalStx.Provider value={value}>{children}</ModalStx.Provider>;
};

export const useModal = () => useContext(ModalStx)[0];

export const useSetModal = () => useContext(ModalStx)[1];
