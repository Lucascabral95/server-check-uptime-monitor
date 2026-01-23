"use client";

import { useParams } from "next/navigation";

export default function EditMonitorPage() {
  const { id } = useParams();

  return (
    <div>
      <h1>Editar monitor {id}</h1>
    </div>
  );
}
