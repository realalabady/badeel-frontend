import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
}
