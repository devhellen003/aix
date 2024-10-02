import classNames from 'classnames';
import { ChangeEvent, FC, HTMLAttributes, ReactNode, useRef } from 'react';

const defaultContainerClasses =
  'flex flex-1 border border-gray-600 focus:border-blue-500 rounded-xl py-2';
const errorContainerClasses = '!border-[#ED1522] !border-opacity-40';

type Props = {
  name: string;
  value: string | null;
  placeholder?: string;
  label?: ReactNode;
  type?: 'input' | 'textarea';
  rows?: number;
  inputContainerClasses?: HTMLAttributes<HTMLDivElement>['className'];
  containerClasses?: HTMLAttributes<HTMLDivElement>['className'];
  labelEnd?: ReactNode;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  disabled?: boolean;
  labelStab?: boolean;
  error?: boolean;
  errorMessage?: string;
  onChange: (e: ChangeEvent<any>) => void;
};

export const UIInput: FC<Props> = ({
  onChange,
  name,
  placeholder,
  value,
  label,
  labelEnd,
  startAdornment,
  endAdornment,
  disabled = false,
  type = 'input',
  rows = 5,
  inputContainerClasses,
  containerClasses,
  error,
  errorMessage,
  labelStab = true,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const inputContainerClassesFull = classNames(
    defaultContainerClasses,
    inputContainerClasses,
    error ? errorContainerClasses : '',
  );
  const containerClassesFull = classNames('flex flex-col relative py-6', containerClasses);

  return (
    <div
      className={containerClassesFull}
      onClick={() => {
        inputRef.current?.focus();
        textareaRef.current?.focus();
      }}
    >
      {labelStab && (
        <div className="flex justify-between items-center mb-2 absolute top-0 left-0 w-full">
          <label htmlFor={name}>{label}</label>
          {labelEnd}
        </div>
      )}
      <div className={inputContainerClassesFull} onClick={() => inputRef.current?.focus()}>
        {startAdornment}
        {type === 'input' ? (
          <input
            ref={inputRef}
            type="text"
            id={name}
            className="w-full flex-1 bg-transparent py-0 px-4 border-none placeholder-gray-500 focus:outline-none"
            value={value || ''}
            name={name}
            placeholder={placeholder}
            onChange={onChange}
            disabled={disabled}
          />
        ) : (
          <textarea
            ref={textareaRef}
            id={name}
            className="w-full flex-1 bg-transparent py-0 px-4 border-none placeholder-gray-400 focus:outline-none resize-none"
            value={value || ''}
            name={name}
            placeholder={placeholder}
            rows={rows}
            onChange={onChange}
            disabled={disabled}
          />
        )}
        {endAdornment}
      </div>
      {error && <div className="text-[#ED1522] absolute bottom-0 left-4 pl-2">{errorMessage}</div>}
    </div>
  );
};
