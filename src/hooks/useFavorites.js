import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { addToFavorites, getMyFavorites, removeFromFavorites } from "../api/favorites-Supabase";

const sameText = (a = "", b = "") => a.trim().toLowerCase() === b.trim().toLowerCase();


export default function useFavorites() {
  const { user, getSession } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null); 

  useEffect(() => {
    setItems([]);
    setError("");
    if (!userId) {
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);
    getSession()
      .then((session) => getMyFavorites(session))
      .then((rows) => { if (!ignore) setItems(rows); })
      .catch((err) => { if (!ignore) setError(err.message); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
    
  }, [userId]);

  
  const findFavorite = useCallback(
    (album) =>
      items.find(
        (row) =>
          String(row.itunes_id) === String(album.id) ||
          (sameText(row.title, album.title) && sameText(row.artist, album.artist))
      ) ?? null,
    [items]
  );

  const toggleFavorite = useCallback(
    async (album) => {
      if (busyId !== null) return;
      setBusyId(album.id);
      try {
        const session = await getSession();
        const existing = findFavorite(album);
        if (existing) {
          await removeFromFavorites(session, existing.id);
          setItems((prev) => prev.filter((row) => row.id !== existing.id));
        } else {
          const saved = await addToFavorites(session, album);
          setItems((prev) => [saved, ...prev]);
        }
      } finally {
        setBusyId(null);
      }
    },
    [busyId, findFavorite, getSession]
  );

  return { items, loading, error, busyId, findFavorite, toggleFavorite };
}
