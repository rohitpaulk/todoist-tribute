import assert = require('assert');
import 'mocha';

import { Constructors, EditorNode } from '../helpers/editor_nodes';
import { Project } from '../models';
import { fakeProject } from './factory.spec';

describe('Constructors  - projectPillNodeFromProject', function() {
    it('should return project in data', function() {
        let project = fakeProject({});
        let projectPillNode = Constructors.projectPillNodeFromProject(project);
        assert.equal(project, projectPillNode.data.project);
    });
});