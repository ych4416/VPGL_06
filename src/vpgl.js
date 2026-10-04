import { Set3DWorld, Get3DWorld, _InitW3D, _theRenderer, _Update3D, _3DReleaseAll, _Fin3D, _3DSetCamera, _3DOperationHandler } from "./vpgl3d.js";
import { _maintabsChange, GeoeUIInit } from "./vpglGeoEditor.js";
var Direction;
(function (Direction) {
    Direction[Direction["top"] = 0] = "top";
    Direction[Direction["left"] = 1] = "left";
    Direction[Direction["right"] = 2] = "right";
    Direction[Direction["bottom"] = 3] = "bottom";
    Direction[Direction["void"] = 4] = "void";
})(Direction || (Direction = {}));
;
var _3DTimerinterval = 100;
function _handleSave() {
    // TODO ChromeとEdge以外は保存できるかどうか試していない。
    // TODO FireFoxではsaveできてない
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
    }
    else {
        alert('The File APIs are not fully supported in this browser.');
        return false;
    }
    ;
    var content = $('#loadsave-console').val();
    var blob = new Blob([content], { "type": "text/plain" });
    var sdf = $("#saveTargetFile").val();
    var sdfn;
    if (sdf === null || sdf === undefined || sdf === "")
        sdfn = "vppl.txt";
    else
        sdfn = sdf.toLocaleString();
    //if (window.navigator.msSaveBlob) {
    //    window.navigator.msSaveBlob(blob, sdfn);
    //} else
    { // microsoft 以外のブラウザ filefoxでは動かない
        $("#saveFile").attr("href", window.URL.createObjectURL(blob));
        $("#saveFile").attr("download", sdfn);
        //        window.document.getElementById("saveFile").navigate();
        //window.alert("Save file is not supported.");
    }
    true;
}
;
function _handleLoad(filename) {
    var content = null;
    var frep;
    var mergein = false;
    if (filename === null) {
        var ldf = $("#targetFile");
        var freps = ldf[0].files;
        frep = freps[0];
    }
    else {
        frep = new File([], filename);
    }
    ;
    //uirep.StdOut("Now Loading...\n");
    try {
        var reader = new FileReader();
        reader.onload = function (e) {
            content = reader.result;
            if (content === null)
                window.alert("読み出し結果がnull");
            else
                $('#loadsave-console').val(content);
        };
        reader.readAsText(frep);
    }
    catch (e) {
        window.alert(e.toLocaleString());
    }
    ;
    return;
}
;
var _MLAmethods = [];
function _RegisterMLAmethod(m) {
    _MLAmethods = _MLAmethods.filter(element => { return element != m; });
    _MLAmethods = [m].concat(_MLAmethods);
    if (_MLAmethods.length >= 11)
        _MLAmethods = _MLAmethods.slice(0, 10);
}
;
var _MLAoption = [];
function _RegisterMLAoption(o) {
    _MLAoption = _MLAoption.filter(element => { return element !== o; });
    _MLAoption = [o].concat(_MLAoption);
    if (_MLAoption.length >= 11)
        _MLAoption = _MLAoption.slice(0, 10);
}
;
var _inMagnify = false;
function _UiSetClassList(classlist, currentClass) {
    var menu = ($("#main-ui-selectclass")[0]);
    $("#main-ui-selectclass > option").remove();
    classlist.forEach(element => {
        var item = new Option();
        item.value = element;
        item.text = element;
        menu.append(item);
    });
    menu.value = currentClass;
}
;
function _UiSetMethodList(methodlist, currentMethod) {
    var menu = ($("#main-ui-selectmethod")[0]);
    $("#main-ui-selectmethod > option").remove();
    methodlist.forEach(element => {
        var item = new Option();
        item.value = element;
        item.text = element;
        menu.append(item);
    });
    menu.value = currentMethod;
}
;
function _UiSetGridArea(griddata) {
    if (griddata !== null && griddata.classid === 'Grid') {
        var remark = "";
        if (griddata.val.remark !== undefined && griddata.val.remark !== null && griddata.val.remark.val !== undefined && griddata.val.remark.val !== null)
            remark = griddata.val.remark.val;
        $('#main-ui-method-remark').val(remark);
        $('#main-ui-grid-incond').val(griddata.val.indir.val);
        $('#main-ui-grid-outdir').val(griddata.val.outdir.val);
        $('#main-ui-grid-ifall').prop('checked', griddata.val.ifall.classid === 'T');
        _UiSetGridTable(griddata.val);
        _UiDrawGridContent(griddata.val);
    }
    else {
        $('#main-ui-grid-incond').val("");
        $('#main-ui-grid-outdir').val("");
        $('#main-ui-grid-ifall').prop('checked', false);
        $('#main-ui-grid-area').html("THIS IS NOT GRID");
    }
}
;
function _UiSetGridTable(griddata) {
    var ww = $('#tabs-main').width() * 0.9;
    var dim = griddata["size"].val;
    if (_inMagnify) {
        _gridSizeInPix = ww / 3;
        _gridSizeInPix = Math.max(_gridSizeInPix, 160);
    }
    else {
        _gridSizeInPix = ww / dim;
        _gridSizeInPix = Math.max(_gridSizeInPix, 32);
    }
    ;
    var tbl = $('<table id="main-ui-grid-table" border="1" width="4" cellspacing="1" cellpadding="1" align="left">');
    tbl.append($('<th></th>'));
    for (var i = 0; i < dim; i++) {
        tbl.append($('<th border="1px">' + "ABCDEFG".charAt(i) + '</th>'));
    }
    for (var y = 0; y < dim; y++) {
        var row = $('<tr><th>' + (y + 1) + '</th>');
        for (var x = 0; x < dim; x++) {
            var gridname = "grid" + x + y;
            var svStr = '<svg id="' + gridname + '" width=' + _gridSizeInPix + ' height=' + _gridSizeInPix + '></svg>';
            // row.append('<td onclick="_GridClick(event,' + x + "," + y + ')" onmousedown="_PointDown(event,' + x + "," + y + ')" onmouseup="_PointUp(event,' + x + "," + y + ')" ontouchstart="_PointDown(event,' + x + "," + y + ')" ontouchend="_PointUp(event,' + x + "," + y + ')">' + svStr + "</td>");
            row.append('<td id="svgrid' + x + y + '">' + svStr + '</td>');
            tbl.append(row);
            $('#grid' + x + y).width(_gridSizeInPix).height(_gridSizeInPix);
            //$('#grid'+x+y)[0].addEventListener("touchstart", function(e){_PointDown(e, x, y);});
            //$('#grid'+x+y)[0].addEventListener("touchend", function(e){_PointRelease(e, x, y);});
        }
    }
    $('#main-ui-grid-area').html("");
    $('#main-ui-grid-area').append(tbl);
    var tblheight = $('#main-ui-grid-table').height();
    $('#main-ui-grid-area').height(tblheight);
    for (var y = 0; y < dim; y++)
        for (var x = 0; x < dim; x++) {
            var xx = $('#grid' + x + y);
            $('#grid' + x + y)[0].addEventListener("mousedown", function (e) { _MouseDown(e); });
            $('#grid' + x + y)[0].addEventListener("mouseup", function (e) { _MouseUp(e); });
        }
    ;
}
;
function _MouseDown(e) {
    var gx = "0123456789".indexOf(e.target['id'].charAt(4));
    var gy = "0123456789".indexOf(e.target['id'].charAt(5));
    _PointDown(e, gx, gy);
}
;
function _MouseUp(e) {
    var gx = "0123456789".indexOf(e.target['id'].charAt(4));
    var gy = "0123456789".indexOf(e.target['id'].charAt(5));
    _PointUp(e, gx, gy);
}
function _UiDrawGridContent(tiles) {
    for (let pos in tiles) {
        if (pos.length !== 2 || "ABCDEFG".indexOf(pos.charAt(0)) === -1 || "1234567".indexOf(pos.charAt(1)) === -1)
            continue;
        var gridname = "grid" + "ABCDEFG".indexOf(pos.charAt(0)) + "1234567".indexOf(pos.charAt(1));
        var elm = document.getElementById(gridname);
        var gridSize = elm.width.baseVal.value;
        if (tiles[pos] !== undefined && tiles[pos] !== null) {
            var target = tiles[pos].val;
            _UiDrawTileSVG(target, elm, gridSize, pos);
        }
        ;
    }
    ;
    _DrawINOUTIndexSVG(tiles, gridSize);
}
;
function _UiDrawTileOptionSVG(target, elm, gSize, pos) {
    var c = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    var option = target['option'].val;
    if (option !== undefined && option !== null && option !== "") {
        c.setAttribute('x', '' + gSize / 2);
        c.setAttribute('y', '' + gSize * 0.7);
        c.setAttribute('font-size', '' + gSize * 0.18);
        c.setAttribute('text-anchor', 'middle');
        c.setAttribute('fill', 'darkblue');
        c.setAttribute('pointer-events', 'none');
        //c.setAttribute('textLength', ''+gSize*0.6+'px');
        if (option.length > 5)
            option = option.substring(0, 5);
        c.textContent = option;
        elm.appendChild(c);
    }
}
function _UiDrawTileFlowOpSVG(target, elm, gSize, pos) {
    if (target['indir'] !== undefined && target['outdir'] !== undefined
        && target['indir'].val !== undefined && target['outdir'].val !== undefined
        && target['indir'].val.length === 2 && target['outdir'].val.length === 2) {
        var tmps = target['indir'].val.charAt(0) + target['outdir'].val.charAt(0);
        var c1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        c1.setAttribute('stroke', 'black');
        c1.setAttribute('stroke-width', '' + gSize * 0.025);
        c1.setAttribute('pointer-events', 'none');
        var c2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        c2.setAttribute('stroke', 'black');
        c2.setAttribute('stroke-width', '' + gSize * 0.025);
        c2.setAttribute('pointer-events', 'none');
        if (tmps === 'TR' || tmps === 'RT' || tmps === 'BL' || tmps === 'LB') {
            c1.setAttribute('x1', '' + gSize * 0.5);
            c1.setAttribute('y1', '' + gSize * 0.2);
            c1.setAttribute('x2', '' + gSize * 0.8);
            c1.setAttribute('y2', '' + gSize * 0.5);
            c2.setAttribute('x1', '' + gSize * 0.2);
            c2.setAttribute('y1', '' + gSize * 0.5);
            c2.setAttribute('x2', '' + gSize * 0.5);
            c2.setAttribute('y2', '' + gSize * 0.8);
            elm.appendChild(c1);
            elm.appendChild(c2);
        }
        else if (tmps === "TL" || tmps === "LT" || tmps === "RB" || tmps === "BR") {
            c1.setAttribute('x1', '' + gSize * 0.5);
            c1.setAttribute('y1', '' + gSize * 0.2);
            c1.setAttribute('x2', '' + gSize * 0.2);
            c1.setAttribute('y2', '' + gSize * 0.5);
            c2.setAttribute('x1', '' + gSize * 0.8);
            c2.setAttribute('y1', '' + gSize * 0.5);
            c2.setAttribute('x2', '' + gSize * 0.5);
            c2.setAttribute('y2', '' + gSize * 0.8);
            elm.appendChild(c1);
            elm.appendChild(c2);
        }
        else {
            c1.setAttribute('x1', '' + gSize * 0.2);
            c1.setAttribute('y1', '' + gSize * 0.5);
            c1.setAttribute('x2', '' + gSize * 0.4);
            c1.setAttribute('y2', '' + gSize * 0.5);
            c2.setAttribute('x1', '' + gSize * 0.5);
            c2.setAttribute('y1', '' + gSize * 0.8);
            c2.setAttribute('x2', '' + gSize * 0.5);
            c2.setAttribute('y2', '' + gSize * 0.2);
            var c3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            c3.setAttribute('stroke', 'black');
            c3.setAttribute('stroke-width', '' + gSize * 0.025);
            c3.setAttribute('x1', '' + gSize * 0.6);
            c3.setAttribute('y1', '' + gSize * 0.5);
            c3.setAttribute('x2', '' + gSize * 0.8);
            c3.setAttribute('y2', '' + gSize * 0.5);
            c3.setAttribute('pointer-events', 'none');
            var c4 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            c4.setAttribute('stroke', 'black');
            c4.setAttribute('fill', 'none');
            c4.setAttribute('stroke-width', '' + gSize * 0.025);
            c4.setAttribute('pointer-events', 'none');
            var sx = gSize * 0.4;
            var sy = gSize * 0.5;
            var r = gSize * 0.1;
            c4.setAttribute('d', 'M ' + sx + ',' + sy + ' a ' + r + ' ' + r + ' 180 0 1 ' + r * 2 + ',0');
            elm.appendChild(c1);
            elm.appendChild(c2);
            elm.appendChild(c3);
            elm.appendChild(c4);
        }
        return;
    } // if (in==2 && out==2)
    var dirs = ((target['indir'] === undefined) ? '' : target['indir'].val)
        + ((target['outdir'] === undefined) ? '' : target['outdir'].val);
    for (var i = 0; i < dirs.length; i++) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        c.setAttribute('stroke', 'black');
        c.setAttribute('stroke-width', '' + gSize * 0.025);
        c.setAttribute('x2', '' + gSize * 0.5);
        c.setAttribute('y2', '' + gSize * 0.5);
        c.setAttribute('pointer-events', 'none');
        switch (dirs.charAt(i)) {
            case 'T':
                c.setAttribute('x1', '' + gSize * 0.5);
                c.setAttribute('y1', '' + gSize * 0.2);
                break;
            case 'L':
                c.setAttribute('x1', '' + gSize * 0.2);
                c.setAttribute('y1', '' + gSize * 0.5);
                break;
            case 'R':
                c.setAttribute('x1', '' + gSize * 0.8);
                c.setAttribute('y1', '' + gSize * 0.5);
                break;
            case 'B':
                c.setAttribute('x1', '' + gSize * 0.5);
                c.setAttribute('y1', '' + gSize * 0.8);
                break;
            default:
                c.setAttribute('x1', '' + gSize * 0.0);
                c.setAttribute('y1', '' + gSize * 0.0);
                break;
        }
        ; // switch
        elm.appendChild(c);
    }
    ; // for
}
;
function _UiDrawTileOpNameSVG(target, elm, gSize, pos) {
    if (target['opname'].val === 'FLOW') {
        _UiDrawTileFlowOpSVG(target, elm, gSize, pos);
        return;
    }
    var c = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    var option = target['option'].val;
    c.setAttribute('x', '' + gSize / 2);
    if (option !== undefined && option !== null && option !== "")
        c.setAttribute('y', '' + gSize * 0.5);
    else
        c.setAttribute('y', '' + gSize * 0.6);
    c.setAttribute('font-size', '' + gSize * 0.167);
    c.setAttribute('text-anchor', 'middle');
    c.setAttribute('fill', 'darkblue');
    c.setAttribute('pointer-events', 'none');
    c.setAttribute('pointer-events', 'none');
    //c.setAttribute('textLength', ''+gSize*0.6+'px');
    var opstr = target["opname"].val;
    if (opstr.length > 6)
        opstr = opstr.substring(0, 6);
    c.textContent = opstr;
    elm.appendChild(c);
}
function _UiDrawTileInOutSVG(target, elm, gSize, pos) {
    var x = function (d, out) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        var p = '' + gSize / 2 + ',' + gSize * 0.2 + ',' + gSize / 2 + ',0';
        if (out)
            p = p + ',' + (gSize * 0.45) + ',' + (gSize * 0.05) + ',' + (gSize * 0.55) + ',' + (gSize * 0.05) + ',' + gSize * 0.5 + ',0';
        c.setAttribute('points', p);
        c.setAttribute('stroke', 'black');
        c.setAttribute('stroke-width', '' + gSize * 0.025);
        c.setAttribute('pointer-events', 'none');
        switch (d) {
            case 'L':
                c.setAttribute('transform', 'rotate(-90,' + gSize / 2 + ',' + gSize / 2 + ')');
                break;
            case 'R':
                c.setAttribute('transform', 'rotate(+90,' + gSize / 2 + ',' + gSize / 2 + ')');
                break;
            case 'B':
                c.setAttribute('transform', 'rotate(180,' + gSize / 2 + ',' + gSize / 2 + ')');
                break;
            case 'T': break;
            default: break;
        }
        ;
        elm.appendChild(c);
    };
    for (var i = 0; i < target['indir'].val.length; i++)
        x(target['indir'].val.charAt(i), false);
    for (var i = 0; i < target['outdir'].val.length; i++)
        x(target['outdir'].val.charAt(i), true);
    var y = function (d, i) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        c.setAttribute('fill', 'black');
        c.setAttribute('font-size', '' + gSize * 0.15);
        c.setAttribute('text-anchor', 'start');
        c.setAttribute('pointer-events', 'none');
        c.textContent = '' + i;
        switch (d) {
            case 'T':
                c.setAttribute('x', '' + gSize * 0.6);
                c.setAttribute('y', '' + gSize * 0.17);
                break;
            case 'L':
                c.setAttribute('x', '' + gSize * 0.05);
                c.setAttribute('y', '' + gSize * 0.4);
                break;
            case 'R':
                c.setAttribute('x', '' + gSize * 0.90);
                c.setAttribute('y', '' + gSize * 0.4);
                break;
            case 'B':
                c.setAttribute('x', '' + gSize * 0.6);
                c.setAttribute('y', '' + gSize * 0.95);
                break;
            default:
                break;
        }
        ;
        elm.appendChild(c);
    };
    for (var i = 0; i < target['indir'].val.length; i++)
        y(target['indir'].val.charAt(i), i);
    for (var i = 0; i < target['outdir'].val.length; i++)
        y(target['outdir'].val.charAt(i), i);
}
function _UiDrawTileSVG(target, elm, gSize, pos) {
    _UiDrawTileOpNameSVG(target, elm, gSize, pos);
    _UiDrawTileOptionSVG(target, elm, gSize, pos);
    _UiDrawTileInOutSVG(target, elm, gSize, pos);
    if (_inMagnify) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        c.setAttribute('text-anchor', 'end');
        c.setAttribute('x', '' + gSize * 0.95);
        c.setAttribute('y', '' + gSize * 0.95);
        c.setAttribute('font-size', '' + gSize * 0.15 + 'px');
        c.setAttribute('fill', 'magenta');
        c.setAttribute('pointer-events', 'none');
        c.textContent = pos;
        elm.appendChild(c);
    }
    ;
    if (_inMove) {
        var tx = "ABCDEFG".indexOf(pos.charAt(0));
        var ty = "1234567".indexOf(pos.charAt(1));
        if (_xMoveFrom === tx && _yMoveFrom === ty) {
            var c = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            c.setAttribute('stroke', 'red');
            c.setAttribute('fill', 'none');
            c.setAttribute('text-anchor', 'middle');
            c.setAttribute('x', '' + gSize / 2);
            c.setAttribute('y', '' + gSize * 0.6);
            c.setAttribute('font-size', '' + gSize * 0.2);
            c.textContent = "MOVING";
            c.setAttribute('pointer-events', 'none');
            elm.appendChild(c);
        }
        ;
    }
    ;
    if (_debugging) {
        var traceInfo = _currentDrawState.traceinfo[pos];
        if (traceInfo !== undefined && traceInfo !== null) {
            _UIDrawTileTraceInfo(target, elm, gSize, pos, traceInfo);
        }
        ;
    }
    ;
}
;
function _UIDrawTileTraceInfo(taregt, elm, gSize, pos, traceInfo) {
    if (traceInfo !== undefined && traceInfo !== null) {
        var fontsize = gSize / 7;
        if (traceInfo['topToken'] !== null && traceInfo['topToken'] !== "") {
            var c2a = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            c2a.textContent = traceInfo['topToken'].trim().slice(0, 8);
            c2a.setAttribute('font-size', '' + fontsize);
            c2a.setAttribute('fill', 'green');
            c2a.setAttribute('text-anchor', 'middle');
            c2a.setAttribute('x', '' + gSize / 2);
            c2a.setAttribute('y', '' + fontsize * 1.1);
            c2a.setAttribute('pointer-events', 'none');
            var b = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            b.setAttribute('fill', 'white');
            b.setAttribute('x', '' + fontsize / 2 * 4.4);
            b.setAttribute('y', '' + 0);
            b.setAttribute('width', '' + fontsize / 2 * 8.8);
            b.setAttribute('height', '' + fontsize * 1.1);
            b.setAttribute('pointer-events', 'none');
            elm.appendChild(b);
            elm.appendChild(c2a);
        }
        if (traceInfo['leftToken'] !== null && traceInfo['leftToken'] !== "") {
            var c2a = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            c2a.textContent = traceInfo['leftToken'].trim().slice(0, 8);
            c2a.setAttribute('font-size', '' + fontsize);
            c2a.setAttribute('fill', 'green');
            c2a.setAttribute('text-anchor', 'start');
            c2a.setAttribute('x', '' + 4);
            c2a.setAttribute('y', '' + gSize / 2);
            c2a.setAttribute('pointer-events', 'none');
            var b = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            b.setAttribute('fill', 'white');
            b.setAttribute('x', '' + 0);
            b.setAttribute('y', '' + (gSize / 2));
            b.setAttribute('width', '' + fontsize / 2 * 8.8);
            b.setAttribute('height', '' + fontsize * 1.1);
            b.setAttribute('pointer-events', 'none');
            elm.appendChild(b);
            elm.appendChild(c2a);
        }
        if (traceInfo['rightToken'] !== null && traceInfo['rightToken'] !== "") {
            var c2a = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            c2a.textContent = traceInfo['rightToken'].trim().slice(0, 8);
            c2a.setAttribute('font-size', '' + fontsize);
            c2a.setAttribute('fill', 'green');
            c2a.setAttribute('text-anchor', 'end');
            c2a.setAttribute('x', '' + (gSize - 4));
            c2a.setAttribute('y', '' + gSize / 2);
            c2a.setAttribute('pointer-events', 'none');
            var b = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            b.setAttribute('fill', 'white');
            b.setAttribute('x', '' + gSize / 2);
            b.setAttribute('y', '' + (gSize / 2 - fontsize));
            b.setAttribute('width', '' + fontsize / 2 * 8.8);
            b.setAttribute('height', '' + fontsize * 1.1);
            b.setAttribute('pointer-events', 'none');
            elm.appendChild(b);
            elm.appendChild(c2a);
        }
        if (traceInfo['bottomToken'] !== null && traceInfo['bottomToken'] !== "") {
            var c2a = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            c2a.textContent = traceInfo['bottomToken'].trim().slice(0, 8);
            c2a.setAttribute('font-size', '' + fontsize);
            c2a.setAttribute('fill', 'green');
            c2a.setAttribute('text-anchor', 'middle');
            c2a.setAttribute('x', '' + gSize / 2);
            c2a.setAttribute('y', '' + (gSize - 4));
            c2a.setAttribute('pointer-events', 'none');
            var b = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            b.setAttribute('fill', 'white');
            b.setAttribute('x', '' + fontsize / 2 * 4.4);
            b.setAttribute('y', '' + (gSize - fontsize * 1.1));
            b.setAttribute('width', '' + fontsize / 2 * 8.8);
            b.setAttribute('height', '' + fontsize * 1.1);
            b.setAttribute('pointer-events', 'none');
            elm.appendChild(b);
            elm.appendChild(c2a);
        }
        if (traceInfo['toDoNext'] !== undefined && traceInfo['toDoNext'] === true) {
            var c = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            c.setAttribute('stroke', 'red');
            c.setAttribute('fill', 'none');
            var stkl = gSize * 0.95;
            c.setAttribute('points', '4,4,' + stkl + ',4,' + stkl + ',' + stkl + ',4,' + stkl + ',4,4');
            c.setAttribute('pointer-events', 'none');
            elm.appendChild(c);
            var c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c1.setAttribute('stroke', 'blue');
            c1.setAttribute('fill', 'none');
            c1.setAttribute('cx', '' + gSize * 0.85);
            c1.setAttribute('cy', '' + gSize * 0.85);
            c1.setAttribute('r', '' + gSize * 0.1);
            c1.setAttribute('pointer-events', 'none');
            elm.appendChild(c1);
        }
        if (traceInfo['setBP']) {
            var c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c1.setAttribute('fill', 'red');
            c1.setAttribute('cx', '' + gSize * 0.15);
            c1.setAttribute('cy', '' + gSize * 0.85);
            c1.setAttribute('r', '' + gSize * 0.1);
            c1.setAttribute('pointer-events', 'none');
            elm.appendChild(c1);
        }
    }
    return;
}
;
function _DrawINOUTIndexSVG(tiles, canvasSize) {
    var indir = tiles.indir.val;
    var odir = tiles.outdir.val;
    var gsize = tiles.size.val;
    var gridname;
    for (var i = 0; i < indir.length; i++) {
        switch (indir.charAt(i)) {
            case 'T':
                gridname = "grid" + Math.floor(gsize / 2) + "0";
                break;
            case 'L':
                gridname = "grid" + "0" + Math.floor(gsize / 2);
                break;
            case 'R':
                gridname = "grid" + (gsize - 1) + Math.floor(gsize / 2);
                break;
            case 'B':
                gridname = "grid" + Math.floor(gsize / 2) + (gsize - 1);
                break;
            default: gridname = null;
        }
        if (gridname !== null) {
            var elm = document.getElementById(gridname);
            var c = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            c.setAttribute('fill', 'magenta');
            c.setAttribute('text-anchor', 'end');
            c.setAttribute('font-size', '' + canvasSize * 0.2);
            c.setAttribute('x', '' + canvasSize * 0.95);
            c.setAttribute('y', '' + canvasSize * 0.2);
            c.textContent = ('I' + i);
            c.setAttribute('pointer-events', 'none');
            elm.appendChild(c);
        }
    }
    ; // for indir
    for (var i = 0; i < odir.length; i++) {
        switch (odir.charAt(i)) {
            case 'T':
                gridname = "grid" + Math.floor(gsize / 2) + "0";
                break;
            case 'L':
                gridname = "grid" + "0" + Math.floor(gsize / 2);
                break;
            case 'R':
                gridname = "grid" + (gsize - 1) + Math.floor(gsize / 2);
                break;
            case 'B':
                gridname = "grid" + Math.floor(gsize / 2) + (gsize - 1);
                break;
            default: gridname = null;
        }
        if (gridname !== null) {
            var elm = document.getElementById(gridname);
            var elm = document.getElementById(gridname);
            var c = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            c.setAttribute('fill', 'magenta');
            c.setAttribute('text-anchor', 'end');
            c.setAttribute('font-size', '' + canvasSize * 0.2);
            c.setAttribute('x', '' + canvasSize * 0.95);
            c.setAttribute('y', '' + canvasSize * 0.2);
            c.textContent = ('O' + i);
            c.setAttribute('pointer-events', 'none');
            elm.appendChild(c);
        }
    }
    ; // for outdir
}
;
function _DrawINOUTIndex(tiles) {
    var indir = tiles.indir.val;
    var odir = tiles.outdir.val;
    var gsize = tiles.size.val;
    var gridname;
    for (var i = 0; i < indir.length; i++) {
        switch (indir.charAt(i)) {
            case 'T':
                gridname = "grid" + Math.floor(gsize / 2) + "0";
                break;
            case 'L':
                gridname = "grid" + "0" + Math.floor(gsize / 2);
                break;
            case 'R':
                gridname = "grid" + (gsize - 1) + Math.floor(gsize / 2);
                break;
            case 'B':
                gridname = "grid" + Math.floor(gsize / 2) + (gsize - 1);
                break;
            default: gridname = null;
        }
        if (gridname !== null) {
            var elm = document.getElementById(gridname);
            var ctx = elm.getContext('2d');
            var canvasSize = elm.width;
            ctx.save();
            ctx.fillStyle = "magenta";
            ctx.textAlign = "right";
            ctx.font = (canvasSize * 0.2) + "pt Arial";
            ctx.fillText("I" + i, canvasSize * 0.95, canvasSize * 0.2);
            ctx.restore();
        }
    }
    ; // for indir
    for (var i = 0; i < indir.length; i++) {
        switch (odir.charAt(i)) {
            case 'T':
                gridname = "grid" + Math.floor(gsize / 2) + "0";
                break;
            case 'L':
                gridname = "grid" + "0" + Math.floor(gsize / 2);
                break;
            case 'R':
                gridname = "grid" + (gsize - 1) + Math.floor(gsize / 2);
                break;
            case 'B':
                gridname = "grid" + Math.floor(gsize / 2) + (gsize - 1);
                break;
            default: gridname = null;
        }
        if (gridname !== null) {
            var elm = document.getElementById(gridname);
            var ctx = elm.getContext('2d');
            var canvasSize = elm.width;
            ctx.save();
            ctx.fillStyle = "magenta";
            ctx.textAlign = "right";
            ctx.font = (canvasSize * 0.2) + "px Arial";
            ctx.fillText("O" + i, canvasSize * 0.95, canvasSize * 0.2);
            ctx.restore();
        }
    }
    ; // for outdir
}
;
function _DrawIONumber(element, ctx, sz, dir, n) {
    const csize = 0.1;
    var params = [[0.2, -0.6], [-0.8, 0.35], [0.8, 0.35], [0.2, 0.9]];
    if (dir === Direction.void)
        return;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.font = (sz * csize) * 1.7 + "px sans-serif";
    ctx.translate(sz / 2, sz / 2);
    ctx.fillText("" + n, sz / 2 * params[dir][0], sz / 2 * params[dir][1]);
    ctx.restore();
}
;
function _UiDrawTileInput(element, ctx, sz) {
    var idir = element["indir"].val;
    var params = [-Math.PI / 2, Math.PI, 0, Math.PI / 2];
    var i;
    for (i = 0; i < idir.length; i++) {
        ctx.save();
        ctx.translate(sz / 2, sz / 2);
        ctx.strokeStyle = "black";
        ctx.rotate(params["TLRB".indexOf(idir[i])]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sz / 2, 0);
        ctx.stroke();
        ctx.restore();
        _DrawIONumber(element, ctx, sz, "TLRB".indexOf(idir[i]), i);
    }
}
;
function _UiDrawTileOutput(element, ctx, sz) {
    var odir = element["outdir"].val;
    var params = [-Math.PI / 2, Math.PI, 0, Math.PI / 2];
    var i;
    for (i = 0; i < odir.length; i++) {
        ctx.save();
        ctx.translate(sz / 2, sz / 2);
        ctx.strokeStyle = "black";
        ctx.rotate(params["TLRB".indexOf(odir[i])]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sz / 2, 0);
        ctx.lineTo(sz / 2 * 0.9, sz / 2 * 0.15);
        ctx.moveTo(sz / 2, 0);
        ctx.lineTo(sz / 2 * 0.9, -sz / 2 * 0.15);
        ctx.stroke();
        ctx.restore();
        _DrawIONumber(element, ctx, sz, "TLRB".indexOf(odir[i]), i);
    }
}
;
function UiDraw_NeedSpecialTreatment(element) {
    var opname = element.opname.val;
    if (opname === "FLOW")
        return true;
    else
        return false;
}
;
function _UiDrawTileOption(element, ctx, sz) {
    var option = element["option"].val;
    if (option !== undefined && option !== null && option !== "") {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "darkblue";
        ctx.textAlign = "center";
        ctx.font = (sz * 0.15) * 1.3 + "px Arial";
        var trimmed = option;
        if (ctx.measureText(trimmed).width > sz * 0.8)
            trimmed = trimmed.substr(0, Math.floor(trimmed.length * ((sz * 0.7) / ctx.measureText(trimmed).width)));
        ctx.fillText(trimmed, sz / 2, sz / 2 + sz * 0.15, sz * 0.6);
        ctx.restore();
    }
}
;
function _UiDrawTileOpName(element, ctx, sz) {
    var opname = element["opname"].val;
    var option = element["option"].val;
    var hpos = sz / 2 - (sz * 0.2) / 2;
    ctx.fillStyle = "darkblue";
    ctx.textAlign = "center";
    ctx.font = (sz * 0.2) + "px Arial";
    if (option === null || option === "")
        hpos = hpos + (sz * 0.3) / 2;
    ctx.fillText(opname, sz / 2, hpos, sz * 0.6);
}
;
function _DecodeToken(token) {
    return JSON.stringify(token);
}
function _UiDrawTile(element, ctx, canvasSize, posstr) {
    if (_inMagnify) {
        ctx.save();
        ctx.fillStyle = "magenta";
        ctx.textAlign = "left";
        ctx.font = (canvasSize * 0.1) + "px Arial";
        ctx.fillText(element.pos, 2, canvasSize * 0.1);
        ctx.restore();
    }
    ;
    ctx.save();
    ctx.rect(0, 0, canvasSize, canvasSize);
    ctx.clip();
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.lineWidth = 2;
    _UiDrawTileInput(element, ctx, canvasSize);
    _UiDrawTileOutput(element, ctx, canvasSize);
    var sz = canvasSize;
    if (!UiDraw_NeedSpecialTreatment(element)) { // FLOW omitts opname and option.
        ctx.clearRect(canvasSize * 0.2, canvasSize * 0.2, canvasSize * 0.6, canvasSize * 0.58);
        _UiDrawTileOption(element, ctx, canvasSize);
        _UiDrawTileOpName(element, ctx, canvasSize);
    }
    else {
        var idir = element.indir.val;
        var odir = element.outdir.val;
        if (idir.length === 2 && odir.length === 2) { // Drawing JCT
            ctx.clearRect(sz * 0.3, sz * 0.3, sz * 0.4, sz * 0.4);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            var tmps = idir.charAt(0) + odir.charAt(0);
            if (tmps === "TB" || tmps === "BT" || tmps === "LR" || tmps === "RL") {
                ctx.beginPath();
                ctx.moveTo(sz / 2, sz * 0.3);
                ctx.lineTo(sz / 2, sz * 0.7);
                ctx.stroke();
                ctx.moveTo(sz * 0.3, sz / 2);
                ctx.arcTo(sz * 0.3, sz * 0.3, sz / 2, sz * 0.3, sz * 0.2);
                ctx.arcTo(sz * 0.7, sz * 0.3, sz * 0.7, sz / 2, sz * 0.2);
                ctx.stroke();
            }
            else if (tmps === "TR" || tmps === "RT" || tmps === "LB" || tmps === "BL") {
                ctx.beginPath();
                ctx.moveTo(sz / 2, sz * 0.3);
                ctx.lineTo(sz * 0.7, sz / 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(sz / 2, sz * 0.7);
                ctx.lineTo(sz * 0.3, sz / 2);
                ctx.stroke();
            }
            else if (tmps === "TL" || tmps === "LT" || tmps === "RB" || tmps === "BR") {
                ctx.beginPath();
                ctx.moveTo(sz / 2, sz * 0.3);
                ctx.lineTo(sz * 0.3, sz / 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(sz / 2, sz * 0.7);
                ctx.lineTo(sz * 0.7, sz / 2);
                ctx.stroke();
            }
        }
    }
    ;
    if (_inMove) {
        var tx = "ABCDEFG".indexOf(posstr.charAt(0));
        var ty = "1234567".indexOf(posstr.charAt(1));
        if (_xMoveFrom === tx && _yMoveFrom === ty) {
            ctx.strokeStyle = "red";
            //ctx.strokeRect( 2, 2, w-2, h-2);
            ctx.textAlign = "center";
            ctx.strokeText("MOVING", sz / 2, sz / 2);
        }
        ;
    }
    ;
    if (_debugging) {
        var traceInfo = _currentDrawState.traceinfo[posstr];
        if (traceInfo !== undefined && traceInfo !== null) {
            if (traceInfo.toDoNext) {
                ctx.strokeStyle = "red";
                ctx.strokeRect(5, 5, sz - 5, sz - 5);
                ctx.strokeStyle = "blue";
                ctx.beginPath();
                ctx.arc(sz * 0.85, sz * 0.85, sz * 0.1, 0, 2 * Math.PI);
                ctx.stroke();
            }
            if (traceInfo.setBP) {
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(sz * 0.15, sz * 0.85, sz * 0.1, 0, 2 * Math.PI);
                ctx.fill();
            }
            var fontsize = sz / 7;
            ctx.font = fontsize + "px Sans-Serif";
            if (traceInfo.topToken !== null && traceInfo.topToken !== "") {
                var txt = traceInfo.topToken.trim().slice(0, 8);
                var stlen = ctx.measureText(txt);
                ctx.textAlign = "center";
                ctx.fillStyle = "white";
                ctx.fillRect((sz - stlen.width) / 2, fontsize * 0.2, stlen.width, fontsize);
                ctx.fillStyle = "#008000";
                ctx.fillText(txt, sz / 2, fontsize * 1.1);
            }
            if (traceInfo.leftToken !== null && traceInfo.leftToken !== "") {
                var txt = traceInfo.leftToken.trim().slice(0, 8);
                var stlen = ctx.measureText(txt);
                ctx.textAlign = "left";
                ctx.fillStyle = "white";
                ctx.fillRect(4, sz / 2 - fontsize, stlen.width, fontsize);
                ctx.fillStyle = "#008000";
                ctx.fillText(txt, 4, sz / 2);
            }
            if (traceInfo.rightToken !== null && traceInfo.rightToken !== "") {
                var txt = traceInfo.rightToken.trim().slice(0, 8);
                var stlen = ctx.measureText(txt);
                ctx.textAlign = "right";
                ctx.fillStyle = "white";
                ctx.fillRect(sz - stlen.width - 4, sz / 2 - fontsize, stlen.width, fontsize);
                ctx.fillStyle = "#008000";
                ctx.fillText(txt, sz - 4, sz / 2);
            }
            if (traceInfo.bottomToken !== null && traceInfo.bottomToken !== "") {
                var txt = traceInfo.bottomToken.trim().slice(0, 8);
                var stlen = ctx.measureText(txt);
                ctx.textAlign = "center";
                ctx.fillStyle = "white";
                ctx.fillRect((sz - stlen.width) / 2, sz - fontsize * 2.0, stlen.width, fontsize);
                ctx.fillStyle = "#008000";
                ctx.fillText(txt, sz / 2, sz - fontsize * 1.1);
            }
        }
    }
    ctx.restore();
}
;
;
;
class VpglMtWorker {
    constructor() {
        this.workerThr = null;
        this.workerThr = new Worker('src/vpglworker.js', { type: 'module' });
        this.workerThr.onerror = function (error) {
            console.error('Workerでエラーが発生しました:', error.message);
            console.error('エラーが起きたファイル:', error.filename);
            console.error('エラー行番号:', error.lineno);
        };
        this.workerThr.addEventListener('message', function (e) {
            //try {
            if (gVpglUI != null)
                gVpglUI.React(e.data);
            //} catch (error) {
            //    window.alert(JSON.stringify(error));
            //}
        });
    }
    ;
    Cmd(cmd) {
        if (this.workerThr != null) {
            this.workerThr.postMessage(cmd, null);
        }
        ;
    }
    ;
}
;
class VpglCLI {
    React(response) { }
    ;
    UpdateDisplay() { }
    ;
    Initialize() { }
    ;
    Redraw(contents) { }
    ;
    ForceStartTimer() { }
    ;
    ForceStopTimer() { }
    ;
    StartTimerHandler(response) { }
    ;
}
;
class VpglGUI {
    constructor() {
        this.currentClass = "App";
        this.currentMethod = "Mainline";
    }
    UpdateDisplay() {
        if (_currentDrawState !== null)
            this.Redraw(_currentDrawState);
        else
            gVpglWorker.Cmd({ cmd: 'UiUpdate', needtrace: _debugging, curClass: this.currentClass, curMethod: this.currentMethod });
    }
    Initialize() {
        this.currentClass = _initialDisplayClass;
        this.currentMethod = _initialDisplayMethod;
        gVpglWorker.Cmd({ cmd: 'ResetSystem', d3: _enable3D });
    }
    ;
    AlertHandler(response) {
        // out #200
        //window.alert(response.msg);
        //gVpglWorker.Cmd({cmd: 'Continue', eid: response.eid, exmode: response.exmode});
        //_jqconsole.Write(response.msg+'\n','jqconsole-output');
        // end of out#200
        // in #200
        var alertdialog = $('#main-ui-alert-dialog');
        $('#main-ui-alert-dialog-message').val(response.msg);
        alertdialog.dialog({
            title: "Message:",
            modal: true,
            position: { of: 'body', at: 'center', my: 'center' },
            buttons: {
                "OK": function () {
                    alertdialog.dialog('close');
                    gVpglWorker.Cmd({ cmd: 'Resume', eid: response.eid, exmode: response.exmode });
                }
            }
        });
        // end of in #200
    }
    ;
    InputHandler(response) {
        // out #200
        //var userinput = window.prompt(response.prompt);
        //gVpglWorker.Cmd({cmd: 'UserInput', val: userinput, eid: response.eid});
        /*
        _jqconsole.Input(function(userinput) {
            gVpglWorker.Cmd({cmd: 'UserInput', val: userinput, eid: response.eid});
          });
          */
        // end of out #200
        // in #200
        var inputdialog = $('#main-ui-input-dialog');
        inputdialog.dialog({
            title: response.prompt,
            modal: true,
            position: { of: 'body', at: 'center', my: 'center' },
            buttons: {
                'OK': function () {
                    var userinput = $('#main-ui-input-dialog-value').val();
                    inputdialog.dialog('close');
                    gVpglWorker.Cmd({ cmd: 'UserInput', val: userinput, eid: response.eid });
                }
            }
        });
        // end of in #200
    }
    ;
    PauseHandler(response) {
        var tid = setTimeout(function () {
            gVpglWorker.Cmd({ cmd: 'Resume', msec: response.msec, eid: response.eid, exmode: response.exmode });
        }, response.msec);
    }
    UpdateProgress(progress) {
        $('#progressBar').val(progress);
    }
    ;
    BreakOrGo(operand) {
        if (!gStopper)
            gVpglWorker.Cmd({ cmd: 'Continue', eid: operand.eid, exmode: operand.exmode });
        else
            gVpglWorker.Cmd({ cmd: 'Break', eid: operand.eid });
    }
    ;
    TerminateHandler(message) {
        this.StopTimerHandler(null);
        VpglGUI.cbInvoking = false;
        _Fin3D();
        window.alert("Program Terminated:" + message);
        //_jqconsole.Write("\nProgram Terminated:"+message+"",'jqconsole-output');
        $("#main-ui-runbutton").attr("disabled", null);
    }
    ;
    CancelMoveHandler() {
        _inMove = false;
        this.UpdateDisplay();
    }
    ;
    VMContentsHandler(response) {
        _3DReleaseAll();
        //var models = JSON.stringify(_the3DWorld, null, "  ");
        var models = JSON.stringify(Get3DWorld(), null); // packed
        var outload = '{ "version" : [ "JN05", 3], \n' +
            '  "outload" : ' + response.val + ", \n" +
            '  "models" : ' + models + "\n}";
        $('#loadsave-console').val(outload);
    }
    ;
    Init3DHandler() {
        _InitW3D();
    }
    ;
    Update3DHandler(response) {
        _Update3D(_theRenderer);
    }
    ;
    SetCameraHandler(response) {
        _3DSetCamera(response.scn, response.camname);
    }
    ;
    StartTimerHandler(response) {
        if (VpglGUI.cbInvoking)
            return;
        //if(_3DTimerinterval === null) return;
        if (false) { // if (_debugging) {
            this.DebugStartTimer();
            return;
        }
        if (this.timerId !== undefined || this.timerId !== null)
            clearInterval(this.timerId);
        VpglGUI.timerCount = 1;
        this.timerId = setInterval(function () {
            if (VpglGUI.cbInvoking)
                VpglGUI.timerCount++;
            else {
                gVpglWorker.Cmd({ cmd: 'TimerRunOut', count: VpglGUI.timerCount, exmode: response.exmode });
                VpglGUI.cbInvoking = true;
                VpglGUI.timerCount = 1;
            }
            ;
        }, response.interval);
    }
    ;
    StopTimerHandler(response) {
        if (false) { //if (_debugging) {
            this.DebugStopTimer();
            return;
        }
        clearInterval(this.timerId);
        VpglGUI.cbInvoking = false;
    }
    ;
    ForceStartTimer() {
        if (_debugging)
            return;
        if (this.timerId !== undefined && this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        if (_3DTimerinterval === undefined || _3DTimerinterval === null || _3DTimerinterval < 1)
            return;
        if (_3DTimerinterval < 20)
            _3DTimerinterval = 20;
        if (VpglGUI.cbInvoking)
            return;
        //if(_3DTimerinterval === null) return;
        if (false) { // if (_debugging) {
            this.DebugStartTimer();
            return;
        }
        VpglGUI.timerCount = 1;
        this.timerId = setInterval(function () {
            if (VpglGUI.cbInvoking)
                VpglGUI.timerCount++;
            else {
                gVpglWorker.Cmd({ cmd: 'TimerRunOut', count: VpglGUI.timerCount });
                VpglGUI.cbInvoking = true;
                VpglGUI.timerCount = 1;
            }
            ;
        }, _3DTimerinterval);
    }
    ;
    ForceStopTimer() {
        if (_3DTimerinterval === undefined || _3DTimerinterval === null)
            return;
        clearInterval(this.timerId);
        VpglGUI.cbInvoking = false;
    }
    ;
    DebugStartTimer() {
        document.getElementById("main-ui-debug-timer-button").style.display = 'block';
    }
    ;
    static DebugTimerTick() {
        if (VpglGUI.cbInvoking)
            VpglGUI.timerCount++;
        if (VpglGUI.timerCount > 1000) {
            _jqconsole.write("Dropped over 1000 Frames\n", 'jqconsole-warning');
        }
        else {
            gVpglWorker.Cmd({ cmd: 'TimerRunOut', count: VpglGUI.timerCount, exmode: 4 });
            VpglGUI.cbInvoking = true;
            VpglGUI.timerCount = 1;
        }
    }
    ;
    DebugStopTimer() {
        VpglGUI.cbInvoking = false;
        document.getElementById("main-ui-debug-timer-button").style.display = 'none';
    }
    ;
    TimerResponseCompleteHandler(response) {
        VpglGUI.cbInvoking = false;
    }
    ;
    Redraw(response) {
        _currentDrawState = response;
        _UiSetClassList(response.classes, response.currentClass);
        _UiSetMethodList(response.methods, response.currentMethod);
        _UiSetGridArea(response.grid);
    }
    ;
    React(response) {
        switch (response.cmd) {
            case 'StopDebug':
                _DebugStopDebugCommand();
                break;
            case 'DrawUI':
                {
                    var tb = $("#main-tabs");
                    tb.tabs({ active: 1 });
                    ;
                    this.Redraw(response);
                    break;
                }
                ;
            case 'Alert':
                this.AlertHandler(response);
                break;
            case 'Input':
                this.InputHandler(response);
                break;
            case 'Pause':
                this.PauseHandler(response);
                break;
            case 'Progress':
                this.UpdateProgress(response.progress);
                break;
            case 'CanBreak':
                this.BreakOrGo(response);
                break;
            case 'Terminated':
                this.TerminateHandler(response.msg);
                break;
            case 'CancelMove':
                this.CancelMoveHandler();
                break;
            case 'VMContents':
                this.VMContentsHandler(response);
                break;
            case 'Init3D':
                this.Init3DHandler();
                break;
            case 'Update3D':
                this.Update3DHandler(response);
                break;
            case '3DSetCamera':
                this.SetCameraHandler(response);
                break;
            case 'StartTimer':
                this.StartTimerHandler(response);
                break;
            case 'StopTimer':
                this.StopTimerHandler(response);
                break;
            case 'TimerResponseComplete':
                this.TimerResponseCompleteHandler(response);
                break;
            case 'GEO3DANGLE':
            case 'GEO3DPOS':
            case 'SCN3DAT':
            case 'GEO3DAPPEAR':
            case '3DSETSCENE':
            case 'GEO3DSET':
            case 'GEO3DGET':
            case 'GEO3DLOOK':
                _3DOperationHandler(response);
                break;
            case 'ERROR':
                if (window.confirm('ERROR : ' + JSON.stringify(response)))
                    this.ForceStopTimer();
                else {
                    gVpglWorker.Cmd({ cmd: 'Break' });
                }
                break;
            default:
                window.alert('Unknown Response : ' + JSON.stringify(response));
                break;
        }
        ;
    }
    ;
}
VpglGUI.timerCount = 0;
VpglGUI.cbInvoking = false;
;
var _debugging = false;
var _inMove = false;
var _xMoveFrom = -1;
var _yMoveFrom = -1;
var _xInMove = -1;
var _yInMove = -1;
var _tapped = false;
var sid; // NodeJS.Timeout;
var _inClickReact = false;
var _magTargetX = -1;
var _magTargetY = -1;
var _currentDrawState = null;
var _gridSizeInPix = -1;
var gUseGUI = true;
var gStopper = true;
export var gVpglWorker = null;
var gVpglUI = null;
var _jqconsole = null;
var _runonly = false;
var _enable3D = true;
function LoadIn() { }
; // 読み込み
function WriteOut() { }
; // 書き出し
function _RunCommand() {
    if (!_debugging && _enable3D)
        $("#main-tabs").tabs({ active: 2 });
    gStopper = false;
    $("#main-ui-runbutton").attr("disabled", "true");
    _InitW3D();
    _3DReleaseAll();
    // To Display Ready Scene.
    Get3DWorld().sceneToBeRendered = 'Running';
    _Update3D(_theRenderer);
    _jqconsole.Reset();
    if (gVpglWorker !== null)
        gVpglWorker.Cmd({ cmd: 'Run' });
}
; // 実行
function _BreakCommand() {
    gStopper = true;
    $("#main-ui-runbutton").attr("disabled", null);
    //gVpglUI.ForceStopTimer(); //ここでやるべきことなのか不明
    gVpglWorker.Cmd({ cmd: 'Break' });
}
; // 実行の強制終了
window.onresize = function (e) {
    gVpglUI.Redraw(_currentDrawState);
};
var _PdTimer = null;
var _PointDown = function (event, x, y) {
    _PdTimer = setTimeout(() => {
        clearTimeout(_PdTimer);
        _PdTimer = null;
        _PointHold(event, x, y);
    }, 1000);
};
var _PointMove = function (event, x, y) { };
var _PointUp = function (event, x, y) {
    if (_PdTimer !== null) {
        clearTimeout(_PdTimer);
        _PdTimer = null;
        _GridClick(event, x, y);
        return; // pass to be onclick
    }
    ;
    event.preventDefault();
    _PointRelease(event, x, y);
};
var _PointHold = function (event, x, y) {
    if (_inMove) {
        _inMove = false;
        var moves = [{ fromx: _xMoveFrom, fromy: _yMoveFrom, tox: x, toy: y }];
        _xMoveFrom = -1;
        _yMoveFrom = -1;
        gVpglWorker.Cmd({ cmd: "TileMove", class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod, moves: moves });
    }
    else {
        _inMove = true;
        _xMoveFrom = x;
        _yMoveFrom = y;
        gVpglUI.UpdateDisplay();
    }
};
var _PointRelease = function (event, x, y) { };
var sLastx = -1;
var sLasty = -1;
function _GridClick(e, x, y) {
    e.stopPropagation();
    if (_inMove) {
        _CancelMove();
        gVpglUI.Redraw(_currentDrawState);
        return;
    }
    ;
    if (_inClickReact)
        return;
    if (!_tapped) {
        //window.alert(e.type+":"+e.offsetX+","+e.offsetY);
        sLastx = e.offsetX;
        sLasty = e.offsetY;
        _tapped = true;
        sid = setTimeout(function () {
            if (_tapped) {
                _inClickReact = true;
                _OnSingleClick(sLastx, sLasty, x, y);
                _inClickReact = false;
            }
            _tapped = false;
        }, 350);
    }
    else {
        _inClickReact = true;
        clearTimeout(sid);
        _tapped = false;
        _OnDoubleClick(e, x, y);
        _inClickReact = false;
    }
    ;
}
;
function _OnSingleClick(px, py, x, y) {
    var gridSize = _currentDrawState.grid.val.size.val;
    var pos = { x: x, y: y, px: px, py: py };
    var posStr = "ABCDEFG".charAt(pos.x) + "1234567".charAt(pos.y);
    if (posStr === null)
        return;
    _SingleClickHandler(posStr, pos.px, pos.py);
}
;
function _SingleClickHandler(pos, px, py) {
    var param = [[0.3, -0.07, 0.7, 0.3], [-0.07, 0.3, 0.3, 0.7], [0.7, 0.3, 1.07, 0.7], [0.3, 0.7, 0.7, 1.07], [0.3, 0.3, 0.7, 0.7]];
    var lux, luy, rlx, rly;
    var targetTile = _currentDrawState.grid.val[pos];
    var tx = "ABCDEFG".indexOf(pos.charAt(0));
    var ty = "1234567".indexOf(pos.charAt(1));
    var i;
    for (i = 0; i <= 4; i++) {
        lux = param[i][0] * _gridSizeInPix;
        luy = param[i][1] * _gridSizeInPix;
        rlx = param[i][2] * _gridSizeInPix;
        rly = param[i][3] * _gridSizeInPix;
        if (px > lux && px < rlx && py > luy && py < rly) {
            if (i < 4) {
                //window.alert("Direction:"+px+","+py+" @ "+_gridSizeInPix);
                if (!_runonly && !_debugging)
                    _EditInputDirection(targetTile, pos, i);
                return;
            }
            else {
                //window.alert("Edit:"+px+","+py+" @ "+_gridSizeInPix);
                if (_debugging)
                    _DisplayTraceInfo(targetTile, tx, ty);
                else {
                    _EditOperation(targetTile, tx, ty);
                    return;
                }
            }
            gVpglUI.React(_currentDrawState);
            return;
        }
        ;
    }
    ;
    //window.alert("NOP:"+px+","+py+" @ "+_gridSizeInPix);
    if (_debugging && px > 0.7 * _gridSizeInPix && py > 0.7 * _gridSizeInPix)
        _DebugStepOverCommand();
    else if (_debugging && px < 0.3 * _gridSizeInPix && py > 0.7 * _gridSizeInPix)
        _ToggleBreakPoint(_currentDrawState.currentClass, _currentDrawState.currentMethod, pos);
}
;
function _EditInputDirection(targetTile, pos, dir) {
    if (targetTile === null || targetTile === undefined)
        targetTile = { classid: 'Tile', val: { opname: { val: 'FLOW' }, indir: { val: '' }, outdir: { val: '' }, option: { val: '' } } };
    var odir = targetTile['val'].outdir.val;
    var idir = targetTile['val'].indir.val;
    var i = 0;
    if ((i = odir.indexOf("TLRB".charAt(dir))) >= 0) {
        odir = odir.substring(0, i) + odir.substring(i + 1);
    }
    else if ((i = idir.indexOf("TLRB".charAt(dir))) >= 0) {
        idir = idir.substring(0, i) + idir.substring(i + 1);
    }
    else
        idir = idir + "TLRB".charAt(dir);
    targetTile['val']['indir'].val = idir;
    targetTile['val']['outdir'].val = odir;
    gVpglWorker.Cmd({ cmd: 'UpdateTile',
        class: _currentDrawState.currentClass,
        method: _currentDrawState.currentMethod,
        pos: pos,
        val: targetTile });
}
;
function _EditOperation_SetUpOpMenu() {
    var menu = $("#main-ui-tile-edit-oplist");
    $("#main-ui-tile-edit-oplist > option").remove();
    menu.append($('<option>').val("---EMPTY---").text("---EMPTY---"));
    _MLAmethods.forEach(element => {
        menu.append($('<option>').val(element).text(element));
    });
    var ops = _currentDrawState['allmethods'];
    for (let key in ops)
        menu.append($('<option>').val(ops[key]).text(ops[key]));
}
;
function _EditOperation_SetUpOptionMenu() {
    var menu = $("#main-ui-tile-edit-tile-option-list");
    $("#main-ui-tile-edit-tile-option-list > option").remove();
    _MLAoption.forEach(element => {
        menu.append($('<option>').val(element).text(element));
    });
    var ops = ["NIL", "T", "{'Scene': '' 'Geo': ''}"];
    for (let key in ops)
        menu.append($('<option>').val(ops[key]).text(ops[key]));
}
;
function _EditOperation(targetTile, tx, ty) {
    //window.alert("Open edit dialog :" + tx +","+ty);
    var editDialog = $("#main-ui-tile-edit");
    if (targetTile === null || targetTile === undefined)
        targetTile = { classid: 'Tile', val: { opname: { val: '' }, indir: { val: '' }, outdir: { val: '' }, option: { val: '' } } };
    _EditOperation_SetUpOpMenu();
    _EditOperation_SetUpOptionMenu();
    var curopname = targetTile['val'].opname.val;
    var curoption = targetTile['val'].option.val;
    $("#main-ui-tile-edit-operator").val(curopname);
    $("#main-ui-tile-edit-option").val(curoption);
    var posstr = "ABCDEFG".charAt(tx) + (ty + 1);
    editDialog.dialog({
        title: "Edit Grid (" + posstr + "): " + curopname,
        modal: true,
        position: { of: 'body', at: 'center', my: 'center' },
        buttons: {
            "Delete": function () {
                if (_runonly)
                    return;
                $("#main-ui-tile-edit-operator").val("");
                $("#main-ui-tile-edit-option").val("");
                editDialog.dialog('close');
                gVpglWorker.Cmd({ cmd: 'UpdateTile',
                    class: _currentDrawState.currentClass,
                    method: _currentDrawState.currentMethod,
                    pos: posstr,
                    val: null });
            },
            "OK": function () {
                var newopname = $("#main-ui-tile-edit-operator").val();
                var newoption = $("#main-ui-tile-edit-option").val();
                if (newopname === null)
                    newopname = "FLOW";
                if (newopname === "---EMPTY---") {
                    gVpglWorker.Cmd({ cmd: 'UpdateTile',
                        class: _currentDrawState.currentClass,
                        method: _currentDrawState.currentMethod,
                        pos: posstr,
                        val: null });
                    editDialog.dialog('close');
                }
                else if (curopname !== newopname || curoption !== newoption) {
                    if (curopname !== newopname) {
                        targetTile['val'].opname.val = newopname;
                        _RegisterMLAmethod(newopname);
                    }
                    if (curoption !== newoption && newoption !== "")
                        _RegisterMLAoption(newoption);
                    targetTile['val'].option.val = newoption;
                    editDialog.dialog('close');
                    gVpglWorker.Cmd({ cmd: 'UpdateTile',
                        class: _currentDrawState.currentClass,
                        method: _currentDrawState.currentMethod,
                        pos: posstr,
                        val: targetTile });
                }
                gVpglUI.Redraw(_currentDrawState);
                editDialog.dialog('close');
            },
            "Cancel": function () {
                editDialog.dialog('close');
            }
        },
        close: function (e) {
            gVpglUI.Redraw(_currentDrawState);
            editDialog.dialog('close');
        }
    });
}
;
function _OnDoubleClick(e, x, y) {
    var pos = { x: x, y: y, px: e.offsetX, py: e.offsetY };
    ;
    if (pos === null)
        return;
    var posStr = "ABCDEFG".charAt(pos.x) + "1234567".charAt(pos.y);
    var targetTile = _currentDrawState.grid.val[posStr];
    var gridSize = _currentDrawState.grid.val.size.val;
    if (targetTile !== null && targetTile !== undefined) {
        if (_DoubleClickHandler(posStr, pos.px, pos.py)) {
            _ToggleMagnify(pos.x, pos.y);
            gVpglUI.Redraw(_currentDrawState);
        }
    }
    else { // Double tapping on empty tiles makes magify the grid view.
        _ToggleMagnify(pos.x, pos.y);
        gVpglUI.Redraw(_currentDrawState);
    }
    ;
}
;
function _DoubleClickHandler(pos, px, py) {
    var param = [[0.3, -0.07, 0.7, 0.3], [-0.07, 0.3, 0.3, 0.7], [0.7, 0.3, 1.07, 0.7], [0.3, 0.7, 0.7, 1.07], [0.3, 0.3, 0.7, 0.7]];
    var lux, luy, rlx, rly;
    var targetTile = _currentDrawState.grid.val[pos];
    var i;
    for (i = 0; i <= 4; i++) {
        lux = param[i][0] * _gridSizeInPix;
        luy = param[i][1] * _gridSizeInPix;
        rlx = param[i][2] * _gridSizeInPix;
        rly = param[i][3] * _gridSizeInPix;
        if (px > lux && px < rlx && py > luy && py < rly) {
            if (i < 4) {
                if (!_runonly && !_debugging)
                    _EditOutputDirection(targetTile, pos, i);
                gVpglUI.Redraw(_currentDrawState);
                return false;
            }
            else
                return true;
        }
        ;
    }
    ;
    return false;
}
;
function _EditOutputDirection(targetTile, pos, dir) {
    var odir = targetTile['val']['outdir'].val;
    var idir = targetTile['val']['indir'].val;
    var dirc = "TLRB".charAt(dir);
    var i = 0;
    if ((i = odir.indexOf("TLRB".charAt(dir))) >= 0) {
        odir = odir.substring(0, i) + odir.substring(i + 1);
    }
    else if ((i = idir.indexOf("TLRB".charAt(dir))) >= 0) {
        idir = idir.substring(0, i) + idir.substring(i + 1);
    }
    else {
        odir = odir + "TLRB".charAt(dir);
    }
    targetTile['val']['indir'].val = idir;
    targetTile['val']['outdir'].val = odir;
    gVpglWorker.Cmd({ cmd: 'UpdateTile',
        class: _currentDrawState.currentClass,
        method: _currentDrawState.currentMethod,
        pos: pos,
        val: targetTile });
}
;
function _CancelMove() {
    _xMoveFrom = -1;
    _yMoveFrom = -1;
    _xInMove = -1;
    _yInMove = -1;
    _inMove = false;
}
;
function _ToggleMagnify(tileX, tileY) {
    _inMagnify = !_inMagnify;
    _magTargetX = tileX;
    _magTargetY = tileY;
}
;
function _ChangeClassCommand() {
    _CancelMove();
    var newClass = $("#main-ui-selectclass").val();
    gVpglWorker.Cmd({ cmd: 'UiUpdate', needtrace: _debugging,
        curClass: newClass, curMethod: "" });
}
function _ChangeMethodCommand() {
    _CancelMove();
    var newMethod = $("#main-ui-selectmethod").val();
    gVpglWorker.Cmd({ cmd: 'UiUpdate', needtrace: _debugging,
        curClass: _currentDrawState.currentClass, curMethod: newMethod });
}
/* Edit Commands */
function _NewClassCommand() {
    _CancelMove();
    $("#main-ui-class-edit-new").dialog({
        title: "MAKING NEW CLASS",
        modal: true,
        position: { of: 'body', at: 'center', my: 'center' },
        width: 400,
        buttons: {
            "Add Class": function () {
                var classname = $("#main-ui-class-edit-new-name").val();
                var superclasses = JSON.parse($("#main-ui-class-edit-supers").val());
                if (classname !== null && superclasses !== null) {
                    if ((_currentDrawState.classes).indexOf(classname) !== -1) {
                        switch (classname) {
                            case "SUBR":
                            case "Grid":
                            case "Tile":
                                window.alert("'SUBR' 'Grid' 'Tile' ARE SYSTEM RESERVED");
                            default:
                                break;
                        }
                        window.alert("SAME NAME IS ALREADY REGISTERED");
                        return;
                    }
                    gVpglWorker.Cmd({ cmd: 'Update', opr: 'NewClass', class: classname, supers: superclasses });
                }
                ;
                $(this).dialog('close');
            },
            "Close": function () {
                $(this).dialog('close');
                gVpglUI.Redraw(_currentDrawState);
            }
        }
    });
}
;
function _NewMethodCommand() {
    var classname = _currentDrawState.currentClass;
    $("#main-ui-method-edit-new").dialog({
        title: "NEW METHOD of : " + classname,
        modal: true,
        position: { of: 'body', at: 'center', my: 'center' },
        width: 400,
        buttons: {
            "Add Method": function () {
                var opname = $("#main-ui-method-edit-new-name").val();
                var size = +$("#main-ui-method-edit-new-boardsize").val();
                var fireif = ($("#main-ui-method-edit-new-fireif:checked").prop("checked") === true);
                var incond = $("#main-ui-method-edit-new-incond").val();
                var outstr = $("#main-ui-method-edit-new-outdir").val();
                if (opname !== null) {
                    var methods = _currentDrawState.methods;
                    if (methods.indexOf(opname) !== -1) {
                        var override = window.confirm("THIS METHOD IS ALREADY REGISTERED IN IT OR ITS SUPERS. OVERRIDE?");
                        if (!override) {
                            return;
                        }
                        ;
                    }
                }
                ;
                $(this).dialog('close');
                gVpglWorker.Cmd({ cmd: 'Update', opr: 'NewMethod', class: classname, method: opname,
                    val: { size: size, opname: opname, indir: incond, outdir: outstr, ifall: fireif } });
            },
            "Close": function () {
                $(this).dialog('close');
                gVpglUI.Redraw(_currentDrawState);
            }
        }
    });
}
;
function _OnGridManipulate() {
    var command = $('#main-ui-tile-manipulation-opname').val();
    switch (command) {
        case 'Clear This Method':
            _CancelMove();
            gVpglWorker.Cmd({ cmd: "GridClear", class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod });
            break;
        case 'Delete This Method':
            _CancelMove();
            gVpglWorker.Cmd({ cmd: "GridDelete", class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod });
            break;
        case 'Rename This Method':
            var newname = window.prompt("Rename to: (may overwite if already exists)");
            if (newname === null || newname === "")
                return;
            _CancelMove();
            gVpglWorker.Cmd({ cmd: "GridRename", class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod, newname: newname });
            break;
        case 'Copy This Method':
            var newname = window.prompt("Copy to: (may overwite if already exists)");
            if (newname === null || newname === "")
                return;
            _CancelMove();
            gVpglWorker.Cmd({ cmd: "GridCopy", class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod, newname: newname });
            break;
        case 'Expand':
            _CancelMove();
            gVpglWorker.Cmd({ cmd: "GridExpand", class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod });
            break;
        case 'Shrink':
            _CancelMove();
            gVpglWorker.Cmd({ cmd: "GridShrink", class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod });
            break;
        case 'Shift Up':
            _CancelMove();
            gVpglWorker.Cmd({ cmd: "GridShift", class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod, x: 0, y: -1 });
            break;
        case 'Shift Down':
            _CancelMove();
            gVpglWorker.Cmd({ cmd: "GridShift", class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod, x: 0, y: 1 });
            break;
        case 'Shift Left':
            _CancelMove();
            gVpglWorker.Cmd({ cmd: "GridShift", class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod, x: -1, y: 0 });
            break;
        case 'Shift Right':
            _CancelMove();
            gVpglWorker.Cmd({ cmd: "GridShift", class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod, x: 1, y: 0 });
            break;
        default:
            window.alert(command + " is not implemented");
    }
    ;
    $('#main-ui-tile-manipulation-opname').val("SelectOp");
}
;
function UIChangeForDebug() {
    $('#main-ui-grid-incond').attr("readonly", "true");
    $('#main-ui-grid-outdir').attr("readonly", "true");
    $('#main-ui-grid-ifall').attr("disabled", "true");
    document.getElementById("main-ui-debug-buttons").style.display = 'block';
    document.getElementById("main-ui-edit-buttons").style.display = 'none';
}
;
var UIChangeEscapeFromDbeug = function () {
    'block';
    $('#main-ui-grid-incond').attr("readonly", null);
    $('#main-ui-grid-outdir').attr("readonly", null);
    $('#main-ui-grid-ifall').attr("disabled", null);
    document.getElementById("main-ui-debug-buttons").style.display = 'none';
    document.getElementById("main-ui-edit-buttons").style.display = 'block';
};
function _DebugCommand() {
    UIChangeForDebug();
    _debugging = true;
    gVpglWorker.Cmd({ cmd: "StartDebug" });
    _RunCommand();
}
;
var _DebugStopDebugCommand = function () {
    UIChangeEscapeFromDbeug();
    _debugging = false;
    gVpglWorker.Cmd({ cmd: "StopDebug" });
    gVpglWorker.Cmd({ cmd: "UiUpdate", curClass: _currentDrawState.currentClass, curMethod: _currentDrawState.currentMethod });
};
function _OnChangeIncond() {
    var newIdir = $("#main-ui-grid-incond").val();
    gVpglWorker.Cmd({ cmd: 'Update', opr: 'UpdateMethod', class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod,
        val: { indir: newIdir } });
}
;
function _OnChangeOutDir() {
    var newOdir = $("#main-ui-grid-outdir").val();
    gVpglWorker.Cmd({ cmd: 'Update', opr: 'UpdateMethod', class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod,
        val: { outdir: newOdir } });
}
;
function _OnChangeIfAll() {
    var newIfall = $("#main-ui-grid-ifall").prop('checked');
    gVpglWorker.Cmd({ cmd: 'Update', opr: 'UpdateMethod', class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod,
        val: { ifall: newIfall } });
}
;
function _OnChangeRemark() {
    var remark = $("#main-ui-method-remark").val();
    gVpglWorker.Cmd({ cmd: 'Update', opr: 'UpdateMethod', class: _currentDrawState.currentClass, method: _currentDrawState.currentMethod,
        val: { remark: remark } });
}
;
export function _allVM() {
    gVpglWorker.Cmd({ cmd: "AllVM" });
}
;
function _HandleLoad(overwrite) {
    var outload = JSON.parse($('#loadsave-console').val());
    Set3DWorld(outload.models);
    gVpglWorker.Cmd({ cmd: 'LoadVM', overwrite: overwrite, val: $('#loadsave-console').val() });
}
;
var consoleFull = false;
function _OnchangeConsoleSize() {
    //var fullsize: boolean = <boolean>$("#main-ui-console-full").prop('checked');
    if (!consoleFull)
        $('#main-ui-console').height(16 * 20 + "pt");
    else
        $('#main-ui-console').height(16 * 2 + "pt");
    consoleFull = !consoleFull;
}
/* Debugging procs */
function _ToggleBreakPoint(cls, mtd, pos) {
    gVpglWorker.Cmd({ cmd: "ToggleBP", class: cls, method: mtd, pos: pos, cxtid: _currentDrawState.cxtid });
}
;
function _DebugStepInCommand() { gVpglWorker.Cmd({ cmd: "StepIn", cxtid: _currentDrawState.cxtid }); }
;
function _DebugStepOverCommand() { gVpglWorker.Cmd({ cmd: "StepOver", cxtid: _currentDrawState.cxtid }); }
;
function _DebugStepOutCommand() { gVpglWorker.Cmd({ cmd: "StepOut", cxtid: _currentDrawState.cxtid }); }
;
function _DebugStepContinueCommand() { gVpglWorker.Cmd({ cmd: "DebugContinue", cxtid: _currentDrawState.cxtid }); }
;
function _DebugClearBPsCommand() { gVpglWorker.Cmd({ cmd: "ClearBreakPoints", cxtid: _currentDrawState.cxtid }); }
;
function _DebugTimerRunOutCommand() {
    VpglGUI.DebugTimerTick();
}
;
function _DisplayTraceInfo(targetTile, tx, ty) {
    var posstr = "ABCDEFG".charAt(tx) + "1234567".charAt(ty);
    var tinfo = _currentDrawState.traceinfo[posstr];
    if (tinfo === undefined || tinfo === null)
        return;
    var tval = (tinfo.topToken === null) ? "" : tinfo.topToken;
    var lval = (tinfo.leftToken === null) ? "" : tinfo.leftToken;
    var rval = (tinfo.rightToken === null) ? "" : tinfo.rightToken;
    var bval = (tinfo.bottomToken === null) ? "" : tinfo.bottomToken;
    var msg = "Top: " + tval + "\nLeft: " + lval + "\nRight: " + rval + "\nBottom: " + bval + "\n\n";
    msg = msg + "Break:" + (tinfo.setBP ? "ON" : "OFF") + "\n Change BreakPoint?";
    var toggle = window.confirm("Info at (" + posstr + ")\n" + msg);
    if (toggle) {
        _ToggleBreakPoint(_currentDrawState.currentClass, _currentDrawState.currentMethod, posstr);
    }
    ; // Confirm(); 
}
;
var _displaySticky = false;
var _warningcount = 10000;
var _initialDisplayClass = "App";
var _initialDisplayMethod = "Mainline";
//var _displaypeg = false;
var _initialscriptstring = null;
var _initialuipane = false;
var _OptionParsingAndLoadIfSpecified = function () {
    var urloption = location.search.substring(1);
    var urlarg = new Object;
    var initialscript = null;
    if (urloption !== "") {
        var pair = urloption.split('&');
        for (var i = 0; pair[i]; i++) {
            var keyandval = pair[i].split('=');
            urlarg[keyandval[0]] = keyandval[1];
        }
        if (urlarg['m'] === "r")
            _runonly = true;
        if (urlarg['m'] === "p") {
            _runonly = true;
            _initialuipane = true;
        }
        ;
        if (urlarg['m'] === "s") {
            _runonly = true;
            _displaySticky = true;
        }
        ;
        if (urlarg['z'] === "false") {
            _enable3D = false;
        }
        ;
        if (urlarg['e'] !== undefined)
            _warningcount = urlarg['e'];
        if (urlarg['s'] !== undefined)
            initialscript = urlarg['s'];
        if (urlarg['c'] !== undefined)
            _initialDisplayClass = urlarg['c'];
        if (urlarg['t'] !== undefined)
            _initialDisplayMethod = urlarg['t'];
        //if(urlarg['p']!==undefined) _displaypeg = urlarg['p'];
        if (_runonly === true) {
            $('#main-ui-edit-buttons').attr("style", "display:none");
            $('#main-tab-switch-load-save').attr("style", "display:none");
            $('#main-ui-grid-incond').attr("readonly", "true");
            $('#main-ui-grid-outdir').attr("readonly", "true");
            $('#main-ui-grid-ifall').attr("disabled", "true");
            $("#main-ui-tile-edit-operator").attr("disabled", "true");
            $("#main-ui-tile-edit-option").attr("disabled", "true");
        }
        if (_displaySticky === true) {
            $('#main-ui-selectclass').attr("disabled", "true");
            $('#main-ui-selectmethod').attr("disabled", "true");
            $('#main-ui-DebugButton')[0].style.display = "none";
        }
        if (initialscript !== null) {
            var request = new XMLHttpRequest();
            request.addEventListener("load", function (e) {
                _initialscriptstring = request.responseText;
                if (_initialscriptstring === "") {
                    _initialscriptstring = null;
                    window.alert("Failing initial loading..");
                }
                else {
                    $('#loadsave-console').val(_initialscriptstring);
                    _HandleLoad(true);
                    _initialscriptstring = null;
                    gVpglWorker.Cmd({ cmd: 'UiUpdate', needtrace: _debugging, curClass: _initialDisplayClass, curMethod: _initialDisplayMethod });
                }
            });
            request.addEventListener("error", function (e) {
                window.alert(JSON.stringify(e));
            });
            request.addEventListener("abort", function (e) {
                window.alert("abort");
            });
            request.open("GET", initialscript);
            request.send();
        }
        ;
    }
    ;
};
window.onload = function _onload() {
    gVpglWorker = new VpglMtWorker();
    gVpglUI = (gUseGUI) ? (new VpglGUI()) : (new VpglCLI());
    _debugging = false;
    _OptionParsingAndLoadIfSpecified();
    gVpglUI.Initialize();
    if (_enable3D === false) {
        $('#tab2')[0].style.display = "none";
        $('#tab3')[0].style.display = "none";
    }
    $('#tab0')[0].addEventListener('click', function () { _maintabsChange('tab0'); });
    $('#tab1')[0].addEventListener('click', function () { _maintabsChange('tab1'); });
    $('#tab2')[0].addEventListener('click', function () { _maintabsChange('tab2'); });
    $('#tab3')[0].addEventListener('click', function () { _maintabsChange('tab3'); });
    $('#saveToFile')[0].addEventListener('click', function () { _handleSave(); });
    $('#loadFromFile')[0].addEventListener('click', function () { _handleLoad(null); });
    $('#overWrite')[0].addEventListener('click', function () { _HandleLoad(true); });
    $('#mergeIn')[0].addEventListener('click', function () { _HandleLoad(false); });
    $('#main-ui-RunButton')[0].addEventListener('click', function () { _RunCommand(); });
    $('#main-ui-DebugButton')[0].addEventListener('click', function () { _DebugCommand(); });
    $('#main-ui-step-in')[0].addEventListener('click', function () { _DebugStepInCommand(); });
    $('#main-ui-step-over')[0].addEventListener('click', function () { _DebugStepOverCommand(); });
    $('#main-ui-step-out')[0].addEventListener('click', function () { _DebugStepOutCommand(); });
    $('#main-ui-continue')[0].addEventListener('click', function () { _DebugStepContinueCommand(); });
    $('#main-ui-stop-debug')[0].addEventListener('click', function () { _DebugStopDebugCommand(); });
    $('#main-ui-clear-bp')[0].addEventListener('click', function () { _DebugClearBPsCommand(); });
    $('#main-ui-timer-tick')[0].addEventListener('click', function () { _DebugTimerRunOutCommand(); });
    $('#main-ui-new-class')[0].addEventListener('click', function () { _NewClassCommand(); });
    $('#main-ui-new-method')[0].addEventListener('click', function () { _NewMethodCommand(); });
    $('#main-ui-tile-manipulation-opname')[0].addEventListener('change', function () { _OnGridManipulate(); });
    $('#main-ui-selectclass')[0].addEventListener('change', function () { _ChangeClassCommand(); });
    $('#main-ui-selectmethod')[0].addEventListener('change', function () { _ChangeMethodCommand(); });
    $('#main-ui-method-remark')[0].addEventListener('change', function () { _OnChangeRemark(); });
    $('#main-ui-grid-incond')[0].addEventListener('change', function () { _OnChangeIncond(); });
    $('#main-ui-grid-outdir')[0].addEventListener('change', function () { _OnChangeOutDir(); });
    $('#main-ui-grid-ifall')[0].addEventListener('change', function () { _OnChangeIfAll(); });
    (function () { _jqconsole = $('#main-ui-console').jqconsole("Welcome To VPGL\n", ">>>"); })();
    $('#uipane-run')[0].addEventListener('click', function () { _RunCommand(); });
    $('#uipane-break')[0].addEventListener('click', function () { _BreakCommand(); });
    GeoeUIInit();
    if (_initialuipane) {
        _maintabsChange('tab1');
    }
    ;
};
window.onresize = function _onresize() {
    if (gVpglUI !== null)
        gVpglUI.UpdateDisplay();
};
//}
//# sourceMappingURL=vpgl.js.map