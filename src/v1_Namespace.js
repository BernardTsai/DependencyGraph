// -----------------------------------------------------------------------------
//
// v1_Namespace
//
// A demo handler function which extracts the dependencies of a resource of gvk:
//   v1/Namespace
//
// Dependencies: none
//
// Author:  bernard@tsai.eu
// License: Apache-2.0
// 
// -----------------------------------------------------------------------------

const GVK        = require('./GVK');
const Dependency = require('./Dependency');

// -----------------------------------------------------------------------------

// gvk: Group / Version / Kind
const gvk = GVK.Namespace;

// -----------------------------------------------------------------------------

// handler: extracts the dependencies of a v1/Namespace item
const handler = (namespace, pods) => {
    const path    = namespace.metadata.annotations["config.kubernetes.io/path"];
    const index   = namespace.metadata.annotations["config.kubernetes.io/index"];
    const cluster = "";
    const ns      = "";
    const name    = namespace.metadata.name;
    const nr      = "";

    const dependenciesList = Dependency.newDependenciesList();

    const dependencies = Dependency.addDependencies(dependenciesList, path, index, cluster, ns, GVK.Namespace, name, nr);

    return dependenciesList;
}

// -----------------------------------------------------------------------------

module.exports = { gvk, handler };