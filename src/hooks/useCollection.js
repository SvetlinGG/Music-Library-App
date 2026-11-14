import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { addToCollection, getMyCollection, removeFromCollection } from "../api/collection-Supabase";
import { findAlbum } from "../api/iTunes";

const sameText = (a = "", b = "") => a.trim().toLowerCase() === b.trim().toLowerCase();


export default function useCollection() {
  const { user, getSession } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");

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
      .then((session) => getMyCollection(session))
      .then((rows) => { if (!ignore) setItems(rows); })
      .catch((err) => { if (!ignore) setError(err.message); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
   
  }, [userId]);

  
  const findItem = useCallback(
    (album, isLocal = false) =>
      items.find(
        (row) =>
          (!isLocal && String(row.itunes_id) === String(album.id)) ||
          (sameText(row.title, album.title) && sameText(row.artist, album.artist))
      ) ?? null,
    [items]
  );

  const add = useCallback(
    async (album, isLocal = false) => {
      if (findItem(album, isLocal)) return;

      const session = await getSession();
      let itunesId = album.id;
      let { cover, genre, year } = album;

      
      if (isLocal) {
        const found = await findAlbum(album.title, album.artist);
        if (!found) throw new Error(`"${album.title}" was not found on iTunes.`);
        itunesId = found.id;
        cover = cover || found.cover;
        genre = genre || found.genre;
        year = year || found.year;
      }

      const saved = await addToCollection(session, { ...album, itunesId, cover, genre, year });
      setItems((prev) => [saved, ...prev]);
    },
    [findItem, getSession]
  );

  const remove = useCallback(
    async (rowId) => {
      const session = await getSession();
      await removeFromCollection(session, rowId);
      setItems((prev) => prev.filter((row) => row.id !== rowId));
    },
    [getSession]
  );

  return { items, loading, error, findItem, add, remove };
}
