import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";

import NotFound from "./pages/OtherPage/NotFound";

import Workshops from "./pages/Workshop/Workshops";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Createform from "./pages/Workshop/Createform";
import Events from "./pages/Events/Events";
import FormPage from "./pages/Events/FormPage";
import Books from "./pages/Books/Books";
import PlacementsForm from "./pages/Placements/PlacementsForm2";
import Department from "./pages/Department/Department";
import Placements from "./pages/Placements/Placements";
import WorkshopRegistration from "./pages/Workshop/WorkshopRegistration";
import AdmissionRegistration from "./pages/AdmissionRegistration";
import Enquiry from "./pages/Enquiry";
import ProtectRoute from "./components/auth/ProtectRoute";
import "react-toastify/dist/ReactToastify.css";
import Mentors from "./pages/Mentors/Mentors";
import JobApplications from "./pages/JobApplications"
import Jobs from "./pages/Jobs/Jobs";
import JobForm from "./pages/Jobs/JobForm";

import VaJobs from "./pages/Va-Jobs/Jobs";
import VaApplications from "./pages/Va-Jobs/JobApplications"
import VaForm from "./pages/Va-Jobs/JobForm"

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route
            element={
              <ProtectRoute>
                <AppLayout />
              </ProtectRoute>
            }
          >
            <Route index path="/" element={<Home />} />
            <Route path="/courses" element={<Department />} />
            <Route path="/workshops" element={<Workshops />} />
            <Route path="/create-workshop" element={<Createform />} />
            <Route path="/edit-workshop/:id" element={<Createform />} />
            <Route path="/workshop-registrations" element={<WorkshopRegistration />} />
            <Route path="/events" element={<Events />} />
            <Route path="/create-event" element={<FormPage />} />
            <Route path="/edit-event/:id" element={<FormPage />} />
            <Route path="/books" element={<Books />} />
            <Route path="/add-placements" element={<PlacementsForm />} />
            <Route path="/edit-placements/:id" element={<PlacementsForm />} />
            <Route path="/placements" element={<Placements />} />
            <Route path="/admissions" element={<AdmissionRegistration />} />
            <Route path="/contact" element={<Enquiry />} />
            <Route path="/mentors" element={<Mentors/>} />

            <Route path="/applications" element={<JobApplications/>} />
            <Route path="/careers" element={<Jobs/>} />
            <Route path="/add-jobs" element={<JobForm/>} />
            <Route path="/edit-jobs/:id" element={<JobForm/>} />
            {/* Vishnuads Jobs */}
            <Route path="/va-careers" element={<VaJobs/>} />
            <Route path="/va-careers/add-jobs" element={<VaForm/>} />
            <Route path="/va-careers/edit-jobs/:id" element={<VaForm/>} />
             <Route path="/va-careers/applications" element={<VaApplications/>} />
          </Route>

          {/* Auth Layout */}
          <Route path="/login" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
