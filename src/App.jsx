import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthScreen from "./components/AuthScreen";
import Header from "./components/Header";
import ProjectTabs from "./components/ProjectTabs";
import ViewSwitcher from "./components/ViewSwitcher";
import Toolbar from "./components/Toolbar";
import Board from "./components/Board";
import BreakdownTable from "./components/BreakdownTable";
import ShotlistView from "./components/ShotlistView";
import CallSheetView from "./components/CallSheetView";
import CardModal from "./components/CardModal";
import SceneModal from "./components/SceneModal";
import ShotModal from "./components/ShotModal";
import ShootDayModal from "./components/ShootDayModal";
import ScheduleSlotModal from "./components/ScheduleSlotModal";
import CallTimeModal from "./components/CallTimeModal";
import NewProjectModal from "./components/NewProjectModal";
import { useProjects } from "./hooks/useProjects";
import { useBoard } from "./hooks/useBoard";
import { useScenes } from "./hooks/useScenes";
import { useShots } from "./hooks/useShots";
import { useShootDays } from "./hooks/useShootDays";
import { useCallSheet } from "./hooks/useCallSheet";
import {
  blankCharacter,
  blankLocation,
  blankScene,
  blankShot,
  blankShootDay,
  blankScheduleSlot,
  blankCallTime,
} from "./utils/helpers";

function MainApp() {
  const { projects, loading: loadingProjects, error: projectsError, createProject, deleteProject } = useProjects();
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState("board"); // "board" | "breakdown" | "shotlist"
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null); // { type, card }
  const [sceneModal, setSceneModal] = useState(null); // scene object or null
  const [shotModal, setShotModal] = useState(null); // shot object or null
  const [selectedSceneId, setSelectedSceneId] = useState(null);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [dayModal, setDayModal] = useState(null);
  const [slotModal, setSlotModal] = useState(null);
  const [callTimeModal, setCallTimeModal] = useState(null);
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

  const { scenes, loading: loadingScenes, error: scenesError, saveScene, deleteScene, reorder } = useScenes(activeId);

  const {
    shots,
    loading: loadingShots,
    error: shotsError,
    saveShot,
    deleteShot,
    reorder: reorderShot,
  } = useShots(selectedSceneId, activeId);

  const { days, loading: loadingDays, error: daysError, saveDay, deleteDay, reorder: reorderDay } = useShootDays(activeId);

  const {
    scheduleSlots,
    callTimes,
    loading: loadingSheet,
    error: sheetError,
    saveSlot,
    deleteSlot,
    reorderSlot,
    saveCallTime,
    deleteCallTime,
    reorderCallTime,
  } = useCallSheet(selectedDayId, activeId);

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

  function openNewScene() {
    setSceneModal(blankScene());
  }
  function openEditScene(scene) {
    setSceneModal(scene);
  }
  async function handleSaveScene(form) {
    const result = await saveScene(form);
    if (result) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      setSceneModal(null);
    }
  }
  async function handleDeleteScene() {
    await deleteScene(sceneModal.id);
    setSceneModal(null);
  }

  function openNewShot() {
    setShotModal(blankShot());
  }
  function openEditShot(shot) {
    setShotModal(shot);
  }
  async function handleSaveShot(form) {
    const result = await saveShot(form);
    if (result) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      setShotModal(null);
    }
  }
  async function handleDeleteShot() {
    await deleteShot(shotModal.id);
    setShotModal(null);
  }

  function openNewDay() {
    setDayModal(blankShootDay());
  }
  function openEditDay(day) {
    setDayModal(day);
  }
  async function handleSaveDay(form) {
    const result = await saveDay(form);
    if (result) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      if (!selectedDayId) setSelectedDayId(result.id);
      setDayModal(null);
    }
  }
  async function handleDeleteDay() {
    const deletedId = dayModal.id;
    await deleteDay(deletedId);
    if (selectedDayId === deletedId) setSelectedDayId(null);
    setDayModal(null);
  }

  function openNewSlot() {
    setSlotModal(blankScheduleSlot());
  }
  function openEditSlot(slot) {
    setSlotModal(slot);
  }
  async function handleSaveSlot(form) {
    const result = await saveSlot(form);
    if (result) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      setSlotModal(null);
    }
  }
  async function handleDeleteSlot() {
    await deleteSlot(slotModal.id);
    setSlotModal(null);
  }

  function openNewCallTime() {
    setCallTimeModal(blankCallTime());
  }
  function openEditCallTime(callTime) {
    setCallTimeModal(callTime);
  }
  async function handleSaveCallTime(form) {
    const result = await saveCallTime(form);
    if (result) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      setCallTimeModal(null);
    }
  }
  async function handleDeleteCallTime() {
    await deleteCallTime(callTimeModal.id);
    setCallTimeModal(null);
  }

  const activeProject = projects.find((p) => p.id === activeId);

  return (
    <div className="app-shell">
      <Header subtitle={activeProject ? "Fichas de personajes y localizaciones" : null} />
      <ProjectTabs projects={projects} activeId={activeId} onSelect={setActiveId} onNew={() => setNewProjectOpen(true)} />

      {(projectsError || boardError || scenesError || shotsError || daysError || sheetError) && (
        <div className="error-banner">{projectsError || boardError || scenesError || shotsError || daysError || sheetError}</div>
      )}

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
          <ViewSwitcher view={view} setView={setView} />

          {view === "board" ? (
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
          ) : view === "breakdown" ? (
            <BreakdownTable
              scenes={scenes}
              loading={loadingScenes}
              characters={characters}
              locations={locations}
              onOpen={openEditScene}
              onAdd={openNewScene}
              onReorder={reorder}
            />
          ) : view === "shotlist" ? (
            <ShotlistView
              scenes={scenes}
              selectedSceneId={selectedSceneId}
              onSelectScene={setSelectedSceneId}
              shots={shots}
              loading={loadingShots}
              onOpen={openEditShot}
              onAdd={openNewShot}
              onReorder={reorderShot}
            />
          ) : (
            <CallSheetView
              days={days}
              loadingDays={loadingDays}
              selectedDayId={selectedDayId}
              onSelectDay={setSelectedDayId}
              onNewDay={openNewDay}
              onEditDay={openEditDay}
              scenes={scenes}
              characters={characters}
              scheduleSlots={scheduleSlots}
              callTimes={callTimes}
              loadingSheet={loadingSheet}
              onAddSlot={openNewSlot}
              onEditSlot={openEditSlot}
              onReorderSlot={reorderSlot}
              onAddCallTime={openNewCallTime}
              onEditCallTime={openEditCallTime}
              onReorderCallTime={reorderCallTime}
            />
          )}
        </>
      )}

      {newProjectOpen && <NewProjectModal onClose={() => setNewProjectOpen(false)} onCreate={handleCreateProject} />}
      {modal && (
        <CardModal type={modal.type} card={modal.card} onClose={() => setModal(null)} onSave={handleSaveCard} onDelete={handleDeleteCard} />
      )}
      {sceneModal && (
        <SceneModal
          scene={sceneModal}
          characters={characters}
          locations={locations}
          onClose={() => setSceneModal(null)}
          onSave={handleSaveScene}
          onDelete={handleDeleteScene}
        />
      )}
      {shotModal && (
        <ShotModal shot={shotModal} onClose={() => setShotModal(null)} onSave={handleSaveShot} onDelete={handleDeleteShot} />
      )}
      {dayModal && (
        <ShootDayModal day={dayModal} onClose={() => setDayModal(null)} onSave={handleSaveDay} onDelete={handleDeleteDay} />
      )}
      {slotModal && (
        <ScheduleSlotModal
          slot={slotModal}
          scenes={scenes}
          onClose={() => setSlotModal(null)}
          onSave={handleSaveSlot}
          onDelete={handleDeleteSlot}
        />
      )}
      {callTimeModal && (
        <CallTimeModal
          callTime={callTimeModal}
          characters={characters}
          onClose={() => setCallTimeModal(null)}
          onSave={handleSaveCallTime}
          onDelete={handleDeleteCallTime}
        />
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
