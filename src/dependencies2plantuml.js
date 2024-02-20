#!/usr/bin/env node

// -----------------------------------------------------------------------------
//
// dependencies2plantuml:
//
// Reads a DependencyGraph from stdin and converts it into plantuml.
//
// Author: bernard@tsai.eu
// License: Apache-2.0
//
// -----------------------------------------------------------------------------

const YAML = require('yaml');
const fs   = require('fs');

// -----------------------------------------------------------------------------

// dependencies2plantuml: convert dependency information to plantuml
function dependencies2plantuml() {
    var inputData    = "";
    var phase        = 0;
    var resources    = {};
    var roots        = [];
    var refs         = {};

    // register handlers
    phase = 0;

    // read input from stdin
    phase = 1;
    try {
        inputData = fs.readFileSync(0, 'utf-8');
    } catch (e) {
        console.error(e);
        process.exit(phase);
    }

    // convert data to DependencyGraph object
    phase = 2;
    try {
        dependencies = YAML.parse(inputData);
    } catch(e) {
        console.error(e);
        process.exit(phase);
    }

    // check for type of object
    if (dependencies == null || dependencies.apiVersion == null || dependencies.kind == null ||
        dependencies.apiVersion != "experimental.nephio.org/v1alpha1" || dependencies.kind != "DependencyGraph") {
        console.error("Input from stdin was not of group/version/kind: 'experimental.nephio.org/v1alpha1/DependencyGraph'");
        process.exit(phase);
    }

    // convert list of resources to an associative array
    phase = 3;
    for (const resource of dependencies.spec.resources) {
        const path  = resource.path;
        const gvk   = resource.gvk.split("/");
        const kind  = gvk.pop();

        // set id of resource and add it to list of resources
        if (kind == "Package") {
            resource.id = resource.name.split("/").pop();
        } else {
            resource.id = resource.gvk + "-" + resource.name;
        }

        resources[resource.id] = resource

        // add empty list of children
        resource.children = [];

        // determine parent id
        if (kind == "Package") {
            resource.pid = "";
        } else {
            const paths = path.split("/");
            paths.pop();

            resource.pid = paths.pop();
        }
    }

    // add children to form a tree
    phase = 4;
    for (const resource of dependencies.spec.resources) {
        // check for root elements
        if (resource.pid == "") {
            roots.push(resource.id);
        } else {
            resources[resource.pid].children.push(resource.id)
        }
    }

    // output tree
    console.log("@startuml")
    phase = 5;
    for (const id of roots) {
        const resource = resources[id];

        outputResource(resources, resource, 0);
    }

    // output dependencies
    phase = 7
    for (const resource of Object.values(resources)) {
        outputDependencies(resource)
    }
    console.log("@enduml")
}

// -----------------------------------------------------------------------------

// outputResource: writes resource definitions to STDOUT
function outputResource(resources, resource, level) {
    const kind   = resource.gvk.split("/").pop();
    const name   = resource.name;
    const id     = resource.id;
    const indent = "    ".repeat(level);

    if (resource.children.length == 0) {
        const line = indent + '[' + id + '] as "<size:10>' + name + '\\n<size:8>' + kind + '"';

        console.log(line);
    } else {
        const line1 = indent + 'package "' + id + '" as "' + id + '" {';

        console.log(line1);

        for (const childId of resource.children) {
            const child = resources[childId];

            outputResource(resources, child, level +1);
        }

        const line2 = indent + '}';

        console.log(line2);
    }
}

// -----------------------------------------------------------------------------

// outputDependencies: writes resource dependencies to STDOUT
function outputDependencies(resource) {
    const rid   = resource.id;
    const rkind = resource.gvk.split("/").pop();

    for (const dependency of Object.values(resource.dependencies)) {
        const dkind = dependency.gvk.split("/").pop();

        if (rkind == "Package" && dkind == "Package") {
            const did = dependency.name.split("/").pop();

            const line = "[" + rid + "] -down-> [" + did + "]";

            console.log(line)
        } 
        
        if (rkind != "Package") {
            did = dependency.gvk + "-" + dependency.name;            

            const line = "[" + rid + "] --> [" + did + "]";

            console.log(line)
        }
    }
}

// -----------------------------------------------------------------------------

dependencies2plantuml();
