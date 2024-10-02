import { ChangeEvent, FC, FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from 'src/components/UI/Modal';
import { UIButton } from 'src/components/UI/UIButton';
import { UIDropdown } from 'src/components/UI/UIDropdown';
import { UIInput } from 'src/components/UI/UIInput';
import { BASE_TYPE_SETTINGS, BASE_TYPES } from 'src/constants/knowledgeBase';
import { useBotsApi } from 'src/hooks/useBotsApi';
import { useSetModal } from 'src/providers/ModalsProvider';
import { KnowledgeBaseNewItem } from 'src/types/bots';
import { AddKnowledgeBaseModalSettings } from 'src/types/modal';

type DynamicFormComponent = {
  settings: KnowledgeBaseNewItem;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const AddKnowledgeBaseModal: FC<AddKnowledgeBaseModalSettings> = ({ botId, onAdd }) => {
  const setModal = useSetModal();
  const { addKnowledgeBase } = useBotsApi();

  const [type, setType] = useState<(typeof BASE_TYPES)[number]>(BASE_TYPES[0]);
  const [settings, setSettings] = useState<KnowledgeBaseNewItem>(
    BASE_TYPE_SETTINGS[BASE_TYPES[0].value],
  );

  useEffect(() => {
    setSettings(BASE_TYPE_SETTINGS[type.value]);
  }, [type]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target;

    setSettings({
      ...settings,
      [name]: event.target.type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleAddBase();
  };

  const handleAddBase = async () => {
    await addKnowledgeBase(botId, settings);
    toast.success('Knowledge base added');
    onAdd();
  };

  return (
    <Modal size="lg">
      <div className="modal-title">Add Base</div>
      <form onSubmit={handleSubmit}>
        <div className="text-black flex flex-col space-y-4">
          <UIDropdown
            value={type}
            options={BASE_TYPES}
            onSelect={(e) => setType(e as (typeof BASE_TYPES)[number])}
            label="Type"
          />
          {type.value === 'website' && (
            <WebSiteForm settings={settings} onChange={handleInputChange} />
          )}
          {type.value === 'mem' && <MemForm settings={settings} onChange={handleInputChange} />}
        </div>
        <div className="flex space-x-4 mt-10">
          <UIButton
            buttonType="stroke"
            className="text-gray-600 w-full"
            onClick={() => setModal(null)}
          >
            Cancel
          </UIButton>
          <UIButton className="w-full" onClick={handleAddBase}>
            Add
          </UIButton>
        </div>
      </form>
    </Modal>
  );
};

const WebSiteForm: FC<DynamicFormComponent> = ({ settings, onChange }) => {
  if (settings.type !== 'website') return null;

  return (
    <>
      <UIInput
        label="Link"
        name="url"
        value={settings.url}
        placeholder="Link"
        onChange={onChange}
      />
    </>
  );
};

const MemForm: FC<DynamicFormComponent> = ({ settings, onChange }) => {
  if (settings.type !== 'mem') return null;

  return (
    <>
      <UIInput
        label="Text"
        type="textarea"
        name="text"
        value={settings.text}
        placeholder="Text field"
        onChange={onChange}
      />
    </>
  );
};

// const FileForm: FC<DynamicFormComponent> = () => {
//   return (
//     <>
//       <UIDropZone />
//     </>
//   );
// };

// const VideoForm: FC<DynamicFormComponent> = ({ settings, onChange }) => {
//   return (
//     <>
//       <UIInput
//         name="youtubeLink"
//         value={settings.youtubeLink}
//         placeholder="Youtube link"
//         onChange={onChange}
//         label="Youtube link"
//       />
//     </>
//   );
// };
