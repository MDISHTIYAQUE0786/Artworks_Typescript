 import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { InputSwitch } from "primereact/inputswitch";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

 
const useArtworks = (page: number, rows: number) => {
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [page, rows]);

  return { data, totalRecords, loading };
};

export default function ArtworksTable() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);  
  const [rowClick, setRowClick] = useState(true);
 
  const [selectedIdsMap, setSelectedIdsMap] = useState<{ [key: number]: boolean }>({});

  const { data, totalRecords, loading } = useArtworks(page, rows);

  const op = useRef<OverlayPanel>(null);
  const [inputValue, setInputValue] = useState("");
 
  const onPageChange = (event: any) => {
    setPage(event.page + 1);
    setRows(event.rows);
  };

  const overlayCheckboxHeader = () => (
    <div
      onClick={(e) => op.current?.toggle(e)}
      style={{
        width: "18px",
        height: "18px",
        border: "1px solid #999",
        borderRadius: "4px",
        cursor: "pointer",
        margin: "auto",
      }}
    />
  );
 
  const handleSubmit = async () => {
    let count = parseInt(inputValue, 10);
    if (isNaN(count) || count <= 0) return;

    const newMap = { ...selectedIdsMap };
    let rowsToSelect = count;
    let currentPage = 1;
    const pageSize = rows;

    while (rowsToSelect > 0) {
     
      const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${pageSize}`);
      const json = await res.json();
      const pageData: Artwork[] = json.data;

      if (pageData.length === 0) break;

      const selectCount = Math.min(rowsToSelect, pageData.length);

      for (let i = 0; i < selectCount; i++) {
        newMap[pageData[i].id] = true;
 
        fetch(`https://api.artic.edu/api/v1/artworks/${pageData[i].id}`)
          .then(res => res.json())
          .then(response => console.log("Fetched row:", response))
          .catch(err => console.error(err));
      }

      rowsToSelect -= selectCount;
      currentPage++;
    }

    setSelectedIdsMap(newMap);
    op.current?.hide();
  };

 
  const handleSelectionChange = (e: any) => {
    const newMap = { ...selectedIdsMap };

   
    e.value.forEach((item: Artwork) => {
      newMap[item.id] = true;
      fetch(`https://api.artic.edu/api/v1/artworks/${item.id}`)
        .then(res => res.json())
        .then(response => console.log("Fetched row:", response))
        .catch(err => console.error(err));
    });

     
    data.forEach((item) => {
      if (!e.value.includes(item)) newMap[item.id] = false;
    });

    setSelectedIdsMap(newMap);
  };

  return (
    <div className="card">
      <h2>Artworks</h2>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <div className="flex align-items-center gap-2">
          <InputSwitch checked={rowClick} onChange={(e) => setRowClick(e.value)} />
          <label>Row Click</label>
        </div>
      </div>

      <DataTable
        value={data}
        loading={loading}
        responsiveLayout="scroll"
        selection={data.filter((row) => selectedIdsMap[row.id])}
        onSelectionChange={handleSelectionChange}
        dataKey="id"
        metaKeySelection={rowClick}
      >
        <Column
          header={overlayCheckboxHeader}
          selectionMode="multiple"
          showSelectAll={false}
          headerStyle={{ width: "3rem" }}
        />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>

      <Paginator
        first={(page - 1) * rows}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[5, 10, 20]}
        onPageChange={onPageChange}
      />

      <OverlayPanel ref={op}>
        <div className="flex flex-column gap-2 p-2">
          <InputText
            placeholder="Enter number of rows..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button label="Submit" size="small" onClick={handleSubmit} />
        </div>
      </OverlayPanel>
    </div>
  );
}
