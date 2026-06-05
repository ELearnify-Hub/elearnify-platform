// layouts/DashboardLayout.jsx
// Wraps any dashboard page with Sidebar + TopBar
import Sidebar from '../components/Sidebar';
import TopBar  from '../components/TopBar';

const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* Sidebar — fixed on left */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <TopBar title={title} subtitle={subtitle} />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;