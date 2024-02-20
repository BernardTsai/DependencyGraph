#!/usr/bin/env node

// -----------------------------------------------------------------------------
//
// DepdendencyGraph:
//
// A kpt function to generate dependency graph information from a ResourceList.
//
// Author: bernard@tsai.eu
// License: Apache-2.0
//
// -----------------------------------------------------------------------------

const YAML = require('yaml');
const fs   = require('fs');

const GVK            = require('./GVK');
const Dependency     = require('./Dependency');
const ConfigMap      = require('./v1_ConfigMap');
const Deployment     = require('./apps_v1_Deployment');
const StatefulSet    = require('./apps_v1_StatefulSet');
const Service        = require('./v1_Service');
const ServiceAccount = require('./v1_ServiceAccount');
const Namespace      = require('./v1_Namespace');

// -----------------------------------------------------------------------------

// addPackageDependencies: adds package to dependencies
function addPackageDependencies(packages, pkg) {
    var package = packages[pkg]

    if (package != null) {
        return package;
    }

    // calculate the attributes
    const path    = pkg;
    const index   = 0;
    const cluster = "";
    const ns      = "";
    const gvk     = GVK.Package;
    const name    = pkg;
    const nr      = "";

    // add dependency to parent package if needed 
    if (pkg.split("/").length > 1) {
        const parentPath = pkg.split("/");
        parentPath.pop();

        const parentPkg = parentPath.join("/");

        const parentPackage = addPackageDependencies(packages, parentPkg)

        Dependency.addDependency(parentPackage, cluster, ns, gvk, name, nr)
    }

    // create package dependencies as needed
    const dependencies = Dependency.newDependencies(path, index, cluster, ns, gvk, name, nr);

    // add dependencies to pacakges and return dependencies
    packages[pkg] = dependencies;

    return dependencies;
}
// -----------------------------------------------------------------------------

// addPackageDependency: adds item as dependency of a package
function addPackageDependency(packages, item) {
    // determine path
    const path = item.metadata.annotations["config.kubernetes.io/path"].split("/");

    // derive pkg
    path.pop();
    const pkg = path.join("/");

    // determine or create package dependencies
    const package = addPackageDependencies(packages, pkg)

    // set cluster to default value
    const cluster = "";

    // set namespace to default value
    const ns = "";

    // determine group/version/kind of item
    const gvk = item.apiVersion + "/" + item.kind;

    // determine name of item
    const name = item.metadata.name;

    // set number to default value
    const nr = "";

    // add dependency
    Dependency.addDependency(package, cluster, ns, gvk, name, nr)
}

// -----------------------------------------------------------------------------

// generateDepdendencyGraph: derive dependency information
function generateDepdendencyGraph() {
    var inputData    = "";
    var outputData   = "";
    var resources    = {};
    var phase        = 0;
    var handlers     = {};
    var pods         = [];

    var packages         = {}
    var dependenciesList = [];

    // register handlers
    phase = 0;
    handlers[Deployment.gvk]     = Deployment.handler;
    handlers[StatefulSet.gvk]    = StatefulSet.handler;
    handlers[ConfigMap.gvk]      = ConfigMap.handler;
    handlers[Service.gvk]        = Service.handler;
    handlers[ServiceAccount.gvk] = ServiceAccount.handler;
    handlers[Namespace.gvk]      = Namespace.handler;

    // read input from stdin
    phase = 1;
    try {
        inputData = fs.readFileSync(0, 'utf-8');
    } catch (e) {
        console.error(e);
        process.exit(phase);
    }

    // convert data to ResourceList object
    phase = 2;
    try {
        resources = YAML.parse(inputData);
    } catch(e) {
        console.error(e);
        process.exit(phase);
    }

    // check for type of object
    if (resources == null || resources.apiVersion == null || resources.kind == null ||
        resources.apiVersion != "config.kubernetes.io/v1" || resources.kind != "ResourceList") {
        console.error("Input from stdin was not of group/version/kind: 'config.kubernetes.io/v1/ResourceList'");
        process.exit(phase);
    }

    // loop over all resource items to capture labels of Deployments and StatefulSets
    phase = 3
    for (const item of resources.items) {
        // determine attributes
        const path    = item.metadata.annotations["config.kubernetes.io/path"];
        const index   = item.metadata.annotations["config.kubernetes.io/index"];
        const cluster = "";
        const ns      = "";
        const gvk     = item.apiVersion + "/" + item.kind;
        const name    = item.metadata.name;
        const nr      = "";

        // handle Deployment or StatefulSet
        if (gvk == GVK.Deployment || gvk == GVK.StatefulSet) {
            pods.push({
                path:    path,
                index:   index,
                cluster: cluster,
                ns:      ns,                
                gvk:     gvk,
                name:    name,
                nr:      nr,
                labels:  item.spec.template.metadata.labels
            })
        }
    }

    // loop over all resource items
    phase = 4;
    for (const item of resources.items) {
        // process item
        const gvk = item.apiVersion + "/" + item.kind;

        // skip kptfiles
        if (gvk == GVK.KptFile) {
            continue;
        }

        // add package dependency
        addPackageDependency(packages, item)

        // check for handler
        const handler = handlers[gvk];
        if (handler == null) {
            console.error("Unknown gvk: " + gvk);
            continue;
        }

        // add dependencies to list of dependencies
        const dependencies = handler(item, pods);

        for (const dependency of dependencies) {
            dependenciesList.push(dependency)
        }
    }

    // loop over all packages and output their dependencies
    phase = 5;
    for (const package of Object.values(packages)) {
        dependenciesList.push(package)        
    }

    // write output
    phase = 6;
    try {
        // add dependency graph
        resources.items.push({
            apiVersion: "experimental.nephio.org/v1alpha1",
            kind:       "DependencyGraph",
            metadata: {
                annotations: {
                    "internal.config.kubernetes.io/index": "0",
                    "internal.config.kubernetes.io/path":  "DependencyGraph.yaml"
                }
            },
            spec: {
                resources: dependenciesList
            }
        });

        // convert resources to string
        outputData = YAML.stringify(resources);

        // output to stdout
        console.log(outputData);
    } catch(e) {
        console.error(e);
        process.exit(phase);
    }
}

// -----------------------------------------------------------------------------

generateDepdendencyGraph();
