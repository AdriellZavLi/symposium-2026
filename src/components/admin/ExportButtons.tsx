"use client";

import { useState } from "react";

export default function ExportButtons() {
  const [loadingReg, setLoadingReg] = useState(false);
  const [loadingTallas, setLoadingTallas] = useState(false);

  const downloadFile = async (url: string, filename: string, setLoading: (s: boolean) => void) => {
    try {
      setLoading(true);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al descargar");
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(error);
      alert("Error al descargar archivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => downloadFile("/api/admin/exportar/registros", "registros-symposium.csv", setLoadingReg)}
        disabled={loadingReg}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loadingReg ? "Generando..." : "Exportar Registros"}
      </button>
      <button
        onClick={() => downloadFile("/api/admin/exportar/tallas", "tallas-symposium.csv", setLoadingTallas)}
        disabled={loadingTallas}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        {loadingTallas ? "Generando..." : "Exportar Tallas"}
      </button>
    </div>
  );
}
