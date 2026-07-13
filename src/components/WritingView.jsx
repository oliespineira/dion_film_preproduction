import { useState } from "react";
import SynopsisEditor from "./SynopsisEditor";
import ScreenplayEditor from "./ScreenplayEditor";

export default function WritingView({
  projectName,
  characters,
  synopsisDrafts,
  loadingSynopsis,
  onCreateSynopsisDraft,
  onDeleteSynopsisDraft,
  screenplayDrafts,
  loadingScreenplay,
  onCreateScreenplayDraft,
  onDeleteScreenplayDraft,
  canEdit = true,
}) {
  const [tab, setTab] = useState("synopsis"); // "synopsis" | "screenplay"

  return (
    <div className="breakdown-section">
      <div className="day-tabs">
        <button className={tab === "synopsis" ? "day-tab active" : "day-tab"} onClick={() => setTab("synopsis")}>
          Sinopsis
        </button>
        <button className={tab === "screenplay" ? "day-tab active" : "day-tab"} onClick={() => setTab("screenplay")}>
          Guion literario
        </button>
      </div>

      {tab === "synopsis" ? (
        <SynopsisEditor
          drafts={synopsisDrafts}
          loading={loadingSynopsis}
          onCreateDraft={onCreateSynopsisDraft}
          onDeleteDraft={onDeleteSynopsisDraft}
          canEdit={canEdit}
        />
      ) : (
        <ScreenplayEditor
          drafts={screenplayDrafts}
          loading={loadingScreenplay}
          characters={characters}
          projectName={projectName}
          onCreateDraft={onCreateScreenplayDraft}
          onDeleteDraft={onDeleteScreenplayDraft}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}
