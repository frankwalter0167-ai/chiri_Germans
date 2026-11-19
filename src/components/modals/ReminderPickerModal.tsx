import { ModalButton } from '$components/ModalButton';
import { ModalWrapper } from '$components/ModalWrapper';
import { DateTimePickerBody } from '$components/modals/DateTimePickerBody';
import { useDateTimePickerDraft } from '$hooks/ui/useDateTimePickerDraft';

interface ReminderPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  value?: Date;
  onSave: (date: Date) => void;
  onClear?: () => void;
  title?: string;
}

export const ReminderPickerModal = ({
  isOpen,
  onClose,
  value,
  onSave,
  onClear,
  title = 'Erinnerung hinzufügen',
}: ReminderPickerModalProps) => {
  const draft = useDateTimePickerDraft({
    isOpen,
    value,
    supportsNoTime: false,
    resetMonthOnOpen: true,
  });

  if (!isOpen) return null;

  const handleClear = () => {
    onClear?.();
    draft.clearLocalValue();
  };

  const handleSave = () => {
    if (draft.localValue) {
      onSave(draft.localValue);
    } else if (draft.initialValue && onClear) {
      onClear();
    }
    onClose();
  };

  const clearButton =
    draft.localValue || draft.initialValue ? (
      <ModalButton
        variant="secondary"
        onClick={handleClear}
        className="text-surface-500 hover:bg-semantic-error/10 hover:text-semantic-error dark:text-surface-400"
      >
        Leeren
      </ModalButton>
    ) : null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="max-w-120"
      zIndex="z-70"
      contentPadding={false}
      initialFocus="dialog"
      footerLeft={clearButton}
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose}>
            Abbrechen
          </ModalButton>
          <ModalButton
            onClick={handleSave}
            disabled={(!draft.localValue && !draft.initialValue) || !draft.hasChanges}
          >
            {value ? 'Speichern' : 'Erinnerung hinzufügen'}
          </ModalButton>
        </>
      }
    >
      <DateTimePickerBody draft={draft} />
    </ModalWrapper>
  );
};
