import toast from "react-hot-toast";
import { useStore } from "../../../store/StoreContext";

export function useFavorites() {
  const { state, dispatch } = useStore();

  const isSaved = (id: string) => state.saved.includes(id);

  const toggle = (id: string, title: string) => {
    dispatch({ type: "TOGGLE_FAVORITE", payload: id });
    if (isSaved(id)) {
      toast(`Removed: ${title}`);
    } else {
      toast.success(`Saved: ${title}`);
    }
  };

  return { toggle, count: state.saved.length, isSaved };
}
