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
 * GeoRSS layer type
 */
(function (msp,Map){
    
    Map.layerTypes["Youtube"] = {

        /**
         * MANDATORY
         */
        icon:"youtube.png",

        /**
         * Youtube returns EPSG:4326 data
         */
        projection:Map.epsg4326,

        /**
         * MANDATORY
         */
        removeOnEmpty:true,

        /**
         * MANDATORY
         */
        selectable:true,

        /**
         * MANDATORY
         *
         * layerDescription:{
         *      type:"Youtube",
         *      title:
         *      bbox: // optional
         *      q: // optional
         *  }
         */
        add: function(layerDescription, options) {

            /*
             * Check if bbox is defined in layerDescription
             */
            layerDescription.bbox = msp.Util.getPropertyValue(layerDescription, "bbox", Map.getBBOX());

            /*
             * Set an empty search term value if not set
             */
            layerDescription.q = msp.Util.getPropertyValue(layerDescription, "q", "");

            /*
             * Extend options object with Flickr specific properties
             */
            $.extend(options,
            {
                /*
                 * HTTP Protocol
                 */
                protocol:new OpenLayers.Protocol.HTTP({
                    url:msp.Util.getAbsoluteUrl("/plugins/youtube/search.php?"),
                    params: {
                        bbox:layerDescription.bbox,
                        q:layerDescription.q
                    },
                    format: new OpenLayers.Format.GeoJSON()
                }),
                /*
                 * Fixed strategy
                 */
                strategies:[new OpenLayers.Strategy.Fixed()],
                /*
                 * Default StyleMap - Points with youtube icon
                 */
                styleMap:new OpenLayers.StyleMap({
                    'default':new OpenLayers.Style({
                        externalGraphic:msp.Util.getImgUrl('youtube.png'),
                        graphicWidth:24,
                        graphicHeight:24
                    }),
                    'select':new OpenLayers.Style({
                        externalGraphic:msp.Util.getImgUrl('youtube_select.png'),
                        graphicWidth:24,
                        graphicHeight:24
                    })
                })  
            }
            );

            var newLayer = new OpenLayers.Layer.Vector(layerDescription.title, options);

            return newLayer;
        },

        appendOpenSearchDescription: function(feature, id, div) {
            div.append('<a href="#" class="'+id+'"><b>'+feature.attributes['name'] + '</b></a><br/>');
            (function(id, feature) {
                $('.'+id, '#jOpenSearchResult').click(function() {
                    Map.zoomTo(feature.geometry.getBounds());
                });
            })(id, feature);
            div.append('<div align="center"><img src="'+feature.attributes['thumbnail']+'"/></div>');
        },

        setFeatureInfoBody: function(feature, $d) {

            /*
             * Construct an embeded youtube object
             */
            if (feature.attributes["url"]) {
                var vid = msp.Util.extractKVP(feature.attributes["url"]).v;
                $d.append('<div class="thumb"><object width="425" height="250" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param value="http://www.youtube.com/v/'+vid+'&amp;feature=youtube_gdata_player" name="movie"><param value="transparent" name="wmode"><param value="true" name="allowfullscreen"><embed width="425" height="250" allowfullscreen="true" wmode="transparent" type="application/x-shockwave-flash" src="http://www.youtube.com/v/'+vid+'&amp;feature=youtube_gdata_player"></object></div>');
            }

        },

        /**
         * MANDATORY
         * Compute an unique mspID based on layerDescription
         */
        getMspID:function(layerDescription) {
            return msp.Util.crc32(layerDescription.type + (layerDescription.q || ""));
        }
    }
})(window.msp, window.msp.Map);
