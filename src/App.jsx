import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthScreen from "./components/AuthScreen";
import Header from "./components/Header";
import ProjectTabs from "./components/ProjectTabs";
import Toolbar from "./components/Toolbar";
import Board from "./components/Board";
import CardModal from "./components/CardModal";
import NewProjectModal from "./components/NewProjectModal";
import { useProjects } from "./hooks/useProjects";
import { useBoard } from "./hooks/useBoard";
import { blankCharacter, blankLocation } from "./utils/helpers";

function MainApp() {
  const { projects, loading: loadingProjects, error: projectsError, createProject, deleteProject } = useProjects();
  const [activeId, setActiveId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null); // { type, card }
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!activeId && projects.length > 0) setActiveId(projects[0].id);
  }, [projects, activeId]);

  const {
    characters,
    locations,
    loading: loadingBoard,
    error: boardError,
    saveCharacter,
    deleteCharacter,
    saveLocation,
    deleteLocation,
  } = useBoard(activeId);

  async function handleCreateProject(name) {
    const proj = await createProject(name);
    if (proj) {
      setActiveId(proj.id);
      setNewProjectOpen(false);
    }
  }

  async function handleDeleteProject() {
    await deleteProject(activeId);
    setDeleteConfirm(false);
    setActiveId(null);
  }

  function openNew(type) {
    setModal({ type, card: type === "character" ? blankCharacter() : blankLocation() });
  }
  function openEdit(card, type) {
    setModal({ type, card });
  }

  async function handleSaveCard(form) {
    const save = modal.type === "character" ? saveCharacter : saveLocation;
    const result = await save(form);
    if (result) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      setModal(null);
    }
  }

  async function handleDeleteCard() {
    const del = modal.type === "character" ? deleteCharacter : deleteLocation;
    await del(modal.card.id);
    setModal(null);
  }

  const activeProject = projects.find((p) => p.id === activeId);

  return (
    <div className="app-shell">
      <Header subtitle={activeProject ? "Fichas de personajes y localizaciones" : null} />
      <ProjectTabs projects={projects} activeId={activeId} onSelect={setActiveId} onNew={() => setNewProjectOpen(true)} />

      {(projectsError || boardError) && <div className="error-banner">{projectsError || boardError}</div>}

      {loadingProjects ? (
        <div className="board-empty">
          <p>Cargando tablero…</p>
        </div>
      ) : !activeId ? (
        <div className="board-empty">
          <p>Todavía no hay ningún proyecto.</p>
          <button className="btn-primary" onClick={() => setNewProjectOpen(true)}>
            Crear el primer proyecto
          </button>
        </div>
      ) : (
        <>
          <Toolbar
            filter={filter}
            setFilter={setFilter}
            onAddCharacter={() => openNew("character")}
            onAddLocation={() => openNew("location")}
            onDeleteProject={() => setDeleteConfirm(true)}
            saved={saved}
          />
          {deleteConfirm && (
            <div className="confirm-bar">
              ¿Eliminar "{activeProject?.name}" y todas sus fichas?
              <button onClick={handleDeleteProject}>Sí, eliminar</button>
              <button onClick={() => setDeleteConfirm(false)}>Cancelar</button>
            </div>
          )}
          <Board loading={loadingBoard} characters={characters} locations={locations} filter={filter} onOpen={openEdit} />
        </>
      )}

      {newProjectOpen && <NewProjectModal onClose={() => setNewProjectOpen(false)} onCreate={handleCreateProject} />}
      {modal && (
        <CardModal type={modal.type} card={modal.card} onClose={() => setModal(null)} onSave={handleSaveCard} onDelete={handleDeleteCard} />
      )}
    </div>
  );
}

function Gate() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="app-shell">
        <div className="board-empty">
          <p>Cargando…</p>
        </div>
      </div>
    );
  }
  return user ? <MainApp /> : <AuthScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
