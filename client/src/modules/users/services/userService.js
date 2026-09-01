import api from "../../../services/api";

export const fetchUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const fetchRoles = async () => {
  const response = await api.get("/users/roles");
  return response.data;
};

export const createNewUser = async (userData) => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const updateUserDetails = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const toggleUserStatus = async (id, status) => {
  const response = await api.patch(`/users/${id}/status`, { status });
  return response.data;
};

export const removeUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};