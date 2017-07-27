import { Task, Project } from './models';
import * as $ from 'jquery';
import axios from 'axios';

interface APITask {
    title: string,
    id: number, // TODO: Change this to string on backend?
    sort_order: number,
    indent_level: number,
    project_id: number // TODO: Change this to string on backend?
}

interface APIProject {
    name: string,
    id: number, // TODO: Change this to string on backend?
    color_hex: string
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

    createTask(title: string, projectId: string): Promise<Task> {
        let url = this.url + "api/v1/tasks.json";
        let axiosPromise = axios.post(url, {
            title: title,
            project_id: projectId
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

    updateProject(id: string, properties: {[ key: string]: any}): Promise<Project> {
        let url = this.url + "api/v1/projects/" + id + ".json";
        let axiosPromise = axios.put(url, properties);

        return API.PromiseForSingleProject(axiosPromise);
    }

    static PromiseForMultipleTasks(axiosPromise): Promise<Task[]> {
        return new Promise(function(resolve, reject) {
            let resolver = function(axiosResponse) {
                resolve(axiosResponse.data.map(API.TaskFromAPI));
            };

            axiosPromise.then(resolver, API.error);
        })
    }

    static PromiseForSingleTask(axiosPromise): Promise<Task> {
        return new Promise(function(resolve, reject) {
            let resolver = function(axiosResponse) {
                resolve(API.TaskFromAPI(axiosResponse.data));
            };

            axiosPromise.then(resolver, API.error);
        })
    }

    static PromiseForMultipleProjects(axiosPromise): Promise<Project[]> {
        return new Promise(function(resolve, reject) {
            let resolver = function(axiosResponse) {
                resolve(axiosResponse.data.map(API.ProjectFromAPI));
            };

            axiosPromise.then(resolver, API.error);
        })
    }

    static PromiseForSingleProject(axiosPromise): Promise<Project> {
        return new Promise(function(resolve, reject) {
            let resolver = function(axiosResponse) {
                resolve(API.ProjectFromAPI(axiosResponse.data));
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
            projectId: String(data.project_id)
        };
    }

    static ProjectFromAPI(data: APIProject): Project {
        return {
            name: data.name,
            id: String(data.id), // TODO: Make API return string
            colorHex: data.color_hex
        };
    }
}

export { API };