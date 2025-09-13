// src/components/ui/FullScreenLayout.tsx
import { Outlet } from 'react-router-dom';

const FullScreenLayout = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};

export default FullScreenLayout;