import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar stays fixed on the left */}
      <Sidebar />

      {/* Right column: header on top, content scrolls underneath */}
      <div className="flex flex-1 flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};
