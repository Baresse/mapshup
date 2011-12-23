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
/**
 * KML layer type
 */
(function (msp,Map){
    
    Map.layerTypes["KML"] = {

        /**
         * MANDATORY
         */
        icon:"kml.png",

        /**
         * MANDATORY
         */
        isFile:true,

        /**
         * KML are EPSG:4326 data
         */
        projection:Map.epsg4326,

        /**
         * Automatically remove layer if empty
         */
        removeOnEmpty: true,

        /**
         * MANDATORY
         */
        selectable:true,

        /**
         * MANDATORY
         *
         * layerDescription = {
         *      type:"KML",
         *      title:,
         *      url:
         *  };
         */
        add: function(layerDescription, options) {

            var newLayer;
            
            /*
             * Extend options object with Flickr specific properties
             */
            $.extend(options,
            {
                format:OpenLayers.Format.KML,
                pointRadius:17,
                formatOptions:{
                    extractStyles: true,
                    extractAttributes: true
                }
            }
            );

            newLayer = new OpenLayers.Layer.GML(layerDescription.title, layerDescription.url, options);

            /**
             * Store the stringified KML
             */
            if (newLayer !== null) {
                $.ajax({
                    url:msp.Util.proxify(layerDescription.url),
                    async:true,
                    dataType:"text",
                    success: function(data) {
                        newLayer["_msp"].kml = data;
                    }
                });
            }

            /*
             * Add a featuresadded event
             */
            newLayer.events.register("featuresadded", newLayer, function() {
                Map.onFeaturesAdded(this);
            });

            return newLayer;

        },

        setFeatureInfoBody: function(feature, $d) {
            $d.append('<div class="info">'+feature.attributes["description"]+'</div>');
        }
    }

})(window.msp, window.msp.Map);
