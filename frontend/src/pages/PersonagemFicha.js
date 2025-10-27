import React, { useEffect, useState } from "react";
import { getPersonagemById, updatePersonagem } from "../api/api";
import { useParams } from "react-router-dom";

export default function PersonagemFicha() {
  const { id } = useParams();
  const [personagem, setPersonagem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPersonagemById(id);
        setPersonagem(data);
      } catch {
        alert("Erro ao carregar personagem");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    setPersonagem({ ...personagem, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updatePersonagem(id, personagem);
      alert("Personagem atualizado!");
    } catch {
      alert("Erro ao salvar");
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (!personagem) return <p>Personagem não encontrado</p>;

  return (
    <div className="p-4">
      <h1>{personagem.nome}</h1>
      <label>
        Nível:
        <input
          type="number"
          name="nivel"
          value={personagem.nivel || ""}
          onChange={handleChange}
        />
      </label>
      <button onClick={handleSave}>Salvar</button>
    </div>
  );
}
