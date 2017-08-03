import { Task, Project, Label } from './models';
import axios, { AxiosPromise } from 'axios';

interface APITask {
    id: number // TODO: Change this to string on backend?
    title: string
    sort_order: number
    indent_level: number
    project_id: number // TODO: Change this to string on backend?
    label_ids: number[]
}

interface APIProject {
    id: number, // TODO: Change this to string on backend?
    name: string,
    color_hex: string,
    sort_order: number,
    is_inbox: boolean
}

interface APILabel {
    id: number, // TODO: Change this to string on backend?
    name: string,
    color_hex: string,
    sort_order: number
}

class API {
    url: string

    constructor(url: string) {
        this.url = url;
    }

    static error() {
        console.log(arguments);
        alert('Error contacting backend! Check console.');
    }

    getTasks(): Promise<Task[]> {
        let url = this.url + "api/v1/tasks.json";
        let axiosPromise = axios.get(url);

        return API.PromiseForMultipleTasks(axiosPromise);
    }

    createTask(title: string, projectId: string, labelIds: string[]): Promise<Task> {
        let url = this.url + "api/v1/tasks.json";
        let axiosPromise = axios.post(url, {
            title: title,
            project_id: projectId,
            label_ids: labelIds
        });

        return API.PromiseForSingleTask(axiosPromise);
    }

    updateTask(id: string, properties: {[ key: string]: any}): Promise<Task> {
        let url = this.url + "api/v1/tasks/" + id + ".json";
        let axiosPromise = axios.put(url, properties);

        return API.PromiseForSingleTask(axiosPromise);
    }

    reorderTasks(project: Project, task_ids: string[]): Promise<Task[]> {
        let url = this.url + "api/v1/tasks/reorder.json";
        let axiosPromise = axios.post(url, {
            task_ids: task_ids.map(x => Number(x)),
            project_id: project.id
        });

        return API.PromiseForMultipleTasks(axiosPromise);
    }

    getProjects(): Promise<Project[]> {
        let url = this.url + "api/v1/projects.json";
        let axiosPromise = axios.get(url);

        return API.PromiseForMultipleProjects(axiosPromise);
    }

    reorderProjects(projectIds: string[]): Promise<Project[]> {
        let url = this.url + "api/v1/projects/reorder.json";
        let axiosPromise = axios.post(url, {
            project_ids: projectIds.map(x => Number(x))
        });

        return API.PromiseForMultipleProjects(axiosPromise);
    }

    createProject(name: string, colorHex: string): Promise<Project> {
        let url = this.url + "api/v1/projects.json";
        let axiosPromise = axios.post(url, {
            name: name,
            color_hex: colorHex
        });

        return API.PromiseForSingleProject(axiosPromise);
    }

    updateProject(id: string, name: string, colorHex: string): Promise<Project> {
        let url = this.url + "api/v1/projects/" + id + ".json";
        let axiosPromise = axios.put(url, {
            name: name,
            color_hex: colorHex
        });

        return API.PromiseForSingleProject(axiosPromise);
    }

    deleteProject(id: string): Promise<void> {
        let url = this.url + "api/v1/projects/" + id + ".json";
        let axiosPromise = axios.delete(url);

        return API.PromiseForVoid(axiosPromise);
    }

    getLabels(): Promise<Label[]> {
        let url = this.url + "api/v1/labels.json";
        let axiosPromise = axios.get(url);

        return API.PromiseForMultipleLabels(axiosPromise);
    }

    reorderLabels(labelIds: string[]): Promise<Label[]> {
        let url = this.url + "api/v1/labels/reorder.json";
        let axiosPromise = axios.post(url, {
            label_ids: labelIds.map(x => Number(x))
        });

        return API.PromiseForMultipleLabels(axiosPromise);
    }

    createLabel(name: string, colorHex: string): Promise<Label> {
        let url = this.url + "api/v1/labels.json";
        let axiosPromise = axios.post(url, {
            name: name,
            color_hex: colorHex
        });

        return API.PromiseForSingleLabel(axiosPromise);
    }

    updateLabel(id: string, name: string, colorHex: string): Promise<Label> {
        let url = this.url + "api/v1/labels/" + id + ".json";
        let axiosPromise = axios.put(url, {
            name: name,
            color_hex: colorHex
        });

        return API.PromiseForSingleLabel(axiosPromise);
    }

    deleteLabel(id: string): Promise<void> {
        let url = this.url + "api/v1/labels/" + id + ".json";
        let axiosPromise = axios.delete(url);

        return API.PromiseForVoid(axiosPromise);
    }

    static PromiseForMultipleTasks(axiosPromise: AxiosPromise): Promise<Task[]> {
        return API.PromiseForMultipleResources(axiosPromise, API.TaskFromAPI);
    }

    static PromiseForSingleTask(axiosPromise: AxiosPromise): Promise<Task> {
        return API.PromiseForSingleResource(axiosPromise, API.TaskFromAPI);
    }

    static PromiseForMultipleProjects(axiosPromise: AxiosPromise): Promise<Project[]> {
        return API.PromiseForMultipleResources(axiosPromise, API.ProjectFromAPI);
    }

    static PromiseForSingleProject(axiosPromise: AxiosPromise): Promise<Project> {
        return API.PromiseForSingleResource(axiosPromise, API.ProjectFromAPI);
    }

    static PromiseForMultipleLabels(axiosPromise: AxiosPromise): Promise<Label[]> {
        return API.PromiseForMultipleResources(axiosPromise, API.LabelFromAPI);
    }

    static PromiseForSingleLabel(axiosPromise: AxiosPromise): Promise<Label> {
        return API.PromiseForSingleResource(axiosPromise, API.LabelFromAPI);
    }

    static PromiseForVoid(axiosPromise: AxiosPromise): Promise<void> {
        return new Promise(function(resolve, reject) {
            let resolver = function(axiosResponse) {
                resolve();
            };

            axiosPromise.then(resolver, API.error);
        })
    }

    static PromiseForSingleResource<T>(axiosPromise: AxiosPromise, mapFunc: (any) => T): Promise<T> {
        return new Promise(function(resolve, reject) {
            let resolver = function(axiosResponse) {
                resolve(mapFunc(axiosResponse.data));
            };

            axiosPromise.then(resolver, API.error);
        })
    }

    static PromiseForMultipleResources<T>(axiosPromise: AxiosPromise, mapFunc: (any) => T): Promise<T[]> {
        return new Promise(function(resolve, reject) {
            let resolver = function(axiosResponse) {
                resolve(axiosResponse.data.map(mapFunc));
            };

            axiosPromise.then(resolver, API.error);
        })
    }

    static TaskFromAPI(data: APITask): Task {
        return {
            title: data.title,
            id: String(data.id), // TODO: Make API return string
            sortOrder: data.sort_order,
            indentLevel: data.indent_level,
            projectId: String(data.project_id),
            labelIds: data.label_ids.map((x) => String(x))
        };
    }

    static ProjectFromAPI(data: APIProject): Project {
        return {
            name: data.name,
            id: String(data.id), // TODO: Make API return string
            colorHex: data.color_hex,
            sortOrder: data.sort_order
        };
    }

    static LabelFromAPI(data: APILabel): Label {
        return {
            name: data.name,
            id: String(data.id), // TODO: Make API return string
            colorHex: data.color_hex,
            sortOrder: data.sort_order
        };
    }
}

export { API };