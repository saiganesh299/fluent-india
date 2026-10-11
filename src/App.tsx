import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { OverviewPage } from './pages/OverviewPage';
import { StudentsPage } from './pages/StudentsPage';
import { CoursesPage } from './pages/CoursesPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ReviewDetailPage } from './pages/ReviewDetailPage';
import { WebsiteContentPage } from './pages/WebsiteContentPage';
import { EnquiriesPage } from './pages/EnquiriesPage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicWebsitePage } from './pages/PublicWebsitePage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Preserved Public Website at / */}
      <Route path="/" element={<PublicWebsitePage />} />

      {/* Tutor Workspace Admin Shell at /admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="materials" element={<MaterialsPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="reviews/:submissionId" element={<ReviewDetailPage />} />
        <Route path="content" element={<WebsiteContentPage />} />
        <Route path="enquiries" element={<EnquiriesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback to /admin */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};
