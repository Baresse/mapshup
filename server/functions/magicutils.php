<?php

/*
 * mapshup - Webmapping made easy
 * http://mapshup.info
 *
 * Copyright Jérôme Gasperi, 2011.12.08
 *
 * jerome[dot]gasperi[at]gmail[dot]com
 *
 * This software is a computer program whose purpose is a webmapping application
 * to display and manipulate geographical data.
 *
 * This software is governed by the CeCILL-B license under French law and
 * abiding by the rules of distribution of free software.  You can  use,
 * modify and/ or redistribute the software under the terms of the CeCILL-B
 * license as circulated by CEA, CNRS and INRIA at the following URL
 * "http://www.cecill.info".
 *
 * As a counterpart to the access to the source code and  rights to copy,
 * modify and redistribute granted by the license, users are provided only
 * with a limited warranty  and the software's author,  the holder of the
 * economic rights,  and the successive licensors  have only  limited
 * liability.
 *
 * In this respect, the user's attention is drawn to the risks associated
 * with loading,  using,  modifying and/or developing or reproducing the
 * software by the user in light of its specific status of free software,
 * that may mean  that it is complicated to manipulate,  and  that  also
 * therefore means  that it is reserved for developers  and  experienced
 * professionals having in-depth computer knowledge. Users are therefore
 * encouraged to load and test the software's suitability as regards their
 * requirements in conditions enabling the security of their systems and/or
 * data to be ensured and,  more generally, to use and operate it in the
 * same conditions as regards security.
 *
 * The fact that you are presently reading this means that you have had
 * knowledge of the CeCILL-B license and that you accept its terms.
 */

define("MSP_UNKNOWN", "unknown");

/**
 * return fileName extension
 */
function getExtension($fileName) {
    $arr = explode(".", $fileName);
    return $arr[count($arr) - 1];
}

/**
 * Get mapshup layer title from an XML file
 */
function getLayerInfosFromType($type, $doc) {

    $infos = array(
        'type' => $type,
        'title' => null,
        'description' => null
    );

    /*
     * RSS
     */
    if ($type == "GeoRSS") {
        return $infos;
    }

    /*
     * GPX
     */
    if ($type == "GPX") {
        return $infos;
    }

    /*
     * Pleiades
     */
    if ($type == "Pleiades") {
        return getPHRInfos($doc);
    }

    /*
     * Sentinel
     */
    if ($type == "Sentinel") {
        return $infos;
    }

    /*
     * WMS
     */
    if ($type == "WMS") {
        return $infos;
    }

    /*
     * WFS
     */
    if ($type == "WFS") {
        return $infos;
    }

    /*
     * OpenSearch catalog
     */
    if ($type == "Catalog_OpenSearch") {
        $infos['title'] = $doc->getElementsByTagName('ShortName')->item(0)->nodeValue;
        $infos['description'] = $doc->getElementsByTagName('Description')->item(0)->nodeValue;
        return $infos;
    }

    return $infos;
}

/**
 * Get mapshup layerType from file extension
 */
function getLayerInfosFromFile($fileName) {

    // Set default values
    $type = MSP_UNKNOWN;

    /*
     * get extension
     */
    $ext = strtolower(getExtension($fileName));
    
    /*
     * KML
     */
    if ($ext === "kml") {
        $type = "KML";
    } else if ($ext === "gpx") {
        $type = "GPX";
    } else if ($ext === "jpeg" || $ext === "gif" || $ext === "jpg" || $ext === "png") {
        $type = "Image";
    }
    /*
     * XML
     */ else if ($ext === "xml" || $ext === "gml") {

        /*
         * Load XML document
         */
        $doc = new DOMDocument();
        $doc->load($fileName);
        $rootName = strtolower(removeNamespace($doc->documentElement->nodeName));
        return getLayerInfosFromType(getLayerTypeFromRootName($rootName), $doc);
    }
    
    // Set default values
    $infos = array(
        'type' => $type,
        'title' => null,
        'description' => null
    );

    return $infos;
}

/**
 * Get mapshup layer type from an XML file
 */
function getLayerTypeFromRootName($rootName) {

    $type = MSP_UNKNOWN;

    /*
     * RSS
     */
    if ($rootName == "rss" || $rootName == "rdf") {
        return "GeoRSS";
    }

    /*
     * GPX
     */
    if ($rootName == "gpx") {
        return "GPX";
    }

    /*
     * OpenSearch
     */
    if ($rootName == "opensearchdescription") {
        return "Catalog_OpenSearch";
    }

    /*
     * Pleiades
     */
    $type = getPHRTypeFromRootName($rootName);
    if ($type != MSP_UNKNOWN) {
        return "Pleiades";
    }

    /*
     * Sentinel
     */
    $type = getSentinelTypeFromRootName($rootName);
    if ($type != MSP_UNKNOWN) {
        return "Sentinel";
    }

    /*
     * OGC
     */
    $type = getOGCTypeFromRootName($rootName);
    if ($type != MSP_UNKNOWN) {
        return $type;
    }

    return $type;
}

/**
 * Get mapshup OGC layerType from XML document rootName
 */
function getOGCTypeFromRootName($rootName) {

    $type = MSP_UNKNOWN;

    if ($rootName === "wfs_capabilities") {
        $type = "WFS";
    }
    /*
     * WMS 1.1.0 => root element = WMT_MS_Capabilities
     * WMS 1.3.0 => root element = WMS_Capabilities
     *
     */ else if ($rootName === "wms_capabilities" || $rootName === "wmt_ms_capabilities") {
        $type = "WMS";
    }
    return $type;
}

/**
 * Get PHR file type from XML document rootName
 */
function getPHRTypeFromRootName($rootName) {

    $type = MSP_UNKNOWN;
    
    /*
     * Valid Pleiades root names
     */
    $rootNames = array(
        "geo_phr_command_file",
        "init_loc_prod_command_file",
        "mask",
        "overilluminationmask",
        "phr_dimap_document",
        "phr_inventory_plan",
        "phr_ip_request"
        );
    reset($rootNames);
    
    /*
     * Check if input rootName is a valid Pleiades rootName
     */
    foreach($rootNames as $v) {
        if ($v === $rootName) {
            return $rootName;
        }
    }
    

    return $type;
}

/**
 * Get PHR file type from XML document rootName
 */
function getPHRInfos($doc) {
    return array(
        'type' => 'Pleiades',
        'title' => $doc->getElementsByTagName('DATASET_NAME')->item(0)->nodeValue,
        'description' => $doc->getElementsByTagName('METADATA_PROFILE')->item(0)->nodeValue
    );
}

/**
 * Get PHR file type from XML document rootName
 */
function getSentinelTypeFromRootName($rootName) {

    $type = MSP_UNKNOWN;

    if ($rootName == "gs2_dimap_document") {
        $type = $rootName;
    }

    return $type;
}

/**
 * Return $elementName without the namespace if any
 */
function removeNamespace($elementName) {
    $arr = explode(":", $elementName);
    return $arr[count($arr) - 1];
}

?>