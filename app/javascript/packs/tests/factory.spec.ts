import { Task, Project } from '../models';

type Partial<T> = {
    [P in keyof T]?: T[P];
}

function fakeTask(props: Partial<Task>): Task {
    let task =  {
        id: '1',
        title: 'Testing',
        sortOrder: 1,
        indentLevel: 1,
        projectId: '1',
        labelIds: []
    };

    for (let propKey in props) {
        task[propKey] = props[propKey];
    }

    return task;
}

function fakeProject(props: Partial<Project>): Project {
    let project: Project =  {
        id: '1',
        name: 'Dummy Project',
        colorHex: '000000',
        sortOrder: 1
    };

    for (let propKey in props) {
        project[propKey] = props[propKey];
    }

    return project;
}

export { fakeTask, fakeProject };