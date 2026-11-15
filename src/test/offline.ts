import axios from 'axios'
import { beforeEach, vi } from 'vitest'

// Unit tests must never reach an API backed by the user's real database.
// Tests can supply explicit mocked HTTP/service responses after this hook.
axios.defaults.adapter = async () => { throw new Error('Live HTTP is disabled in unit tests. Mock the API response.') }
beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Live fetch is disabled in unit tests. Mock the storage response.'))
})
