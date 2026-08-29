import { PROJECTS } from '../content'
import ProjectItem from './ProjectItem'

type WorkProps = { shown: boolean }

/** The second slide of the deck. */
export default function Work({ shown }: WorkProps) {
  return (
    <section
      className={`am-work${shown ? ' is-shown' : ''}`}
      aria-labelledby="am-work-title"
      inert={!shown}
    >
      <div className="am-work-inner">
        <h2 className="am-work-title" id="am-work-title">
          Projects
        </h2>

        <ul className="am-projects">
          {PROJECTS.map((project, i) => (
            <ProjectItem key={project.name} project={project} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
