import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Submission, SubmissionStatus } from '../types';
import { CATEGORIES_DATA } from '../constants';
import Button from '../components/ui/Button';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Helper to get current date in YYYY-MM-DD format
const getIsoDate = (date = new Date()) => date.toISOString().split('T')[0];

const ReportsPage: React.FC = () => {
  const { submissions, currentUser, users, isLoading: appContextIsLoading, error: appContextError } = useAppContext();

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus | 'ALL'>('ALL');
  
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const uniqueDepartments = Array.from(new Set(submissions.map(s => s.divisionName).filter(Boolean))) as string[];
    setDepartments(uniqueDepartments.sort());
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const submissionDate = new Date(sub.timestamp);
      const isAfterStartDate = !startDate || submissionDate >= new Date(startDate + "T00:00:00");
      const isBeforeEndDate = !endDate || submissionDate <= new Date(endDate + "T23:59:59");
      const departmentMatch = selectedDepartment === 'ALL' || sub.divisionName === selectedDepartment;
      const categoryMatch = selectedCategory === 'ALL' || sub.category === selectedCategory;
      const statusMatch = selectedStatus === 'ALL' || sub.status === selectedStatus;
      
      return isAfterStartDate && isBeforeEndDate && departmentMatch && categoryMatch && statusMatch;
    }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [submissions, startDate, endDate, selectedDepartment, selectedCategory, selectedStatus]);

  const summaryStats = useMemo(() => {
    const totalSubmissions = filteredSubmissions.length;
    const resolvedIssues = filteredSubmissions.filter(s => s.status === SubmissionStatus.CLOSED).length;
    const openIssues = totalSubmissions - resolvedIssues; // Could be more nuanced based on other statuses
    const totalRewards = filteredSubmissions.reduce((acc, curr) => acc + (curr.rewardPoints || 0), 0);
    return { totalSubmissions, resolvedIssues, openIssues, totalRewards };
  }, [filteredSubmissions]);

  const categoryDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {};
    filteredSubmissions.forEach(sub => {
      distribution[sub.category] = (distribution[sub.category] || 0) + 1;
    });
    return Object.entries(distribution)
      .map(([name, count]) => ({ name, count, percentage: summaryStats.totalSubmissions > 0 ? ((count / summaryStats.totalSubmissions) * 100).toFixed(1) : 0}))
      .sort((a,b) => b.count - a.count);
  }, [filteredSubmissions, summaryStats.totalSubmissions]);

  const weeklyTrend = useMemo(() => {
    const trend: { [key: string]: number } = {};
    filteredSubmissions.forEach(sub => {
      const date = new Date(sub.timestamp);
      const year = date.getFullYear();
      const week = Math.ceil((((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
      const weekKey = `${year}-W${week.toString().padStart(2, '0')}`;
      trend[weekKey] = (trend[weekKey] || 0) + 1;
    });
    return Object.entries(trend).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([week, count]) => ({week, count}));
  }, [filteredSubmissions]);

  const departmentFrequency = useMemo(() => {
     const frequency: { [key: string]: number } = {};
     filteredSubmissions.forEach(sub => {
       const dept = sub.divisionName || 'N/A';
       frequency[dept] = (frequency[dept] || 0) + 1;
     });
     return Object.entries(frequency)
        .map(([name, count]) => ({ name, count }))
        .sort((a,b) => b.count - a.count);
  }, [filteredSubmissions]);


  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedDepartment('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  const handleExportExcel = useCallback(() => {
    const dataToExport = filteredSubmissions.map(sub => ({
      ID: sub.id,
      Date: new Date(sub.timestamp).toLocaleDateString(),
      Time: new Date(sub.timestamp).toLocaleTimeString(),
      Employee: sub.employeeName,
      Department: sub.divisionName || 'N/A',
      Description: sub.description,
      Category: sub.category,
      Subcategory: sub.subCategory,
      Status: sub.status,
      Points: sub.rewardPoints || 0
    }));

    const summarySheetData = [
        ["FactoryPulse Analytics Report"],
        ["Filters Applied:"],
        ["Start Date:", startDate || "Not set"],
        ["End Date:", endDate || "Not set"],
        ["Department:", selectedDepartment],
        ["Category:", selectedCategory],
        ["Status:", selectedStatus],
        [],
        ["Summary Statistics:"],
        ["Total Submissions:", summaryStats.totalSubmissions],
        ["Resolved Issues:", summaryStats.resolvedIssues],
        ["Open Issues (non-Closed):", summaryStats.totalSubmissions - summaryStats.resolvedIssues],
        ["Total Rewards Given:", summaryStats.totalRewards],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
    const wsData = XLSX.utils.json_to_sheet(dataToExport);
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, wsData, "Submissions Data");
    XLSX.writeFile(wb, `FactoryPulse_Report_${getIsoDate()}.xlsx`);
  }, [filteredSubmissions, startDate, endDate, selectedDepartment, selectedCategory, selectedStatus, summaryStats]);

  const handleExportPdf = useCallback(() => {
    const doc = new jsPDF();
    const tableColumn = ["Date", "Employee", "Department", "Summary", "Category", "Status", "Points"];
    const tableRows: (string | number)[][] = [];

    filteredSubmissions.forEach(sub => {
      const submissionData = [
        new Date(sub.timestamp).toLocaleDateString(),
        sub.employeeName,
        sub.divisionName || "N/A",
        sub.description.substring(0, 30) + (sub.description.length > 30 ? "..." : ""),
        sub.category,
        sub.status,
        sub.rewardPoints || 0
      ];
      tableRows.push(submissionData);
    });

    doc.setFontSize(18);
    doc.text("FactoryPulse Analytics Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    let startY = 30;
    doc.text(`Filters: ${startDate || 'Any Date'} to ${endDate || 'Any Date'}, Dept: ${selectedDepartment}, Cat: ${selectedCategory}, Status: ${selectedStatus}`, 14, startY);
    startY += 10;

    doc.setFontSize(14);
    doc.text("Summary Statistics", 14, startY);
    startY += 7;
    doc.setFontSize(10);
    doc.text(`Total Submissions: ${summaryStats.totalSubmissions}`, 14, startY);
    startY += 5;
    doc.text(`Resolved Issues: ${summaryStats.resolvedIssues}`, 14, startY);
    startY += 5;
    doc.text(`Open Issues (Non-Closed): ${summaryStats.totalSubmissions - summaryStats.resolvedIssues}`, 14, startY);
    startY += 5;
    doc.text(`Total Rewards Given: ${summaryStats.totalRewards}`, 14, startY);
    startY += 10;
    
    (doc as any).autoTable({
        startY: startY,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138] } // brand-primary
    });
    
    startY = (doc as any).lastAutoTable.finalY + 10;

    // Add text visualizations to PDF
    doc.setFontSize(14);
    doc.text("Category Distribution", 14, startY);
    startY += 7;
    doc.setFontSize(10);
    categoryDistribution.forEach(cat => {
        doc.text(`${cat.name}: ${cat.count} submissions (${cat.percentage}%)`, 14, startY);
        startY+=5;
        if (startY > 270) { doc.addPage(); startY = 20; }
    });
    startY += 5;
    if (startY > 270) { doc.addPage(); startY = 20; }


    doc.setFontSize(14);
    doc.text("Weekly Trend", 14, startY);
    startY += 7;
    doc.setFontSize(10);
    weeklyTrend.forEach(week => {
        doc.text(`${week.week}: ${week.count} submissions`, 14, startY);
        startY+=5;
        if (startY > 270) { doc.addPage(); startY = 20; }
    });
    startY += 5;
    if (startY > 270) { doc.addPage(); startY = 20; }

    doc.setFontSize(14);
    doc.text("Department Submission Frequency", 14, startY);
    startY += 7;
    doc.setFontSize(10);
    departmentFrequency.forEach(dept => {
        doc.text(`${dept.name}: ${dept.count} submissions`, 14, startY);
        startY+=5;
         if (startY > 270) { doc.addPage(); startY = 20; }
    });


    doc.save(`FactoryPulse_Report_${getIsoDate()}.pdf`);
  }, [filteredSubmissions, startDate, endDate, selectedDepartment, selectedCategory, selectedStatus, summaryStats, categoryDistribution, weeklyTrend, departmentFrequency]);


  if (!currentUser?.isAdmin) {
    return <div className="text-center p-8 bg-red-100 text-red-700 rounded-md shadow">Access Denied. This page is for administrators only.</div>;
  }

  if (appContextIsLoading && !currentUser) {
    return <div className="flex justify-center items-center h-64"><p className="text-xl text-brand-primary">Loading Reports...</p></div>;
  }

  if (appContextError) {
    return <div className="text-center p-8 bg-red-100 text-red-700 rounded-md shadow">{appContextError}</div>;
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 bg-sky-50 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-brand-dark mb-6">Analytics Reports</h1>

      {/* Filters Section */}
      <section className="p-6 bg-white rounded-lg shadow space-y-4 border border-brand-primary">
        <h2 className="text-xl font-semibold text-brand-dark mb-3">Filter Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-sky-800">Start Date</label>
            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 p-2 w-full border border-sky-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-sky-800">End Date</label>
            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 p-2 w-full border border-sky-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label htmlFor="departmentFilter" className="block text-sm font-medium text-sky-800">Department</label>
            <select id="departmentFilter" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} className="mt-1 p-2 w-full border border-sky-300 rounded-md shadow-sm">
              <option value="ALL">All Departments</option>
              {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="categoryFilter" className="block text-sm font-medium text-sky-800">Category</label>
            <select id="categoryFilter" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="mt-1 p-2 w-full border border-sky-300 rounded-md shadow-sm">
              <option value="ALL">All Categories</option>
              {CATEGORIES_DATA.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-sky-800">Status</label>
            <select id="statusFilter" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as SubmissionStatus | 'ALL')} className="mt-1 p-2 w-full border border-sky-300 rounded-md shadow-sm">
              <option value="ALL">All Statuses</option>
              {Object.values(SubmissionStatus).map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <Button onClick={handleClearFilters} variant="outline" className="w-full md:w-auto">Clear Filters</Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleExportExcel} variant="secondary" disabled={filteredSubmissions.length === 0}>Export to Excel</Button>
            <Button onClick={handleExportPdf} variant="primary" disabled={filteredSubmissions.length === 0}>Export to PDF</Button>
        </div>
      </section>

      {/* Summary Statistics */}
      <section className="p-6 bg-white rounded-lg shadow border border-brand-secondary">
        <h2 className="text-xl font-semibold text-brand-dark mb-4">Summary Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-brand-light rounded shadow">
            <p className="text-3xl font-bold text-brand-primary">{summaryStats.totalSubmissions}</p>
            <p className="text-sky-700">Total Submissions</p>
          </div>
          <div className="p-4 bg-brand-light rounded shadow">
            <p className="text-3xl font-bold text-green-600">{summaryStats.resolvedIssues}</p>
            <p className="text-sky-700">Resolved Issues</p>
          </div>
          <div className="p-4 bg-brand-light rounded shadow">
            <p className="text-3xl font-bold text-yellow-600">{summaryStats.totalSubmissions - summaryStats.resolvedIssues}</p>
            <p className="text-sky-700">Open/Pending Issues</p>
          </div>
          <div className="p-4 bg-brand-light rounded shadow">
            <p className="text-3xl font-bold text-brand-accent">{summaryStats.totalRewards}</p>
            <p className="text-sky-700">Total Reward Points</p>
          </div>
        </div>
      </section>

      {/* Visualizations (Text-Based) */}
      <section className="p-6 bg-white rounded-lg shadow border border-brand-accent">
        <h2 className="text-xl font-semibold text-brand-dark mb-4">Visual Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-brand-primary mb-2">Category Distribution</h3>
            {categoryDistribution.length > 0 ? categoryDistribution.map(cat => (
              <p key={cat.name} className="text-sm text-slate-700">{cat.name}: {cat.count} ({cat.percentage}%)</p>
            )) : <p className="text-sm text-sky-600">No data for category distribution.</p>}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-primary mb-2">Weekly Submission Trend</h3>
            {weeklyTrend.length > 0 ? weeklyTrend.slice(-10).map(week => ( // Show last 10 weeks for brevity
              <p key={week.week} className="text-sm text-slate-700">{week.week}: {week.count} submissions</p>
            )) : <p className="text-sm text-sky-600">No data for weekly trend.</p>}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-primary mb-2">Department Submission Frequency</h3>
            {departmentFrequency.length > 0 ? departmentFrequency.map(dept => (
              <p key={dept.name} className="text-sm text-slate-700">{dept.name}: {dept.count} submissions</p>
            )) : <p className="text-sm text-sky-600">No data for department frequency.</p>}
          </div>
        </div>
      </section>
      

      {/* Data Table */}
      <section className="bg-white rounded-lg shadow overflow-x-auto">
        <h2 className="text-xl font-semibold text-brand-dark p-4 border-b border-sky-200">Filtered Submissions ({filteredSubmissions.length})</h2>
        {filteredSubmissions.length > 0 ? (
          <table className="min-w-full divide-y divide-sky-200">
            <thead className="bg-sky-100">
              <tr>
                {['Date', 'Employee', 'Department', 'Summary', 'Category', 'Subcategory', 'Status', 'Points'].map(col => (
                  <th key={col} scope="col" className="px-4 py-3 text-left text-xs font-medium text-sky-700 uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-sky-200">
              {filteredSubmissions.map(sub => (
                <tr key={sub.id} className="hover:bg-sky-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{new Date(sub.timestamp).toLocaleDateString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{sub.employeeName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{sub.divisionName || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate" title={sub.description}>{sub.description}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{sub.category}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{sub.subCategory}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${sub.status === SubmissionStatus.CLOSED ? 'bg-green-100 text-green-800' : 
                          sub.status === SubmissionStatus.OPEN ? 'bg-yellow-100 text-yellow-800' :
                          sub.status === SubmissionStatus.RED_HOT ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'}`}>
                        {sub.status}
                     </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 text-right">{sub.rewardPoints || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-6 text-center text-sky-600">No submissions match the current filters.</p>
        )}
      </section>
    </div>
  );
};

export default ReportsPage;