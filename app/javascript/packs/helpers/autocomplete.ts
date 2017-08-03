// Incomplete, not used yet!

import * as _ from 'lodash';

import { EditorNode } from './editor_nodes';

interface AutocompleteState {
    // The position of the TextInputNode that autocompletion is active on.
    nodePosition: number

    // The cursor position of the trigger word within the active node.
    //
    // If text is "this #autocompleting", then triggerPosition will be 5.
    triggerPosition: number

    // The
    activeSuggestionPosition: number
}

interface AutocompleteSuggestion {
    type: "project" | "label"
    name: string
    colorHex: string
}

function getQuery(editorNodes: EditorNode[], autocompleteState) {

}

let Accessors = {
    Suggestions(definitions, autocompleteState): AutocompleteSuggestion[] {
        return [];
    }
};


function resetActiveSuggestionPosition(state: AutocompleteState) {
    let newState = _.clone(state);
    newState.activeSuggestionPosition = 0;

    return newState;
}