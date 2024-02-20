// -----------------------------------------------------------------------------
//
// Dependency
//
// Supports creation of new Dependencies
//
// Author:  bernard@tsai.eu
// License: Apache-2.0
// 
// -----------------------------------------------------------------------------

// newDependenciesList: creates new list of dependencies
const newDependenciesList = () => {
    return [];
}

// -----------------------------------------------------------------------------

// newDependencies: creates new dependencies
const newDependencies = (path, index, cluster, ns, gvk, name, nr) => {
    // create new dependencies
    const dependencies = {
        path:         path,    // file path
        index:        index,   // index of the yaml in the file
        cluster:      cluster, // name of the cluster
        ns:           ns,      // namespace
        gvk:          gvk,     // group / version / kind of resource
        name:         name,    // name of resource
        nr:           nr,      // nr of resource,
        dependencies: []       // list of depencies
    }

    // return dependencies
    return dependencies;
}

// -----------------------------------------------------------------------------

// addDependencies: creates new dependencies and adds them to list of dependencies
const addDependencies = (dependenciesList, path, index, cluster, ns, gvk, name, nr) => {
    // create new dependencies
    const dependencies = newDependencies(path, index, cluster, ns, gvk, name, nr);
    
    // add dependencies to dependencies list
    dependenciesList.push(dependencies);

    // return dependencies
    return dependencies;
}

// -----------------------------------------------------------------------------

// addDependency: add a new dependency to dependencies
const addDependency = (dependencies, cluster, ns, gvk, name, nr) => {
    // create a new dependdency
    const dependency = {
        cluster: cluster, // name of the cluster
        ns:      ns,      // namespace
        gvk:     gvk,     // group / version / kind of resource
        name:    name,    // name of resource
        nr:      nr       // nr of resource
    };

    // add dependency to dependencies
    dependencies.dependencies.push(dependency);

    // return dependency
    return dependency;
}

// -----------------------------------------------------------------------------

module.exports = { newDependenciesList, newDependencies, addDependencies, addDependency };