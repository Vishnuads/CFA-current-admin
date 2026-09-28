import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../api";
import {
  GraduationCap,
  UserPlus,
  Briefcase,
  Mail,
  Wrench,
  CalendarDays,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

interface StatCardData {
  label: string;
  value: string;
  icon: LucideIcon;
  loading?: boolean;
}

export default function Dashboard() {
  // These two are wired to your existing backend and fetched for real.
  const [coursesCount, setCoursesCount] = useState<number | null>(null);
  const [placementsCount, setPlacementsCount] = useState<number | null>(null);
  const [eventsCount, setEventsCount] = useState(null);
  const [admissionCount, setAdmissionCount] = useState(null);
  const [orderCount, setOrderCount] = useState(null);
  const [enquiryCount, setEnquiryCount] = useState(null);
  const [workshopCount, setWorkshopCount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          deptRes,
          placementRes,
          eventsRes,
          admissionRes,
          orderRes,
          contactRes,
          workshopRes,
        ] = await Promise.all([
          axios.get(`${BASE_URL}/api/departments/get`),
          axios.get(`${BASE_URL}/api/placements/get`),
          axios.get(`${BASE_URL}/api/events/get`),
          axios.get(`${BASE_URL}/api/admission/get`),
          axios.get(`${BASE_URL}/api/bookOrders/get`),
          axios.get(`${BASE_URL}/api/contact/get`),
          axios.get(`${BASE_URL}/api/workshops/get`)
        ]);
        setCoursesCount((deptRes.data.data || []).length);
        setPlacementsCount((placementRes.data.data || []).length);
        setEventsCount((eventsRes.data.data || []).length);
        setAdmissionCount((admissionRes.data.data || []).length);
        setOrderCount((orderRes.data.data || []).length);
        setEnquiryCount((contactRes.data.data || []).length);
        setWorkshopCount((workshopRes.data.data || []).length);

        // console.log(workshopRes.data.data[0].isActive ? "1" : "0");
        
      } catch (err) {
        setError("Could not load live counts. Is the backend running?");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const stats: StatCardData[] = [
    {
      label: "Courses",
      value: loading ? "–" : String(coursesCount ?? 0),
      icon: GraduationCap,
    },

    {
      label: "Placements",
      value: loading ? "–" : String(placementsCount ?? 0),
      icon: Briefcase,
    },
    {
      label: "Events",
      value: loading ? "0" : String(eventsCount) + "+",
      icon: CalendarDays,
    },
    {
      label: "Active Workshops",
      value: loading ? "0" : String(workshopCount),
      icon: Wrench,
    },
    {
      label: "Contact Form",
      value: loading ? "0" : String(enquiryCount ?? 0),
      icon: Mail,
    },

    {
      label: "Admissions",
      value: loading ? "0" : String(admissionCount ?? 0),
      icon: UserPlus,
    },

    {
      label: "Book Orders",
      value: loading ? "0" : String(orderCount ?? 0),
      icon: ShoppingCart,
    },
  ];

  return (
    <section className="mx-auto w-full max-w-4xl ">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          A quick overview across every part of the site.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <Icon size={22} className="text-gray-900" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none text-gray-900">
                {value}
              </p>
              <p className="mt-1.5 text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
