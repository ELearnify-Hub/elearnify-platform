// layouts/DashboardLayout.jsx
import Sidebar from '../components/Sidebar';
import TopBar  from '../components/TopBar';

const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex h-screen overflow-hidden
      bg-[var(--bg-secondary)] transition-colors duration-200">

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <TopBar title={title} subtitle={subtitle} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6
          bg-[var(--bg-secondary)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;