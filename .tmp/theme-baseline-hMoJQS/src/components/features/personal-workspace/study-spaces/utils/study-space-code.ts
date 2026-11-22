export function isStudySpaceCode(value: string) {
  return /^(?:SPS-OWLIO|OWLIO-SPS)-[A-Z0-9]{4}$/i.test(value)
}

export function isStudySpaceInvitationToken(value: string) {
  return /^[A-Za-z0-9_-]{43}$/.test(value)
}
