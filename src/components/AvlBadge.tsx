export type AvlBadgeProps = { route: string };

const AVL_BADGE_SVG =
  'https://raw.githubusercontent.com/frontier-infra/avl/main/assets/avl-badge.svg';

export default function AvlBadge({ route }: AvlBadgeProps) {
  const endpoint = `${route}.agent`;
  const alt = `AVL agent-ready: this page ships a parallel agent view at ${endpoint}`;

  return (
    <div
      role="group"
      aria-label="Platform capabilities"
      data-agent-discovery="true"
      data-avl-endpoint={endpoint}
      data-avl-manifest="/agent.txt"
      data-avl-package="@frontier-infra/avl"
    >
      <a href={endpoint} rel="alternate agent-view" type="text/agent-view">
        <img src={AVL_BADGE_SVG} alt={alt} />
      </a>
    </div>
  );
}
