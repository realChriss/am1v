const SCALE_STEPS = [0.42, 0.34, 0.26, 0.2]

const GRADE_FRAMES = 30
const GRADE_SLOW_MS = 20
const GRADE_STRIKES = 2

export type Quality = {
  scale: () => number
  record: (delta: number) => boolean
  reset: () => void
}

export function createQuality(): Quality {
  let step = 0
  let graded = 0
  let gradeSum = 0
  let strikes = 0

  return {
    scale: () => SCALE_STEPS[step],

    record(delta) {
      if (step >= SCALE_STEPS.length - 1) return false
      gradeSum += delta
      graded += 1
      if (graded < GRADE_FRAMES) return false

      const mean = gradeSum / graded
      gradeSum = 0
      graded = 0

      if (mean <= GRADE_SLOW_MS) {
        strikes = 0
        return false
      }
      strikes += 1
      if (strikes < GRADE_STRIKES) return false

      strikes = 0
      step += 1
      return true
    },

    reset() {
      gradeSum = 0
      graded = 0
    },
  }
}
