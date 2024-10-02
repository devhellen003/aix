import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from 'src/components/Header/Header';
import { LeftSidebar } from 'src/components/LeftSidebar/LeftSidebar';

export const MainLayout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 pt-6 overflow-hidden">
        <LeftSidebar />
        <div className="flex flex-col flex-1 pl-4 pr-6 pb-6 overflow-auto">
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
};
