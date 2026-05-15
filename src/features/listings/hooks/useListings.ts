import { useEffect } from "react";
import { useStore } from "../../../store/StoreContext";

export function useListings() {
  const { dispatch } = useStore();

  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });
    fetch("http://localhost:5000/listings?limit=50")
      .then((r) => r.json())
      .then((res) => {
        const mapped = (res.data ?? []).map((l: any) => ({
          id: l.id,
          title: l.title,
          location: l.location,
          price: l.pricePerNight,
          rating: l.rating ?? 4.5,
          superhost: false,
          available: true,
          availableFrom: l.createdAt?.slice(0, 10) ?? "",
          img: l.photos?.[0]?.url ?? "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=260&fit=crop",
          category: l.type?.toLowerCase() ?? "city",
        }));
        dispatch({ type: "SET_LISTINGS", payload: mapped });
      })
      .catch(() => dispatch({ type: "SET_LISTINGS", payload: [] }))
      .finally(() => dispatch({ type: "SET_LOADING", payload: false }));
  }, []);
}
