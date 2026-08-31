import type { CSSProperties } from 'react'
import { SKILLS } from '../content'

type SkillsProps = { shown: boolean }

export default function Skills({ shown }: SkillsProps) {
  return (
    <section
      className={`am-skills${shown ? ' is-shown' : ''}`}
      data-pane
      aria-labelledby="am-skills-title"
      inert={!shown}
    >
      <div className="am-skills-inner">
        <h2 className="am-pane-title" id="am-skills-title">
          Skills
        </h2>

        <ul className="am-skill-rail">
          {SKILLS.map(({ name, href, Icon }, i) => (
            <li className="am-skill-item" key={name} style={{ '--i': i } as CSSProperties}>
              <a
                className="am-skill"
                data-skill={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon />
                <span className="am-skill-name">{name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
