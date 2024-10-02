import { Icon } from '@iconify/react';
import { FC, HTMLAttributes, MouseEvent, ReactNode, useEffect, useState } from 'react';
import { useImmutableCallback } from 'src/hooks/useActualRef';

export interface IOption {
  name: string;
  value: string;
  hide?: boolean;
}

type Props = {
  placeholder?: string;
  value: IOption | null | undefined;
  label?: string | ReactNode;
  labelPosition?: 'left' | 'top' | 'inside';
  disabled?: boolean;
  options: IOption[];
  labelEnd?: ReactNode;
  ToggleButton?: FC<{ isOpen: boolean }> | string;
  selectContainerClasses?: HTMLAttributes<HTMLDivElement>['className'];
  onSelect: (item: IOption) => void;
};

export const UIDropdown: FC<Props> = ({
  placeholder,
  disabled,
  label,
  labelPosition = 'top',
  options,
  value,
  labelEnd,
  ToggleButton,
  onSelect,
  selectContainerClasses,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const clickCallback = useImmutableCallback(() => {
    setIsOpen(false);
    setSearch('');
  });

  useEffect(() => {
    document.addEventListener('click', clickCallback);

    return () => document.removeEventListener('click', clickCallback);
  }, []);

  const filteredOptions = [...options].filter((el) =>
    el.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleDropdown = (
    e:
      | MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
      | MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
  ) => {
    if (disabled) return;
    e.preventDefault();
    setIsOpen(!isOpen);
    setSearch('');
  };

  const selectItem = (item: IOption) => {
    if (disabled) return;
    onSelect(item);
    setIsOpen(false);
  };

  return (
    <div
      className={`flex ${labelPosition === 'top' ? 'flex-col' : 'gap-4'}`}
      onClick={(e) => e.stopPropagation()}
    >
      {(label || labelEnd) && labelPosition !== 'inside' && (
        <div
          className={`flex justify-between items-center ${labelPosition === 'top' ? 'mb-2' : ''}`}
        >
          {label && <label>{label}</label>}
          {labelEnd}
        </div>
      )}
      <div className="relative">
        <div onClick={toggleDropdown} className={'cursor-pointer'}>
          {ToggleButton ? (
            <ToggleButton isOpen={isOpen} />
          ) : (
            <button
              className={`flex items-center  justify-between w-full text-left border border-gray-600 rounded-xl px-4 py-2 focus:outline-none ${
                disabled ? 'opacity-40 cursor-default' : ''
              } ${selectContainerClasses}`}
            >
              {labelPosition === 'inside' && label}
              {value?.name || placeholder || 'Select'}
              <span
                className={`inset-y-0 -mt-[1px] right-1 flex items-center ml-4 pointer-events-none ${
                  disabled ? 'text-gray-600' : ''
                }`}
              >
                <Icon icon={`${isOpen ? 'fa6-solid:caret-up' : 'fa6-solid:caret-down'}`} />
              </span>
            </button>
          )}
        </div>
        {isOpen && (
          <div className="absolute w-full bg-white rounded-xl border border-gray-600 overflow-auto z-10">
            {options.length > 6 && (
              <div className="relative">
                <Icon
                  icon="fa6-solid:magnifying-glass"
                  className="absolute left-3.5 top-3 text-gray-500"
                />
                <input
                  value={search}
                  type="search"
                  placeholder="Search"
                  className="w-full px-4 pl-10 py-2 focus:outline-none text-black"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
            <ul className="max-h-60 overflow-auto text-black">
              {filteredOptions
                .filter((el) => !el.hide)
                .map((item, i) => (
                  <li
                    key={`${item.value}_${i}`}
                    onClick={() => selectItem(item)}
                    className={`px-4 py-2 cursor-pointer border-t border-gray-200 ${
                      value?.value === item.value
                        ? 'bg-dropdown-selected'
                        : 'hover:bg-dropdown-hover'
                    }`}
                  >
                    {item.name}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
