import { useEffect, useState } from "react";
import API from "./api";

function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await API.get("/vendors");
      setVendors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const approveVendor = async (id) => {
    await API.put(`/vendors/${id}/approve`);
    fetchVendors();
  };

  const rejectVendor = async (id) => {
    await API.put(`/vendors/${id}/reject`);
    fetchVendors();
  };

  // 🔍 FILTER LOGIC
  const filteredVendors = vendors.filter((v) => {
    return (
      v.companyName.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "" || v.status === statusFilter)
    );
  });

  // 📊 STATS
  const total = vendors.length;
  const approved = vendors.filter(v => v.status === "APPROVED").length;
  const rejected = vendors.filter(v => v.status === "REJECTED").length;
  const pending = vendors.filter(v => v.status === "REGISTERED").length;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Vendor Dashboard</h2>

      {/* 📊 STATS */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", margin: "20px" }}>
        <div style={card}>Total: {total}</div>
        <div style={{ ...card, background: "green", color: "white" }}>Approved: {approved}</div>
        <div style={{ ...card, background: "red", color: "white" }}>Rejected: {rejected}</div>
        <div style={{ ...card, background: "orange", color: "white" }}>Pending: {pending}</div>
      </div>

      {/* 🔍 SEARCH + FILTER */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          placeholder="Search by company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={input}
        >
          <option value="">All Status</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="REGISTERED">Pending</option>
        </select>
      </div>

      {/* 📋 TABLE */}
      <table style={table}>
        <thead style={{ background: "#2563eb", color: "white" }}>
          <tr>
            <th style={th}>Company</th>
            <th style={th}>Email</th>
            <th style={th}>Status</th>
            <th style={th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredVendors.map((v) => (
            <tr key={v.id} style={{ textAlign: "center" }}>
              <td style={td}>{v.companyName}</td>
              <td style={td}>{v.email}</td>

              <td style={td}>
                <span style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  color: "white",
                  background:
                    v.status === "APPROVED" ? "green" :
                    v.status === "REJECTED" ? "red" :
                    "orange"
                }}>
                  {v.status}
                </span>
              </td>

              <td style={td}>
                <button
                  onClick={() => approveVendor(v.id)}
                  style={approveBtn}
                  disabled={v.status === "APPROVED"}
                >
                  Approve
                </button>

                <button
                  onClick={() => rejectVendor(v.id)}
                  style={rejectBtn}
                  disabled={v.status === "REJECTED"}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 🎨 STYLES
const card = {
  padding: "10px 20px",
  borderRadius: "8px",
  background: "#eee"
};

const input = {
  padding: "8px",
  margin: "5px",
  borderRadius: "5px",
  border: "1px solid #ccc"
};

const table = {
  width: "90%",
  margin: "auto",
  borderCollapse: "collapse"
};

const th = {
  padding: "10px",
  border: "1px solid #ddd"
};

const td = {
  padding: "10px",
  border: "1px solid #ddd"
};

const approveBtn = {
  background: "green",
  color: "white",
  border: "none",
  padding: "6px 10px",
  marginRight: "5px",
  borderRadius: "5px",
  cursor: "pointer"
};

const rejectBtn = {
  background: "red",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "5px",
  cursor: "pointer"
};

export default VendorList;