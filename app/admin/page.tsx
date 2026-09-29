"use client";

import { useState } from "react";
import { Upload, Plus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function AdminIMS() {
  const [formData, setFormData] = useState({
    name: "",
    category: "Roses",
    stem_length: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [responseMsg, setResponseMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setResponseMsg({ type: "error", text: "Please select an image file." });
      return;
    }

    setSubmitting(true);
    setResponseMsg(null);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("stem_length", formData.stem_length);
    data.append("description", formData.description);
    data.append("image", imageFile);

    try {
      const res = await fetch("/api/add_flower.php", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (result.status === "success") {
        setResponseMsg({ type: "success", text: result.message });
        setFormData({ name: "", category: "Roses", stem_length: "", description: "" });
        setImageFile(null);
        setPreviewUrl(null);
      } else {
        setResponseMsg({ type: "error", text: result.message });
      }
    } catch (err: any) {
      setResponseMsg({ type: "error", text: "Failed to connect to backend server." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Plus className="text-amber-600" /> Flower Inventory Management
          </h1>
          <p className="text-sm text-slate-500">
            Upload new flower species and details to display on the Export catalog.
          </p>
        </div>

        {/* Feedback Message */}
        {responseMsg && (
          <div
            className={`p-4 mb-6 rounded-lg flex items-center gap-3 text-sm font-medium ${
              responseMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {responseMsg.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-600" />
            ) : (
              <AlertCircle size={18} className="text-red-600" />
            )}
            <span>{responseMsg.text}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Flower Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Red Naomi Rose"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm bg-white"
              >
                <option value="Roses">Roses</option>
                <option value="Spray Roses">Spray Roses</option>
                <option value="Carnations">Carnations</option>
                <option value="Lilies">Lilies</option>
                <option value="Summer Flowers">Summer Flowers</option>
              </select>
            </div>

            {/* Stem Length */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Stem Length</label>
              <input
                type="text"
                name="stem_length"
                required
                value={formData.stem_length}
                onChange={handleInputChange}
                placeholder="e.g., 60-80 cm"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              />
            </div>

            {/* Image Upload Input */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Flower Image</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Image Preview Box */}
          {previewUrl && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Description / Export Notes</label>
            <textarea
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide export details, vase life, or colour descriptions..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading Flower...
              </>
            ) : (
              <>
                <Upload size={16} /> Save & Publish Flower
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}