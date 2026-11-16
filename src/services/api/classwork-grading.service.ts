import { requestOperation } from './contract-client'
import type { OperationBody, OperationData } from './generated-contract'

export type ClassworkEvaluation = NonNullable<OperationData<'GET /api/v1/submissions/{submissionId}/evaluation'>>
export type EvaluationInput = OperationBody<'PUT /api/v1/submissions/{submissionId}/evaluation'>
export const getClassworkEvaluation = (submissionId: string, signal?: AbortSignal) =>
  requestOperation('GET /api/v1/submissions/{submissionId}/evaluation', { params: { submissionId }, signal })
export const getClassworkAnswerScore = (submissionId: string, signal?: AbortSignal) =>
  requestOperation('GET /api/v1/submissions/{submissionId}/assessment-score', { params: { submissionId }, signal })
export const getClassworkRubric = (classworkId: string, signal?: AbortSignal) =>
  requestOperation('GET /api/v1/classwork/{classworkId}/rubric', { params: { classworkId }, signal })
export const saveClassworkEvaluation = (submissionId: string, body: EvaluationInput) =>
  requestOperation('PUT /api/v1/submissions/{submissionId}/evaluation', { params: { submissionId }, body })
export const releaseClassworkEvaluation = (submissionId: string, expectedVersion: number) =>
  requestOperation('POST /api/v1/submissions/{submissionId}/evaluation/release', { params: { submissionId }, body: { expectedVersion } })
