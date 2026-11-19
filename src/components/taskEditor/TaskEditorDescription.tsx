import AlignLeft from 'lucide-react/icons/align-left';
import FileX from 'lucide-react/icons/file-x';
import { useEffect, useRef } from 'react';
import { ComposedTextarea } from '$components/ComposedTextarea';
import { TaskEditorEmptyState } from '$components/taskEditor/TaskEditorEmptyState';
import { useDebouncedTaskUpdate } from '$hooks/ui/useDebouncedTaskUpdate';
import { filterCalDavBeschreibung } from '$lib/ical/vtodo';
import type { Task } from '$types/task/model';

interface BeschreibungProps {
  task: Task;
  readOnly?: boolean;
}

export const TaskEditorBeschreibung = ({ task, readOnly = false }: BeschreibungProps) => {
  const [pendingBeschreibung, updatePendingBeschreibung] = useDebouncedTaskUpdate(
    task.id,
    'description',
    task.description ?? '',
  );

  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const description = filterCalDavBeschreibung(pendingBeschreibung);

  // auto-resize the description textarea based on its content
  useEffect(() => {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    // skip if DOM value has not reflected the latest state yet
    if (textarea.value !== description) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [description]);

  const handleBeschreibungChange = (value: string, cursorPos?: number | null) => {
    updatePendingBeschreibung(value);
    requestAnimationFrame(() => {
      if (descriptionRef.current && cursorPos !== null && cursorPos !== undefined) {
        descriptionRef.current.setSelectionRange(cursorPos, cursorPos);
      }
    });
  };

  return (
    <div>
      <label
        htmlFor={readOnly ? undefined : 'task-description'}
        className="mb-2 flex items-center gap-2 font-medium text-sm text-surface-600 dark:text-surface-400"
      >
        <AlignLeft className="h-4 w-4" />
        Beschreibung
      </label>
      {readOnly ? (
        description ? (
          <div className="selectable min-h-24 w-full cursor-not-allowed whitespace-pre-wrap rounded-lg border border-transparent bg-surface-100 px-3 py-2 text-sm text-surface-700 dark:bg-surface-800 dark:text-surface-300">
            {description}
          </div>
        ) : (
          <TaskEditorEmptyState icon={<FileX className="h-4 w-4 shrink-0" />}>
            Keine Beschreibung
          </TaskEditorEmptyState>
        )
      ) : (
        <ComposedTextarea
          ref={descriptionRef}
          id="task-description"
          value={description}
          onChange={handleBeschreibungChange}
          placeholder="Beschreibung hinzufügen …"
          rows={4}
          className="w-full resize-none overflow-hidden rounded-lg border border-transparent bg-surface-100 px-3 py-2 text-sm text-surface-700 transition-colors focus:border-primary-ink focus:bg-white focus:outline-hidden dark:bg-surface-800 dark:text-surface-300 dark:focus:bg-surface-800"
        />
      )}
    </div>
  );
};
