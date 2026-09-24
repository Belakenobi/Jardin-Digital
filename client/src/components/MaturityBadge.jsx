const maturityConfig = {
  seed: {
    emoji: '🌱',
    label: 'Semilla',
  },
  budding: {
    emoji: '🌿',
    label: 'Brote',
  },
  tree: {
    emoji: '🌳',
    label: 'Árbol',
  },
}

function MaturityBadge({ maturity }) {
  const item =
    maturityConfig[maturity] ??
    {
      emoji: '·',
      label: maturity,
    }

  return (
    <span className="maturity-stamp">
      <span aria-hidden="true">
        {item.emoji}
      </span>{' '}
      {item.label}
    </span>
  )
}

export default MaturityBadge
