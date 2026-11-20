import { collectOperation, requestOperation } from './contract-client'
import { classworkSchema, getClasswork, listClasswork, type Classwork, type Submission } from './academic.service'
import type { OperationBody, OperationData } from './generated-contract'

export type ClassworkQuestions = OperationData<'GET /api/v1/classwork/{classworkId}/questions'>
export type ClassworkQuestion = ClassworkQuestions['questions'][number]
export type ClassworkEntry = { work: Classwork; questions: ClassworkQuestions; submission: Submission | null }
export type ClassworkInput = OperationBody<'POST /api/v1/classrooms/{classroomId}/classwork'>
type QuestionBody = OperationBody<'POST /api/v1/classwork/{classworkId}/questions'>
export type QuestionDefinition = Extract<QuestionBody, { definition: unknown }>['definition']
export type QuestionInput = { position: number; prompt: string } & (
  { options: string[]; answerIndex: number } | { definition: QuestionDefinition }
)
export type QuestionAnswer = NonNullable<Submission['questionAnswers']>[number]

export function savedQuestion(id: string, input: QuestionInput): ClassworkQuestion {
  return 'definition' in input ? { ...input, id, options: [] } : { ...input, id }
}

export function editableQuestion(question: ClassworkQuestion): QuestionInput | undefined {
  const { position, prompt, definition } = question
  if (!definition) {
    return question.answerIndex === undefined ? undefined
      : { position, prompt, options: question.options, answerIndex: question.answerIndex }
  }
  if (definition.type === 'dropdown') {
    if (definition.answerIndex === undefined) return undefined
    return { position, prompt, definition: { ...definition, answerIndex: definition.answerIndex } }
  }
  if (definition.type === 'checkboxes') {
    if (!definition.answerIndexes) return undefined
    return { position, prompt, definition: { ...definition, answerIndexes: definition.answerIndexes } }
  }
  return { position, prompt, definition }
}

export const getClassworkQuestions = (classworkId: string, signal?: AbortSignal) =>
  requestOperation('GET /api/v1/classwork/{classworkId}/questions', { params: { classworkId }, signal })
export const getOwnClassworkSubmission = (classworkId: string, signal?: AbortSignal) =>
  requestOperation('GET /api/v1/classwork/{classworkId}/submissions/me', { params: { classworkId }, signal })

async function hydrate(work: Classwork, owned: boolean, signal?: AbortSignal): Promise<ClassworkEntry> {
  const [questions, submission] = await Promise.all([
    getClassworkQuestions(work.id, signal),
    owned ? Promise.resolve(null) : getOwnClassworkSubmission(work.id, signal),
  ])
  return { work, questions, submission }
}

export async function listClassroomWork(classroomId: string, owned: boolean, signal?: AbortSignal) {
  const items = await listClasswork(classroomId, signal)
  // Publication is enforced by the API; also exclude drafts from learner presentation.
  return Promise.all(items.filter(item => owned || item.status === 'PUBLISHED').map(item => hydrate(item, owned, signal)))
}

export async function loadClassroomWork(classroomId: string, classworkId: string, owned: boolean, signal?: AbortSignal) {
  const work = await getClasswork(classworkId, signal)
  if (work.classroomId !== classroomId || (!owned && work.status !== 'PUBLISHED')) throw new Error('This classwork is not available in this classroom.')
  return hydrate(work, owned, signal)
}

export async function createClassroomWork(classroomId: string, input: ClassworkInput) {
  return classworkSchema.parse(await requestOperation('POST /api/v1/classrooms/{classroomId}/classwork', { params: { classroomId }, body: input }))
}
export const updateClassroomWork = (classworkId: string, input: ClassworkInput) =>
  requestOperation('PATCH /api/v1/classwork/{classworkId}', { params: { classworkId }, body: input })
export const publishClassroomWork = (classworkId: string) =>
  requestOperation('POST /api/v1/classwork/{classworkId}/publish', { params: { classworkId }, body: {} })
export const addClassworkQuestion = (classworkId: string, expectedVersion: number, input: QuestionInput) =>
  requestOperation('POST /api/v1/classwork/{classworkId}/questions', { params: { classworkId }, body: { ...input, expectedVersion } })
export const updateClassworkQuestion = (classworkId: string, questionId: string, expectedVersion: number, input: QuestionInput) =>
  requestOperation('PATCH /api/v1/classwork/{classworkId}/questions/{questionId}', { params: { classworkId, questionId }, body: { ...input, expectedVersion } })
export const removeClassworkQuestion = (classworkId: string, questionId: string, expectedVersion: number) =>
  requestOperation('DELETE /api/v1/classwork/{classworkId}/questions/{questionId}', { params: { classworkId, questionId }, body: { expectedVersion } })
export const saveClassworkResponse = (classworkId: string, expectedVersion: number, textAnswer: string, choiceAnswers: NonNullable<OperationBody<'PUT /api/v1/classwork/{classworkId}/submissions/me'>['choiceAnswers']>, questionAnswers?: QuestionAnswer[]) =>
  requestOperation('PUT /api/v1/classwork/{classworkId}/submissions/me', { params: { classworkId }, body: { expectedVersion, textAnswer, choiceAnswers, ...(questionAnswers && { questionAnswers }) } })
export const submitClassworkResponse = (classworkId: string, expectedVersion: number) =>
  requestOperation('POST /api/v1/classwork/{classworkId}/submissions/me/submit', { params: { classworkId }, body: { expectedVersion } })
export const listClassworkSubmissions = (classworkId: string, signal?: AbortSignal) =>
  collectOperation('GET /api/v1/classwork/{classworkId}/submissions', { params: { classworkId }, signal })
export const listClassworkLearners = (classroomId: string, signal?: AbortSignal) =>
  collectOperation('GET /api/v1/classrooms/{classroomId}/students', { params: { classroomId }, signal })
export const getClassworkSubmission = (submissionId: string, signal?: AbortSignal) =>
  requestOperation('GET /api/v1/submissions/{submissionId}', { params: { submissionId }, signal })

export const getSubmissionFileDownload = (submissionId: string, fileId: string) =>
  requestOperation('GET /api/v1/submissions/{submissionId}/files/{fileId}/download', { params: { submissionId, fileId } })