import { Get3DWorld, _Update3D, _InitW3D } from "./vpgl3d.js";
import { _allVM } from "./vpgl.js";
import * as THREE from '../node_modules/three/build/three.module.js';
var _geoe_renderer = null;
function _Geoe_SetupSceneMenu(sname) {
    $('#geoe-scenemenu > option').remove();
    for (let scn in Get3DWorld().Scenes) {
        $('#geoe-scenemenu').append($('<option>').html(scn).val(scn));
    }
    ;
    $('#geoe-scenemenu').val(sname);
    return sname;
}
;
function _Geoe_SetupItemMenu(sname, gname, camname) {
    $('#geoe-itemmenu > option').remove();
    for (let item in Get3DWorld().Scenes[sname].Geometries) {
        if (gname === null)
            gname = item;
        $('#geoe-itemmenu').append($('<option>').html(item).val(item));
    }
    ;
    for (let cam in Get3DWorld().Scenes[sname].Cameras) {
        $('#geoe-itemmenu').append($('<option>').html(cam).val(cam));
    }
    for (let lgt in Get3DWorld().Scenes[sname].Lights) {
        $('#geoe-itemmenu').append($('<option>').html(lgt).val(lgt));
    }
    $('#geoe-itemmenu').val(gname);
    $('#main-ui-geoe-cams > option').remove();
    for (let cam in Get3DWorld().Scenes[sname].Cameras) {
        if (camname == null || camname === "")
            camname = cam;
        $('#main-ui-geoe-cams').append($('<option>').html(cam).val(cam));
    }
    ;
    $('#main-ui-geoe-cams').val(camname);
    return gname;
}
function _GeoParams_ClearDispaly() {
    $('#geoe-pos').css('display', 'none');
    $('#geoe-scl').css('display', 'none');
    $('#geoe-dim').css('display', 'none');
    $('#geoe-rot').css('display', 'none');
    $('#geoe-col').css('display', 'none');
    $('#geoe-rad').css('display', 'none');
    $('#geoe-rd2').css('display', 'none');
    $('#geoe-len').css('display', 'none');
    $('#geoe-arc').css('display', 'none');
    $('#geoe-siz').css('display', 'none');
    $('#geoe-txt').css('display', 'none');
    $('#geoe-cam').css('display', 'none');
    $('#geoe-lgt').css('display', 'none');
    $('#geoe-uip').css('display', 'none');
    $('#geoe-off').css('display', 'none');
    $('#geoe-tch').css('display', 'none');
    $('#geoe-tmr').css('display', 'none');
    $('#geoe-lst').css('display', 'none');
    $('#geoe-com').css('display', 'none');
    $('#geoe-cls').css('display', 'none');
    $('#geoe-cst').css('display', 'none');
    $('#geoe-ckv').css('display', 'none');
    $('#geoe-rgv').css('display', 'none');
    $('#geoe-chv').css('display', 'none');
    $('#geoe-tgt').css('display', 'none');
}
;
function _Geoe_OpenScl(params) {
    $('#geoe-scl').css('display', 'block');
    $('#geoe-sclX').val((params.sx === undefined) ? 1.0 : params.sx);
    $('#geoe-sclY').val((params.sy === undefined) ? 1.0 : params.sy);
    $('#geoe-sclZ').val((params.sz === undefined) ? 1.0 : params.sz);
}
;
function _Geoe_OpenPos(params) {
    $('#geoe-pos').css('display', 'block');
    $('#geoe-posX').val(params.posx);
    $('#geoe-posY').val(params.posy);
    $('#geoe-posZ').val(params.posz);
}
;
function _Geoe_OpenDim(params) {
    $('#geoe-dim').css('display', 'block');
    $('#geoe-Width').val(params.width);
    $('#geoe-Height').val(params.height);
    $('#geoe-Depth').val(params.depth);
}
;
function _Geoe_OpenRot(params) {
    $('#geoe-rot').css('display', 'block');
    if (params.rotx === undefined)
        params.rotx = 0;
    if (params.roty === undefined)
        params.roty = 0;
    if (params.rotz === undefined)
        params.rotz = 0;
    $('#geoe-RotX').val(180.0 * params.rotx / Math.PI);
    $('#geoe-RotY').val(180.0 * params.roty / Math.PI);
    $('#geoe-RotZ').val(180.0 * params.rotz / Math.PI);
}
;
function _Geoe_OpenCol(params) {
    $('#geoe-col').css('display', 'block');
    var xx = '#' + ('00000' + params.color.toString(16)).substr(-6);
    $('#geoe-Color').val(xx);
}
;
function _Geoe_OpenOff(params) {
    $('#geoe-off').css('display', 'block');
    var val = params.off;
    val = (val !== undefined) ? val : false;
    $('#geoe-Off').prop('checked', val);
}
;
function _Geoe_OpenTch(params) {
    $('#geoe-tch').css('display', 'block');
    var val = params.touchable;
    val = (val !== undefined) ? val : false;
    $('#geoe-Touchable').prop('checked', val);
}
;
function _Geoe_OpenCls(params) {
    $('#geoe-cls').css('display', 'block');
    var val = params.checkCollision;
    val = (val !== undefined) ? val : false;
    $('#geoe-Collision').prop('checked', val);
}
;
function _Geoe_OpenRad(params) {
    $('#geoe-rad').css('display', 'block');
    $('#geoe-Radius').val(params.r);
}
;
function _Geoe_OpenRd2(params) {
    $('#geoe-rd2').css('display', 'block');
    $('#geoe-Radius2').val(params.r2);
}
;
function _Geoe_OpenLen(params) {
    $('#geoe-len').css('display', 'block');
    $('#geoe-Length').val(params.length);
}
;
function _Geoe_OpenArc(params) {
    $('#geoe-arc').css('display', 'block');
    $('#geoe-Arc').val(180.0 * params.arc / Math.PI);
}
;
function _Geoe_OpenTxt(params) {
    $('#geoe-txt').css('display', 'block');
    $('#geoe-Text').val(params.text);
}
;
function _Geoe_OpenCom(params) {
    $('#geoe-com').css('display', 'block');
    $('#geoe-Import > option').remove();
    $('#geoe-Import').append($('<option>').html('-- no ref --').val('-- no ref --'));
    for (let scn in Get3DWorld()) {
        if (scn !== $('#geoe-scenemenu').val())
            $('#geoe-Import').append($('<option>').html(scn).val(scn));
    }
    ;
    if (params.ref !== undefined && params.ref !== null && params.ref !== "")
        $('#geoe-Import').val(params.ref);
}
;
function _Geoe_OpenSiz(params) {
    $('#geoe-siz').css('display', 'block');
    $('#geoe-Size').val(params.size);
}
;
function _Geoe_OpenUIP(params) {
    $('#geoe-uip').css('display', 'block');
    $('#geoe-Order').val(params.order);
    $('#geoe-UiWidth').val(params.size);
}
;
function _Geoe_OpenLst(params) {
    $('#geoe-lst').css('display', 'block');
    var value = (params.items !== undefined) ? params.items : '["Yes", "No"]';
    $('#geoe-items').val(params.items);
}
;
function _Geoe_OpenTMR(params) {
    $('#geoe-tmr').css('display', 'block');
    $('#geoe-Interval').val(params.interval);
}
;
function _Geoe_OpenTgt(params) {
    var tgx = (params.targetx === undefined) ? 0 : params.targetx;
    var tgy = (params.targety === undefined) ? 0 : params.targety;
    var tgz = (params.targetz === undefined) ? 0 : params.targetz;
    $('#geoe-tgt').css('display', 'block');
    $('#geoe-TargetX').val(tgx);
    $('#geoe-TargetY').val(tgy);
    $('#geoe-TargetZ').val(tgz);
    if (params.shaoe === 'Camera') { // camera only
        var val = (params.usetarget === undefined) ? true : params.usetarget;
        $('#geoe-UseTgt').prop('checked', val);
        $('#geoe-secusetgt').css('display', 'block');
    }
    else {
        $('#geoe-secusetgt').css('display', 'none');
    }
}
;
function _Geoe_OpenCst(params) {
    $('#geoe-cst').css('display', 'block');
    params.working = null;
    $('#geoe-Custom').val(JSON.stringify(params, undefined, "  "));
}
;
function _Geoe_SetupParams(sname, iname) {
    var params = Get3DWorld().Scenes[sname].Geometries[iname];
    if (params === undefined)
        params = Get3DWorld().Scenes[sname].Cameras[iname];
    if (params === undefined)
        params = Get3DWorld().Scenes[sname].Lights[iname];
    _GeoParams_ClearDispaly();
    $('#geoe-typemenu').val(params.shape);
    switch (params.shape) {
        case 'Box':
            _Geoe_OpenPos(params);
            _Geoe_OpenDim(params);
            _Geoe_OpenRot(params);
            _Geoe_OpenCol(params);
            _Geoe_OpenOff(params);
            _Geoe_OpenTch(params);
            _Geoe_OpenCls(params);
            break;
        case 'Ball':
            _Geoe_OpenPos(params);
            _Geoe_OpenRad(params);
            _Geoe_OpenCol(params);
            _Geoe_OpenOff(params);
            _Geoe_OpenTch(params);
            _Geoe_OpenCls(params);
            break;
        case 'Text':
            _Geoe_OpenPos(params);
            _Geoe_OpenTxt(params);
            _Geoe_OpenSiz(params);
            _Geoe_OpenCol(params);
            _Geoe_OpenOff(params);
            _Geoe_OpenTch(params);
            _Geoe_OpenRot(params);
            break;
        case 'Pipe':
            _Geoe_OpenPos(params);
            _Geoe_OpenRot(params);
            _Geoe_OpenRad(params);
            _Geoe_OpenRd2(params);
            _Geoe_OpenCol(params);
            _Geoe_OpenLen(params);
            _Geoe_OpenOff(params);
            _Geoe_OpenTch(params);
            break;
        case 'Ring':
            _Geoe_OpenPos(params);
            _Geoe_OpenRot(params);
            _Geoe_OpenRad(params);
            _Geoe_OpenRd2(params);
            _Geoe_OpenArc(params);
            _Geoe_OpenCol(params);
            _Geoe_OpenOff(params);
            _Geoe_OpenTch(params);
            break;
        case 'Import':
            _Geoe_OpenPos(params);
            _Geoe_OpenScl(params);
            _Geoe_OpenRot(params);
            _Geoe_OpenCom(params);
            _Geoe_OpenOff(params);
            _Geoe_OpenTch(params);
            break;
        case 'range':
            _Geoe_OpenUIP(params);
            _Geoe_OpenOff(params);
            break;
        case 'timer':
            _Geoe_OpenTMR(params);
            _Geoe_OpenOff(params);
            break;
        case 'Camera':
            _Geoe_OpenPos(params);
            _Geoe_OpenTgt(params);
            _Geoe_OpenRot(params);
            break;
        case 'Light':
            _Geoe_OpenPos(params);
            _Geoe_OpenTgt(params);
            _Geoe_OpenCol(params);
            _Geoe_OpenOff(params);
            break;
        case "button":
            _Geoe_OpenOff(params);
            _Geoe_OpenTxt(params);
            _Geoe_OpenUIP(params);
            break;
        case "check":
            _Geoe_OpenOff(params);
            _Geoe_OpenTxt(params);
            _Geoe_OpenUIP(params);
            break;
        case "choice":
            _Geoe_OpenOff(params);
            _Geoe_OpenTxt(params);
            _Geoe_OpenLst(params);
            _Geoe_OpenUIP(params);
            break;
        case 'timer':
            _Geoe_OpenTMR(params);
            break;
        default:
            break;
    }
    ;
    _Geoe_OpenCst(params);
}
;
function _Geoe_RedisplayItems(sname, gname, cname) {
    sname = _Geoe_SetupSceneMenu(sname);
    gname = _Geoe_SetupItemMenu(sname, gname, cname);
    _Geoe_SetupParams(sname, gname);
    _Update3D(_geoe_renderer, sname, cname, 1000, '#main-ui-geuiitems');
}
;
export function _maintabsChange(tname) {
    $('#tabs-loadsave').css('display', 'none');
    $('#tabs-main').css('display', 'none');
    $('#tabs-uipane').css('display', 'none');
    $('#tabs-geoeditor').css('display', 'none');
    switch (tname) {
        case "tab0":
            _allVM();
            $('#tabs-loadsave').css('display', 'block');
            break;
        case "tab1":
            $('#tabs-main').css('display', 'block');
            break;
        case "tab2":
            _InitW3D();
            _geoe_renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#main-ui-3dcanvas') });
            _geoe_renderer.setPixelRatio(window.devicePixelRatio);
            var width = window.innerWidth - 70;
            var height = width * 0.75;
            _geoe_renderer.setSize(width, height);
            _Update3D(_geoe_renderer);
            $('#tabs-uipane').css('display', 'block');
            break;
        case "tab3":
            _InitW3D();
            _geoe_renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#main-ui-geoecanvas") });
            _geoe_renderer.setPixelRatio(window.devicePixelRatio);
            var width = window.innerWidth - 50;
            var height = width * 0.75;
            _geoe_renderer.setSize(width, height);
            _Geoe_RedisplayItems(Get3DWorld().sceneToBeRendered, null, null);
            $('#tabs-geoeditor').css('display', 'block');
            break;
    }
}
;
function _GeoeCamChange(cname) {
    var ss = $('#geoe-scenemenu').val();
    var item = $('#geoe-itemmenu').val();
    if (Get3DWorld()[ss].Cameras[cname] === undefined) {
        cname = Get3DWorld()[ss].Cameras[0];
    }
    ;
    Get3DWorld()[ss].UsingCameraName = cname;
    _Geoe_RedisplayItems(ss, item, cname);
}
;
const _Geoe_DefaultSceneContents = {
    UsingCameraName: 'Default',
    Cameras: {
        Default: { shape: "Camera", type: 'Perspective', fov: 75, aspect: 1.25, near: 0.1, far: 2000, posx: 0, posy: 0, posz: 1000, rotx: 0, roty: 0, rotz: 0, working: null },
    },
    Lights: { Main: { shape: "Light", type: 'Directional', color: 0xffffff, posx: 0, posy: 0, posz: 1000, targetx: 0, targety: 0, targetz: 0, working: null } },
    Geometries: {
        Cube0: { shape: "Box", width: 300, height: 300, depth: 300, color: 0x0000ff,
            posx: 0, posy: 0, posz: 0, rotx: 0.785, roty: 0.785, rotz: 0, working: null },
    },
    working: null
};
function _Geoe_NewScene() {
    var newSceneName = window.prompt("NewSceneName");
    if (newSceneName === null)
        return null;
    if (Get3DWorld().Scenes[newSceneName] !== undefined) {
        window.alert("Sene : " + newSceneName + " already exist");
        return;
    }
    // making deep copy
    var newSceneContent = JSON.parse(JSON.stringify(_Geoe_DefaultSceneContents));
    Get3DWorld().Scenes[newSceneName] = newSceneContent;
    Get3DWorld().sceneToBeRendered = newSceneName;
    _Geoe_RedisplayItems(newSceneName, null, null);
    return;
}
;
function _GeoeSceneChange(sname) {
    _Geoe_RedisplayItems(sname, null, null);
}
;
function _GeoeItemChange(tname) {
    _Geoe_RedisplayItems($('#geoe-scenemenu').val(), tname, null);
}
;
function _Geoe_SetDefaultParams(scenename, itemname) {
    return { px: 0, py: 0, pz: 0, w: 200, h: 200, d: 200, rx: 0, ry: 0, rz: 0, col: 128 };
}
function _Geoe_NewBox(scenename, itemname, prm) {
    Get3DWorld()[scenename].Geometries[itemname] =
        { shape: "Box", off: false, touchable: false, width: prm.w, height: prm.h, depth: prm.d, color: prm.col,
            posx: prm.px, posy: prm.py, posz: prm.pz, rotx: prm.rx, roty: prm.ry, rotz: prm.rz, working: null };
    return itemname;
}
function _Geoe_NewText(scenename, itemname, prm) {
    Get3DWorld()[scenename].Geometries[itemname] =
        { shape: "Text", size: prm.h, h: 5, text: "TEXT", posx: prm.px, posy: prm.py, posz: prm.pz, color: 0x00ff00, working: null };
    return itemname;
}
function _Geoe_NewCylinder(scenename, itemname, prm) {
    Get3DWorld()[scenename].Geometries[itemname] =
        { shape: "Pipe", off: false, touchable: false, r: 100, r2: 10, len: prm.h, color: prm.col,
            posx: 0, posy: 100, posz: 0, rotx: prm.rx, roty: prm.ry, rotz: prm.rz, opeEndeded: false, working: null };
    return itemname;
}
function _Geoe_NewTorus(scenename, itemname, prm) {
    Get3DWorld()[scenename].Geometries[itemname] =
        { shape: "Ring", off: false, touchable: false, r: prm.w, r2: prm.w, arc: Math.PI * 2, color: prm.col,
            posx: prm.px, posy: prm.py, posz: prm.pz, rotx: prm.rx, roty: prm.ry, rotz: prm.rz, working: null };
    return itemname;
}
function _Geoe_NewImport(scenename, itemname, prm) {
    var geoparms = { shape: "Import", ref: null, off: false, touchable: false, sx: 1.0, sy: 1.0, sz: 1.0, posx: prm.px, posy: prm.py, posz: prm.pz, rotx: prm.rx, roty: prm.ry, rotz: prm.rz, working: null };
    geoparms.sx = (prm.sx === undefined) ? 1.0 : prm.sx;
    geoparms.sy = (prm.sy === undefined) ? 1.0 : prm.sy;
    geoparms.sz = (prm.sz === undefined) ? 1.0 : prm.sz;
    Get3DWorld()[scenename].Geometries[itemname] = geoparms;
    return itemname;
}
function _Geoe_NewTimer(scenename, itemname, prm) {
    Get3DWorld()[scenename].Geometries[itemname] =
        { shape: "timer", off: false, interval: 1000, working: null };
    return itemname;
}
;
function _Geoe_NewButton(scenename, itemname, prm) {
    Get3DWorld()[scenename].Geometries[itemname] =
        { shape: "button", off: false, text: itemname, size: "20%", order: 1, working: null };
    return itemname;
}
;
function _Geoe_NewSlider(scenename, itemname, prm) {
    Get3DWorld()[scenename].Geometries[itemname] =
        { shape: "range", off: false, width: "20%", order: 1, working: null };
    return itemname;
}
;
function _Geoe_NewChoice(scenename, itemname, prm) {
    Get3DWorld()[scenename].Geometries[itemname] =
        { shape: "choice", off: false, text: itemname, width: "20%", order: 1, items: '["Yes", "No"]', working: null };
    return itemname;
}
;
function _Geoe_NewChceck(scenename, itemname, prm) {
    Get3DWorld()[scenename].Geometries[itemname] =
        { shape: "check", off: false, text: itemname, items: '["Yes","No"]', width: "20%", order: 1, working: null };
    return itemname;
}
;
function _Geoe_NewCamera(scenename, itemname, prm) {
    Get3DWorld()[scenename].Cameras[itemname] =
        { shape: "Camera", type: 'Perspective', fov: 75, aspect: 1.25, near: 0.1, far: 2000,
            posx: prm.px, posy: prm.py, posz: prm.pz, targetx: 0, targety: 0, targetz: 0, rotx: 0, roty: 0, rotz: 0, working: null };
    return itemname;
}
function _Geoe_NewLight(scenename, itemname, prm) {
    Get3DWorld()[scenename].Lights[itemname] =
        { shape: "Light", type: 'Directional', color: 0xffffff, // default color is white
            posx: 0, posy: 1000, posz: 0, targetx: 0, targety: 0, targetz: 0, working: null };
    return itemname;
}
function _GeoeTypeChange(typename) {
    var scenename = $('#geoe-scenemenu').val();
    var itemname = $('#geoe-itemmenu').val();
    var prm = _Geoe_SetDefaultParams(scenename, itemname);
    delete Get3DWorld()[scenename].Cameras[itemname];
    delete Get3DWorld()[scenename].Geometries[itemname];
    Get3DWorld()[scenename].working = null;
    switch (typename) {
        case 'Camera':
            _Geoe_NewCamera(scenename, itemname, prm);
            _Geoe_RedisplayItems(scenename, itemname, itemname);
            break;
        case 'Light':
            _Geoe_NewLight(scenename, itemname, prm);
            _Geoe_RedisplayItems(scenename, itemname, null);
            break;
        case 'Pipe':
            _Geoe_NewCylinder(scenename, itemname, prm);
            _Geoe_RedisplayItems(scenename, itemname, null);
            break;
        case 'Ring':
            _Geoe_NewTorus(scenename, itemname, prm);
            _Geoe_RedisplayItems(scenename, itemname, null);
            break;
        case 'Text':
            _Geoe_NewText(scenename, itemname, prm);
            _Geoe_RedisplayItems(scenename, itemname, null);
            break;
        case 'Import':
            _Geoe_NewImport(scenename, itemname, prm);
            _Geoe_RedisplayItems(scenename, itemname, null);
            break;
        case 'timer':
            _Geoe_NewTimer(scenename, itemname, prm);
            _Geoe_RedisplayItems(scenename, itemname, null);
            break;
        case 'button':
            _Geoe_NewButton(scenename, itemname, prm);
            _Geoe_RedisplayItems(scenename, itemname, null);
            break;
        case 'range':
            _Geoe_NewSlider(scenename, itemname, prm);
            _Geoe_RedisplayItems(scenename, itemname, null);
            break;
        case 'check':
            _Geoe_NewChceck(scenename, itemname, prm);
            _Geoe_RedisplayItems(scenename, itemname, null);
            break;
        case 'choice':
            _Geoe_NewChoice(scenename, itemname, prm);
            _Geoe_RedisplayItems(scenename, itemname, null);
            break;
        default:
            window.alert("Changing to " + typename + " is not implemented. \n Operation is Cancelled");
            return;
    }
}
function _GeoEdOps_NewItem() {
    var ss = $('#geoe-scenemenu').val();
    var tname = window.prompt("New Item Name");
    if (tname === null)
        return;
    if (Get3DWorld()[ss].Geometries[tname] !== undefined || Get3DWorld()[ss].Cameras[tname] !== undefined) {
        window.alert(tname + " already exists. Operation is Cancelled.");
        return;
    }
    ;
    var prm = _Geoe_SetDefaultParams(ss, tname);
    tname = _Geoe_NewBox(ss, tname, prm);
    if (tname === null) {
        for (var x in Get3DWorld()) {
            tname = x;
            break;
        }
        ;
    }
    _Geoe_RedisplayItems(ss, tname, $('#main-ui-geoe-cams').val());
}
function _GeoePosChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    if (parm === undefined)
        parm = Get3DWorld()[curscn].Cameras[curitem];
    if (parm === undefined)
        parm = Get3DWorld()[curscn].Lights[curitem];
    if (parm === undefined)
        return;
    parm.working = null;
    parm.posx = ($('#geoe-posX').val()) * 1;
    parm.posy = ($('#geoe-posY').val()) * 1;
    parm.posz = ($('#geoe-posZ').val()) * 1;
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeSclChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    if (parm === undefined)
        parm = Get3DWorld()[curscn].Cameras[curitem];
    if (parm === undefined)
        return;
    parm.working = null;
    parm.sx = ($('#geoe-sclX').val()) * 1;
    parm.sy = ($('#geoe-sclY').val()) * 1;
    parm.sz = ($('#geoe-sclZ').val()) * 1;
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeDimChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    parm.working = null;
    parm.height = ($('#geoe-Height').val()) * 1;
    parm.width = ($('#geoe-Width').val()) * 1;
    parm.depth = ($('#geoe-Depth').val()) * 1;
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeRotChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    if (parm === undefined)
        parm = Get3DWorld()[curscn].Cameras[curitem];
    if (parm === undefined)
        return;
    parm.working = null;
    parm.rotx = $('#geoe-RotX').val() * Math.PI / 180.0;
    parm.roty = $('#geoe-RotY').val() * Math.PI / 180.0;
    parm.rotz = $('#geoe-RotZ').val() * Math.PI / 180.0;
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeColorChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    var newcolor = Number.parseInt($('#geoe-Color').val().slice(1, 7), 16);
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    if (parm === undefined)
        parm = Get3DWorld()[curscn].Lights[curitem];
    if (parm === undefined)
        return;
    parm.working = null;
    parm.color = newcolor;
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeRadChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    parm.working = null;
    parm.r = ($('#geoe-Radius').val()) * 1;
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeRd2Change() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    parm.working = null;
    parm.r2 = ($('#geoe-Radius2').val()) * 1;
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeLenChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    parm.working = null;
    parm.length = ($('#geoe-Length').val());
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeArcChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    parm.working = null;
    parm.arc = $('#geoe-Arc').val() * Math.PI / 180.0;
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeSizChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    parm.working = null;
    parm.size = $('#geoe-Size').val();
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeTxtChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    parm.working = null;
    parm.text = $('#geoe-Text').val();
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeImpChange() {
    var refname = $('#geoe-Import').val();
    if (Get3DWorld()[refname] === undefined) {
        window.alert('No such scene : ' + refname);
        return;
    }
    ;
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    parm.working = null;
    parm.ref = refname;
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeOffChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    if (parm === undefined)
        parm = Get3DWorld()[curscn].Lights[curitem];
    if (parm === undefined)
        return;
    parm.working = null;
    parm.off = $('#geoe-Off').prop('checked');
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeTchChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    if (parm === undefined)
        parm = Get3DWorld()[curscn].Lights[curitem];
    if (parm === undefined)
        return;
    parm.working = null;
    parm.touchable = $('#geoe-Touchable').prop('checked');
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeCollisionChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    parm.working = null;
    parm.checkCollision = $('#geoe-Collision').prop('checked');
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeTgtChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Cameras[curitem];
    if (parm === undefined)
        parm = Get3DWorld()[curscn].Lights[curitem];
    if (parm === undefined)
        return;
    parm.working = null;
    parm.targetx = $('#geoe-TargetX').val();
    parm.targety = $('#geoe-TargetY').val();
    parm.targetz = $('#geoe-TargetZ').val();
    if (parm.shape === 'Camera') // camrera only
        parm.usetarget = $('#geoe-UseTgt').prop('checked');
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeUipChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    parm.working = null;
    parm.order = $('#geoe-Order').val();
    parm.size = $('#geoe-UiWidth').val();
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeIntChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    parm.working = null;
    parm.interval = $('#geoe-Interval').val();
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeLstChange() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    Get3DWorld()[curscn].working = null;
    var parm = Get3DWorld()[curscn].Geometries[curitem];
    parm.working = null;
    parm.items = $('#geoe-items').val();
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoeCkvChange() {
    window.alert("UIEditor oncheck not implemented");
}
function _GeoeRgvChange() {
    window.alert("UIEditor onrange not implemented");
}
function _GeoeChvChange() {
    window.alert("UIEditor onchoise not implemented");
}
function _GeoEdOpsChange(ops) {
    switch (ops) {
        case "AddScn":
            _Geoe_NewScene();
            break;
        case "AddItem":
            _GeoEdOps_NewItem();
            break;
        case "CopyItem":
            _GeoEdOpsCopyItem();
            break;
        case "Rename":
            _GeoEdOpsRenameItem();
            break;
        case "DelItem":
            _GeoEdOpsDeleteItem();
            break;
        case "CopyScn":
            _GeoEdOpsCopyScene();
            break;
        case "DelScn":
            _GeoEdOpsDeleteScene();
            break;
        default:
            window.alert("not implemented : " + ops);
            break;
    }
    $('#main-ui-geoe-ops').val("hpos");
}
function _GeoeCstChange() {
    var newparam = $('#geoe-Custom').val();
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    try {
        var parms = JSON.parse(newparam);
        Get3DWorld()[curscn].working = null;
        parms.working = null;
        Get3DWorld()[curscn].Geometries[curitem] = parms;
    }
    catch (e) {
        alert('Malformed Geo params. Ingore your change to keep consistency.');
    }
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
    return;
}
function _GeoEdOpsCopyItem() {
    var newname = window.prompt("Enter New Item Name");
    if (newname === null)
        return;
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    if (Get3DWorld()[curscn].Geometries[newname] !== undefined
        || Get3DWorld()[curscn].Cameras[newname] !== undefined
        || Get3DWorld()[curscn].Lights[newname] !== undefined) {
        window.alert(newname + " is aleady exist");
        return;
    }
    ;
    var org;
    if ((org = Get3DWorld()[curscn].Geometries[curitem]) !== undefined)
        Get3DWorld()[curscn].Geometries[newname] = JSON.parse(JSON.stringify(org));
    else if ((org = Get3DWorld()[curscn].Cameras[curitem]) !== undefined)
        Get3DWorld()[curscn].Cameras[newname] = JSON.parse(JSON.stringify(org));
    else if ((org = Get3DWorld()[curscn].Lights[curitem]) !== undefined)
        Get3DWorld()[curscn].Lights[newname] = JSON.parse(JSON.stringify(org));
    else
        window.alert(curitem + " does not exist.");
    for (let name in Get3DWorld()[curscn].Geometries) {
        Get3DWorld()[curscn].Geometries[name].working = null;
    }
    ;
    Get3DWorld()[curscn].working = null;
    _Geoe_RedisplayItems(curscn, newname, $('#main-ui-geoe-cams').val());
}
;
function _GeoEdOpsRenameItem() {
    var newname = window.prompt("Enter New Item Name");
    if (newname === null)
        return;
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    if (Get3DWorld()[curscn].Geometries[newname] !== undefined
        || Get3DWorld()[curscn].Cameras[newname] !== undefined
        || Get3DWorld()[curscn].Lights[newname] !== undefined) {
        window.alert(newname + " is aleady exist.");
        return;
    }
    ;
    if (Get3DWorld()[curscn].Geometries[curitem] !== undefined) {
        Get3DWorld()[curscn].Geometries[newname] = Get3DWorld()[curscn].Geometries[curitem];
        delete Get3DWorld()[curscn].Geometries[curitem];
    }
    else if (Get3DWorld()[curscn].Cameras[curitem] !== undefined) {
        Get3DWorld()[curscn].Cameras[newname] = Get3DWorld()[curscn].Cameras[curitem];
        delete Get3DWorld()[curscn].Cameras[curitem];
    }
    else if (Get3DWorld()[curscn].Lights[curitem] !== undefined) {
        Get3DWorld()[curscn].Lights[newname] = Get3DWorld().Lights[curitem];
        delete Get3DWorld()[curscn].Lights[curitem];
    }
    else
        window.alert(curitem + " does not exist.");
    _Geoe_RedisplayItems(curscn, newname, $('#main-ui-geoe-cams').val());
}
function _GeoEdOpsDeleteItem() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    if (Get3DWorld()[curscn].Geometries[curitem] === undefined
        && Get3DWorld()[curscn].Cameras[curitem] === undefined
        && Get3DWorld()[curscn].Lights[curitem] === undefined) {
        window.alert(curitem + " does not exist");
        return;
    }
    if (Get3DWorld()[curscn].Geometries[curitem] !== null) {
        if (Get3DWorld()[curscn].Geometries.length <= 1)
            window.alert("Can't delete. At least 1 Object requires.");
        else {
            delete Get3DWorld()[curscn].Geometries[curitem];
        }
        ;
    }
    else if (Get3DWorld()[curscn].Cameras[curitem] !== null) {
        if (Get3DWorld()[curscn].Cameras.length <= 1)
            window.alert("Can't delete. At least 1 Camera requires. ");
        else
            delete Get3DWorld()[curscn].Cameras[curitem];
    }
    else if (Get3DWorld()[curscn].Lights[curitem] !== null) {
        if (Get3DWorld()[curscn].Lights.length <= 1)
            window.alert("Can't delete. At least 1 Light requires. ");
        else
            delete Get3DWorld()[curscn].lights[curitem];
    }
    else {
        window.alert(curitem + " does not exist.");
    }
    curitem = Object.keys(Get3DWorld()[curscn].Geometries)[0];
    for (let name in Get3DWorld()[curscn].Geometries) {
        Get3DWorld()[curscn].Geometries[name].working = null;
    }
    ;
    for (let name in Get3DWorld()[curscn].Cameras) {
        Get3DWorld()[curscn].Cameras[name].working = null;
    }
    ;
    for (let name in Get3DWorld()[curscn].Lights) {
        Get3DWorld()[curscn].Lights[name].working = null;
    }
    ;
    Get3DWorld()[curscn].working = null;
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoEdOpsCopyScene() {
    var newname = window.prompt("Enter New Scene Name");
    if (newname === null)
        return;
    var curscn = $('#geoe-scenemenu').val();
    var curitem = $('#geoe-itemmenu').val();
    if (Get3DWorld()[newname] !== undefined) {
        window.alert(newname + " is aleady exist");
        return;
    }
    for (let name in Get3DWorld()[curscn].Geometries) {
        Get3DWorld()[curscn].Geometries[name].working = null;
    }
    ;
    for (let name in Get3DWorld()[curscn].Cameras) {
        Get3DWorld()[curscn].Cameras[name].workging = null;
    }
    ;
    for (let name in Get3DWorld()[curscn].Lights) {
        Get3DWorld()[curscn].Lights[name].working = null;
    }
    ;
    Get3DWorld()[curscn].working = null;
    var newcontents = JSON.parse(JSON.stringify(Get3DWorld()[curscn]));
    Get3DWorld()[newname] = newcontents;
    _Geoe_RedisplayItems(newname, curitem, $('#main-ui-geoe-cams').val());
}
function _GeoEdOpsDeleteScene() {
    var curscn = $('#geoe-scenemenu').val();
    var curitem = null;
    if (Get3DWorld()[curscn] === undefined) {
        window.alert(curitem + " does not exist");
        return;
    }
    delete Get3DWorld()[curscn];
    if (Object.keys(Get3DWorld()).length !== 0) {
        for (let name in Get3DWorld()) {
            curscn = name;
            break;
        }
        ;
        Get3DWorld().sceneToBeRendered = curscn;
        for (let name in Get3DWorld()[curscn].Geometries) {
            curitem = name;
            break;
        }
        ;
    }
    else {
        curscn = null;
        curitem = null;
        Get3DWorld().sceneToBeRendered = null;
    }
    _Geoe_RedisplayItems(curscn, curitem, $('#main-ui-geoe-cams').val());
}
export function GeoeUIInit() {
    $('#main-ui-geoe-cams')[0].addEventListener('change', function () { _GeoeCamChange($('#main-ui-geoe-cams').val()); });
    $('#main-ui-geoe-ops')[0].addEventListener('change', function () { _GeoEdOpsChange($('#main-ui-geoe-ops').val()); });
    $('#geoe-scenemenu')[0].addEventListener('change', function () { _GeoeSceneChange($('#geoe-scenemenu').val()); });
    $('#geoe-itemmenu')[0].addEventListener('change', function () { _GeoeItemChange($('#geoe-itemmenu').val()); });
    $('#geoe-typemenu')[0].addEventListener('change', function () { _GeoeTypeChange($('#geoe-typenemnu').val()); });
    $('#geoe-pos')[0].addEventListener('change', function () { _GeoePosChange(); });
    $('#geoe-scl')[0].addEventListener('change', function () { _GeoeSclChange(); });
    $('#geoe-dim')[0].addEventListener('change', function () { _GeoeDimChange(); });
    $('#geoe-rot')[0].addEventListener('change', function () { _GeoeRotChange(); });
    $('#geoe-col')[0].addEventListener('change', function () { _GeoeColorChange(); });
    $('#geoe-rad')[0].addEventListener('change', function () { _GeoeRadChange(); });
    $('#geoe-rd2')[0].addEventListener('change', function () { _GeoeRd2Change(); });
    $('#geoe-len')[0].addEventListener('change', function () { _GeoeLenChange(); });
    $('#geoe-arc')[0].addEventListener('change', function () { _GeoeArcChange(); });
    $('#geoe-siz')[0].addEventListener('change', function () { _GeoeSizChange(); });
    $('#geoe-txt')[0].addEventListener('change', function () { _GeoeTxtChange(); });
    $('#geoe-com')[0].addEventListener('change', function () { _GeoeImpChange(); });
    $('#geoe-tgt')[0].addEventListener('change', function () { _GeoeTgtChange(); });
    //$('#geoe-lgt')[0].addEventListener('change',function(){ _GeoeLgtChange()});
    $('#geoe-uip')[0].addEventListener('change', function () { _GeoeUipChange(); });
    $('#geoe-off')[0].addEventListener('change', function () { _GeoeOffChange(); });
    $('#geoe-tch')[0].addEventListener('change', function () { _GeoeTchChange(); });
    $('#geoe-lst')[0].addEventListener('change', function () { _GeoeLstChange(); });
}
//# sourceMappingURL=vpglGeoEditor.js.map