import Settings from '../components/objectmaker/Settings'
import Assist from '../components/objectmaker/Assist'
import Editor from '../components/objectmaker/Editor'
import { getExperienceById } from '../config/experiences'
import { useObjectMakerBuilderState } from './useObjectMakerBuilderState'

export default function ObjectMakerBuilder() {
  const experience = getExperienceById('objectmaker')
  const state = useObjectMakerBuilderState(experience)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-12">
        <Settings
          baseUrl={state.baseUrl}
          setBaseUrl={state.setBaseUrl}
          model={state.model}
          setModel={state.setModel}
          experience={experience}
          objectType={state.objectType}
        />
        <Assist
          prompt={state.prompt}
          setPrompt={state.setPrompt}
          chatMessages={state.chatMessages}
          chatLoading={state.chatLoading}
          onSend={state.sendToChat}
          onAdopt={state.tryAdoptAssistantJson}
        />
        <Editor
          structureText={state.structureText}
          setStructureText={state.setStructureText}
          onValidate={state.validateStructure}
          objectType={state.objectType}
          setObjectType={state.setObjectType}
          objectTitle={state.objectTitle}
          setObjectTitle={state.setObjectTitle}
          createPrompt={state.createPrompt}
          setCreatePrompt={state.setCreatePrompt}
          systemText={state.systemText}
          setSystemText={state.setSystemText}
          temperature={state.temperature}
          setTemperature={state.setTemperature}
          strictMode={state.strictMode}
          setStrictMode={state.setStrictMode}
          onCreate={state.handleCreate}
          createLoading={state.createLoading}
          error={state.error}
          resultObj={state.resultObj}
        />
      </div>
    </div>
  )
}
