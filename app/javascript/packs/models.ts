interface Task {
    title: string,
    id: string,
    sortOrder: number,
    indentLevel: number,
    projectId: string
}

// TODO: Add sortOrder?
interface Project {
    id: string,
    name: string,
    colorHex: string
}

export { Task, Project };