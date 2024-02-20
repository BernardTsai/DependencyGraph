// -----------------------------------------------------------------------------
//
// v1_ConfigMap
//
// A demo handler function which extracts the dependencies of a resource of gvk:
//   v1/ConfigMap
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
const gvk = GVK.ConfigMap;

// -----------------------------------------------------------------------------

// handler: extracts the dependencies of a v1/ConfigMap item
const handler = (configMap, pods) => {
    const path    = configMap.metadata.annotations["config.kubernetes.io/path"];
    const index   = configMap.metadata.annotations["config.kubernetes.io/index"];
    const cluster = "";
    const ns      = "";
    const name    = configMap.metadata.name;
    const nr      = "";

    const dependenciesList = Dependency.newDependenciesList();

    const dependencies = Dependency.addDependencies(dependenciesList, path, index, cluster, ns, GVK.ConfigMap, name, nr);

    return dependenciesList;
}

// -----------------------------------------------------------------------------

module.exports = { gvk, handler };