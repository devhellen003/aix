import { ButtonHTMLAttributes, FC, ReactNode, useMemo } from 'react';
import { CircularProgress } from 'src/components/UI/CircularProgress';

const colorStyles = {
  'blur-white': 'bg-white bg-opacity-10 backdrop-blur-2xl',
  white: 'bg-white text-black',
  orange: 'from-[#FF6240] to-[#FFA940]',
  blue: 'from-[#1677FF] to-[#16B9FF]',
  gray: 'bg-[#2E3031]',
  danger: 'bg-[#ED1522]',
  transparent: 'bg-transparent',
  default: 'from-[#FB1FFF] to-[#8247FF]',
};

const getButtonBg = (color: keyof typeof colorStyles): string => {
  return colorStyles[color] || colorStyles['default'];
};

type ButtonType = 'solid' | 'opacity' | 'stroke';

type ButtonProps = {
  buttonType?: ButtonType;
  disabled?: boolean;
  buttonColor?: keyof typeof colorStyles;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  size?: 'xs' | 'small' | 'normal' | 'xl';
  processing?: boolean;
};

export type UIButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps;

export const UIButton: FC<UIButtonProps> = ({
  buttonType = 'solid',
  disabled,
  children,
  className,
  buttonColor = 'default',
  startIcon,
  endIcon,
  size = 'normal',
  processing = false,
  onClick,
  ...others
}) => {
  const buttonBg = useMemo(() => getButtonBg(buttonColor), [buttonColor]);

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  const renderContent = () => (
    <div className="flex items-center justify-center">
      {startIcon && <span className="mr-4">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-4">{endIcon}</span>}
      {processing && (
        <div className="absolute inset-0 backdrop-blur-xl flex items-center justify-center">
          <CircularProgress spinnerSize="xs" />
        </div>
      )}
    </div>
  );

  const commonClasses = `btn overflow-hidden ${
    disabled ? 'opacity-20 cursor-not-allowed' : 'hover:opacity-90 active:opacity-80'
  } ${
    size === 'xs'
      ? 'px-2 py-0.5 text-xs rounded-lg'
      : size === 'small'
        ? 'px-3 py-1.5 text-xs rounded-lg'
        : size === 'xl'
          ? 'px-8 py-5 pt-5.5 text-xl'
          : ''
  } ${className}`;

  if (buttonType === 'solid') {
    return (
      <button
        type="button"
        onClick={handleOnClick}
        disabled={disabled || processing}
        className={`${commonClasses} bg-gradient-to-r ${buttonBg}`}
        {...others}
      >
        {renderContent()}
      </button>
    );
  }

  if (buttonType === 'stroke') {
    return (
      <button
        onClick={handleOnClick}
        disabled={disabled || processing}
        className={`btn--stroke ${commonClasses}`}
        {...others}
      >
        {renderContent()}
      </button>
    );
  }

  return null;
};
