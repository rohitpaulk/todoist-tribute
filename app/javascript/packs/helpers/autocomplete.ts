import Fuse from 'fuse.js';
import * as _ from 'lodash';

import { EditorNode, EditorNodeList } from './editor_nodes';
import { Accessors as EditorNodeAccessors } from './editor_nodes';
import { Mutators as EditorNodeMutators } from './editor_nodes';
import { Constructors as EditorNodeConstructors } from './editor_nodes';
import { EventHandlerAction } from './event_handler_actions';

interface State {
    // The position of the TextInputNode that autocompletion is active on.
    nodePosition: number

    // The cursor position of the trigger word within the active node.
    //
    // If text is "this #autocompleting", then triggerPosition will be 5.
    triggerPosition: number

    // Index of the active suggestion in the suggestion list.
    activeSuggestionIndex: number

    definitionType: "project" | "label"
}

interface SuggestionList {
    type: "project" | "label"
    suggestions: Suggestion[]
}

interface Suggestion {
    id: string
    name: string
    colorHex: string
}

interface Definition {
    type: "project" | "label"
    triggerCharCode: number
    suggestions: Suggestion[]
}

function _getQuery(nodeList: EditorNodeList, state: State): string {
    let nodePosition = state.nodePosition;
    let triggerPosition = state.triggerPosition;

    let node = EditorNodeAccessors.getTextNodeAt(nodeList, nodePosition)

    // TODO: Make this better with tracking live current cursor position!
    //       If someone triggers an autocomplete in the middle of a text
    //       box, this will fail.

    return _.trim(node.data.text.slice(triggerPosition));
}

function getAutocompleteSuggestions(definitions: Definition[], state: State, nodeList: EditorNodeList): Suggestion[] {
    let query = _getQuery(nodeList, state);

    let definition = _.find(definitions, (x) => x.type === state.definitionType);
    let allSuggestions = definition!.suggestions;

    if (query === '') {
        return allSuggestions
    } else {
        let fuse = new Fuse(allSuggestions, {keys: ["name"]});
        return fuse.search(query);
    }
}

function getActiveSelection(definitions: Definition[], state: State, nodeList: EditorNodeList): Suggestion | null {
    let suggestions = getAutocompleteSuggestions(definitions, state, nodeList);

    return suggestions[state.activeSuggestionIndex];
}

function _removeAutocompleteTextFromInput(nodeList: EditorNodeList, state: State): EditorNodeList {
    let nodePosition = state.nodePosition;
    let text = EditorNodeAccessors.getTextNodeAt(nodeList, nodePosition).data.text;
    let caretPosition = state.triggerPosition;
    let strippedText = text.slice(0, caretPosition - 1);

    let newNode = EditorNodeConstructors.inputNodeFromText(strippedText);
    let newNodeList = EditorNodeMutators.replaceTextNodeAt(nodeList, nodePosition, newNode);

    return newNodeList;
}

const CHAR_CODE_SPACE = 32;

let EventHandlers = {
    onKeyPress(event, definitions: Definition[], nodePosition: number, nodeList: EditorNodeList): EventHandlerAction[] {
        let caretPosition = (event.target.selectionStart);
        let textNode = EditorNodeAccessors.getTextNodeAt(nodeList, nodePosition);
        let characterBeforeCursor = textNode.data.text[caretPosition-1];

        let previousCharacterIsSpace = (characterBeforeCursor === ' ');
        let isValidStartPoint = previousCharacterIsSpace || (caretPosition === 0);
        let matchingDefinition = _.find(definitions, function(definition: Definition) {
            return definition.triggerCharCode === event.charCode;
        });

        if (matchingDefinition && isValidStartPoint) {
            return [{
                type: "update_autocomplete_state",
                state: {
                    nodePosition: nodePosition,
                    triggerPosition: caretPosition + 1, // Why the +1?
                    activeSuggestionIndex: 0,
                    definitionType: matchingDefinition.type
                }
            }];
        } else {
            return [];
        }
    },

    onKeyPressWhileAutocompleting(event, state: State): EventHandlerAction[] {
        // Reset the active suggestion, because the user pressed a key.
        state.activeSuggestionIndex = 0;

        let keyIsSpace = (event.charCode === CHAR_CODE_SPACE);
        if (keyIsSpace) {
            return [{ type: "cancel_autocomplete" }];
        } else {
            return [];
        }
    },

    onIntentToComplete(definitions: Definition[], state: State, nodeList: EditorNodeList): EventHandlerAction[] {
        let actions: EventHandlerAction[] = [
            { type: "cancel_autocomplete" }
        ];

        let activeSelection = getActiveSelection(definitions, state, nodeList);

        if (activeSelection) {
            let newNodeList = _removeAutocompleteTextFromInput(nodeList, state);

            let position = state.nodePosition + 1; // Place pill node after text

            if (state.definitionType === 'label') {
                let labelNode = EditorNodeConstructors.pillNodeFromLabel(activeSelection);
                newNodeList = EditorNodeMutators.addLabelNode(newNodeList, position, labelNode);
            } else if (state.definitionType === 'project') {
                let projectNode = EditorNodeConstructors.pillNodeFromProject(activeSelection);
                newNodeList = EditorNodeMutators.addOrReplaceProjectNode(newNodeList, position, projectNode)
            }

            actions.push({
                type: "update_editor_nodes",
                editorNodes: newNodeList
            });
        }

        return actions;
    }
};

export { State as AutocompleteState }
export { Suggestion as AutocompleteSuggestion }
export { Definition as AutocompleteDefinition }
export { getAutocompleteSuggestions }
export { EventHandlers as AutocompleteEventHandlers }
