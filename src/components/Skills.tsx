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
          {SKILLS.map(({ name, Icon }, i) => (
            <li className="am-skill-item" key={name} style={{ '--i': i } as CSSProperties}>
              <div className="am-skill am-glass" data-skill={name}>
                <Icon />
                <span className="am-skill-name">{name}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
