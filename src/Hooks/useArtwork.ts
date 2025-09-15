 import { useState, useEffect } from "react";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

export const useArtworks = (page: number, rows: number) => {
  const [data, setData] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rows}`
        );
        const json = await res.json();
        setData(json.data);
        setTotalRecords(json.pagination.total);
      } catch (err) {
        console.error("Error fetching artworks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [page, rows]);

  return { data, totalRecords, loading };
};
