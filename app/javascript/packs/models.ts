interface Task {
    title: string,
    id: string,
    sortOrder: number,
    indentLevel: number,
    projectId: string,
    labelIds: string[]
}

// TODO: Add sortOrder?
interface Project {
    id: string
    name: string
    colorHex: string
    sortOrder: number
}

interface Label {
    id: string
    name: string
    colorHex: string
    sortOrder: number
}

export { Label, Project, Task };