/// Group
//    25to44
//    2orMore
//    45to64
//    65Plus
//    Asian
//    Black
//    Hawaiian
//    Hispanic
//    Married with Children
//    Native
//    Single Female with Children
//    Single Male with Children
//    Single or Cohabitating under 65
//    Total
//    U25
//    White




// filter for total
function TotalFilter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "Total")) return true
}
//age and state filters
function ageU25Filter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "U25")&&(feature.properties['TOTAL'] > 99)) return true
}
function age25to44Filter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "25to44")&&(feature.properties['TOTAL'] > 99)) return true
}
function age45to64Filter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "45to64")&&(feature.properties['TOTAL'] > 99)) return true
}
function age65PlusFilter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "65Plus")&&(feature.properties['TOTAL'] > 99)) return true
}

// Race & State filters
function WhiteFilter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "White")&&(feature.properties['TOTAL'] > 99)) return true
}
function blackFilter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "Black")&&(feature.properties['TOTAL'] > 99)) return true
}
function HispanicFilter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "Hispanic")&&(feature.properties['TOTAL'] > 99)) return true
}
function AsianFilter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "Asian")&&(feature.properties['TOTAL'] > 99)) return true
}
function HawaiianFilter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "Hawaiian")&&(feature.properties['TOTAL'] > 99)) return true
}
function twoorMoreFilter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "2orMore")&&(feature.properties['TOTAL'] > 99)) return true
}
function NativeFilter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "Native")&&(feature.properties['TOTAL'] > 99)) return true
}

// Family Type
function MarriedWCFilter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "Married with Children")&&(feature.properties['TOTAL'] > 99)) return true
}
function SingleFMFilter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "Single Female with Children")&&(feature.properties['TOTAL'] > 99)) return true
}
function SingleMLFilter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "Single Male with Children")&&(feature.properties['TOTAL'] > 99)) return true
}
function SingleCOHABFilter(feature) {
    if ((feature.properties['STATEABV'] === st)&&(feature.properties['Group'] === "Single or Cohabitating under 65")&&(feature.properties['TOTAL'] > 99)) return true
}

// single state filter for resources
function stateabvfilter(feature) {
    if (feature.properties['STATEABV'] === st) return true
}

// colors 
function getColor(d) {
    return   d > .9  ? '#18619a' :
             d > .8  ? '#3071a4' :
             d > .7  ? '#4981ae' :
             d > .6  ? '#6191b7' :
             d > .5  ? '#79a1c1' :
             d > .4  ? '#92b1cb' :
             d > .3  ? '#aac2d4' :
             d > .2  ? '#c2d2de' :
             d > .1  ? '#DBE2E8' :
                       '#FFFFFF' ;
}
// style for all geographies
function style_County(feature) {
    return{fillColor:getColor(feature.properties['perBAT']),
    weight: 1,
    opacity: 1,
    color: '#FFFFFF',
    dashArray: '0',
    fillOpacity: 1
    }
}

// pop up table for resources
function pop_facility(feature, layer) {
    layer.on({
        mouseout: function(e) {
            for (i in e.target._eventParents) {
                e.target._eventParents[i].resetStyle(e.target);
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2">' + (feature.properties['name1'] !== null ? autolinker.link(feature.properties['name1'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2">' + (feature.properties['address'] !== null ? autolinker.link(feature.properties['address'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2">' + (feature.properties['city'] !== null ? autolinker.link(feature.properties['city'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2">' + (feature.properties['type'] !== null ? autolinker.link(feature.properties['type'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2">' + (feature.properties['detail1'] !== null ? autolinker.link(feature.properties['detail1'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2">' + (feature.properties['name2'] !== null ? autolinker.link(feature.properties['name2'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2">' + (feature.properties['detail2'] !== null ? autolinker.link(feature.properties['detail2'].toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    layer.bindPopup(popupContent, {maxHeight: 400});
}
// pop up for all county data 
function pop_ALICE_COUNTY(feature, layer) {
    layer.on({
        mouseout: function(e) {
            for (i in e.target._eventParents) {
                e.target._eventParents[i].resetStyle(e.target);
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <th>' + (feature.properties['NAMELSAD'] !== null ? autolinker.link(feature.properties['NAMELSAD'].toLocaleString()) : '') +', '+ (feature.properties['STATE_NAME'] !== null ? autolinker.link(feature.properties['STATE_NAME'].toLocaleString()) : '')+ '</th>\
            </tr>\
            <tr>\
            <th scope="row">Total:</th>\
            <td>' + (feature.properties['TOTAL'] !== null ? autolinker.link(feature.properties['TOTAL'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">Poverty:</th>\
                <td>' + (feature.properties['POVERTY'] !== null ? autolinker.link(feature.properties['POVERTY'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">ALICE:</th>\
                <td>' + (feature.properties['ALICE'] !== null ? autolinker.link(feature.properties['ALICE'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">Above ALICE Threshold:</th>\
                <td>' + (feature.properties['ABOVE AT'] !== null ? autolinker.link(feature.properties['ABOVE AT'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">% Below ALICE Threshold:</th>\
                <td>' + (feature.properties['perBAT'] !== null ? autolinker.link(feature.properties['perBAT'].toLocaleString("en-US", {style:"percent"})) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">Selection</th>\
                <td>' + (feature.properties['GroupName'] !== null ? autolinker.link(feature.properties['GroupName'].toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    layer.bindPopup(popupContent, {maxHeight: 400});
}
// pop up for sub county geographies
function pop_subcounty(feature, layer) {
    var popupContent = '<table>\
            <tr>\
                <th>' + (feature.properties['GEO.display_label'] !== null ? autolinker.link(feature.properties['GEO.display_label'].toLocaleString()) : '') + '</th>\
            </tr>\
            <tr>\
                <th scope="row">Total:</th>\
                <td>' + (feature.properties['TOTAL'] !== null ? autolinker.link(feature.properties['TOTAL'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">Poverty:</th>\
                <td>' + (feature.properties['POVERTY'] !== null ? autolinker.link(feature.properties['POVERTY'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">ALICE:</th>\
                <td>' + (feature.properties['ALICE'] !== null ? autolinker.link(feature.properties['ALICE'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">Above ALICE Threshold:</th>\
                <td>' + (feature.properties['ABOVE AT'] !== null ? autolinker.link(feature.properties['ABOVE AT'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">% Below ALICE Threshold:</th>\
                <td>' + (feature.properties['perBAT'] !== null ? autolinker.link(feature.properties['perBAT'].toLocaleString("en-US", {style:"percent"})) : '') + '</td>\
            </tr>\
        </table>';
    layer.bindPopup(popupContent, {maxHeight: 400});
}
///map
var highlightLayer;
function highlightFeature(e) {
    highlightLayer = e.target;

    if (e.target.feature.geometry.type === 'LineString') {
      highlightLayer.setStyle({
        color: '#ffff00',
      });
    } else {
      highlightLayer.setStyle({
        fillColor: '#ffff00',
        fillOpacity: 1
      });
    }
}
var map = L.map('map', {
    zoomControl:true, maxZoom:28, minZoom:1
})
var hash = new L.Hash(map);
map.attributionControl.setPrefix('<a href="https://github.com/tomchadwin/qgis2web" target="_blank">qgis2web</a> &middot; <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> &middot; <a href="https://qgis.org">QGIS</a>');
var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});
var bounds_group = new L.featureGroup([]);
function setBounds() {
    if (bounds_group.getLayers().length) {
        map.fitBounds(bounds_group.getBounds());
    }
    map.setMaxBounds(map.getBounds());
}
//resources layers
function style_type_healthcarefacilities_0_0() {
    return {
        pane: 'pane_type_healthcarefacilities_0',
        radius: 3.0,
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(133,182,111,1.0)',
        interactive: true,
    }
}
map.createPane('pane_type_healthcarefacilities_0');
map.getPane('pane_type_healthcarefacilities_0').style.zIndex = 600;
map.getPane('pane_type_healthcarefacilities_0').style['mix-blend-mode'] = 'normal';
var layer_type_healthcarefacilities_0 = new L.geoJson(json_type_healthcarefacilities_0, {
    attribution: '',
    filter: stateabvfilter,
    interactive: false,
    dataVar: 'json_type_healthcarefacilities_0',
    layerName: 'layer_type_healthcarefacilities_0',
    pane: 'pane_type_healthcarefacilities_0',
    onEachFeature: pop_facility,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        return L.circleMarker(latlng, style_type_healthcarefacilities_0_0(feature));
    },
});
bounds_group.addLayer(layer_type_healthcarefacilities_0);

function style_type_libraries_1_0() {
    return {
        pane: 'pane_type_libraries_1',
        radius: 3.0,
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(164,113,88,1.0)',
        interactive: true,
    }
}
map.createPane('pane_type_libraries_1');
map.getPane('pane_type_libraries_1').style.zIndex = 601;
map.getPane('pane_type_libraries_1').style['mix-blend-mode'] = 'normal';
var layer_type_libraries_1 = new L.geoJson(json_type_libraries_1, {
    attribution: '',
    filter: stateabvfilter,
    interactive: true,
    dataVar: 'json_type_libraries_1',
    layerName: 'layer_type_libraries_1',
    pane: 'pane_type_libraries_1',
    onEachFeature: pop_facility,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        return L.circleMarker(latlng, style_type_libraries_1_0(feature));
    },
});
bounds_group.addLayer(layer_type_libraries_1);
//map.addLayer(layer_type_libraries_1);

function style_type_PennsylvaniaChildCareFacilitiesgeojsons_0_0() {
    return {
        pane: 'pane_type_PennsylvaniaChildCareFacilitiesgeojsons_0',
        radius: 3.0,
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(152,125,183,1.0)',
        interactive: true,
    }
}
map.createPane('pane_type_PennsylvaniaChildCareFacilitiesgeojsons_0');
map.getPane('pane_type_PennsylvaniaChildCareFacilitiesgeojsons_0').style.zIndex = 602;
map.getPane('pane_type_PennsylvaniaChildCareFacilitiesgeojsons_0').style['mix-blend-mode'] = 'normal';
var layer_type_PennsylvaniaChildCareFacilitiesgeojsons_0 = new L.geoJson(json_type_PennsylvaniaChildCareFacilitiesgeojsons_0, {
    attribution: '',
    filter: stateabvfilter,
    interactive: true,
    dataVar: 'json_type_PennsylvaniaChildCareFacilitiesgeojsons_0',
    layerName: 'layer_type_PennsylvaniaChildCareFacilitiesgeojsons_0',
    pane: 'pane_type_PennsylvaniaChildCareFacilitiesgeojsons_0',
    onEachFeature: pop_facility,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        return L.circleMarker(latlng, style_type_PennsylvaniaChildCareFacilitiesgeojsons_0_0(feature));
    },
});
bounds_group.addLayer(layer_type_PennsylvaniaChildCareFacilitiesgeojsons_0);

function style_type_primarycarehpsageojsons_1_0() {
    return {
        pane: 'pane_type_primarycarehpsageojsons_1',
        radius: 3.0,
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(225,89,137,1.0)',
        interactive: true,
    }
}
map.createPane('pane_type_primarycarehpsageojsons_1');
map.getPane('pane_type_primarycarehpsageojsons_1').style.zIndex = 603;
map.getPane('pane_type_primarycarehpsageojsons_1').style['mix-blend-mode'] = 'normal';
var layer_type_primarycarehpsageojsons_1 = new L.geoJson(json_type_primarycarehpsageojsons_1, {
    attribution: '',
    filter: stateabvfilter,
    interactive: true,
    dataVar: 'json_type_primarycarehpsageojsons_1',
    layerName: 'layer_type_primarycarehpsageojsons_1',
    pane: 'pane_type_primarycarehpsageojsons_1',
    onEachFeature: pop_facility,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        return L.circleMarker(latlng, style_type_primarycarehpsageojsons_1_0(feature));
    },
});
bounds_group.addLayer(layer_type_primarycarehpsageojsons_1);

function style_type_substanceabusesamhsageojsons_2_0() {
    return {
        pane: 'pane_type_substanceabusesamhsageojsons_2',
        radius: 3.0,
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(196,60,57,1.0)',
        interactive: true,
    }
}
map.createPane('pane_type_substanceabusesamhsageojsons_2');
map.getPane('pane_type_substanceabusesamhsageojsons_2').style.zIndex = 604;
map.getPane('pane_type_substanceabusesamhsageojsons_2').style['mix-blend-mode'] = 'normal';
var layer_type_substanceabusesamhsageojsons_2 = new L.geoJson(json_type_substanceabusesamhsageojsons_2, {
    attribution: '',
    filter: stateabvfilter,
    interactive: true,
    dataVar: 'json_type_substanceabusesamhsageojsons_2',
    layerName: 'layer_type_substanceabusesamhsageojsons_2',
    pane: 'pane_type_substanceabusesamhsageojsons_2',
    onEachFeature: pop_facility,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        return L.circleMarker(latlng, style_type_substanceabusesamhsageojsons_2_0(feature));
    },
});
bounds_group.addLayer(layer_type_substanceabusesamhsageojsons_2);

function style_type_VirginiaFreeClinicsgeojsons_3_0() {
    return {
        pane: 'pane_type_VirginiaFreeClinicsgeojsons_3',
        radius: 3.0,
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(145,82,45,1.0)',
        interactive: true,
    }
}
map.createPane('pane_type_VirginiaFreeClinicsgeojsons_3');
map.getPane('pane_type_VirginiaFreeClinicsgeojsons_3').style.zIndex = 605;
map.getPane('pane_type_VirginiaFreeClinicsgeojsons_3').style['mix-blend-mode'] = 'normal';
var layer_type_VirginiaFreeClinicsgeojsons_3 = new L.geoJson(json_type_VirginiaFreeClinicsgeojsons_3, {
    attribution: '',
    filter: stateabvfilter,
    interactive: true,
    dataVar: 'json_type_VirginiaFreeClinicsgeojsons_3',
    layerName: 'layer_type_VirginiaFreeClinicsgeojsons_3',
    pane: 'pane_type_VirginiaFreeClinicsgeojsons_3',
    onEachFeature: pop_facility,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        return L.circleMarker(latlng, style_type_VirginiaFreeClinicsgeojsons_3_0(feature));
    },
});
bounds_group.addLayer(layer_type_VirginiaFreeClinicsgeojsons_3);

function style_type_banksgeojsons_4_0() {
    return {
        pane: 'pane_type_banksgeojsons_4',
        radius: 3.0,
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(133,182,111,1.0)',
        interactive: true,
    }
}
map.createPane('pane_type_banksgeojsons_4');
map.getPane('pane_type_banksgeojsons_4').style.zIndex = 606;
map.getPane('pane_type_banksgeojsons_4').style['mix-blend-mode'] = 'normal';
var layer_type_banksgeojsons_4 = new L.geoJson(json_type_banksgeojsons_4, {
    attribution: '',
    filter: stateabvfilter,
    interactive: true,
    dataVar: 'json_type_banksgeojsons_4',
    layerName: 'layer_type_banksgeojsons_4',
    pane: 'pane_type_banksgeojsons_4',
    onEachFeature: pop_facility,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        return L.circleMarker(latlng, style_type_banksgeojsons_4_0(feature));
    },
});
bounds_group.addLayer(layer_type_banksgeojsons_4);

function style_type_CreditUnionsNewJerseygeojsons_5_0() {
    return {
        pane: 'pane_type_CreditUnionsNewJerseygeojsons_5',
        radius: 3.0,
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(213,180,60,1.0)',
        interactive: true,
    }
}
map.createPane('pane_type_CreditUnionsNewJerseygeojsons_5');
map.getPane('pane_type_CreditUnionsNewJerseygeojsons_5').style.zIndex = 607;
map.getPane('pane_type_CreditUnionsNewJerseygeojsons_5').style['mix-blend-mode'] = 'normal';
var layer_type_CreditUnionsNewJerseygeojsons_5 = new L.geoJson(json_type_CreditUnionsNewJerseygeojsons_5, {
    attribution: '',
    filter: stateabvfilter,
    interactive: true,
    dataVar: 'json_type_CreditUnionsNewJerseygeojsons_5',
    layerName: 'layer_type_CreditUnionsNewJerseygeojsons_5',
    pane: 'pane_type_CreditUnionsNewJerseygeojsons_5',
    onEachFeature: pop_facility,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        return L.circleMarker(latlng, style_type_CreditUnionsNewJerseygeojsons_5_0(feature));
    },
});
bounds_group.addLayer(layer_type_CreditUnionsNewJerseygeojsons_5);

function style_type_CreditUnionsPennsylvaniageojsons_6_0() {
    return {
        pane: 'pane_type_CreditUnionsPennsylvaniageojsons_6',
        radius: 3.0,
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(243,166,178,1.0)',
        interactive: true,
    }
}
map.createPane('pane_type_CreditUnionsPennsylvaniageojsons_6');
map.getPane('pane_type_CreditUnionsPennsylvaniageojsons_6').style.zIndex = 608;
map.getPane('pane_type_CreditUnionsPennsylvaniageojsons_6').style['mix-blend-mode'] = 'normal';
var layer_type_CreditUnionsPennsylvaniageojsons_6 = new L.geoJson(json_type_CreditUnionsPennsylvaniageojsons_6, {
    attribution: '',
    filter: stateabvfilter,
    interactive: true,
    dataVar: 'json_type_CreditUnionsPennsylvaniageojsons_6',
    layerName: 'layer_type_CreditUnionsPennsylvaniageojsons_6',
    pane: 'pane_type_CreditUnionsPennsylvaniageojsons_6',
    onEachFeature: pop_facility,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        return L.circleMarker(latlng, style_type_CreditUnionsPennsylvaniageojsons_6_0(feature));
    },
});
bounds_group.addLayer(layer_type_CreditUnionsPennsylvaniageojsons_6);

function style_type_dentalhpsageojsons_7_0() {
    return {
        pane: 'pane_type_dentalhpsageojsons_7',
        radius: 3.0,
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(232,113,141,1.0)',
        interactive: true,
    }
}
map.createPane('pane_type_dentalhpsageojsons_7');
map.getPane('pane_type_dentalhpsageojsons_7').style.zIndex = 609;
map.getPane('pane_type_dentalhpsageojsons_7').style['mix-blend-mode'] = 'normal';
var layer_type_dentalhpsageojsons_7 = new L.geoJson(json_type_dentalhpsageojsons_7, {
    attribution: '',
    filter: stateabvfilter,
    interactive: true,
    dataVar: 'json_type_dentalhpsageojsons_7',
    layerName: 'layer_type_dentalhpsageojsons_7',
    pane: 'pane_type_dentalhpsageojsons_7',
    onEachFeature: pop_facility,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        return L.circleMarker(latlng, style_type_dentalhpsageojsons_7_0(feature));
    },
});
bounds_group.addLayer(layer_type_dentalhpsageojsons_7);


function style_type_higheredinstitutionsgeojsons_9_0() {
    return {
        pane: 'pane_type_higheredinstitutionsgeojsons_9',
        radius: 3.0,
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(152,125,183,1.0)',
        interactive: true,
    }
}
map.createPane('pane_type_higheredinstitutionsgeojsons_9');
map.getPane('pane_type_higheredinstitutionsgeojsons_9').style.zIndex = 610;
map.getPane('pane_type_higheredinstitutionsgeojsons_9').style['mix-blend-mode'] = 'normal';
var layer_type_higheredinstitutionsgeojsons_9 = new L.geoJson(json_type_higheredinstitutionsgeojsons_9, {
    attribution: '',
    filter: stateabvfilter,
    interactive: true,
    dataVar: 'json_type_higheredinstitutionsgeojsons_9',
    layerName: 'layer_type_higheredinstitutionsgeojsons_9',
    pane: 'pane_type_higheredinstitutionsgeojsons_9',
    onEachFeature: pop_facility,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        return L.circleMarker(latlng, style_type_higheredinstitutionsgeojsons_9_0(feature));
    },
});
bounds_group.addLayer(layer_type_higheredinstitutionsgeojsons_9);
//map.addLayer(layer_type_higheredinstitutionsgeojsons_9);

function style_type_mentalhealthsamhsageojsons_11_0() {
    return {
        pane: 'pane_type_mentalhealthsamhsageojsons_11',
        radius: 3.0,
        opacity: 1,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(196,60,57,1.0)',
        interactive: true,
    }
}
map.createPane('pane_type_mentalhealthsamhsageojsons_11');
map.getPane('pane_type_mentalhealthsamhsageojsons_11').style.zIndex = 611;
map.getPane('pane_type_mentalhealthsamhsageojsons_11').style['mix-blend-mode'] = 'normal';
var layer_type_mentalhealthsamhsageojsons_11 = new L.geoJson(json_type_mentalhealthsamhsageojsons_11, {
    attribution: '',
    filter: stateabvfilter,
    interactive: true,
    dataVar: 'json_type_mentalhealthsamhsageojsons_11',
    layerName: 'layer_type_mentalhealthsamhsageojsons_11',
    pane: 'pane_type_mentalhealthsamhsageojsons_11',
    onEachFeature: pop_facility,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        return L.circleMarker(latlng, style_type_mentalhealthsamhsageojsons_11_0(feature));
    },
});
bounds_group.addLayer(layer_type_mentalhealthsamhsageojsons_11);




//setup pane for county layer  zIndex gives the layer order lowest being the bottome
map.createPane('pane_ALICE_COUNTY');
map.getPane('pane_ALICE_COUNTY').style.zIndex = 405;
map.getPane('pane_ALICE_COUNTY').style['mix-blend-mode'] = 'normal';
/// total        
var layer_ALICE_COUNTY = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: TotalFilter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_COUNTY);
/// age
var layer_ALICE_U25 = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: ageU25Filter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_U25);        

var layer_ALICE_25to44 = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: age25to44Filter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_25to44);       

var layer_ALICE_45to64 = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: age45to64Filter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_45to64); 

var layer_ALICE_over65 = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: age65PlusFilter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_over65);         

/// race ethnicity        
var layer_ALICE_BLACK = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: blackFilter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_BLACK);

var layer_ALICE_White = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: WhiteFilter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_White);

var layer_ALICE_Hispanic = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: HispanicFilter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_Hispanic);

var layer_ALICE_Asian = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: AsianFilter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_Asian);

var layer_ALICE_Hawaiian = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: HawaiianFilter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_Hawaiian);

var layer_ALICE_twoormore = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: twoorMoreFilter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_twoormore);        

var layer_ALICE_Native = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: NativeFilter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_Native);   

// Family types
var layer_ALICE_Married = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: MarriedWCFilter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_Married);        

var layer_ALICE_SingleFM = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: SingleFMFilter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_SingleFM);   

var layer_ALICE_SingleML = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: SingleMLFilter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_SingleML);        

var layer_ALICE_SingleCO = new L.geoJson(json_ALICE_COUNTY, {
    attribution: '',
    filter: SingleCOHABFilter,
    interactive: true,
    onEachFeature: pop_ALICE_COUNTY,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_SingleCO);  

/////sub county geographies
map.createPane('pane_ALICE_ZIPCODE');
map.getPane('pane_ALICE_ZIPCODE').style.zIndex = 402;
map.getPane('pane_ALICE_ZIPCODE').style['mix-blend-mode'] = 'normal';
var layer_ALICE_ZIPCODE = new L.geoJson(json_ALICE_ZIPCODE, {
    attribution: '',
    filter: stateabvfilter,
    interactive: true,
    dataVar: 'json_ALICE_ZIPCODE',
    layerName: 'layer_ALICE_ZIPCODE',
    pane: 'pane_ALICE_ZIPCODE',
    onEachFeature: pop_subcounty,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_ZIPCODE);


map.createPane('pane_ALICE_SUBCOUNTY');
map.getPane('pane_ALICE_SUBCOUNTY').style.zIndex = 403;
map.getPane('pane_ALICE_SUBCOUNTY').style['mix-blend-mode'] = 'normal';
var layer_ALICE_SUBCOUNTY = new L.geoJson(json_ALICE_SUBCOUNTY, {
    attribution: '',
    interactive: true,
    filter: stateabvfilter,
    dataVar: 'json_ALICE_SUBCOUNTY',
    layerName: 'layer_ALICE_SUBCOUNTY',
    pane: 'pane_ALICE_SUBCOUNTY',
    onEachFeature: pop_subcounty,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_SUBCOUNTY);


map.createPane('pane_ALICE_PLACES');
map.getPane('pane_ALICE_PLACES').style.zIndex = 404;
map.getPane('pane_ALICE_PLACES').style['mix-blend-mode'] = 'normal';
var layer_ALICE_PLACES = new L.geoJson(json_ALICE_PLACES, {
    attribution: '',
    filter: stateabvfilter,
    interactive: true,
    dataVar: 'json_ALICE_PLACES',
    layerName: 'layer_ALICE_PLACES',
    pane: 'pane_ALICE_PLACES',
    onEachFeature: pop_subcounty,
    style: style_County,
});
bounds_group.addLayer(layer_ALICE_PLACES);

/// Base Maps  https://github.com/CartoDB/basemap-styles

map.createPane('pane_Positron_0');
map.getPane('pane_Positron_0').style.zIndex = 500;
var layer_Positron_0 = L.tileLayer('https://a.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
    pane: 'pane_Positron_0',
    opacity: 1.0,
    attribution: '<a href="https://cartodb.com/basemaps/">CartoDB, OpenStreetMap</a>',
    minZoom: 1,
    maxZoom: 28,
    minNativeZoom: 0,
    maxNativeZoom: 20
});
layer_Positron_0;
map.addLayer(layer_Positron_0);

map.createPane('pane_Positron_1');
map.getPane('pane_Positron_1').style.zIndex = 300;
var layer_Positron_1 = L.tileLayer('https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
    pane: 'pane_Positron_1',
    opacity: 1.0,
    minZoom: 1,
    maxZoom: 28,
    minNativeZoom: 0,
    maxNativeZoom: 20
});
layer_Positron_1;


map.createPane('pane_Positron_3');
map.getPane('pane_Positron_3').style.zIndex = 300;
var layer_Positron_3 = L.tileLayer('https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
    pane: 'pane_Positron_1',
    opacity: 1.0,
    minZoom: 1,
    maxZoom: 28,
    minNativeZoom: 0,
    maxNativeZoom: 20
});
layer_Positron_3;
map.addLayer(layer_Positron_3);


map.addLayer(layer_ALICE_COUNTY);

var baseMaps = [
    {groupName: "All Households",
    expanded: true,
    layers: {'Total': layer_ALICE_COUNTY,
            'Base Map':layer_Positron_1,}
    },
    {groupName: "AGE",
    expanded: false,
    layers:{'Under 25 Years':layer_ALICE_U25,
        '25 to 44 Years':layer_ALICE_25to44,
        '45 to 64 Years':layer_ALICE_45to64,
        'Over 65 Years':layer_ALICE_over65,}
    },
    {groupName: "Race/Ethnicity",
    expanded: false,
    layers:{'Black': layer_ALICE_BLACK,
        'White':layer_ALICE_White,
        'Hispanic':layer_ALICE_Hispanic,
        'Asian':layer_ALICE_Asian,
        'Hawaiian':layer_ALICE_Hawaiian,
        'Two or More Races':layer_ALICE_twoormore,
        'AI/AN':layer_ALICE_Native}
    },{groupName: "Family Types",
    expanded:false,
    layers:{'Married With Children':layer_ALICE_Married,
        'Single Female With Children':layer_ALICE_SingleFM,
        'Single Male With Children':layer_ALICE_SingleML,
        'Single or Cohabitating Under 65 Years':layer_ALICE_SingleCO}
    },
    {groupName:"Sub County Geographies",
    expanded:false,
    layers:{'ALICE_PLACES': layer_ALICE_PLACES,
        'ALICE_SUBCOUNTY': layer_ALICE_SUBCOUNTY,
        'ALICE_ZIPCODE': layer_ALICE_ZIPCODE,}
    }
];

var overlays = [
             {
                groupName : "Resources",
                expanded  : false,
                layers    : { 
                    "Libraries" : layer_type_libraries_1,
                    "Health care facilities" :layer_type_healthcarefacilities_0,
                    "Banks":layer_type_banksgeojsons_4,
                    "NJ Credit Unions":layer_type_CreditUnionsNewJerseygeojsons_5,
                    "PA Credit Unions":layer_type_CreditUnionsPennsylvaniageojsons_6,
                    "Dental Care":layer_type_dentalhpsageojsons_7,
                    "Higher Education Institutions":layer_type_higheredinstitutionsgeojsons_9,
                    "Mental Health Facilities":layer_type_mentalhealthsamhsageojsons_11,
                    "PA Child Care":layer_type_PennsylvaniaChildCareFacilitiesgeojsons_0,
                    "Primary Healh Facilities":layer_type_primarycarehpsageojsons_1,
                    "Substance Abuse Facilities":layer_type_substanceabusesamhsageojsons_2,
                    "VA Free Clinics":layer_type_VirginiaFreeClinicsgeojsons_3
                }	
             }						 
];

//L.control.layers(baseMaps,{'<img src="legend/type_libraries_1.png" /> type_libraries': layer_type_libraries_1,'<img src="legend/type_healthcarefacilities_0.png" /> type_health care facilities': layer_type_healthcarefacilities_0,},{collapsed:false}).addTo(map);
setBounds();

var options = {
exclusive : false,
group_maxHeight     : "200px",
collapsed :true
}

var control = L.Control.styledLayerControl(baseMaps, overlays, options);
map.addControl(control);

/*Legend specific*/
var legend = L.control({ position: "bottomright" });

legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += '<img src=css/images/Legend-1.png width = "200" height = "40"/>';
    return div;
  };
  legend.addTo(map);
