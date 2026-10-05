"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import {
  Lock,
  User,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Flower2,
  Users as UsersIcon,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Upload,
} from "lucide-react";

interface Flower {
  id: number;
  name: string;
  category: string;
  stem_length?: string;
  description?: string;
  price: number | string;
  image_url: string;
}

interface UserAccount {
  id: number;
  username: string;
  email: string;
  role: string;
}

const API_BASE = "https://whitevalley.co.ke/api";

export default function AdminDashboard() {
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [loginCreds, setLoginCreds] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"flowers" | "users">("flowers");

  // Data state
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Modal State
  const [flowerModal, setFlowerModal] = useState<Partial<Flower> | null>(null);
  const [userModal, setUserModal] = useState<(Partial<UserAccount> & { password?: string }) | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      startTransition(() => setToken(savedToken));
    }
  }, []);

  const showFeedback = useCallback((type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  // --- AUTH HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch(`${API_BASE}/login.php`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          username: loginCreds.username.trim(),
          password: loginCreds.password,
        }),
      });
      
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem("admin_token", data.token);
        setToken(data.token);
      } else {
        setAuthError(data.debug ? `${data.message} (${JSON.stringify(data.debug)})` : (data.message || "Invalid username or password"));
      }
    } catch (err) {
      console.error("Login Error:", err);
      setAuthError("Failed to connect to authentication server.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
  };

  // --- FLOWERS CRUD ---
  const fetchFlowers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/get_flowers.php`);
      if (!res.ok) throw new Error("Flower request failed.");
      const data = await res.json();
      if (Array.isArray(data)) setFlowers(data);
      else throw new Error("Invalid flower response.");
    } catch {
      showFeedback("error", "Failed to fetch flowers.");
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  const handleSaveFlower = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowerModal) return;

    // Send data as FormData instead of JSON to support file upload
    const formData = new FormData();
    if (flowerModal.id) {
      formData.append("id", String(flowerModal.id));
    }
    formData.append("name", flowerModal.name || "");
    formData.append("category", flowerModal.category || "");
    formData.append("price", String(flowerModal.price ?? ""));
    formData.append("stem_length", flowerModal.stem_length || "");
    formData.append("description", flowerModal.description || "");

    if (selectedFile) {
      // Key must match $_FILES['image'] in flowers.php
      formData.append("image", selectedFile);
    } else if (flowerModal.image_url) {
      formData.append("image_url", flowerModal.image_url);
    } else {
      showFeedback("error", "Please select an image to upload.");
      return;
    }

    setUploadingImage(true);
    try {
      // Do NOT set "Content-Type" header when sending FormData; browser sets boundary automatically
      const res = await fetch(`${API_BASE}/flowers.php`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.status === "success" || data.success) {
        showFeedback("success", flowerModal.id ? "Flower updated!" : "Flower added!");
        setFlowerModal(null);
        setSelectedFile(null);
        fetchFlowers();
      } else {
        showFeedback("error", data.message || "Operation failed.");
      }
    } catch (err) {
      console.error("Save Flower Error:", err);
      showFeedback("error", "Error saving flower data.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteFlower = async (id: number) => {
    if (!confirm("Are you sure you want to delete this flower item?")) return;

    try {
      const res = await fetch(`${API_BASE}/flowers.php`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showFeedback("success", "Flower deleted successfully.");
        fetchFlowers();
      } else {
        showFeedback("error", data.message || "Deletion failed.");
      }
    } catch {
      showFeedback("error", "Server error during deletion.");
    }
  };

  // --- USERS CRUD ---
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/users.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("User request failed.");

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        showFeedback("error", "Server output invalid JSON. Check console for details.");
        return;
      }

      if (data.error) {
        showFeedback("error", data.message || data.error);
      }

      if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data.data)) {
        setUsers(data.data);
      }
    } catch (err) {
      showFeedback("error", "Failed to fetch user accounts.");
    } finally {
      setLoading(false);
    }
  }, [showFeedback, token]);

  useEffect(() => {
    if (token) {
      startTransition(() => setLoading(true));
      if (activeTab === "flowers") fetchFlowers();
      if (activeTab === "users") fetchUsers();
    }
  }, [token, activeTab, fetchFlowers, fetchUsers]);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userModal) return;

    const payload = {
      id: userModal.id ?? null,
      username: userModal.username,
      email: userModal.email,
      role: userModal.role,
      password: userModal.password ?? "",
    };

    try {
      const res = await fetch(`${API_BASE}/users.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        showFeedback("error", data.message || "Failed to save user.");
        return;
      }

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        showFeedback("error", "Failed to parse server response.");
        return;
      }

      if (data.success) {
        showFeedback("success", payload.id ? "User updated!" : "User created!");
        setUserModal(null);
        fetchUsers();
      } else {
        showFeedback("error", data.message || data.error || "Failed to save user.");
      }
    } catch (err) {
      showFeedback("error", "Error saving user record.");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_BASE}/users.php`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json();
        showFeedback("error", data.message || "Failed to delete user.");
        return;
      }

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        showFeedback("error", "Failed to parse server response.");
        return;
      }

      if (data.success) {
        showFeedback("success", "User account removed.");
        fetchUsers();
      } else {
        showFeedback("error", data.message || data.error || "Failed to delete user.");
      }
    } catch (err) {
      showFeedback("error", "Server error deleting user.");
    }
  };

  // --- LOGIN UI ---
  if (!token) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 p-8 shadow-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0f2e23] text-white mb-3">
              <Lock size={20} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#0f2e23]">Admin Portal</h1>
            <p className="text-xs text-stone-500 mt-1">Sign in to manage inventory & users</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} /> {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  value={loginCreds.username}
                  onChange={(e) => setLoginCreds({ ...loginCreds, username: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f2e23]/20"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  required
                  value={loginCreds.password}
                  onChange={(e) => setLoginCreds({ ...loginCreds, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f2e23]/20"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 bg-[#0f2e23] hover:bg-[#194032] text-white font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
            >
              {authLoading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD UI ---
  const filteredFlowers = flowers.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f9f8f6] text-slate-800">
      {/* Top Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-serif font-bold text-lg text-[#0f2e23]">White Valley Admin</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              Authenticated
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-rose-600 hover:text-rose-700 font-medium border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-2 border ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {feedback.msg}
          </div>
        )}

        {/* Navigation Tabs and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex border border-stone-200 bg-white p-1 rounded-2xl">
            <button
              onClick={() => {
                setActiveTab("flowers");
                setSearch("");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "flowers"
                  ? "bg-[#0f2e23] text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Flower2 size={16} /> Flowers Catalog
            </button>
            <button
              onClick={() => {
                setActiveTab("users");
                setSearch("");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "users"
                  ? "bg-[#0f2e23] text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <UsersIcon size={16} /> Manage Users
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f2e23]/20"
              />
            </div>

            {activeTab === "flowers" ? (
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setFlowerModal({ name: "", category: "Bouquets", stem_length: "", description: "", price: "", image_url: "" });
                }}
                className="flex items-center gap-2 bg-[#0f2e23] hover:bg-[#194032] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus size={16} /> Add Flower
              </button>
            ) : (
              <button
                onClick={() => setUserModal({ username: "", email: "", password: "", role: "admin" })}
                className="flex items-center gap-2 bg-[#0f2e23] hover:bg-[#194032] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus size={16} /> Add User
              </button>
            )}
          </div>
        </div>

        {/* Data Tables */}
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">Loading data...</div>
        ) : activeTab === "flowers" ? (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <th className="p-4">Item</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Stem Length</th>
                    <th className="p-4">Price (KSh)</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {filteredFlowers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-stone-500">
                        No flowers found.
                      </td>
                    </tr>
                  ) : (
                    filteredFlowers.map((flower) => (
                      <tr key={flower.id} className="hover:bg-stone-50/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={flower.image_url.startsWith("/") ? `https://whitevalley.co.ke${flower.image_url}` : flower.image_url}
                              alt={flower.name}
                              className="w-10 h-10 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-800">{flower.name}</p>
                              <p className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">
                                {flower.description || "No description provided."}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full text-[10px] font-medium">
                            {flower.category}
                          </span>
                        </td>
                        <td className="p-4 text-stone-600">{flower.stem_length || "Standard"}</td>
                        <td className="p-4 font-bold text-[#0f2e23]">
                          {Number(flower.price).toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedFile(null);
                                setFlowerModal(flower);
                              }}
                              className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteFlower(flower.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <th className="p-4">Username</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-stone-500">
                        No user accounts found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-stone-50/50">
                        <td className="p-4 font-bold text-slate-800">{user.username}</td>
                        <td className="p-4 text-stone-600">{user.email}</td>
                        <td className="p-4">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase">
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setUserModal({ id: user.id, username: user.username, email: user.email, role: user.role })}
                              className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* FLOWER MODAL */}
      {flowerModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-serif font-bold text-lg text-[#0f2e23]">
                {flowerModal.id ? "Edit Flower Item" : "Create New Flower"}
              </h3>
              <button onClick={() => setFlowerModal(null)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFlower} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={flowerModal.name || ""}
                  onChange={(e) => setFlowerModal({ ...flowerModal, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f2e23]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={flowerModal.category || ""}
                    onChange={(e) => setFlowerModal({ ...flowerModal, category: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f2e23]/20"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Price (KSh)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={flowerModal.price || ""}
                    onChange={(e) => setFlowerModal({ ...flowerModal, price: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f2e23]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Stem Length Specification</label>
                <input
                  type="text"
                  value={flowerModal.stem_length || ""}
                  onChange={(e) => setFlowerModal({ ...flowerModal, stem_length: e.target.value })}
                  placeholder="e.g. 50cm - 60cm"
                  className="w-full border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f2e23]/20"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Flower Image Upload</label>
                <div className="flex items-center gap-3">
                  {(selectedFile || flowerModal.image_url) && (
                    <img
                      src={selectedFile ? URL.createObjectURL(selectedFile) : flowerModal.image_url}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                    />
                  )}
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 border border-dashed border-stone-300 rounded-xl p-3 bg-stone-50 hover:bg-stone-100 transition-colors">
                    <Upload size={16} className="text-stone-500" />
                    <span className="text-stone-600 font-medium">
                      {selectedFile ? selectedFile.name : "Select Image File..."}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={flowerModal.description || ""}
                  onChange={(e) => setFlowerModal({ ...flowerModal, description: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f2e23]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFlowerModal(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-[#0f2e23] hover:bg-[#194032] text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {uploadingImage ? "Uploading Image..." : "Save Flower"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER MODAL */}
      {userModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-serif font-bold text-lg text-[#0f2e23]">
                {userModal.id ? "Edit User Account" : "Create New User"}
              </h3>
              <button onClick={() => setUserModal(null)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={userModal.username || ""}
                  onChange={(e) => setUserModal({ ...userModal, username: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f2e23]/20"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={userModal.email || ""}
                  onChange={(e) => setUserModal({ ...userModal, email: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f2e23]/20"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Password {userModal.id && <span className="text-stone-400 font-normal">(Leave blank to keep existing)</span>}
                </label>
                <input
                  type="password"
                  required={!userModal.id}
                  value={userModal.password || ""}
                  onChange={(e) => setUserModal({ ...userModal, password: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f2e23]/20"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Role</label>
                <select
                  value={userModal.role || "admin"}
                  onChange={(e) => setUserModal({ ...userModal, role: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f2e23]/20 bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUserModal(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f2e23] hover:bg-[#194032] text-white font-semibold rounded-xl"
                >
                  Save User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}