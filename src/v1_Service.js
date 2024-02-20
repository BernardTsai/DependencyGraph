// -----------------------------------------------------------------------------
//
// v1_Service
//
// A demo handler function which extracts the dependencies of a resource of gvk:
//   v1/Service
//
// Dependencies:
//   Deployment
//   StatefulSet
//
// Author:  bernard@tsai.eu
// License: Apache-2.0
// 
// -----------------------------------------------------------------------------

const GVK        = require('./GVK');
const Dependency = require('./Dependency');

// -----------------------------------------------------------------------------

// gvk: Group / Version / Kind
const gvk = GVK.Service;

// -----------------------------------------------------------------------------

// handler: extracts the dependencies of a v1/Service item
const handler = (service, pods) => {
    const path    = service.metadata.annotations["config.kubernetes.io/path"];
    const index   = service.metadata.annotations["config.kubernetes.io/index"];
    const cluster = "";
    const ns      = "";
    const name    = service.metadata.name;
    const nr      = "";

    const dependenciesList = Dependency.newDependenciesList();

    const dependencies = Dependency.addDependencies(dependenciesList, path, index, cluster, ns, GVK.Service, name, nr);

    // loop over all labels to determine dependencies
    const labels = service.spec.selector;

    for (var pod of pods) {
        var match = true;

        // compare labels
        for (const [key,value] of Object.entries(labels)) {
            const val = pod.labels[key];

            if (val == null || val != value) {
                match = false;
                break;
            }
        }

        // add dependency
        if (match) {
            Dependency.addDependency(dependencies, pod.cluster, pod.ns, pod.gvk, pod.name, pod.nr);
        }
    }

    // return list of dependencies
    return dependenciesList;
}

// -----------------------------------------------------------------------------

module.exports = { gvk, handler };