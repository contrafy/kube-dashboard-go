export namespace main {
	
	export class NamespaceResources {
	    deployments: string[];
	    statefulsets: string[];
	    secrets: string[];
	
	    static createFrom(source: any = {}) {
	        return new NamespaceResources(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.deployments = source["deployments"];
	        this.statefulsets = source["statefulsets"];
	        this.secrets = source["secrets"];
	    }
	}

}

