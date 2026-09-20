import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const getToken = () => localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/users/admin/all`,
        {
          params: {
            page,
            limit: 20,
            ...(search.trim() && { search: search.trim() }),
            ...(role && { role }),
            ...(status && { status }),
          },
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = response.data?.data;

      setUsers(data?.users || []);

      setPagination(
        data?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("Admin users error:", err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, role, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const updateUser = async (
    id,
    endpoint,
    method = "patch",
    body = {}
  ) => {
    try {
      await axios({
        method,
        url: `${API_URL}/users/admin/${id}/${endpoint}`,
        data: body,
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      await fetchUsers();
    } catch (err) {
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Action failed"
      );
    }
  };

  const handleBlock = async (item) => {
    const action = item.isBlocked ? "unblock" : "block";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${item.name}?`
      )
    ) {
      return;
    }

    await updateUser(item.id, "block");
  };

  const handleStatus = async (item) => {
    const action = item.isActive ? "deactivate" : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${item.name}?`
      )
    ) {
      return;
    }

    await updateUser(item.id, "status");
  };

  const handleVerify = async (item) => {
    await updateUser(item.id, "verify");
  };

  const handleRoleChange = async (item, newRole) => {
    if (newRole === item.role) return;

    if (
      !window.confirm(
        `Change ${item.name}'s role to ${newRole}?`
      )
    ) {
      return;
    }

    await updateUser(
      item.id,
      "role",
      "patch",
      { role: newRole }
    );
  };

  const handleDelete = async (item) => {
    if (
      !window.confirm(
        `Delete ${item.name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/users/admin/${item.id}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      await fetchUsers();
    } catch (err) {
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to delete user"
      );
    }
  };

  const getStatus = (item) => {
    if (item.isBlocked) return "BLOCKED";
    if (!item.isActive) return "INACTIVE";
    return "ACTIVE";
  };

  return (
    <div className="admin-users-page">

      {/* HEADER */}
      <header className="admin-users-header">

        <div className="admin-users-header-left">

          <button
            className="admin-back-button"
            onClick={() => navigate("/admin")}
          >
            ←
          </button>

          <div>
            <span className="admin-kicker">
              ADMINISTRATION
            </span>

            <h1>User Management</h1>

            <p>
              Manage KhetiMarket users, roles, access and verification.
            </p>
          </div>

        </div>

        <button
          className="admin-refresh-button"
          onClick={fetchUsers}
        >
          ↻ Refresh
        </button>

      </header>


      <main className="admin-users-container">

        {/* FILTERS */}
        <section className="admin-users-toolbar">

          <form
            className="admin-users-search"
            onSubmit={handleSearch}
          >
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search name, email, phone or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button type="submit">
              Search
            </button>
          </form>

          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            <option value="FARMER">Farmer</option>
            <option value="BUYER">Buyer</option>
            <option value="ADMIN">Admin</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Blocked</option>
            <option value="INACTIVE">Inactive</option>
          </select>

        </section>


        {/* ERROR */}
        {error && (
          <div className="admin-users-error">
            {error}
          </div>
        )}


        {/* SUMMARY */}
        <section className="admin-users-summary">

          <div>
            <strong>{pagination.total}</strong>
            <span>Total users</span>
          </div>

          <div>
            <strong>
              {users.filter(
                (u) => u.role === "FARMER"
              ).length}
            </strong>
            <span>Farmers</span>
          </div>

          <div>
            <strong>
              {users.filter(
                (u) => u.role === "BUYER"
              ).length}
            </strong>
            <span>Buyers</span>
          </div>

          <div>
            <strong>
              {users.filter(
                (u) => u.isBlocked
              ).length}
            </strong>
            <span>Blocked</span>
          </div>

        </section>


        {/* TABLE */}
        <section className="admin-users-table-card">

          {loading ? (

            <div className="admin-users-loading">
              Loading users...
            </div>

          ) : users.length === 0 ? (

            <div className="admin-users-empty">

              <div>👥</div>

              <strong>
                No users found
              </strong>

              <span>
                Try changing your search or filters.
              </span>

            </div>

          ) : (

            <div className="admin-users-table-wrapper">

              <table className="admin-users-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Verification</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {users.map((item) => {

                    const currentUserId =
                      user?._id || user?.id;

                    const isCurrentUser =
                      String(item.id) ===
                      String(currentUserId);

                    return (
                      <tr key={item.id}>

                        {/* USER */}
                        <td>

                          <div className="admin-user-cell">

                            <div className="admin-user-cell-avatar">
                              {item.name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                            </div>

                            <div>

                              <strong>
                                {item.name}
                              </strong>

                              <span>
                                {item.email}
                              </span>

                              {item.phone && (
                                <small>
                                  {item.phone}
                                </small>
                              )}

                            </div>

                          </div>

                        </td>


                        {/* ROLE */}
                        <td>

                          <select
                            className={`admin-role-select ${String(
                              item.role || ""
                            ).toLowerCase()}`}
                            value={item.role}
                            disabled={
                              isCurrentUser ||
                              item.role === "ADMIN"
                            }
                            onChange={(e) =>
                              handleRoleChange(
                                item,
                                e.target.value
                              )
                            }
                          >
                            <option value="FARMER">
                              FARMER
                            </option>

                            <option value="BUYER">
                              BUYER
                            </option>

                            <option value="ADMIN">
                              ADMIN
                            </option>
                          </select>

                        </td>


                        {/* LOCATION */}
                        <td>

                          <span className="admin-location-cell">
                            {item.location || "—"}
                          </span>

                        </td>


                        {/* STATUS */}
                        <td>

                          <span
                            className={`admin-user-status ${getStatus(
                              item
                            ).toLowerCase()}`}
                          >
                            {getStatus(item)}
                          </span>

                        </td>


                        {/* VERIFY */}
                        <td>

                          <button
                            className={`admin-verify-button ${
                              item.isVerified
                                ? "verified"
                                : ""
                            }`}
                            onClick={() =>
                              handleVerify(item)
                            }
                          >
                            {item.isVerified
                              ? "✓ Verified"
                              : "Verify"}
                          </button>

                        </td>


                        {/* DATE */}
                        <td>

                          <span className="admin-date-cell">
                            {item.createdAt
                              ? new Date(
                                  item.createdAt
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "—"}
                          </span>

                        </td>


                        {/* ACTIONS */}
                        <td>

                          <div className="admin-user-actions">

                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/users/${item.id}`
                                )
                              }
                            >
                              View
                            </button>

                            {!isCurrentUser && (
                              <>

                                <button
                                  className={
                                    item.isBlocked
                                      ? "unblock"
                                      : "block"
                                  }
                                  onClick={() =>
                                    handleBlock(item)
                                  }
                                >
                                  {item.isBlocked
                                    ? "Unblock"
                                    : "Block"}
                                </button>

                                <button
                                  className="status"
                                  onClick={() =>
                                    handleStatus(item)
                                  }
                                >
                                  {item.isActive
                                    ? "Disable"
                                    : "Enable"}
                                </button>

                                {item.role !== "ADMIN" && (
                                  <button
                                    className="delete"
                                    onClick={() =>
                                      handleDelete(item)
                                    }
                                  >
                                    Delete
                                  </button>
                                )}

                              </>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* PAGINATION */}
        {pagination.totalPages > 1 && (

          <div className="admin-users-pagination">

            <button
              disabled={page <= 1}
              onClick={() =>
                setPage((p) => p - 1)
              }
            >
              ← Previous
            </button>

            <span>
              Page <strong>{pagination.page}</strong>{" "}
              of{" "}
              <strong>
                {pagination.totalPages}
              </strong>
            </span>

            <button
              disabled={
                page >= pagination.totalPages
              }
              onClick={() =>
                setPage((p) => p + 1)
              }
            >
              Next →
            </button>

          </div>

        )}

      </main>

    </div>
  );
}