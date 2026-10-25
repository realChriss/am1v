import type { CSSProperties } from 'react'
import type { Project } from '../content'
import { ArrowUpRightIcon } from './icons'

type ProjectItemProps = {
  project: Project
  index: number
}

export default function ProjectItem({ project, index }: ProjectItemProps) {
  const { name, blurb, href, Icon } = project

  return (
    <li style={{ '--i': index } as CSSProperties}>
      <a className="am-project-link" href={href} target="_blank" rel="noopener noreferrer">
        <span className="am-project-glyph" aria-hidden="true">
          <Icon />
        </span>
        <span className="am-project-name">{name}</span>
        <span className="am-project-blurb">{blurb}</span>
        <ArrowUpRightIcon className="am-project-arrow" />
      </a>
    </li>
  )
}
