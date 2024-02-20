// -----------------------------------------------------------------------------
//
// apps_v1_Deployment
//
// A demo handler function which extracts the dependencies of a resource of gvk:
//   apps/v1/Deployment
//
// Dependencies:
//   Deployment
//     Containers
//       Volumes
//         ConfigMaps
//
// Author:  bernard@tsai.eu
// License: Apache-2.0
// 
// -----------------------------------------------------------------------------

const GVK        = require('./GVK');
const Dependency = require('./Dependency');

// -----------------------------------------------------------------------------

// gvk: Group / Version / Kind
const gvk = GVK.Deployment;

// -----------------------------------------------------------------------------

// volumeHandler: extracts the dependencies of a volume
const volumeHandler = (dependenciesList, path, index, cluster, ns, deployment, volume) => {
    const volumeName = volume.name;
    const volumeNr   = "";

    // create new dependencies
    const dependencies = Dependency.addDependencies(dependenciesList, path, index, cluster, ns, GVK.Volume, volumeName, volumeNr);

    // process volumes
    if (volume.projected.sources) {
        for (const source of volume.projected.sources) {
            if (source.configMap) {
                const configMapName = source.configMap.name;
                const configMapNr   = "";

                Dependency.addDependency(dependencies, cluster, ns, GVK.ConfigMap, configMapName, configMapNr)
            }
        }
    }

    // return dependencies
    return dependencies;
}

// -----------------------------------------------------------------------------

// volumeClaimTemplateHandler: extracts the dependencies of a volume claim template
const volumeClaimTemplateHandler = (dependenciesList, path, index, cluster, ns, deployment, volumeClaimTemplate) => {
    const volumeName = volumeClaimTemplate.metadata.name;
    const volumeNr = "";

    // create new dependencies
    const dependencies = Dependency.addDependencies(dependenciesList, path, index, cluster, ns, GVK.Volume, volumeName, volumeNr);

    // return dependencies
    return dependencies;
}

// -----------------------------------------------------------------------------

// containerHandler: extracts the dependencies of a container
const containerHandler = (dependenciesList, path, index, cluster, ns, deployment, container) => {
    const containerName = deployment.metadata.name + "/" + container.name;
    const containerNr   = "";

    // create new dependencies
    const dependencies = Dependency.addDependencies(dependenciesList, path, index, cluster, ns, GVK.Container, containerName, containerNr);

    // process volumes
    if (container.volumeMounts) {
        for (const volumeMount of container.volumeMounts) {
            const volumeName = volumeMount.name;
            const volumeNr   = "";

            Dependency.addDependency(dependencies, cluster, ns, GVK.Volume, volumeName, volumeNr)
        }
    }

    // return dependencies
    return dependencies;
}

// -----------------------------------------------------------------------------

// handler: extracts the dependencies of a apps/v1/Deployment item
const handler = (deployment, pods) => {
    const path    = deployment.metadata.annotations["config.kubernetes.io/path"];
    const index   = deployment.metadata.annotations["config.kubernetes.io/index"];
    const cluster = "";
    const ns      = "";
    const name    = deployment.metadata.name;
    const nr      = "";

    const dependenciesList = Dependency.newDependenciesList();

    const dependencies = Dependency.addDependencies(dependenciesList, path, index, cluster, ns, GVK.Deployment, name, nr);

    // check for all init containers
    if (deployment.spec.template.spec.initContainers != null) {
        for (const container of deployment.spec.template.spec.initContainers) {
            const containerName = deployment.metadata.name + "/" + container.name;

            Dependency.addDependency(dependencies, cluster, ns, GVK.Container, containerName, "");

            // handle container 
            containerHandler(dependenciesList, path, index, cluster, ns, deployment, container);
        }
    }

    // check for all containers
    if (deployment.spec.template.spec.containers != null) {
        for (const container of deployment.spec.template.spec.containers) {
            const containerName = deployment.metadata.name + "/" +container.name;

            Dependency.addDependency(dependencies, cluster, ns, GVK.Container, containerName, "");

            // handle container 
            containerHandler(dependenciesList, path, index, cluster, ns, deployment, container);
        }
    }

    // check for all volumes
    if (deployment.spec.template.spec.volumes != null) {
        for (const volume of deployment.spec.template.spec.volumes) {
            const volumeName = volume.name;

            Dependency.addDependency(dependencies, cluster, ns, GVK.Volume, volumeName, "");

            // handle volume 
            volumeHandler(dependenciesList, path, index, cluster, ns, deployment, volume);
        }
    }


    // check for all volume claims
    if (deployment.spec.volumeClaimTemplates != null) {
        for (const volumeClaimTemplate of deployment.spec.volumeClaimTemplates) {
            const volumeClaimTemplateName = volumeClaimTemplate.metadata.name;

            Dependency.addDependency(dependencies, cluster, ns, GVK.Volume, volumeClaimTemplateName, "");

            // handle volume 
            volumeClaimTemplateHandler(dependenciesList, path, index, cluster, ns, deployment, volumeClaimTemplate);
        }
    }

    return dependenciesList;
}

// -----------------------------------------------------------------------------

module.exports = { gvk, handler };