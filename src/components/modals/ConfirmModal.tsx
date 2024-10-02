import { FC, memo } from 'react';
import { Modal } from 'src/components/UI/Modal';
import { UIButton } from 'src/components/UI/UIButton';
import { useSetModal } from 'src/providers/ModalsProvider';
import { ConfirmModalSettings } from 'src/types/modal';

export const ConfirmModal: FC<ConfirmModalSettings> = memo(
  ({
    danger,
    title = '',
    body,
    cancelText = 'Cancel',
    confirmText = 'Confirm',
    onConfirm,
    size,
  }) => {
    const setModal = useSetModal();

    return (
      <Modal size={size}>
        <div className="modal-title">{title}</div>
        {body}
        <div className="flex items-center justify-center">
          {cancelText && (
            <UIButton
              className="border-black text-black"
              buttonType="stroke"
              onClick={() => setModal(null)}
            >
              {cancelText}
            </UIButton>
          )}
          <UIButton
            className={`ml-6 ${!cancelText && 'w-full'}`}
            buttonColor={danger ? 'danger' : 'default'}
            onClick={() => onConfirm(true)}
          >
            {confirmText}
          </UIButton>
        </div>
      </Modal>
    );
  },
);
