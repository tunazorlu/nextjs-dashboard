"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { databases } from "../appwrite/appwrite";
import { createDecipheriv } from "crypto";

export default function Search({ yertutucu }: { yertutucu: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [sebzeler, setSebzeler] = useState<
    {
      id: string; // number değil, string olmalı
      ad: string;
      fiyat: number; // float değerler için uygun
      durum: string;
      createdAt: string;
      updatedAt: string;
    }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
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
      } catch (error) {
        console.error("Veriler alınamadı:", error);
      }
    }
    fetchData();
  }, []);

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <div className="relative flex flex-1 flex-shrink-0">
        <label htmlFor="search" className="sr-only">
          Ara
        </label>
        <input
          className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
          placeholder={yertutucu}
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
          defaultValue={searchParams.get("query")?.toString()}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      </div>
      <ul className="mt-4">
        {sebzeler.map((sebze, index) => (
          <li key={index} className="border-b py-2">
            {sebze.id} | {sebze.ad} - {sebze.fiyat} TL / {sebze.durum}
          </li>
        ))}
      </ul>
    </div>
  );
}
