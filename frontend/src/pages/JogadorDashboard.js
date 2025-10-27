import React, { useEffect, useState } from "react";
import { getPersonagensByJogador } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function JogadorDashboard() {
  const { jogador } = useAuth();
  const [personagens, setPersonagens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonagens = async () => {
      try {
        const data = await getPersonagensByJogador(jogador.id);
        setPersonagens(data);
      } catch {
        alert("Erro ao carregar personagens");
      } finally {
        setLoading(false);
      }
    };
    fetchPersonagens();
  }, [jogador]);

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="p-4">
      <h1>Personagens de {jogador.nome}</h1>
      <ul>
        {personagens.map((p) => (
          <li key={p.id}>{p.nome}</li>
        ))}
      </ul>
    </div>
  );
}
