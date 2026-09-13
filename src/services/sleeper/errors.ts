export type SleeperErrorCode = 'not_found' | 'unavailable' | 'invalid_response'

export class SleeperApiError extends Error {
  readonly code: SleeperErrorCode

  constructor(message: string, code: SleeperErrorCode) {
    super(message)
    this.name = 'SleeperApiError'
    this.code = code
  }
}
