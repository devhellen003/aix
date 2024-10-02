import React, { FC, ReactNode } from 'react';

type Props = {
  icon: ReactNode;
};

export const CircleWithIcon: FC<Props> = ({ icon }) => {
  return (
    <div className="w-11 h-11 flex items-center justify-center bg-white rounded-full text-black text-lg">
      {icon}
    </div>
  );
};
