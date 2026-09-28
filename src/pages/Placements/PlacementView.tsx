import { X } from "lucide-react";
import BASE_URL from "../../api";


interface PlacementViewModalProps {
  placement: PlacementRecord;
  close: () => void;
}

export interface PlacementRecord {
  _id: string;
  name: string;
  role: string;
  company: string;
  note?: string;
  type?: string;
  department: { _id: string; name: string; slug: string } | string;
  order: number;
  isActive: boolean;
  studentImage: string | null;
  companyLogo: string | null;
  workImages: string[];
}

export default function PlacementViewModal({
  placement,
  close,
}: PlacementViewModalProps) {
  const departmentName =
    typeof placement.department === "string"
      ? placement.department
      : placement.department?.name;

  const detailRows: { label: string; value: string | null | undefined }[] = [
    { label: "Role", value: placement.role },
    { label: "Company", value: placement.company },
    { label: "Department", value: departmentName },
    { label: "Note", value: placement.note },
    { label: "Type", value: placement.type },
    { label: "Status", value: placement.isActive ? "Active" : "Inactive" },
    { label: "Display order", value: String(placement.order) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="relative my-8 w-full max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-900"
        >
          <X size={18} />
        </button>

        <div className="mb-6 flex items-center gap-4">
          {placement.studentImage ? (
            <img
              src={`${BASE_URL}${placement.studentImage}`}
              alt={placement.name}
              className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-xs text-gray-400">
              No photo
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {placement.name}
            </h2>
            <p className="text-sm text-gray-500">{placement.role}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <dl className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {detailRows
              .filter((row) => row.value)
              .slice(0, 4)
              .map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                >
                  <dt className="text-sm text-gray-500">{row.label}</dt>
                  <dd className="text-right text-sm font-medium text-gray-900">
                    {row.value}
                  </dd>
                </div>
              ))}
          </dl>
          <dl className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {detailRows
              .filter((row) => row.value)
              .slice(4, 7)
              .map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                >
                  <dt className="text-sm text-gray-500">{row.label}</dt>
                  <dd className="text-right text-sm font-medium text-gray-900">
                    {row.value}
                  </dd>
                </div>
              ))}
          </dl>
        </div>

        <div className="grid grid-cols1 sm:grid-cols-2 gap-4">
          {placement.companyLogo && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-gray-900">
                Company logo
              </p>
              <img
                src={`${BASE_URL}${placement.companyLogo}`}
                alt={`${placement.company} logo`}
                className="h-20 w-20 rounded-lg border border-gray-200 bg-gray-50 object-contain"
              />
            </div>
          )}

          {placement.workImages.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-gray-900">
                Work samples
              </p>
              <div className="flex flex-wrap gap-3">
                {placement.workImages.map((src) => (
                  <img
                    key={src}
                    src={`${BASE_URL}${src}`}
                    alt="Work sample"
                    className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* <button
          type="button"
          onClick={close}
          className="mt-8 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
        >
          Close
        </button> */}
      </div>
    </div>
  );
}
