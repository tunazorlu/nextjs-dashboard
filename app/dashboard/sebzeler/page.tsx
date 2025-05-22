"use client";

import { useEffect, useState } from "react";
import { databases, client } from "../../appwrite/appwrite";
import { ID, Query, Account } from "appwrite";
import { useRouter } from "next/navigation";

export default function SebzelerPage() {
  const router = useRouter();
  const [sebzeler, setSebzeler] = useState<
    {
      id: string;
      ad: string;
      fiyat: number;
      durum: string;
      createdAt: string;
      updatedAt: string;
    }[]
  >([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [yeniSebze, setYeniSebze] = useState({
    ad: "",
    fiyat: 0,
    durum: "Mevcut"
  });

  // Oturum kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const account = new Account(client);
        const session = await account.getSession('current');
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Oturum bulunamadı:", error);
        setIsAuthenticated(false);
        router.push('/login'); // Login sayfasına yönlendir
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await databases.createDocument(
        "1", // Database ID
        "1", // Collection ID
        ID.unique(),
        yeniSebze
      );
      
      // Formu sıfırla
      setYeniSebze({
        ad: "",
        fiyat: 0,
        durum: "Mevcut"
      });
      
      // Verileri yeniden yükle
      fetchData();
    } catch (error: any) {
      console.error("Veri eklenemedi:", error);
      setError(error.message || "Veri eklenirken bir hata oluştu");
    }
  };

  const fetchData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError("");
    try {
      const response = await databases.listDocuments(
        "1", // Database ID
        "1" // Collection ID
      );
      setSebzeler(
        response.documents.map((doc: any) => ({
          ad: doc.ad,
          fiyat: doc.fiyat,
          durum: doc.durum,
          id: doc.$id,
          createdAt: doc.$createdAt,
          updatedAt: doc.$updatedAt,
        }))
      );
    } catch (error: any) {
      console.error("Veriler alınamadı:", error);
      setError(error.message || "Veriler alınırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center">
        <p>Lütfen giriş yapın...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sebzeler</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Yeni Sebze Ekleme Formu */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Yeni Sebze Ekle</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Sebze Adı:</label>
            <input
              type="text"
              value={yeniSebze.ad}
              onChange={(e) => setYeniSebze({...yeniSebze, ad: e.target.value})}
              className="w-full p-2 border rounded"
              required
              title="Sebze Adı"
              placeholder="Sebze adını giriniz"
            />
          </div>
          <div>
            <label className="block mb-2">Fiyat (TL):</label>
            <input
              type="number"
              value={yeniSebze.fiyat}
              onChange={(e) => setYeniSebze({...yeniSebze, fiyat: Number(e.target.value)})}
              className="w-full p-2 border rounded"
              required
              title="Sebze Fiyatı"
              placeholder="Fiyatı giriniz"
            />
          </div>
          <div>
            <label className="block mb-2">Durum:</label>
            <select
              value={yeniSebze.durum}
              onChange={(e) => setYeniSebze({...yeniSebze, durum: e.target.value})}
              className="w-full p-2 border rounded"
              title="Sebze Durumu"
            >
              <option value="Mevcut">Mevcut</option>
              <option value="Tükendi">Tükendi</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Ekleniyor..." : "Ekle"}
          </button>
        </form>
      </div>

      {/* Mevcut Sebzeler Tablosu */}
      {loading ? (
        <div className="text-center py-4">Yükleniyor...</div>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">ID</th>
              <th className="px-4 py-2 border-b">Ad</th>
              <th className="px-4 py-2 border-b">Fiyat</th>
              <th className="px-4 py-2 border-b">Durum</th>
              <th className="px-4 py-2 border-b">Oluşturulma Tarihi</th>
              <th className="px-4 py-2 border-b">Güncellenme Tarihi</th>
            </tr>
          </thead>
          <tbody>
            {sebzeler.map((sebze) => (
              <tr key={sebze.id}>
                <td className="px-4 py-2 border-b">{sebze.id}</td>
                <td className="px-4 py-2 border-b">{sebze.ad}</td>
                <td className="px-4 py-2 border-b">{sebze.fiyat} TL</td>
                <td className="px-4 py-2 border-b">{sebze.durum}</td>
                <td className="px-4 py-2 border-b">{sebze.createdAt}</td>
                <td className="px-4 py-2 border-b">{sebze.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
