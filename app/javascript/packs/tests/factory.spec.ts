import { Task, Project } from '../models';

type Partial<T> = {
    [P in keyof T]?: T[P];
}

function fakeTask(props: Partial<Task>): Task {
    let fakeTask =  {
        id: '1',
        title: 'Testing',
        sortOrder: 1,
        indentLevel: 1,
        projectId: '1'
    };

    for (let propKey in props) {
        fakeTask[propKey] = props[propKey];
    }

    return fakeTask;
}

export { fakeTask };