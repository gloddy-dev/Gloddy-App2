import { useEffect, useRef } from "react"

export const useDidMount = (callback: () => {}) => {
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    callback();
    return () => {
      mounted.current = false;
    }
  }, [])
}