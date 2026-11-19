import RotateCcw from 'lucide-react/icons/rotate-ccw';
import Trash2 from 'lucide-react/icons/trash-2';
import X from 'lucide-react/icons/x';
import { Tooltip } from '$components/Tooltip';

interface TaskEditorHeaderProps {
  onLöschen: () => void;
  onSchließen: () => void;
  isLöschend?: boolean;
  isSubtask?: boolean;
  onWiederherstellen?: () => void;
  onLöschenPermanently?: () => void;
}

export const TaskEditorHeader = ({
  onLöschen,
  onSchließen,
  isLöschend = false,
  isSubtask = false,
  onWiederherstellen,
  onLöschenPermanently,
}: TaskEditorHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-surface-200 border-b p-4 dark:border-surface-700">
      <h2 className="font-semibold text-lg text-surface-800 dark:text-surface-200">
        {isLöschend ? 'Kürzlich gelöscht' : isSubtask ? 'Unteraufgabe bearbeiten' : 'Aufgabe bearbeiten'}
      </h2>
      <div className="flex items-center gap-2">
        {isLöschend ? (
          <>
            <Tooltip content="Wiederherstellen" position="bottom">
              <button
                type="button"
                onClick={onWiederherstellen}
                className="rounded-lg p-2 text-surface-500 outline-hidden transition-colors hover:bg-surface-100 hover:text-surface-700 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:hover:bg-surface-800 dark:hover:text-surface-300"
                aria-label="Wiederherstellen task"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </Tooltip>

            <Tooltip content="Endgültig löschen" position="bottom">
              <button
                type="button"
                onClick={onLöschenPermanently}
                className="rounded-lg p-2 text-surface-500 outline-hidden transition-colors hover:bg-semantic-error/10 hover:text-semantic-error focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset"
                aria-label="Aufgabe endgültig löschen"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </Tooltip>
          </>
        ) : (
          <Tooltip content="Löschen" position="bottom">
            <button
              type="button"
              onClick={onLöschen}
              className="rounded-lg p-2 text-surface-500 outline-hidden transition-colors hover:bg-semantic-error/10 hover:text-semantic-error focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset"
              aria-label="Löschen task"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </Tooltip>
        )}

        <Tooltip content="Schließen" position="bottom">
          <button
            type="button"
            onClick={onSchließen}
            className="rounded-lg p-2 text-surface-500 outline-hidden transition-colors hover:bg-surface-100 hover:text-surface-700 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:hover:bg-surface-800 dark:hover:text-surface-300"
            aria-label="Schließen editor"
          >
            <X className="h-5 w-5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
