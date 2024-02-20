// -----------------------------------------------------------------------------
//
// GVK
//
// Group / Version / Kind definitions
//
// Author:  bernard@tsai.eu
// License: Apache-2.0
// 
// -----------------------------------------------------------------------------

const Package         = "experimental.nephio.org/v1alpha1/Package";
const Deployment      = "apps/v1/Deployment";
const Container       = "experimental.nephio.org/v1alpha1/Container";
const Volume          = "experimental.nephio.org/v1alpha1/Volume";
const ConfigMap       = "v1/ConfigMap";
const Service         = "v1/Service";
const Namespace       = "v1/Namespace";
const ServiceAccount  = "v1/ServiceAccount";
const KptFile         = "kpt.dev/v1/Kptfile";
const StatefulSet     = "apps/v1/StatefulSet";
const DependencyGraph = "experimental.nephio.org/v1alpha1/DependencyGraph";

// -----------------------------------------------------------------------------

module.exports = {
    Package, Deployment, Container, Volume, ConfigMap, KptFile, Service, ServiceAccount, Namespace, StatefulSet
}