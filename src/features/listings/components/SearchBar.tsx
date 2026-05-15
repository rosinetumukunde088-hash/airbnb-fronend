import { useEffect, useRef, useMemo } from "react";
import { debounce } from "lodash";
import { useStore } from "../../../store/StoreContext";

const SearchBar = () => {
  const { dispatch } = useStore();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleChange = useMemo(
    () =>
      debounce((value: string) => {
        dispatch({ type: "SET_FILTER", payload: value });
      }, 300),
    [dispatch]
  );

  return (
    <input
      ref={ref}
      type="text"
      placeholder="Search listings..."
      onChange={(e) => handleChange(e.target.value)}
      style={styles.input}
    />
  );
};

export default SearchBar;

const styles = {
  input: {
    padding: "10px 18px",
    borderRadius: "25px",
    border: "1px solid #ddd",
    fontSize: "14px",
    width: "280px",
    outline: "none",
  },
} as const;
