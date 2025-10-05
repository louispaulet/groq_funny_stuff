const CITATION_MARK_PATTERN = /【[^】]+】/g

function removeCitationMarks(text) {
  if (!text) return text
  return text.replace(CITATION_MARK_PATTERN, '')
}

export function enhanceAssistantContent(experience, content) {
  let output = content || ''
  if (!output) return output

  if (experience?.id === 'allergyfinder') {
    output = removeCitationMarks(output)
  }

  return output.trim()
}
