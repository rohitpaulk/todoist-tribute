interface Task {
    title: string,
    id: string,
    sortOrder: number,
    indentLevel: number
}

interface Project {
    id: string,
    name: string,
    colorHex: string
}

export { Task, Project };