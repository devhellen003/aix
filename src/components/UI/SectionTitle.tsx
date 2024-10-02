import { HTMLProps } from 'react';
import { FCC } from 'src/types/FCC';

export const SectionTitle: FCC<HTMLProps<HTMLDivElement>> = ({
  children,
  className,
  ...others
}) => {
  return (
    <h1 className={`text-4xl mb-6 ${className}`} {...others}>
      {children}
    </h1>
  );
};
