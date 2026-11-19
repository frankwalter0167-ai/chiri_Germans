import { useCallback, useState } from 'react';
import { parseIcsFile, parseJsonTasksFile } from '$lib/ical/import';
import { loggers } from '$lib/logger';
import type { ParsedTaskWithStatus } from '$types/task/import';
import type { Task } from '$types/task/model';

const log = loggers.import;

export const useImportFile = () => {
  const [fileName, setFileName] = useState('');
  const [parsedTasks, setParsedTasks] = useState<ParsedTaskWithStatus[]>([]);
  const [error, setError] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  const handleFileContent = useCallback((name: string, content: string) => {
    setFileName(name);
    setError('');
    setParseErrors([]);

    let tasks: Partial<Task>[] = [];
    const lowerName = name.toLowerCase();

    try {
      if (lowerName.endsWith('.ics') || lowerName.endsWith('.ical')) {
        tasks = parseIcsFile(content);
      } else if (lowerName.endsWith('.json')) {
        tasks = parseJsonTasksFile(content);
      } else {
        if (content.trim().startsWith('BEGIN:VCALENDAR')) {
          tasks = parseIcsFile(content);
        } else if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
          tasks = parseJsonTasksFile(content);
        } else {
          setError('Nicht unterstütztes Dateiformat. Bitte verwende Dateien im Format .ics, .ical oder .json.');
          return;
        }
      }
    } catch (err) {
      log.error('Error parsing file:', err);
      setError('Die Datei konnte nicht eingelesen werden. Möglicherweise ist sie beschädigt oder hat ein nicht unterstütztes Format.');
      return;
    }

    if (tasks.length === 0) {
      setError('In der Datei wurden keine Aufgaben gefunden.');
      return;
    }

    setParsedTasks(tasks.map((task) => ({ ...task, importStatus: 'pending' })));
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      try {
        const content = await file.text();
        handleFileContent(file.name, content);
      } catch (err) {
        setError('Die Datei konnte nicht gelesen werden.');
        log.error('Failed to read file:', err);
      }
    },
    [handleFileContent],
  );

  const resetFile = useCallback(() => {
    setParsedTasks([]);
    setFileName('');
    setError('');
    setParseErrors([]);
  }, []);

  return {
    fileName,
    parsedTasks,
    error,
    parseErrors,
    handleFileContent,
    handleFileSelect,
    resetFile,
    setError,
    setParsedTasks,
  };
};
