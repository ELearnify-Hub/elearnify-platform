// layouts/DashboardLayout.jsx
// Wraps any dashboard page with Sidebar + TopBar
import Sidebar from '../components/Sidebar';
import TopBar  from '../components/TopBar';

const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
        <TopBar title={title} subtitle={subtitle} />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
