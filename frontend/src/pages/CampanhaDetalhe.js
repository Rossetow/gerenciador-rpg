import React, { useEffect, useState } from "react";
import { getCampanhaById, getPersonagensByCampanha } from "../api/api";
import { useParams } from "react-router-dom";

export default function CampanhaDetalhe() {
  const { id } = useParams();
  const [campanha, setCampanha] = useState(null);
  const [personagens, setPersonagens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [camp, pers] = await Promise.all([
          getCampanhaById(id),
          getPersonagensByCampanha(id),
        ]);
        setCampanha(camp);
        setPersonagens(pers);
      } catch {
        alert("Erro ao carregar detalhes da campanha");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <p>Carregando...</p>;
  if (!campanha) return <p>Campanha não encontrada</p>;

  return (
    <div className="p-4">
      <h1>{campanha.nome}</h1>
      <h2>Personagens</h2>
      <ul>
        {personagens.map((p) => (
          <li key={p.id}>{p.nome}</li>
        ))}
      </ul>
    </div>
  );
}
