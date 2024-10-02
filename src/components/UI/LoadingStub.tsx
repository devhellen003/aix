import classNames from 'classnames';
import { FC, HTMLProps } from 'react';
import { CircularProgress } from 'src/components/UI/CircularProgress';
import { OpacityBox } from 'src/components/UI/OpacityBox';

export const LoadingStub: FC<
  { label: string; containerSize?: 'full' } & HTMLProps<HTMLDivElement>
> = ({ label, containerSize, className }) => {
  const defaultClasses = `flex flex-col ${
    containerSize === 'full' ? 'flex-1 h-full' : ''
  } items-center justify-center space-y-4`;
  const classes = classNames(defaultClasses, className);

  return (
    <OpacityBox className={classes}>
      <CircularProgress spinnerSize="small" />
      <p>{label}</p>
    </OpacityBox>
  );
};
