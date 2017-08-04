import { AutocompleteState } from './autocomplete';
import { EditorNodeList } from './editor_nodes';

// An action to be run against `task_editor`. Used to
// communicate between modules.
type EventHandlerAction = CancelAutocompleteAction
                        | UpdateAutocompleteStateAction
                        | UpdateEditorNodesAction;

interface CancelAutocompleteAction {
    type: "cancel_autocomplete"
}

interface UpdateAutocompleteStateAction {
    type: "update_autocomplete_state"
    state: AutocompleteState
}

interface UpdateEditorNodesAction {
    type: "update_editor_nodes"
    editorNodes: EditorNodeList
}

export { EventHandlerAction };