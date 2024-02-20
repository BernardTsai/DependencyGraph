// -----------------------------------------------------------------------------
//
// v1_ServiceAccount
//
// A demo handler function which extracts the dependencies of a resource of gvk:
//   v1/ServiceAccount
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
const gvk = GVK.ServiceAccount;

// -----------------------------------------------------------------------------

// handler: extracts the dependencies of a v1/ServiceAccount item
const handler = (serviceAccount, pods) => {
    const path    = serviceAccount.metadata.annotations["config.kubernetes.io/path"];
    const index   = serviceAccount.metadata.annotations["config.kubernetes.io/index"];
    const cluster = "";
    const ns      = "";
    const name    = serviceAccount.metadata.name;
    const nr      = "";

    const dependenciesList = Dependency.newDependenciesList();

    const dependencies = Dependency.addDependencies(dependenciesList, path, index, cluster, ns, GVK.ServiceAccount, name, nr);

    return dependenciesList;
}

// -----------------------------------------------------------------------------

module.exports = { gvk, handler };