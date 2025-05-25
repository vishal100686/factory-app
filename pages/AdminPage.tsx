
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { useAppContext } from '../contexts/AppContext';
import IssueCard from '../components/IssueCard';
import { Submission, SubmissionStatus, User } from '../types';
import { CATEGORIES_DATA } from '../constants';
import Button from '../components/ui/Button';
import MonthlyThemeManager from '../components/admin/MonthlyThemeManager';

type AdminTab = 'submissions' | 'themes' | 'supervisors';

const AdminPage: React.FC = () => {
  const { submissions, users, currentUser, isLoading, error } = useAppContext();
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | 'ALL'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AdminTab>('submissions');

  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter(sub => {
        const statusMatch = filterStatus === 'ALL' || sub.status === filterStatus;
        const categoryMatch = filterCategory === 'ALL' || sub.category === filterCategory;
        const employeeMatch = filterEmployeeId === 'ALL' || sub.employeeId === filterEmployeeId;
        const searchMatch = searchTerm === '' ||
                            sub.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            sub.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
        return statusMatch && categoryMatch && employeeMatch && searchMatch;
      })
      .sort((a, b) => {
        if (a.status === SubmissionStatus.RED_HOT && b.status !== SubmissionStatus.RED_HOT) return -1;
        if (a.status !== SubmissionStatus.RED_HOT && b.status === SubmissionStatus.RED_HOT) return 1;
        if (a.status === SubmissionStatus.OPEN && b.status !== SubmissionStatus.OPEN) return -1;
        if (a.status !== SubmissionStatus.OPEN && b.status === SubmissionStatus.OPEN) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [submissions, filterStatus, filterCategory, filterEmployeeId, searchTerm]);

  const supervisorList = useMemo(() => {
    return users.filter(user => user.isAdmin);
  }, [users]);

  if (!currentUser?.isAdmin) {
    return (
      <div className="text-center p-8 bg-red-100 text-red-700 rounded-md shadow">
        Access Denied. This page is for administrators only.
      </div>
    );
  }

  if (isLoading && !currentUser) {
    return <div className="flex justify-center items-center h-64"><p className="text-xl text-brand-primary">Loading Admin Panel...</p></div>;
  }

  if (error) {
    return <div className="text-center p-8 bg-red-100 text-red-700 rounded-md shadow">{error}</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'submissions':
        return (
          <section>
            <h2 className="text-2xl font-semibold text-brand-dark mb-4">Manage Submissions</h2>
            <div className="bg-white p-4 rounded-lg shadow-md space-y-4 md:space-y-0 md:flex md:flex-wrap md:justify-between md:items-center mb-6">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label htmlFor="statusFilter" className="text-sm font-medium text-sky-800 mr-2">Status:</label>
                  <select
                    id="statusFilter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as SubmissionStatus | 'ALL')}
                    className="p-2 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
                  >
                    <option value="ALL">All Statuses</option>
                    {Object.values(SubmissionStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="categoryFilter" className="text-sm font-medium text-sky-800 mr-2">Category:</label>
                  <select
                    id="categoryFilter"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="p-2 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
                  >
                    <option value="ALL">All Categories</option>
                    {CATEGORIES_DATA.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="employeeFilter" className="text-sm font-medium text-sky-800 mr-2">Employee:</label>
                  <select
                    id="employeeFilter"
                    value={filterEmployeeId}
                    onChange={(e) => setFilterEmployeeId(e.target.value)}
                    className="p-2 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
                  >
                    <option value="ALL">All Employees</option>
                    {users.filter(u => !u.isAdmin).map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <input
                type="text"
                placeholder="Search by ID, description, user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border border-sky-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary w-full md:w-auto mt-4 md:mt-0"
              />
            </div>

            {filteredSubmissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSubmissions.map(submission => (
                  <IssueCard key={submission.id} submission={submission} isAdminView={true} />
                ))}
              </div>
            ) : (
              <p className="text-center text-sky-700 py-8">No submissions match the current filters.</p>
            )}
          </section>
        );
      case 'themes':
        return <MonthlyThemeManager />;
      case 'supervisors':
        return (
          <section>
            <h2 className="text-2xl font-semibold text-brand-dark mb-4">Manage Supervisors</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              {supervisorList.length > 0 ? (
                <ul className="divide-y divide-sky-200">
                  {supervisorList.map(supervisor => (
                    <li key={supervisor.id} className="py-3">
                      <p className="text-md font-medium text-brand-primary">{supervisor.name}</p>
                      <p className="text-sm text-sky-600">{supervisor.id}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sky-700">No supervisors found.</p>
              )}
              {/* Add functionality to add/remove supervisors would go here */}
            </div>
          </section>
        );
      default:
        return null;
    }
  };


  return (
    <div className="space-y-8">
      <header className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold text-brand-dark mb-4 sm:mb-0">Admin Dashboard</h1>
             <Link to="/admin/reports">
                <Button variant="secondary">View Analytics Reports</Button>
            </Link>
        </div>

        <nav className="mt-6 border-b border-sky-200">
          <ul className="flex flex-wrap -mb-px">
            <li>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`inline-block p-4 border-b-2 rounded-t-lg font-medium transition-colors ${activeTab === 'submissions' ? 'border-brand-primary text-brand-primary' : 'border-transparent hover:text-sky-600 hover:border-sky-300'}`}
              >
                Submissions ({filteredSubmissions.length})
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('themes')}
                className={`inline-block p-4 border-b-2 rounded-t-lg font-medium transition-colors ${activeTab === 'themes' ? 'border-brand-primary text-brand-primary' : 'border-transparent hover:text-sky-600 hover:border-sky-300'}`}
              >
                Monthly Themes
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('supervisors')}
                className={`inline-block p-4 border-b-2 rounded-t-lg font-medium transition-colors ${activeTab === 'supervisors' ? 'border-brand-primary text-brand-primary' : 'border-transparent hover:text-sky-600 hover:border-sky-300'}`}
              >
                Supervisors ({supervisorList.length})
              </button>
            </li>
          </ul>
        </nav>
      </header>
      
      <main className="p-2 sm:p-0">
        {renderTabContent()}
      </main>
    </div>
  );
};
// FIX: Add default export for AdminPage component.
export default AdminPage;
