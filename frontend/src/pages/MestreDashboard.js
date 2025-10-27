import React, { useEffect, useState } from "react";
import { getCampanhasByMestre, createCampanha } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function MestreDashboard() {
  const { jogador } = useAuth();
  const [campanhas, setCampanhas] = useState([]);
  const [nomeCampanha, setNomeCampanha] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const fetchCampanhas = async () => {
      try {
        const data = await getCampanhasByMestre(jogador.id);
        setCampanhas(data);
      } catch {
        setErro("Erro ao carregar campanhas");
      } finally {
        setLoading(false);
      }
    };
    fetchCampanhas();
  }, [jogador]);

  const handleCreate = async () => {
    if (!nomeCampanha.trim()) return;
    try {
      const nova = await createCampanha({ nome: nomeCampanha, mestre_id: jogador.id });
      setCampanhas([...campanhas, nova]);
      setNomeCampanha("");
    } catch {
      setErro("Erro ao criar campanha");
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div className="p-4">
      <h1>Campanhas do Mestre {jogador.nome}</h1>
      <input
        placeholder="Nova campanha"
        value={nomeCampanha}
        onChange={(e) => setNomeCampanha(e.target.value)}
      />
      <button onClick={handleCreate}>Criar</button>
      <ul>
        {campanhas.map((c) => (
          <li key={c.id}>{c.nome}</li>
        ))}
      </ul>
    </div>
  );
}
