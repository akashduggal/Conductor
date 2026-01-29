import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, Database, GitCompare } from 'lucide-react';
import { cn } from '../../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Experiments', href: '/experiments', icon: FlaskConical },
  { name: 'Datasets', href: '/datasets', icon: Database },
  { name: 'Comparison', href: '/comparison', icon: GitCompare },
];

export const Sidebar = () => {
  return (
    <aside className="w-14 bg-zinc-900 border-r border-zinc-800 min-h-screen flex flex-col items-center py-4">
      <nav className="flex flex-col items-center gap-1 w-full">
        {navigation.map((item) => (
          <div key={item.name} className="relative group w-full flex justify-center">
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-center p-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                )
              }
            >
              <item.icon className="h-5 w-5" />
            </NavLink>
            <span
              className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-md bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-200 shadow-lg ring-1 ring-zinc-700 group-hover:block"
              role="tooltip"
            >
              {item.name}
            </span>
          </div>
        ))}
      </nav>
    </aside>
  );
};
