const BASE_URL = "http://localhost:5000";

export interface RegisterPayload {
  name: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  role: "GUEST" | "HOST";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: "GUEST" | "HOST" | "ADMIN";
  createdAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export interface CreateListingPayload {
  title: string;
  location: string;
  pricePerNight: number;
  guest: number;
  type: "APARTMENT" | "HOUSE" | "VILLA" | "CABIN";
  amenities: string[];
  description: string;
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data as T;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    request<BackendUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    request<{ token: string; user: BackendUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateProfile: (id: string, payload: UpdateProfilePayload, token: string) =>
    request<BackendUser>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  forgotPassword: (email: string) =>
    request<{ message: string; resetToken?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  createListing: (payload: CreateListingPayload, token: string) =>
    request<any>("/listings", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  getListings: () =>
    request<{ data: any[] }>("/listings?limit=100", { method: "GET" }),

  updateListing: (id: string, payload: Partial<CreateListingPayload>, token: string) =>
    request<any>(`/listings/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteListing: (id: string, token: string) =>
    request<any>(`/listings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  createBooking: (payload: {
    checkIn: string; checkOut: string;
    guestId: string; listingId: string; guests: number;
  }, token: string) =>
    request<any>("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  getMyBookings: (userId: string, token: string) =>
    request<{ data: any[] }>(`/users/${userId}/bookings`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }),
};
