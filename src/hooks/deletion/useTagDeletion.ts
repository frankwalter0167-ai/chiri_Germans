import { createElement, useCallback } from 'react';
import { ColoredItemLabel } from '$components/ColoredItemLabel';
import { useConfirmDialog } from '$context/confirmDialogContext';
import { useDeleteTag } from '$hooks/queries/useTags';
import type { Tag } from '$types/tag';

export const useTagDeletion = () => {
  const deleteTagMutation = useDeleteTag();
  const { confirm, close } = useConfirmDialog();

  const deleteTag = useCallback(
    async (tagId: string, tags: Tag[]) => {
      const tag = tags.find((t) => t.id === tagId);

      const confirmed = await confirm({
        title: 'Schlagwort löschen',
        subtitle: tag
          ? createElement(ColoredItemLabel, {
              name: tag.name,
              icon: tag.icon,
              emoji: tag.emoji,
              color: tag.color,
              defaultIcon: 'tag',
            })
          : undefined,
        message: 'Bist du sicher? Aufgaben mit diesem Schlagwort sind davon nicht betroffen.',
        confirmLabel: 'Löschen',
        cancelLabel: 'Abbrechen',
        destructive: true,
      });
      if (!confirmed) return false;

      deleteTagMutation.mutate(tagId);
      close();
      return true;
    },
    [close, confirm, deleteTagMutation],
  );

  return { deleteTag };
};
