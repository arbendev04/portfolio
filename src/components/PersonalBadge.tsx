import { useT } from '../i18n/langStore';
import './PersonalBadge.css';

interface PersonalBadgeProps {
  className?: string;
}

/** Marks a self-initiated study project, so it is never mistaken for client work. */
export default function PersonalBadge({ className }: PersonalBadgeProps) {
  const t = useT();
  return <span className={['personal-badge', className].filter(Boolean).join(' ')}>{t.projects.personal}</span>;
}
