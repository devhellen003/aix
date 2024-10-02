import { FC, useState } from 'react';
import { Modal } from 'src/components/UI/Modal';
import { UIButton } from 'src/components/UI/UIButton';

export const XOTariffsModal: FC<{ modalKey: 'xo-tariffs' }> = () => {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');

  return (
    <Modal size="xl">
      <div className="modal-title">Custom Solution Request</div>
      <div className="mb-4">
        <span className="block mb-1">Company name</span>
        <input
          value={input1}
          placeholder="Answer"
          className="ui-input"
          onChange={(e) => setInput1(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <span className="block mb-1">The number of employees</span>
        <input
          value={input2}
          placeholder="Answer"
          className="ui-input"
          onChange={(e) => setInput2(e.target.value)}
        />
      </div>
      <div className="mb-8">
        <span className="block mb-1">Your Request</span>
        <input
          value={input3}
          placeholder="Answer"
          className="ui-input"
          onChange={(e) => setInput3(e.target.value)}
        />
      </div>
      <UIButton className="w-full">Send</UIButton>
    </Modal>
  );
};
