interface Task {
    title: string,
    id: string,
    sortOrder: number,
    indentLevel: number,
    projectId: string
}

interface Project {
    id: string,
    name: string,
    colorHex: string
}

export { Task, Project };