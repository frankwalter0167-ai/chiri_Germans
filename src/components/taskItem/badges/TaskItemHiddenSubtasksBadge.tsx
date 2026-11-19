import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';
export const TaskItemHiddenSubtasksBadge = ({ count }: { count: number }) => (
  <TaskItemBadge>
    {count} {count === 1 ? 'ausgeblendete Unteraufgabe' : 'ausgeblendete Unteraufgaben'}
  </TaskItemBadge>
);
