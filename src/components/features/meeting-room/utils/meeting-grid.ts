export const MAX_GRID_TILES = 16

const basis = ['', 'sm:basis-full', 'sm:basis-[calc((100%-0.75rem)/2)]', 'sm:basis-[calc((100%-1.5rem)/3)]', 'sm:basis-[calc((100%-2.25rem)/4)]']
const height = ['', 'sm:h-full', 'sm:h-[calc((100%-0.75rem)/2)]', 'sm:h-[calc((100%-1.5rem)/3)]', 'sm:h-[calc((100%-2.25rem)/4)]']

export function meetGrid<T>(people: T[]) {
  const visible = people.length > MAX_GRID_TILES ? people.slice(0, MAX_GRID_TILES - 1) : people
  const hidden = people.length - visible.length
  const count = visible.length + (hidden ? 1 : 0)
  const columns = count <= 1 ? 1 : count <= 4 ? 2 : count <= 9 ? 3 : 4
  const rows = Math.min(Math.ceil(count / columns), 4)
  return {
    visible,
    hidden,
    container: 'grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto sm:flex sm:flex-wrap sm:content-center sm:justify-center sm:overflow-hidden',
    tile: ['h-40 sm:h-auto sm:shrink-0 sm:grow-0', basis[columns], height[rows], visible.length === 1 ? 'col-span-2 h-72' : ''].join(' '),
  }
}
