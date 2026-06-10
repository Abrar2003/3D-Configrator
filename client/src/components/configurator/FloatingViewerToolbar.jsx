import {
  Download,
  Hand,
  RotateCcw,
  Ruler,
  Share2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const placeholderActions = {
  zoomIn: () => console.log("Zoom in control is not wired yet."),
  zoomOut: () => console.log("Zoom out control is not wired yet."),
  download: () => console.log("Download action is not wired yet."),
  share: () => console.log("Share action is not wired yet."),
};

function ToolbarButton({ label, icon: Icon, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg shadow-black/10 backdrop-blur transition ${
        active
          ? "border-black bg-black text-white hover:bg-neutral-800"
          : "border-black/10 bg-white/88 text-neutral-700 hover:bg-white hover:text-black"
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export default function FloatingViewerToolbar({
  panMode,
  showDimensions,
  onTogglePan,
  onToggleDimensions,
  onReset,
}) {
  return (
    <div className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3 md:right-6">
      <ToolbarButton
        label="Reset configuration"
        icon={RotateCcw}
        onClick={onReset}
      />
      <ToolbarButton
        label="Pan view"
        icon={Hand}
        active={panMode}
        onClick={onTogglePan}
      />
      <ToolbarButton
        label={showDimensions ? "Hide dimensions" : "Show dimensions"}
        icon={Ruler}
        active={showDimensions}
        onClick={onToggleDimensions}
      />
      <ToolbarButton
        label="Zoom in"
        icon={ZoomIn}
        onClick={placeholderActions.zoomIn}
      />
      <ToolbarButton
        label="Zoom out"
        icon={ZoomOut}
        onClick={placeholderActions.zoomOut}
      />
      <ToolbarButton
        label="Download"
        icon={Download}
        onClick={placeholderActions.download}
      />
      <ToolbarButton label="Share" icon={Share2} onClick={placeholderActions.share} />
    </div>
  );
}
