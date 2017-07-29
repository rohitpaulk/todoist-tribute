import assert = require('assert');
import 'mocha';

import { Constructors, EditorNode } from '../helpers/editor_nodes';
import { Project } from '../models';

describe('Constructors  - projectPillNodeFromProject', function() {
    it('should return project in data', function() {
        let project: Project = {name: "Testing", id: '1', colorHex: "000000"};
        let projectPillNode = Constructors.projectPillNodeFromProject(project);
        assert.equal(project, projectPillNode.data.project);
    });
});