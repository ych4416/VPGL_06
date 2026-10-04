// /// <reference path="../node_modules/three/src/Three.d.ts" />
// /// <reference path="../node_modules/@types/three/index.d.ts" />
import * as THREE from '../node_modules/three/build/three.module.js';
import { FontLoader } from '../libs/FontLoader.js';
import { TextGeometry } from '../libs/TextGeometry.js';
import { gVpglWorker } from './vpgl.js';
const width = 600;
const height = 450;
var _W3DInitialized = false;
const _theDefault3DWorld = {
    sceneToBeRendered: 'Running',
    Scenes: {
        Ready: {
            UsingCameraName: 'Default',
            Cameras: {
                Default: { shape: "Camera", type: 'Perspective', fov: 75, aspect: 1.25, near: 0.1, far: 2000, posx: 0, posy: 0, posz: 1000, rotx: 0, roty: 0, rotz: 0, targetx: 0, targety: 0, targetz: 0, working: null },
            },
            Lights: {
                Main: { shape: "Light", type: 'Directional', color: 0xffffff, posx: 0, posy: 0, posz: 1000, targetx: 0, targety: 0, targetz: 0, working: null }
            },
            Geometries: {
                BlueBox: { shape: "Box", width: 300, height: 300, depth: 300, color: 0x0000ff,
                    posx: 0, posy: 0, posz: 0, rotx: 0.785, roty: 0.785, rotz: 0, working: null },
                TextReady: { shape: "Text", size: 50, h: 50, text: "Ready To Go", posx: 0, posy: 0, posz: 500, color: 0x00ff00, working: null }
            },
            working: null
        },
        Running: {
            UsingCameraName: 'Default',
            Cameras: {
                Default: { shape: "Camera", type: 'Perspective', fov: 75, aspect: 1.25, near: 0.1, far: 2000, posx: 0, posy: 0, posz: 1000, rotx: 0, roty: 0, rotz: 0, working: null },
            },
            Lights: { 'Main': { shape: "Light", type: 'Directional', color: 0xffffff, posx: 0, posy: 0, posz: 1000, targetx: 0, targety: 0, targetz: 0, working: null } },
            Geometries: {
                BlueBox: { shape: "Box", width: 300, height: 300, depth: 300, color: 0x0000ff,
                    posx: 0, posy: 0, posz: 0, rotx: 0.785, roty: 0.785, rotz: 0, working: null },
                TextRun: { shape: "Text", size: 50, h: 50, text: "RUNNING...", posx: 0, posy: 0, posz: 500, color: 0x00ff00, working: null }
            },
            working: null
        },
        Fin: {
            UsingCameraName: 'Default',
            Cameras: {
                Default: { shape: "Camera", type: 'Perspective', fov: 75, aspect: 1.25, near: 0.1, far: 1000, posx: 0, posy: 0, posz: 100, rotx: 0, roty: 0, rotz: 0, working: null },
            },
            Lights: { shape: "Light", 'Main': { type: 'Directional', color: 0xffffff, posx: 1, posy: 1, posz: 1, targetx: 0, targety: 0, targetz: 0, working: null } },
            Geometries: {
                TextRun: { shape: "Text", size: 20, h: 5, text: "END", posx: 0, posy: 0, posz: 0, color: 0x00ff00, working: null },
                Ball: { shape: "Ball", r: 100, posx: 0, posy: 0, posz: -200, color: 0xffffff, working: null }
            },
            working: null
        }
    } // Scenes
};
var _the3DWorld = Object.create(_theDefault3DWorld).__proto__;
export function Set3DWorld(outload) { _the3DWorld = outload; }
;
export function Get3DWorld() { return _the3DWorld; }
;
export var _theRenderer = null;
var _helvetica = null;
var _gFontLoader = new FontLoader();
if (_helvetica === null)
    //THREE.Fontloader.load('../libs/helvetiker_regular.typeface.json', function(font){ _helvetica = font;});
    _gFontLoader.load('./libs/helvetiker_regular.typeface.json', function (font) { _helvetica = font; });
export function _3DReleaseAll() {
    // dispose() is deprecated on threejs r122
    // if (_theRenderer !== null && _theRenderer !== undefined)
    //    _theRenderer.dispose();
    _theRenderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#main-ui-3dcanvas") });
    //_theRenderer.xr.enabled = true;
    //_theRenderer.xr.setAnimationLoop(()=>{});
    //(<HTMLElement>document.querySelector('#main-ui-3dcanvas')).appendChild(THREE.VRButton.createButton(_theRenderer))
    var tmp0;
    tmp0 = _the3DWorld.Scenes;
    for (let s in tmp0) {
        var tmp1 = tmp0[s];
        if (tmp1.working !== undefined && tmp1.working !== null) {
            //tmp1.working.dispose(); // dispose is deprecaed
            tmp1.working = null;
        }
        ;
        for (let c in tmp1.Cameras)
            if (tmp1.Cameras[c].working !== undefined && tmp1.Cameras[c].working !== null) {
                tmp1.Cameras[c].working = null;
            }
        ;
        for (let l in tmp1.Lights)
            if (tmp1.Lights[l].working !== undefined && tmp1.Lights[l].working !== null) {
                tmp1.Lights[l].working = null;
            }
        ;
        for (let g in tmp1.Geometries)
            if (tmp1.Geometries[g].working !== undefined && tmp1.Geometries[g].working !== null) {
                var gparm = tmp1.Geometries[g];
                // if(gparm.shape !== 'button' && gparm.shape !== 'range' && gparm.shape !== 'slider' && gparm.shape !== 'timer')
                //  tmp1.Geometries[g].working.dispose();
                tmp1.Geometries[g].working = null;
            }
        ;
    }
    ;
    $('#main-ui-3ditems').html("");
    _3DTimerinterval = null;
    //gVpglUI.ForceStopTimer();
}
;
function SetupCamera(sparam, camparams) {
    var cam = null;
    switch (camparams.type) {
        case 'Perspective':
            cam = new THREE.PerspectiveCamera(camparams.fov, camparams.aspect, camparams.near, camparams.far);
            cam.position.set(camparams.posx, camparams.posy, camparams.posz);
            if ((camparams.usetarget === undefined || camparams.usetarget === true) && camparams.targetx !== undefined && camparams.targety !== undefined && camparams.targetz !== undefined)
                cam.lookAt(camparams.targetx, camparams.targety, camparams.targetz);
            else
                cam.rotation.set(camparams.rotx, camparams.roty, camparams.rotz, "XYZ");
            camparams.working = cam;
            break;
        default:
            cam = null;
            camparams.woking = null;
    }
    ;
}
;
function SetupLight(sparam, lightparam) {
    if (lightparam === undefined)
        return null;
    if (lightparam.off !== undefined && lightparam.off) {
        lightparam.working = null;
        return;
    }
    ;
    var l = null;
    switch (lightparam.type) {
        case 'Directional':
            l = new THREE.DirectionalLight(lightparam.color);
            l.position.set(lightparam.posx, lightparam.posy, lightparam.posz);
            l.target.position.set(lightparam.targetx, lightparam.targety, lightparam.targetz);
            sparam.working.add(l);
            lightparam.working = l;
            break;
        default:
    }
    return l;
}
;
function SetupScene(sname, axislen, uipalette) {
    if (sname !== _the3DWorld.sceneToBeRendered)
        return MakeSceneAndCamera(sname, axislen, uipalette);
    var sparam = _the3DWorld.Scenes[sname];
    if (sparam === undefined)
        return null;
    if (sparam.working === null)
        return MakeSceneAndCamera(sname, axislen, uipalette);
    var camparams = sparam.Cameras[sparam.UsingCameraName];
    if (camparams == undefined) {
        for (let cam in sparam.Cameras) {
            camparams = sparam[cam];
            sparam.UsingCameraName = cam;
            break;
        }
    }
    ;
    if (camparams === undefined)
        return null;
    if (camparams.working === null)
        SetupCamera(sparam, camparams);
    for (let lgt in sparam.Lights) {
        if (sparam.Lights[lgt].worling === null)
            SetupLight(sparam, sparam.Lights[lgt]);
    }
    for (let geokey in sparam.Geometries) {
        var geoparms = sparam.Geometries[geokey];
        if (geoparms === undefined)
            return null;
        if (geoparms.off !== undefined && geoparms.off === true && geoparms.working !== null) {
            sparam.working.remove(geoparms.working);
            // geoparms.working.disose();
            geoparms.working = null;
            continue;
        }
        ;
        if (geoparms.off === undefined && geoparms.working !== null)
            continue;
        if (geoparms.off !== undefined && geoparms.off === false && geoparms.working !== null)
            continue;
        if (geoparms.off !== undefined && geoparms.off === true && geoparms.working === null)
            continue;
        var material = null;
        var geo = null; //: THREE.Geometry = null;
        var mesh = null;
        switch (geoparms.shape) {
            case 'Box':
                material = new THREE.MeshStandardMaterial({ color: geoparms.color });
                geo = new THREE.BoxGeometry(geoparms.width, geoparms.height, geoparms.depth);
                mesh = new THREE.Mesh(geo, material);
                mesh.position.set(geoparms.posx, geoparms.posy, geoparms.posz);
                mesh.rotation.set(geoparms.rotx, geoparms.roty, geoparms.rotz);
                mesh.name = geokey;
                sparam.working.add(mesh);
                geoparms.working = mesh;
                break;
            case 'Ball':
                material = new THREE.MeshStandardMaterial({ color: geoparms.color });
                geo = new THREE.SphereGeometry(geoparms.r, 20, 20);
                mesh = new THREE.Mesh(geo, material);
                mesh.position.set(geoparms.posx, geoparms.posy, geoparms.posz);
                mesh.name = geokey;
                sparam.working.add(mesh);
                geoparms.working = mesh;
                break;
            case 'Text':
                material = new THREE.MeshStandardMaterial({ color: geoparms.color });
                geo = new TextGeometry(geoparms.text, { font: _helvetica, size: geoparms.size, height: geoparms.h, curveSegments: 12 });
                if (geoparms.rotx === undefined)
                    geoparms.rotx = 0;
                if (geoparms.roty === undefined)
                    geoparms.roty = 0;
                if (geoparms.rotz === undefined)
                    geoparms.rotz = 0;
                geo.rotateX(geoparms.rotx);
                geo.rotateY(geoparms.roty);
                geo.rotateZ(geoparms.rotz);
                geo.computeBoundingBox();
                var center = geo.boundingBox.getCenter(new THREE.Vector3(0, 0, 0));
                mesh = new THREE.Mesh(geo, material);
                //mesh.rotation.set(geoparms.rotx, geoparms.roty, geoparms.rotz);
                mesh.position.set(geoparms.posx - center.x, geoparms.posy - center.y, geoparms.posz - center.z);
                mesh.name = geokey;
                sparam.working.add(mesh);
                geoparms.working = mesh;
                break;
            case 'Pipe':
                material = new THREE.MeshStandardMaterial({ color: geoparms.color });
                var openEnded = geoparms.openEnded === undefined ? false : geoparms.openEnded;
                geo = new THREE.CylinderGeometry(geoparms.r, geoparms.r2, geoparms.length, 12, 12, openEnded);
                material = new THREE.MeshStandardMaterial({ color: geoparms.color });
                mesh = new THREE.Mesh(geo, material);
                mesh.position.set(geoparms.posx, geoparms.posy, geoparms.posz);
                mesh.rotation.set(geoparms.rotx, geoparms.roty, geoparms.rotz);
                mesh.name = geokey;
                sparam.working.add(mesh);
                geoparms.working = mesh;
                break;
            case 'Ring':
                material = new THREE.MeshStandardMaterial({ color: geoparms.color });
                geo = new THREE.TorusGeometry(geoparms.r, geoparms.r2, 12, 12, geoparms.arc);
                material = new THREE.MeshStandardMaterial({ color: geoparms.color });
                mesh = new THREE.Mesh(geo, material);
                mesh.position.set(geoparms.posx, geoparms.posy, geoparms.posz);
                mesh.rotation.set(geoparms.rotx, geoparms.roty, geoparms.rotz);
                mesh.name = geokey;
                sparam.working.add(mesh);
                geoparms.working = mesh;
                break;
            case 'Import':
                if (geoparms.ref === null) {
                    geoparms.working !== null;
                    return;
                }
                ;
                var grp = new THREE.Group();
                _3DMakeGroup(grp, geoparms.ref);
                grp.scale.set(geoparms.sx, geoparms.sy, geoparms.sz);
                grp.position.set(geoparms.posx, geoparms.posy, geoparms.posz);
                grp.rotation.set(geoparms.rotx, geoparms.roty, geoparms.rotz);
                grp.name = geokey;
                sparam.working.add(grp);
                geoparms.working = grp;
            default:
                continue;
        }
    }
    ;
    if (axislen > 0) {
        var axes = new THREE.AxesHelper(axislen);
        sparam.working.add(axes);
    }
    ;
    return { scene: sparam.working, camera: camparams.working };
}
;
function _3DMakeGroup(grp, scn) {
    if (_the3DWorld.Scenes[scn] === undefined)
        return;
    for (let geokey in _the3DWorld.Scenes[scn].Geometries) {
        var geoparms = _the3DWorld.Scenes[scn].Geometries[geokey];
        var geo, mesh;
        var material = new THREE.MeshStandardMaterial({ color: geoparms.color });
        if (geoparms.off !== undefined && geoparms.off)
            continue;
        switch (geoparms.shape) {
            case 'Box':
                geo = new THREE.BoxGeometry(geoparms.width, geoparms.height, geoparms.depth);
                mesh = new THREE.Mesh(geo, material);
                mesh.position.set(geoparms.posx, geoparms.posy, geoparms.posz);
                mesh.rotation.set(geoparms.rotx, geoparms.roty, geoparms.rotz);
                grp.add(mesh);
                break;
            case 'Ball':
                geo = new THREE.SphereGeometry(geoparms.r, 20, 20);
                mesh = new THREE.Mesh(geo, material);
                mesh.position.set(geoparms.posx, geoparms.posy, geoparms.posz);
                grp.add(mesh);
                break;
            case 'Text':
                geo = new TextGeometry(geoparms.text, { font: _helvetica, size: geoparms.size, height: geoparms.h, curveSegments: 12 });
                if (geoparms.rotx === undefined)
                    geoparms.rotx = 0;
                if (geoparms.roty === undefined)
                    geoparms.roty = 0;
                if (geoparms.rotz === undefined)
                    geoparms.rotz = 0;
                geo.rotateX(geoparms.rotx);
                geo.rotateY(geoparms.roty);
                geo.rotateZ(geoparms.rotz);
                geo.computeBoundingBox();
                var center = geo.boundingBox.getCenter(new THREE.Vector3(0, 0, 0));
                mesh = new THREE.Mesh(geo, material);
                //mesh.rotation.set(geoparms.rotx, geoparms.roty, geoparms.rotz);
                mesh.position.set(geoparms.posx - center.x, geoparms.posy - center.y, geoparms.posz - center.z);
                grp.add(mesh);
                break;
            case 'Pipe':
                var openEnded = geoparms.openEnded === undefined ? false : geoparms.openEnded;
                geo = new THREE.CylinderGeometry(geoparms.r, geoparms.r2, geoparms.length, 12, 12, openEnded);
                material = new THREE.MeshStandardMaterial({ color: geoparms.color });
                mesh = new THREE.Mesh(geo, material);
                mesh.position.set(geoparms.posx, geoparms.posy, geoparms.posz);
                mesh.rotation.set(geoparms.rotx, geoparms.roty, geoparms.rotz);
                grp.add(mesh);
                break;
            case 'Ring':
                geo = new THREE.TorusGeometry(geoparms.r, geoparms.r2, 12, 12, geoparms.arc);
                material = new THREE.MeshStandardMaterial({ color: geoparms.color });
                mesh = new THREE.Mesh(geo, material);
                mesh.position.set(geoparms.posx, geoparms.posy, geoparms.posz);
                mesh.rotation.set(geoparms.rotx, geoparms.roty, geoparms.rotz);
                grp.add(mesh);
                break;
            default:
                break;
        }
    }
}
;
function MakeSceneAndCamera(sname, axislen = -1, uipalette = "#main-ui-3ditems") {
    _3DReleaseAll();
    $(uipalette).html("");
    var result = { scene: null, camera: null };
    var sceneparam = _the3DWorld.Scenes[sname];
    if (sceneparam === undefined)
        return null;
    var camparams = sceneparam.Cameras[sceneparam.UsingCameraName];
    if (camparams === undefined)
        return null;
    result.scene = new THREE.Scene();
    _the3DWorld.Scenes[_the3DWorld.sceneToBeRendered].working = result.scene;
    switch (camparams.type) {
        case 'Perspective':
            result.camera = new THREE.PerspectiveCamera(camparams.fov, camparams.aspect, camparams.near, camparams.far);
            result.camera.position.set(camparams.posx, camparams.posy, camparams.posz);
            if ((camparams.usetarget === undefined || camparams.usetarget === true) && camparams.targetx !== undefined && camparams.targety !== undefined && camparams.targetz !== undefined)
                result.camera.lookAt(camparams.targetx, camparams.targety, camparams.targetz);
            else
                result.camera.rotation.set(camparams.rotx, camparams.roty, camparams.rotz);
            camparams.working = result.camera;
            break;
        default:
            result.scene = null;
            return null;
    }
    ;
    for (let geokey in sceneparam.Geometries) {
        var geoparms = sceneparam.Geometries[geokey];
        if (geoparms === undefined)
            return null;
        if (geoparms.off !== undefined && geoparms.off === true)
            continue;
        var material = null;
        var geo = null; // : THREE.Geometry = null;
        var mesh = null;
        switch (geoparms.shape) {
            case 'Box':
                geo = new THREE.BoxGeometry(geoparms.width, geoparms.height, geoparms.depth);
                material = new THREE.MeshStandardMaterial({ color: geoparms.color });
                mesh = new THREE.Mesh(geo, material);
                mesh.position.set(geoparms.posx, geoparms.posy, geoparms.posz);
                mesh.rotation.set(geoparms.rotx, geoparms.roty, geoparms.rotz);
                break;
            case 'Ball':
                geo = new THREE.SphereGeometry(geoparms.r, 20, 20);
                material = new THREE.MeshStandardMaterial({ color: geoparms.color });
                mesh = new THREE.Mesh(geo, material);
                mesh.position.set(geoparms.posx, geoparms.posy, geoparms.posz);
                break;
            case 'Text':
                geo = new TextGeometry(geoparms.text, { font: _helvetica, size: geoparms.size, height: geoparms.h, curveSegments: 12 });
                material = new THREE.MeshStandardMaterial({ color: geoparms.color });
                if (geoparms.rotx === undefined)
                    geoparms.rotx = 0;
                if (geoparms.roty === undefined)
                    geoparms.roty = 0;
                if (geoparms.rotz === undefined)
                    geoparms.rotz = 0;
                geo.rotateX(geoparms.rotx);
                geo.rotateY(geoparms.roty);
                geo.rotateZ(geoparms.rotz);
                geo.computeBoundingBox();
                var center = geo.boundingBox.getCenter(new THREE.Vector3(0, 0, 0));
                mesh = new THREE.Mesh(geo, material);
                //mesh.rotation.set(geoparms.rotx, geoparms.roty, geoparms.rotz);
                mesh.position.set(geoparms.posx - center.x, geoparms.posy - center.y, geoparms.posz - center.z);
                break;
            case 'Pipe':
                var openEnded = geoparms.openEnded === undefined ? false : geoparms.openEnded;
                geo = new THREE.CylinderGeometry(geoparms.r, geoparms.r2, geoparms.length, 12, 12, openEnded);
                material = new THREE.MeshStandardMaterial({ color: geoparms.color });
                mesh = new THREE.Mesh(geo, material);
                mesh.position.set(geoparms.posx, geoparms.posy, geoparms.posz);
                mesh.rotation.set(geoparms.rotx, geoparms.roty, geoparms.rotz);
                break;
            case 'Ring':
                geo = new THREE.TorusGeometry(geoparms.r, geoparms.r2, 12, 12, geoparms.arc);
                material = new THREE.MeshStandardMaterial({ color: geoparms.color });
                mesh = new THREE.Mesh(geo, material);
                mesh.position.set(geoparms.posx, geoparms.posy, geoparms.posz);
                mesh.rotation.set(geoparms.rotx, geoparms.roty, geoparms.rotz);
                break;
            case 'Import':
                if (geoparms.ref === null) {
                    geoparms.working = null;
                    break;
                }
                ;
                var grp = new THREE.Group();
                _3DMakeGroup(grp, geoparms.ref);
                grp.scale.set(geoparms.sx, geoparms.sy, geoparms.sz);
                grp.position.set(geoparms.posx, geoparms.posy, geoparms.posz);
                grp.rotation.set(geoparms.rotx, geoparms.roty, geoparms.rotz);
                grp.name = geokey;
                mesh = null;
                geoparms.working = grp;
                result.scene.add(grp);
                break;
            case 'button':
                var en = (uipalette !== '#main-ui-3ditems') ? ' disabled ' : '';
                var html = '<button id="3d' + geokey + '" style="width: ' + geoparms.size + 'pt; height: 36pt;"' + en + '>' + geoparms.text + "</button>";
                $(html).appendTo(uipalette);
                $("#3d" + geokey)[0].addEventListener('click', function () { _3donclick(geokey); });
                geoparms.working = html;
                mesh = null;
                break;
            case 'range':
                var en = (uipalette !== '#main-ui-3ditems') ? ' disabled ' : '';
                var html = '<input id="3d' + geokey + '" type="range" ' + en + ' min="0" max="100" step="2" oninput="_3drngonchange(\'' + geokey + '\',this.value )" style="width: ' + geoparms.size + '; height: 36pt">';
                $(html).appendTo(uipalette);
                $("#3d" + geokey)[0].addEventListener('input', function () { _3drngonchange(geokey, $("#3d" + geokey).val()); });
                geoparms.working = html;
                mesh = null;
                break;
            case 'check':
                var checkval = 'unchecked';
                if (geoparms.val === undefined) {
                    geoparms.val = false;
                }
                else {
                    checkval = geoparms.val ? 'checked' : 'unchecked';
                }
                var en = (uipalette !== '#main-ui-3ditems') ? ' disabled ' : '';
                var html = '<div sytle="display: block"><input id="3d' + geokey + '" type="checkbox" ' + en + ' ' + checkval + ' style="width: ' + geoparms.size + '; transform:scale(2.5);"><label ' + en + ' style="padding-left: 10pt">' + geoparms.text + '</label></div>';
                $(html).appendTo(uipalette);
                $("#3d" + geokey)[0].addEventListener('change', function () { _3dchkonchange(geokey, $("#3d" + geokey).prop('checked')); });
                geoparms.working = html;
                mesh = null;
                break;
            case 'choice':
                var en = (uipalette !== '#main-ui-3ditems') ? ' disabled ' : '';
                var html = '<div style="display: block"><label ' + en + ' >' + geoparms.text + '</label><select id="3d' + geokey + '" ' + en + ' style="width: ' + geoparms.size + '; height: 36pt">';
                var items = [];
                try {
                    items = JSON.parse(geoparms.items);
                }
                catch (error) {
                    window.alert(" Syntax error on item list");
                    items = ["NEED TO CORRECT"];
                }
                if (items.length <= 0) {
                    geoparms.val = "";
                }
                if (geoparms.val === undefined && items.length !== 0) {
                    geoparms.val = items[0];
                }
                ;
                for (let l in items) {
                    var strl = "" + items[l];
                    if (strl === geoparms.val)
                        html = html + '<option selected>' + strl + '</optoin>';
                    else
                        html = html + '<option>' + strl + '</option>';
                }
                html = html + '</select></div>';
                $(html).appendTo(uipalette);
                $("#3d" + geokey)[0].addEventListener('change', function () { _3dlstonchange(geokey, $("#3d" + geokey).val()); });
                geoparms.working = html;
                mesh = null;
                break;
            default:
                return null;
        }
        ;
        if (mesh !== null) {
            mesh.name = geokey;
            geoparms.working = mesh;
            result.scene.add(mesh);
        }
        ;
    } // for in Geometries
    for (let lgt in sceneparam.Lights) {
        var l = SetupLight(sceneparam, sceneparam.Lights[lgt]);
        if (l !== null)
            result.scene.add(l);
    }
    ;
    if (axislen > 0) {
        var axes = new THREE.AxesHelper(axislen);
        result.scene.add(axes);
    }
    ;
    //gVpglUI.ForceStartTimer();
    return result;
}
;
var _3DTimerinterval = null;
export function _Update3D(renderer, scene = null, camera = null, axislen = -1, uipalette = '#main-ui-3ditems') {
    //_3DReleaseAll();
    var width = window.innerWidth - 70;
    var height = width * 0.75;
    renderer.setSize(width, height);
    _the3DWorld.sceneToBeRendered = (scene !== null) ? scene : _the3DWorld.sceneToBeRendered;
    var tbr 
    //= MakeSceneAndCamera(_the3DWorld.sceneToBeRendered);
    = SetupScene(_the3DWorld.sceneToBeRendered, axislen, uipalette);
    if (tbr === null) {
        window.alert('3DParams of :' + _the3DWorld.sceneToBeRendered + ' is invalid');
        gVpglWorker.Cmd({ cmd: "Break" });
        return;
    }
    if (_W3DInitialized === false)
        return;
    scene = (scene === null) ? _the3DWorld.sceneToBeRendered : scene;
    camera = (camera === null || camera === '') ? _the3DWorld.Scenes[scene].UsingCameraName : camera;
    var cam = null;
    if (_the3DWorld.Scenes[scene].Cameras[camera] !== null) {
        if (_the3DWorld.Scenes[scene].Cameras[camera].working !== null)
            cam = _the3DWorld.Scenes[scene].Cameras[camera].working;
        else {
            var prms = _the3DWorld.Scenes[scene].Cameras[camera];
            SetupCamera(_the3DWorld.Scenes[scene], prms);
            cam = prms.working;
        }
    }
    ;
    var usecam = (cam !== null) ? cam : tbr.camera;
    renderer.render(tbr.scene, usecam);
}
;
export function _3DSetCamera(scn, camname) {
    if (_the3DWorld.Scenes[scn] === undefined) {
        window.alert("3DSETCAM: Scene not found : " + scn);
        return;
    }
    ;
    if (_the3DWorld.Scenes[scn].Cameras[camname] === undefined) {
        window.alert("3DSETCAM: Camera not found : " + camname + " in Scene : " + scn);
        return;
    }
    _the3DWorld.Scenes[scn].UsingCameraName = camname;
}
;
export function _Fin3D() {
    _Update3D(_theRenderer, "Fin");
}
;
function _pointerHandler(htmlelem, target, clientX, clientY, event = "Drag") {
    var currentScn = _the3DWorld.Scenes[_the3DWorld.sceneToBeRendered];
    if (currentScn === undefined || currentScn === null)
        return;
    var currentCam = currentScn.Cameras[currentScn.UsingCameraName].working;
    if (currentCam === undefined || currentCam === null)
        return;
    var raycaster = new THREE.Raycaster();
    const elem = target;
    // 以下のやり方だと、親からの相対位置しか採れないので、正確性に欠ける。
    //const x = clientX + document.documentElement.scrollLeft - htmlelem.offsetLeft;
    //const y = clientY + document.documentElement.scrollTop - htmlelem.offsetTop; 
    // ブラウザの角からの相対位置同士の引き算でオフセットを決定
    const x = clientX - htmlelem.getBoundingClientRect().left;
    const y = clientY - htmlelem.getBoundingClientRect().top;
    const w = htmlelem.offsetWidth;
    const h = htmlelem.offsetHeight;
    // -1〜+1の範囲で現在のマウス座標を登録する
    var rx = (x / w) * 2 - 1;
    var ry = -(y / h) * 2 + 1;
    raycaster.setFromCamera({ x: rx, y: ry }, currentCam);
    if (currentScn.working === null)
        return;
    const intersects = raycaster.intersectObjects(currentScn.working.children, true);
    if (intersects.length < 1)
        return;
    var tappedGeo = null;
    var gEntry = null;
    for (var i = 0; i < intersects.length; i++) {
        var tgt = intersects[i].object;
        while (true) {
            if (tgt === null) {
                tappedGeo = null;
                break;
            }
            ;
            if (tgt.parent === null) {
                tappedGeo = null;
                break;
            }
            ;
            if (tgt.parent.type === "Scene") {
                tappedGeo = tgt.name;
                break;
            }
            tgt = tgt.parent;
        }
        tappedGeo = tgt.name;
        if (tappedGeo === undefined || tappedGeo === null || tappedGeo === '')
            continue;
        gEntry = currentScn.Geometries[tappedGeo];
        if (gEntry === undefined || gEntry === null || gEntry.touchable === undefined) {
            gEntry = null;
            continue;
        }
        else
            break;
    }
    if (gEntry === undefined || gEntry === null)
        return;
    if (gEntry.touchable !== undefined && gEntry.touchable === true) {
        const tx = intersects[0].point.x;
        const ty = intersects[0].point.y;
        const tz = intersects[0].point.z;
        var geSave = null;
        if (currentScn.working !== null && gEntry.working !== null) {
            geSave = gEntry.working;
            currentScn.working.remove(gEntry.working);
            gEntry.working = null;
        }
        gVpglWorker.Cmd({ cmd: event, scn: _the3DWorld.sceneToBeRendered, target: tappedGeo, spec: gEntry, x: tx, y: ty, z: tz });
        if (geSave !== null) {
            gEntry.working = geSave;
            currentScn.working.add(geSave);
        }
    }
}
;
function _touchmoveHandler(ev) {
    ev.preventDefault();
    _pointerHandler(this, ev.currentTarget, ev.touches[0].clientX, ev.touches[0].clientY);
}
;
function _mousemoveHandler(ev) {
    _pointerHandler(this, ev.currentTarget, ev.clientX, ev.clientY);
}
;
var touchCount = 0;
function _tapHandler(ev) {
    if (touchCount <= 0) {
        ++touchCount;
        setTimeout(function () {
            if (touchCount > 0) { // not after double tapping
                ev.preventDefault();
                touchCount = 0;
                _pointerHandler(($('#main-ui-3dcanvas')[0]), ev.currentTarget, ev.touches[0].clientX, ev.touches[0].clientY, "SingleTouch");
            }
            ;
        }, 350);
        // ダブルタップ判定
    }
    else {
        ev.preventDefault();
        touchCount = 0;
        _pointerHandler(($('#main-ui-3dcanvas')[0]), ev.currentTarget, ev.touches[0].clientX, ev.touches[0].clientY, "DoubleTouch");
    }
}
function _clickHandler(ev) {
    if (touchCount <= 0) {
        ++touchCount;
        setTimeout(function () {
            if (touchCount > 0) { // not after double clicking
                ev.preventDefault();
                touchCount = 0;
                _pointerHandler(($('#main-ui-3dcanvas')[0]), ev.currentTarget, ev.clientX, ev.clientY, "SingleTouch");
            }
        }, 350);
        // ダブルタップ判定
    }
    else {
        ev.preventDefault();
        touchCount = 0;
        _pointerHandler(($('#main-ui-3dcanvas')[0]), ev.currentTarget, ev.clientX, ev.clientY, "DoubleTouch");
    }
}
export function _InitW3D() {
    var width = window.innerWidth - 50;
    var height = width * 0.75;
    try {
        if (!_W3DInitialized) {
            _W3DInitialized = true;
            $("#main-ui-3dcanvas").width(width);
            $("#main-ui-3dcanvas").height(height);
            _theRenderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#main-ui-3dcanvas") });
            ($('#main-ui-3dcanvas')[0]).addEventListener('click', _clickHandler);
            //(<HTMLCanvasElement>($('#main-ui-3dcanvas')[0])).addEventListener<"touchstart">('touchstart', _tapHandler);
            ($('#main-ui-3dcanvas')[0]).addEventListener('mousemove', _mousemoveHandler);
            ($('#main-ui-3dcanvas')[0]).addEventListener('touchmove', _touchmoveHandler);
            _theRenderer.setPixelRatio(window.devicePixelRatio);
            _theRenderer.setSize(width, height);
        }
        _Update3D(_theRenderer, "Ready");
        // 初回実行
    }
    catch (error) {
        window.alert(error);
        gVpglWorker.Cmd({ cmd: "Break" });
    }
}
;
function _CheckCollision(ssname, geos) {
    var ssllx, sslly, ssllz, ssurx, ssury, ssurz;
    var tgllx, tglly, tgllz, tgurx, tgury, tgurz;
    var ss = geos[ssname];
    if (ss === undefined)
        return [];
    if (ss.r !== undefined) {
        ssllx = ss.posx - ss.r;
        ssurx = ss.posx + ss.r;
        sslly = ss.posy - ss.r;
        ssury = ss.posy + ss.r;
        ssllz = ss.posz - ss.r;
        ssurz = ss.posz + ss.r;
    }
    else if (ss.width !== undefined && ss.height !== undefined && ss.depth !== undefined) {
        ssllx = ss.posx - ss.width / 2;
        ssurx = ss.posx + ss.width / 2;
        sslly = ss.posy - ss.height / 2;
        ssury = ss.posy + ss.height / 2;
        ssllz = ss.posz - ss.depth / 2;
        ssurz = ss.posz + ss.depth / 2;
    }
    else
        return [];
    for (let tgkey in geos) {
        if (ssname === tgkey)
            continue;
        var tg = geos[tgkey];
        if (tg.off)
            continue;
        if (tg.r !== undefined) {
            tgllx = tg.posx - tg.r;
            tgurx = tg.posx + tg.r;
            tglly = tg.posy - tg.r;
            tgury = tg.posy + tg.r;
            tgllz = tg.posz - tg.r;
            tgurz = tg.posz + tg.r;
        }
        else if (tg.width !== undefined && tg.height !== undefined && tg.depth !== undefined) {
            tgllx = tg.posx - tg.width / 2;
            tgurx = tg.posx + tg.width / 2;
            tglly = tg.posy - tg.height / 2;
            tgury = tg.posy + tg.height / 2;
            tgllz = tg.posz - tg.depth / 2;
            tgurz = tg.posz + tg.depth / 2;
        }
        else if (tg.shape === 'Import') {
            var dists = Math.sqrt((tg.posx - ss.posx) ^ 2 + (tg.posy - ss.posy) ^ 2 + (tg.posz - ss.psoz) ^ 2);
            var ray = new THREE.Raycaster(new THREE.Vector3(ss.posx, ss.posy, ss.posz), new THREE.Vector3(tg.posx - ss.posx, tg.posy - ss.posy, tg.posz - ss.posz), 0, dists);
            var objects = ray.intersectObjects(tg.working, true);
            if (objects.length <= 0)
                continue;
            var nearest = objects[0];
            return [{ obj: tgkey, dx: tg.posx - ss.posx, dy: tg.posy - ss.posy, dz: tg.posz - ss.posz }];
        }
        else
            continue;
        if (ssllx > tgllx && ssllx < tgurx && sslly > tglly && sslly < tgury && ssllz > tgllz && ssllz < tgurz) {
            //return [{obj: tgkey, theta: Math.atan2(tg.posx-ss.posx, tg.posy-ss.posy), psy: Math.atan2(tg.posx-ss.posx, tg.posz-ss.posz)}];
            return [{ obj: tgkey, dx: tg.posx - ss.posx, dy: tg.posy - ss.posy, dz: tg.posz - ss.posz }];
        }
        ;
        if (ssurx > tgllx && ssurx < tgurx && ssury > tglly && ssury < tgury && ssurz > tgllz && ssurz < tgurz) {
            //return [{obj: tgkey, theta: Math.atan2(tg.posx-ss.posx, tg.posy-ss.posy), psy: Math.atan2(tg.posx-ss.posx, tg.posz-ss.posz)}];
            return [{ obj: tgkey, dx: tg.posx - ss.posx, dy: tg.posy - ss.posy, dz: tg.posz - ss.posz }];
        }
        ;
    }
    return [];
}
function _3donclick(geoname) {
    var tgspec = _the3DWorld.Scenes[_the3DWorld.sceneToBeRendered].Geometries[geoname];
    tgspec.working = null;
    gVpglWorker.Cmd({ cmd: 'Click', scn: _the3DWorld.sceneToBeRendered, target: geoname, spec: tgspec });
}
;
function _3drngonchange(geoname, value) {
    var tgspec = _the3DWorld.Scenes[_the3DWorld.sceneToBeRendered].Geometries[geoname];
    tgspec.working = null;
    gVpglWorker.Cmd({ cmd: 'ChangeVal', scn: _the3DWorld.sceneToBeRendered, target: geoname, spec: tgspec, val: parseInt(value) });
}
;
function _3dchkonchange(geoname, value) {
    var tgspec = _the3DWorld.Scenes[_the3DWorld.sceneToBeRendered].Geometries[geoname];
    tgspec.working = null;
    tgspec.val = value;
    value = (value) ? "T" : "NIL"; // value is always string representation.
    gVpglWorker.Cmd({ cmd: 'ChangeVal', scn: _the3DWorld.sceneToBeRendered, target: geoname, spec: tgspec, val: value });
}
;
function _3dlstonchange(geoname, value) {
    var tgspec = _the3DWorld.Scenes[_the3DWorld.sceneToBeRendered].Geometries[geoname];
    tgspec.working = null;
    value = '"' + value + '"'; // value is always string representation.
    tgspec.val = value;
    gVpglWorker.Cmd({ cmd: 'ChangeVal', scn: _the3DWorld.sceneToBeRendered, target: geoname, spec: tgspec, val: value });
}
;
function _3DSETPOS(scn, geo, x, y, z, eid, exmode) {
    var scene = _the3DWorld.Scenes[scn];
    if (scene === undefined) {
        gVpglWorker.Cmd({ cmd: 'ERROR', msg: "3DSETPOS: Scene Not Found :" + scn });
        return;
    }
    ;
    var geoEntry = scene.Geometries[geo];
    if (geoEntry === undefined) {
        gVpglWorker.Cmd({ cmd: 'ERROR', msg: "3DSETPOS: Geometry Not Found : " + geo + " in " + _the3DWorld.sceneToBeRendered });
        return;
    }
    ;
    //geoEntry.rotx = x; geoEntry.roty = y; geoEntry.rotz = z;
    geoEntry.posx = x, geoEntry.posy = y, geoEntry.posz = z;
    if (geoEntry.working !== null)
        geoEntry.working.position.set(x, y, z);
    if (geoEntry.checkCollision !== undefined && geoEntry.checkCollision) {
        var target = _CheckCollision(geo, scene.Geometries);
        gVpglWorker.Cmd({ cmd: 'CollisionReport', eid: eid, obj: geo, target: target, exmode: exmode });
    }
    ;
}
;
function _ToStruct(fromWorker) {
    var result = {};
    var val;
    for (let key in fromWorker) {
        var evl = fromWorker[key];
        switch (evl.classid) {
            case 'T':
                val = true;
                break;
            case 'NIL':
                val = false;
                break;
            case 'Number':
                val = evl.numval;
                break;
            case 'String':
                val = evl.stringval;
                break;
            default:
                alert('3D-TOSTRUCT: meets unsupported type: ' + evl.classid);
                val = undefined;
                break;
        }
        ;
        result[key] = val;
    }
    return result;
}
function _3DSET(scn, geo, tobeset, eid, exmode) {
    var scene = _the3DWorld.Scenes[scn];
    if (scene === undefined) {
        gVpglWorker.Cmd({ cmd: 'ERROR', msg: "3DSET: Scene Not Found :" + scn });
        return;
    }
    ;
    var camEntry = scene.Cameras[geo];
    if (camEntry !== undefined) {
        if (scene.working !== null && camEntry.working !== null)
            scene.working.remove(camEntry.working);
        camEntry.working = null;
        for (let key in tobeset)
            camEntry[key] = tobeset[key];
        gVpglWorker.Cmd({ cmd: 'CollisionReport', eid: eid, obj: geo, src: camEntry, target: [], exmode: exmode });
        return;
    }
    ;
    var geoEntry = scene.Geometries[geo];
    if (geoEntry === undefined) {
        gVpglWorker.Cmd({ cmd: 'ERROR', msg: "3DSET: Entry Not Found : " + geo + " in " + _the3DWorld.sceneToBeRendered });
        return;
    }
    ;
    if (scene.working !== null && geoEntry.working !== null)
        scene.working.remove(geoEntry.working);
    // 以下のように、完全にリセットしてしまうと、UIPALLETEのボタンやスライダーもリセット/再描画されてしまい
    // onclickの動作が不安定になる。
    //if(scene.working !== null)
    //  scene.working = null;
    geoEntry.working = null;
    var stct = tobeset; //_ToStruct(tobeset['dictval']);
    for (let key in stct)
        geoEntry[key] = stct[key];
    if (geoEntry.checkCollision !== undefined && geoEntry.checkCollision) {
        var target = _CheckCollision(geo, scene.Geometries);
        gVpglWorker.Cmd({ cmd: 'CollisionReport', eid: eid, obj: geo, src: geoEntry, target: target, exmode: exmode });
    }
    else {
        gVpglWorker.Cmd({ cmd: 'CollisionReport', eid: eid, obj: geo, src: geoEntry, target: [], exmode: exmode });
    }
    ;
}
;
function _3DGET(scn, geo, eid, exmode) {
    var scene = _the3DWorld.Scenes[scn];
    // var scnsave: string = _the3DWorld.sceneToBeRendered;
    var result = {};
    if (scene === undefined) {
        gVpglWorker.Cmd({ cmd: 'ERROR', msg: "3DGET: Scene Not Found : " + scn });
        return;
    }
    // 原因は不明だが、GETしようとしているgeoのあるscnが現在表示中だと、
    // 最後のObjReportのイベント発行でフリーズしてしまうので、いったん表示を消す。
    // -- もしかしたら強制再表示が必要になるかもしれないが、その時は3DGETはとても時間がかかる。
    _3DReleaseAll();
    var camEntry = scene.Cameras[geo];
    if (camEntry !== undefined) {
        for (let key in camEntry) {
            result[key] = camEntry[key];
        }
        ;
        gVpglWorker.Cmd({ cmd: 'GetReport', obj: result, eid: eid, exmode: exmode });
        return;
    }
    ;
    var geoEntry = scene.Geometries[geo];
    if (geoEntry !== undefined) {
        for (let key in geoEntry) {
            result[key] = geoEntry[key];
        }
        ;
        switch (geoEntry.shape) {
            case 'check':
                if (result['val'] === undefined)
                    result['val'] = false;
                break;
            case 'choise':
                if (result['val'] === undefined)
                    result['val'] = "";
                break;
            default: break;
        }
        gVpglWorker.Cmd({ cmd: 'GetReport', obj: result, eid: eid, exmode: exmode });
        // 消した表示をもとに戻す。
        // -- 現在は、時間の節約のため、強制再表示は省略
        //_Update3D(_theRenderer, scnsave);
        return;
    }
    gVpglWorker.Cmd({ cmd: 'ERROR', msg: "3DGET: No Such Item: " + geo + " in scene : " + scn });
    return;
}
;
function _3DSETANGLE(scn, geo, x, y, z, eid, exmode) {
    var scene = _the3DWorld.Scenes[scn];
    if (scene === undefined) {
        gVpglWorker.Cmd({ cmd: 'ERROR', msg: "3DSETANGLE: Scene Not Found :" + scn });
        return;
    }
    ;
    var geoEntry = scene.Geometries[geo];
    if (geoEntry === undefined) {
        gVpglWorker.Cmd({ cmd: 'ERROR', msg: "3DSETANGLE: Geometry Not Found : " + geo + " in " + _the3DWorld.sceneToBeRendered });
        return;
    }
    ;
    geoEntry.rotx = x;
    geoEntry.roty = y;
    geoEntry.rotz = z;
    if (geoEntry.working !== null)
        geoEntry.working.rotation.set(x, y, z);
    gVpglWorker.Cmd({ cmd: 'CollisionReport', eid: eid, obj: geo, target: [], exmode: exmode });
}
;
function _3DSETAPPEAR(scn, geo, appearance) {
    var scene = _the3DWorld.Scenes[scn];
    if (scene === undefined) {
        gVpglWorker.Cmd({ cmd: 'ERROR', msg: "3DAPPEAR: Scene Not Found :" + scn });
        return;
    }
    ;
    var geoEntry = scene.Geometries[geo];
    if (geoEntry === undefined) {
        gVpglWorker.Cmd({ cmd: 'ERROR', msg: "3DAPPEAR: Geometry Not Found : " + geo + " in " + _the3DWorld.sceneToBeRendered });
        return;
    }
    ;
    geoEntry.off = !(appearance);
}
;
function _3DLOOK(scn, geo, x, y, z, eid, exmode) {
    var scene = _the3DWorld.Scenes[scn];
    if (scene === undefined) {
        gVpglWorker.Cmd({ cmd: 'ERROR', msg: "3DLOOK: Scene Not Found :" + scn });
        return;
    }
    ;
    var sGeo = scene.Geometries[geo];
    if (sGeo === undefined) {
        gVpglWorker.Cmd({ cmd: 'ERROR', msg: "3DLOOK: Item Not Found :" + sGeo + " in " + scn });
        return;
    }
    _Update3D(_theRenderer, scn);
    var geos = [];
    var delta = 1;
    for (let key in scene.Geometries) {
        if (key === geo)
            continue;
        switch (scene.Geometries[key].shape) {
            case 'button':
            case 'timer':
            case 'check':
            case 'choice':
                continue;
            default: // step ahead
        }
        ;
        if (scene.Geometries[key].off !== undefined && scene.Geometries[key].off)
            continue;
        if (scene.Geometries[key].working !== null)
            geos.push(scene.Geometries[key].working);
    }
    ;
    var sgv = new THREE.Vector3(sGeo.posx, sGeo.posy, sGeo.posz);
    var tgv = new THREE.Vector3(x, y, z);
    var distance = sgv.distanceTo(new THREE.Vector3(sGeo.posx + x, sGeo.posy + y, sGeo.posz + z));
    tgv = tgv.normalize();
    var ray = new THREE.Raycaster(sgv, tgv, 0, distance);
    var objs;
    //try {
    objs = ray.intersectObjects(geos, true);
    //} catch (e) {
    //objs = [];
    //};
    var tmp = {};
    var result = [];
    objs.forEach(function (value, index, array) {
        var tag = value.object.name;
        var prt = value.object;
        while (tag === '' && prt.parent !== null) {
            prt = prt.parent;
            tag = prt.name;
        }
        ;
        var tg = scene.Geometries[tag];
        var copied = { name: tag };
        for (const key in tg) {
            if (key !== 'working')
                copied[key] = tg[key];
        }
        ;
        tmp[tag] = copied;
    });
    for (const hits in tmp) {
        result.push(tmp[hits]);
    }
    ;
    gVpglWorker.Cmd({ cmd: 'ObjReport', eid: eid, target: result, exmode: exmode });
}
;
function _3DSETSCENE(scn) {
    if (_the3DWorld.Scenes[scn] === undefined) {
        window.alert("3DSETSCENE: Scene not found : " + scn);
        return;
    }
    ;
    _the3DWorld.sceneToBeRendered = scn;
}
;
export function _3DOperationHandler(operation) {
    switch (operation.cmd) {
        case 'GEO3DANGLE':
            _3DSETANGLE(operation.scn, operation.geo, operation.x, operation.y, operation.z, operation.eid, operation.exmode);
            break;
        case 'GEO3DPOS':
            _3DSETPOS(operation.scn, operation.geo, operation.x, operation.y, operation.z, operation.eid, operation.exmode);
            break;
        case 'GEO3DAPPEAR':
            _3DSETAPPEAR(operation.scn, operation.geo, operation.appearance);
            break;
        case 'GEO3DLOOK':
            _3DLOOK(operation.scn, operation.geo, operation.x, operation.y, operation.z, operation.eid, operation.exmode);
            break;
        case 'GEO3DSET':
            _3DSET(operation.scn, operation.geo, operation.tobeset, operation.eid, operation.exmode);
            break;
        case 'GEO3DGET':
            _3DGET(operation.scn, operation.geo, operation.eid, operation.exmode);
            break;
        case '3DSETSCENE':
            _3DSETSCENE(operation.scn);
            break;
        default:
            window.alert('UNKNOWN 3D OPERAION : ' + operation.cmd);
    }
}
;
//# sourceMappingURL=vpgl3d.js.map