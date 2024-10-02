import classNames from 'classnames';
import React, { HTMLProps } from 'react';
import { FCC } from 'src/types/FCC';

type Props = HTMLProps<HTMLDivElement>;

export const OpacityBox: FCC<Props> = ({ children, className, ...others }) => {
  const defaultClasses = {
    'rounded-3xl': !className?.includes('rounded-'),
    'bg-white': true,
    'bg-opacity-5': !className?.includes('bg-opacity-'),
    'p-6': !className || className?.split(' ').findIndex((el) => el.indexOf('p-') === 0) === -1,
  };
  const classes = classNames(defaultClasses, className);

  return (
    <div className={classes} {...others}>
      {children}
    </div>
  );
};
