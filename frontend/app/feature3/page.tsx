import { FormEvent, useState } from "react";

const today = new Date().toISOString().split("T")[0];

type EventForm = {
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  host: string;
  description: string;
  selectedCategories: number[];
};

type EventModalProps = {
  categories: { id: number; name: string }[];
  onSubmit?: (event: {
    name: string;
    start: string;
    end: string;
    location: string;
    host: string;
    description: string;
    category: number[];
  }) => void;
};

const emptyForm: EventForm = {
  name: "",
  startDate: today,
  startTime: "12:00",
  endDate: today,
  endTime: "13:00",
  location: "",
  host: "",
  description: "",
  selectedCategories: [],
};

function toDatetime(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

function ErrorMessage({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="text-xs text-red-500 mt-1">{text}</p>;
}

function inputClass(hasError?: string): string {
  return `w-full border rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 focus:border-cyan-400 focus:ring-cyan-100"
  }`;
}

export default function EventModal({ categories, onSubmit }: EventModalProps){
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [success, setSuccess] = useState(false);

  function updateField(field: keyof EventForm, value: string | number[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function toggleCategory(id: number) {
    setForm((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(id)
        ? prev.selectedCategories.filter((c) => c !== id)
        : [...prev.selectedCategories, id],
    }));
  }

  function validate() {
	const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Event name is required.";
    else if (form.name.length > 100) errs.name = "Maximum 100 characters.";
    if (!form.startDate) errs.startDate = "Required.";
    if (!form.startTime) errs.startTime = "Required.";
    if (!form.endDate) errs.endDate = "Required.";
    if (!form.endTime) errs.endTime = "Required.";
    if (form.startDate && form.startTime && form.endDate && form.endTime) {
      if (toDatetime(form.endDate, form.endTime) <= toDatetime(form.startDate, form.startTime)) {
        errs.endDate = "End must be after start.";
      }
    }
    if (form.location.length > 100) errs.location = "Maximum 100 characters.";
    if (!form.host.trim()) errs.host = "Organizer is required.";
    else if (form.host.length > 100) errs.host = "Maximum 100 characters.";
    if (form.selectedCategories.length === 0) errs.selectedCategories = "Select at least one category.";
    return errs;
  }

 
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit?.({
      name: form.name.trim(),
      start: toDatetime(form.startDate, form.startTime).toISOString(),
      end: toDatetime(form.endDate, form.endTime).toISOString(),
      location: form.location.trim(),
      host: form.host.trim(),
      description: form.description.trim(),
      category: form.selectedCategories,
    });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setOpen(false);
      setForm(emptyForm);
      setErrors({});
    }, 1600);
  }

  function handleClose() {
    setOpen(false);
    setForm(emptyForm);
    setErrors({});
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
      >
        + Add Event
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
            <div className="flex items-start justify-between px-7 pt-6 pb-4 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">Add Event</h2>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="h-px bg-slate-100 mx-7 shrink-0" />

            <form onSubmit={handleSubmit} className="overflow-y-auto px-7 py-5 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass(errors.name)}
                  placeholder="What's the event?"
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  autoFocus
                />
                <div className="flex justify-between mt-1">
                  <ErrorMessage text={errors.name} />
                  <span className="text-xs text-slate-400 ml-auto">{form.name.length}/100</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Start <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      className={inputClass(errors.startDate)}
                      value={form.startDate}
                      onChange={(e) => updateField("startDate", e.target.value)}
                    />
                    <ErrorMessage text={errors.startDate} />
                  </div>
                  <div>
                    <input
                      type="time"
                      className={inputClass(errors.startTime)}
                      value={form.startTime}
                      onChange={(e) => updateField("startTime", e.target.value)}
                    />
                    <ErrorMessage text={errors.startTime} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  End <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      className={inputClass(errors.endDate)}
                      value={form.endDate}
                      onChange={(e) => updateField("endDate", e.target.value)}
                    />
                    <ErrorMessage text={errors.endDate} />
                  </div>
                  <div>
                    <input
                      type="time"
                      className={inputClass(errors.endTime)}
                      value={form.endTime}
                      onChange={(e) => updateField("endTime", e.target.value)}
                    />
                    <ErrorMessage text={errors.endTime} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Location <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  className={inputClass(errors.location)}
                  placeholder="McCosh 50, Frist Campus Center, etc."
                  maxLength={100}
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                />
                <div className="flex justify-between mt-1">
                  <ErrorMessage text={errors.location} />
                  <span className="text-xs text-slate-400 ml-auto">{form.location.length}/100</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Organizer <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass(errors.host)}
                  placeholder="e.g., Princeton Coding Club"
                  maxLength={100}
                  value={form.host}
                  onChange={(e) => updateField("host", e.target.value)}
                />
                <div className="flex justify-between mt-1">
                  <ErrorMessage text={errors.host} />
                  <span className="text-xs text-slate-400 ml-auto">{form.host.length}/100</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Description <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  className={`${inputClass(errors.description)} resize-y min-h-20`}
                  placeholder="Optional details about the event..."
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors text-center ${
                        form.selectedCategories.includes(cat.id)
                          ? "bg-cyan-500 border-cyan-500 text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:border-cyan-300 hover:text-cyan-600"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                <ErrorMessage text={errors.selectedCategories} />
              </div>

              <div className="flex justify-end gap-2.5 pt-1 pb-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="border border-slate-200 text-slate-600 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`font-semibold text-sm px-5 py-2.5 rounded-lg text-white transition-colors ${
                    success ? "bg-green-500" : "bg-cyan-500 hover:bg-cyan-600"
                  }`}
                >
                  {success ? "✓ Event Created!" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
