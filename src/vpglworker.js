// import { isRegularExpressionLiteral } from "typescript";
var DirectionW;
(function (DirectionW) {
    DirectionW[DirectionW["top"] = 0] = "top";
    DirectionW[DirectionW["left"] = 1] = "left";
    DirectionW[DirectionW["right"] = 2] = "right";
    DirectionW[DirectionW["bottom"] = 3] = "bottom";
    DirectionW[DirectionW["void"] = 4] = "void";
})(DirectionW || (DirectionW = {}));
;
var ExecOption;
(function (ExecOption) {
    ExecOption[ExecOption["normal"] = 0] = "normal";
    ExecOption[ExecOption["stepIn"] = 1] = "stepIn";
    ExecOption[ExecOption["stepOver"] = 2] = "stepOver";
    ExecOption[ExecOption["stepOut"] = 3] = "stepOut";
    ExecOption[ExecOption["continue"] = 4] = "continue";
})(ExecOption || (ExecOption = {}));
;
var Status;
(function (Status) {
    Status[Status["waiting"] = 0] = "waiting";
    Status[Status["canbetry"] = 1] = "canbetry";
    Status[Status["waitingforchild"] = 2] = "waitingforchild";
    Status[Status["blocked"] = 3] = "blocked";
    Status[Status["resumeFromWaiting"] = 4] = "resumeFromWaiting";
    Status[Status["breaking"] = 5] = "breaking";
})(Status || (Status = {}));
;
var ReturnCode;
(function (ReturnCode) {
    ReturnCode[ReturnCode["ok"] = 0] = "ok";
    ReturnCode[ReturnCode["canDoMore"] = 1] = "canDoMore";
    ReturnCode[ReturnCode["exhausted"] = 2] = "exhausted";
    ReturnCode[ReturnCode["executionEND"] = 3] = "executionEND";
    ReturnCode[ReturnCode["executionHALT"] = 4] = "executionHALT";
    ReturnCode[ReturnCode["executionComplete"] = 5] = "executionComplete";
    ReturnCode[ReturnCode["error"] = 6] = "error";
    ReturnCode[ReturnCode["noSuchOp"] = 7] = "noSuchOp";
    ReturnCode[ReturnCode["needMoreToken"] = 8] = "needMoreToken";
    ReturnCode[ReturnCode["notImplementedCase"] = 9] = "notImplementedCase";
    ReturnCode[ReturnCode["blocking"] = 10] = "blocking";
    ReturnCode[ReturnCode["featureIsNotImplemeted"] = 11] = "featureIsNotImplemeted";
    ReturnCode[ReturnCode["malformed"] = 12] = "malformed";
    ReturnCode[ReturnCode["versionMismatch"] = 13] = "versionMismatch";
    ReturnCode[ReturnCode["subclassResponsibility"] = 14] = "subclassResponsibility";
    ReturnCode[ReturnCode["requireContext"] = 15] = "requireContext";
    ReturnCode[ReturnCode["rejectedByVoid"] = 16] = "rejectedByVoid";
    ReturnCode[ReturnCode["somethingRemain"] = 17] = "somethingRemain";
    ReturnCode[ReturnCode["breakStop"] = 18] = "breakStop";
    ReturnCode[ReturnCode["stepStop"] = 19] = "stepStop";
})(ReturnCode || (ReturnCode = {}));
;
var BreakPointState;
(function (BreakPointState) {
    BreakPointState[BreakPointState["off"] = 0] = "off";
    BreakPointState[BreakPointState["on"] = 1] = "on";
    BreakPointState[BreakPointState["absent"] = 2] = "absent";
    BreakPointState[BreakPointState["hit"] = 3] = "hit";
})(BreakPointState || (BreakPointState = {}));
;
const BreakPointKey = "VPGLDebugBreakPoint";
const ClassNameKey = "CLASSNAME";
const SuperClassesKey = "SUPERCLASSES";
const SingletonKey = "SINGLETON";
var _SUBRDepo = [[]];
var _eventid = 0;
function _NewEventId() {
    _eventid++;
    return _eventid;
}
;
class MetaToken {
    EvalStep(mode, cxT, opname, option, inTokenInOrder) {
        return { status: "No Such Op: " + opname, ret: ReturnCode.noSuchOp, outputInOrder: [null, null, null] };
    }
    ;
}
;
class Token extends MetaToken {
    constructor() { super(); this.tosave = true; this.classid = null; this.val = null; }
    ;
    static NewInstance(typeid, val) {
        if (Token.builtInClasses[typeid] === undefined)
            return null;
        return Token.builtInClasses[typeid].newInstance(val);
    }
    ;
    static FromLiteral(literal) {
        literal = literal.trim();
        for (let cls in Token.builtInClasses) {
            var result = Token.builtInClasses[cls].fromLiteral(literal);
            if (result !== null)
                return result;
        }
        return { val: null, rest: literal };
    }
    ;
    ToLiteral() { return this.AsString(); }
    ;
    static IsDelimitter(char) {
        return ("+- \t\n\\r\.,:\"'{[}]<>".indexOf(char.charAt(0)) !== -1);
    }
    static lex(lit) {
        lit = lit.trim();
        var rst = lit.substr(1);
        var cc = lit.substr(0, 1);
        var ll = "";
        if (lit === null || lit === "")
            return { val: "", rest: "" };
        if (Token.IsDelimitter(cc))
            return { val: cc, rest: rst };
        ll += cc;
        cc = rst.substr(0, 1);
        rst = rst.substr(1);
        while (!this.IsDelimitter(cc)) {
            if (rst === "")
                return { val: ll + cc, rest: "" };
            ll += cc;
            cc = rst.substr(0, 1);
            rst = rst.substr(1);
        }
        ;
        return { val: ll, rest: cc + rst };
    }
    ;
    static JSONReciver(key, value) {
        if (value === null)
            return null;
        var typeid = value.classid;
        if (typeid === undefined)
            return value;
        var reciever = Token.builtInClasses[typeid].reciever;
        if (reciever === undefined)
            return value;
        return reciever(key, value);
    }
    ;
    static JSONReplacer(key, value) {
        if (value === undefined || value === null)
            return;
        if (value.tosave !== undefined && !value.tosave)
            return;
        var classid = value.classid;
        if (classid === undefined)
            return value;
        var replacer = Token.builtInClasses[classid].replacer;
        if (replacer === undefined)
            return value;
        return replacer(key, value);
    }
    ;
    static FromJSStruct(val) {
        if (val.classid === undefined)
            return val;
        if (val.val === undefined && val.arrayval === undefined)
            return Token.NewInstance(val.classid, val);
        if (val.val !== undefined) {
            var tokenized = {};
            for (let elemkey in val.val) {
                tokenized[elemkey] = Token.FromJSStruct(val.val[elemkey]);
            }
            ;
            return Token.NewInstance(val.classid, tokenized);
        }
        if (val.arrayval !== undefined) {
            var tokenizedA = [];
            for (let idx in val.arrayval) {
                tokenizedA[idx] = Token.FromJSStruct(val.arrayval[idx]);
            }
            ;
            return Token.NewInstance(val.classid, tokenizedA);
        }
        return null;
    }
    ;
    static InstallClass(classname, ni, fl, rc, rp) {
        Token.builtInClasses[classname] = { newInstance: ni, fromLiteral: fl, reciever: rc, replacer: rp };
    }
    ;
    ClassId() { return this.classid; }
    ;
    // Overridden if needed.
    IsVoid() { return false; }
    ;
    AsNumber() { return null; }
    ;
    AsString() { return null; }
    ;
    AsBool() { return null; }
    ;
    Put(key, val) { try {
        this.val.Put(key, val);
    }
    catch (e) { } }
    ;
    Get(key) { var r = null; try {
        r = this.val.Get(key);
    }
    catch (e) {
        r = null;
    } return r; }
    ;
    EQ(dest) { return false; }
    ;
    ForAll(f) { }
    ;
    EvalStep(mode, cxT, opname, option, inTokenInOrder) {
        var clsdef = VPGLGlobalDataBase.Get(this.classid);
        if (clsdef !== undefined) {
            var method = clsdef.Get(opname);
            if (method !== undefined)
                return method.EvalStep(mode, cxT, opname, option, inTokenInOrder);
        }
        ;
        var subr = this.Where(opname);
        if (subr === undefined)
            return super.EvalStep(mode, cxT, opname, option, inTokenInOrder);
        return subr.EvalStep(mode, cxT, opname, option, inTokenInOrder);
    }
    ;
    SearchSC(cls, key) {
        var result = null;
        var clsdef = VPGLGlobalDataBase.Get(cls);
        if (clsdef === undefined || clsdef === null)
            return null;
        var sclist = clsdef.Get(SuperClassesKey);
        var self = this;
        sclist.ForAll(function (xkey, val) {
            var clsname = val.AsString();
            if (clsname === undefined || clsname === null)
                return false;
            var cld = VPGLGlobalDataBase.Get(clsname);
            if (cld !== undefined && cld !== null) {
                result = cld.Get(key);
                if (result !== undefined && result !== null)
                    return true;
            }
            if (_SUBRDepo[clsname] !== undefined && _SUBRDepo[clsname] !== null) {
                result = _SUBRDepo[clsname][key];
                if (result !== undefined && result !== null)
                    return true;
            }
            result = self.SearchSC(clsname, key);
            if (result !== undefined && result !== null)
                return true;
            return false;
        });
        return result;
    }
    ;
    Where(key) {
        var result = this.Get(key);
        if (result !== undefined && result !== null)
            return result;
        var clsdef = VPGLGlobalDataBase.Get(this.ClassId());
        if (clsdef !== undefined && clsdef !== null) {
            result = clsdef.Get(key);
            if (result !== undefined && result !== null)
                return result;
        }
        ;
        if (_SUBRDepo[this.ClassId()] !== undefined && _SUBRDepo[this.ClassId()] !== null) {
            result = _SUBRDepo[this.ClassId()][key];
            if (result !== undefined && result !== null)
                return result;
        }
        ;
        return this.SearchSC(this.ClassId(), key);
    }
    ;
    DeepFindMethod(cname, key) {
        if (key === '' || key === undefined || key === null)
            return { target: null, clsname: cname };
        var result = this.val[key];
        if (result !== undefined && result !== null)
            return { target: result, clsname: cname };
        var clsdef = VPGLGlobalDataBase.Get(this.ClassId());
        if (clsdef !== undefined && clsdef !== null) {
            result = clsdef.Get(key);
            if (result !== undefined && result !== null)
                return { target: result, clsname: cname };
        }
        ;
        if (_SUBRDepo[this.ClassId()] !== undefined && _SUBRDepo[this.ClassId()] !== null) {
            result = _SUBRDepo[this.ClassId()][key];
            if (result !== undefined && result !== null)
                return { target: result, clsname: cname };
        }
        ;
        var sc = this.val[SuperClassesKey];
        if (sc !== undefined && sc !== null) {
            var scs = sc.val;
            for (var i = 0; i < scs.length; i++) {
                var clss = scs[i].AsString();
                var sctoken = VPGLGlobalDataBase.Get(clss);
                if (sctoken === undefined || sctoken === null)
                    continue;
                var rstruct = sctoken.DeepFindMethod(clss, key);
                if (rstruct !== null)
                    return rstruct;
            }
            ;
        }
        return { target: null, clsname: cname };
    }
}
Token.builtInClasses = [];
;
class VPGLGlobalDataBase {
    static Get(key) {
        return this.constlist.Get(key);
    }
    ;
    static ForAll(func) {
        for (let key in this.constlist) {
            if (func(key, this.constlist[key]))
                break;
        }
        ;
    }
    ;
    static Put(key, val, tosave) {
        val.tosave = tosave;
        this.constlist.Put(key, val);
    }
    ;
    static Classes() {
        var result = [];
        VPGLGlobalDataBase.constlist.ForAll(function (key, val) { result.push(key); return false; });
        return result;
    }
    ;
    static Members(clsname) {
        var result = [];
        var cls = VPGLGlobalDataBase.Get(clsname);
        cls.ForAll(function (key, val) {
            if (key !== SuperClassesKey)
                result.push(key);
            return false;
        });
        return result;
    }
    ;
    static PickUpForSourceOut() {
        return VPGLGlobalDataBase.constlist;
    }
    ;
    static SourceOut() {
        this.ClearAllBreakPoints();
        var loadimage = this.PickUpForSourceOut();
        //return JSON.stringify(loadimage, Token.JSONReplacer , "  ");
        return JSON.stringify(loadimage, Token.JSONReplacer); // packed
    }
    ;
    static SourceIn(source, overwrite) {
        if (overwrite)
            gDB.Initialize();
        var newmembers = JSON.parse(source, Token.JSONReciver).outload;
        newmembers.ForAll(function (key, val) {
            VPGLGlobalDataBase.Put(key, val, true); // keep it to save.
            return false;
        });
    }
    ;
    Initialize() {
        VPGLGlobalDataBase.constlist = DictToken.NewInstance({});
        VoidToken.RegisterSelf();
        TToken.RegisterSelf();
        NILToken.RegisterSelf();
        NumberToken.RegisterSelf();
        ArrayToken.RegisterSelf();
        StringToken.RegisterSelf();
        TimerToken.RegisterSelf();
        DictToken.RegisterSelf();
        GridToken.RegisterSelf();
        TileToken.RegisterSelf();
        if (_enable3D) {
            ThreeDToken.RegisterSelf();
            Scene3DToken.RegisterSelf();
            Geometry3DToken.RegisterSelf();
        }
        ;
        AppToken.RegisterSelf();
        UserDefinedClassToken.RegisterSelf();
        var appClass = Token.NewInstance("App", {});
        var mainlineMethod = GridToken.NewInstance(Token.FromLiteral('{"opname": "Mainline" "size": 7 "indir": "T" "outdir": "" "ifall": T}').val);
        mainlineMethod.Put("D1", Token.NewInstance("Tile", Token.FromLiteral('{"indir": "T" "outdir": "B" "opname": "CONST" "option": "\'HELLO WORLD\'" }').val));
        mainlineMethod.Put("D2", Token.NewInstance("Tile", Token.FromLiteral('{"indir": "T" "outdir": "B" "opname": "ALRT" "option": "" }').val));
        mainlineMethod.Put("D3", Token.NewInstance("Tile", Token.FromLiteral('{"indir": "T" "outdir": "" "opname": "STOP" "option": ""}').val));
        appClass.Put("Mainline", mainlineMethod);
        appClass.Put(SuperClassesKey, Token.NewInstance("Array", [StringToken.NewInstance("Dictionary")]));
        VPGLGlobalDataBase.Put("App", appClass, true);
    }
    ;
    static RegisterBreakPoint(classname, methodname, posstr) {
        var len = VPGLGlobalDataBase.breakPointList.length;
        for (var i = 0; i < len; i++) {
            var e = VPGLGlobalDataBase.breakPointList[i];
            if (e.cname === classname && e.mname === methodname && e.posstr === posstr)
                return;
        }
        VPGLGlobalDataBase.breakPointList[len] = { cname: classname, mname: methodname, posstr: posstr };
    }
    ;
    static UnregisterBreakPoint(classname, methodname, posstr) {
        var len = VPGLGlobalDataBase.breakPointList.length;
        for (var i = 0; i < len; i++) {
            var e = VPGLGlobalDataBase.breakPointList[i];
            if (e.cname === classname && e.mname === methodname && e.posstr === posstr) {
                VPGLGlobalDataBase.breakPointList.splice(i, 1);
                return;
            }
        }
        postMessage({ cmd: 'ERROR', msg: "Unregister BP - No such BP: " + classname + ":" + methodname + ":" + posstr }, null);
    }
    ;
    static ClearAllBreakPoints() {
        for (var i = 0; i < VPGLGlobalDataBase.breakPointList.length; i++) {
            var e = VPGLGlobalDataBase.breakPointList[i];
            var ctk = VPGLGlobalDataBase.Get(e.cname);
            if (ctk !== undefined && ctk !== null) {
                var mtk = ctk.Get(e.mname);
                if (mtk !== undefined && mtk !== null) {
                    var ptk = mtk.Get(e.posstr);
                    if (ptk !== undefined && ptk !== null) {
                        ptk.Put(BreakPointKey, null);
                    }
                    ;
                }
                ;
            }
            ;
        }
        ;
        VPGLGlobalDataBase.breakPointList = [];
    }
    ;
    static BPHitToOn() {
        for (var i = 0; i < VPGLGlobalDataBase.breakPointList.length; i++) {
            var e = VPGLGlobalDataBase.breakPointList[i];
            var cls = VPGLGlobalDataBase.Get(e.cname);
            var mtd = cls.Get(e.mname);
            var ctk = mtd.Get(e.posstr);
            if (ctk !== undefined && ctk !== null) {
                var mtk = ctk.Get(e.mname);
                if (mtk !== undefined && mtk !== null) {
                    var ptk = mtk.Get(e.posstr);
                    if (ptk !== undefined && ptk !== null) {
                        var btk = ptk.Get(BreakPointKey);
                        if (btk !== undefined && btk !== null) {
                            var bp = btk.AsNumber();
                            if (bp === BreakPointState.hit)
                                btk.Put(BreakPointKey, NumberToken.NewInstance(BreakPointState.on));
                        }
                        ;
                    }
                    ;
                }
                ;
            }
            ;
        }
        ;
    }
    ;
}
VPGLGlobalDataBase.constlist = null;
VPGLGlobalDataBase.breakPointList = [];
;
class VoidToken extends Token {
    constructor() { super(); this.classid = VoidToken.classidstr; this.val = null; }
    static NewInstance(val) { return VoidToken.theVOID; }
    ;
    static FromLiteral(literal) {
        var result = Token.lex(literal);
        if (result.val === "void")
            return { val: VoidToken.theVOID, rest: result.rest };
        else
            return null;
    }
    ;
    Clone() { return this; }
    ToJSStruct() { return "void"; }
    ;
    static JSONRcv(key, value) { return VoidToken.theVOID; }
    ;
    static JSONRpl(key, value) { return { "classid": "void" }; }
    ;
    IsVoid() { return true; }
    ;
    Put(key, val) { }
    ;
    Get(key) { return null; }
    ;
    static RegisterSelf() {
        Token.InstallClass("void", VoidToken.NewInstance, VoidToken.FromLiteral, VoidToken.JSONRcv, VoidToken.JSONRpl);
        var initval = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([]));
        _SUBRDepo["void"] = VoidToken.subrcoll;
        VPGLGlobalDataBase.Put("Void", initval, false);
    }
    ;
}
VoidToken.subrcoll = [];
VoidToken.classidstr = "Void";
VoidToken.theVOID = new VoidToken();
;
class TToken extends VoidToken {
    constructor() { super(); this.classid = TToken.classidstr; this.val = null; }
    ;
    static NewInstance(val) { return TToken.theT; }
    ;
    static FromLiteral(literal) {
        var result = Token.lex(literal);
        if (result.val === "T")
            return { val: TToken.theT, rest: result.rest };
        else
            return null;
    }
    ;
    Clone() { return TToken.theT; }
    ;
    ToJSStruct() { return true; }
    ;
    static JSONRcv(key, value) { return TToken.theT; }
    ;
    static JSONRpl(key, value) { return { classid: "T" }; }
    ;
    IsVoid() { return false; }
    ;
    AsBool() { return true; }
    ;
    AsString() { return "T"; }
    ;
    EQ(dest) { return false; }
    ;
    Put(key, val) { }
    ;
    Get(key) { return null; }
    ;
    // SUBRs
    static TNOT(mode, cxt, inTokenInOrder, option) {
        return { status: "T::GDB", ret: ReturnCode.ok, outputInOrder: [NILToken.NewInstance(null), null, null, null] };
    }
    ;
    static CONST(mode, cxt, inTokenInOrder, option) {
        var val = Token.FromLiteral(option);
        if (val === null)
            return { status: "CONST: option is malformed", ret: ReturnCode.error, outputInOrder: [null, null, null] };
        return { status: "T::CONST", ret: ReturnCode.ok, outputInOrder: [val.val, null, null] };
    }
    ;
    static OPTION(mode, cxt, inTokenInOrder, option) {
        var val = null;
        if (cxt.parent !== null && cxt.parent.parent !== null)
            val = Token.FromLiteral(cxt.parent.parent.option);
        var result = null;
        if (val === null || val.val === null)
            result = VoidToken.NewInstance(null);
        else
            result = val.val;
        return { status: "T::OPTION", ret: ReturnCode.ok, outputInOrder: [result, null, null] };
    }
    static GDB(mode, cxt, inTokenInOrder, option) {
        return { status: "T::GDB", ret: ReturnCode.ok, outputInOrder: [VPGLGlobalDataBase.constlist, null, null, null] };
    }
    ;
    static EQ(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === undefined || inTokenInOrder[0] === null)
            return { status: "EQ of T", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var opttoken = null;
        if (option !== undefined && option !== null && option !== '')
            opttoken = Token.FromLiteral(option).val;
        if ((opttoken === undefined || opttoken === null) && inTokenInOrder[1] === null)
            return { status: "EQ of T", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var result = inTokenInOrder[0].EQ(opttoken !== null ? opttoken : inTokenInOrder[1]);
        return { status: "T::EQ", ret: ReturnCode.ok, outputInOrder: [result ? TToken.NewInstance(null) : NILToken.NewInstance(null), null, null, null] };
    }
    ;
    static RANDOM(mode, cxt, inTokenInOrder, option) {
        var range = 1;
        if (option !== undefined && option !== null && option !== '') {
            var opttoken = Token.FromLiteral(option).val;
            range = opttoken.AsNumber();
            if (range === undefined || range === null)
                return { status: "T::RANDOM - option must be number", ret: ReturnCode.error, outputInOrder: null };
        }
        var result = Math.random() * range;
        return { status: "T::RANDOM", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(result), null, null, null] };
    }
    ;
    static ARRAY2(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return { status: "TARRAY2", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var val = Token.NewInstance('Array', [inTokenInOrder[0], inTokenInOrder[1]]);
        return { status: "T::ARRAY2", ret: ReturnCode.ok, outputInOrder: [val, null, null] };
    }
    ;
    static ARRAY3(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null || inTokenInOrder[1] === null || inTokenInOrder[2] == null)
            return { status: "TARRAY3", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var val = Token.NewInstance('Array', [inTokenInOrder[0], inTokenInOrder[1], inTokenInOrder[2]]);
        return { status: "T::ARRAY3", ret: ReturnCode.ok, outputInOrder: [val, null, null] };
    }
    ;
    static INPUT(mode, cxt, inTokenInOrder, option) {
        var eid = _NewEventId();
        var prompt = "Please Input";
        if (option !== undefined && option !== null) {
            var pt = Token.FromLiteral(option).val;
            if (pt != undefined && pt !== null)
                prompt = pt.ToLiteral();
        }
        ;
        postMessage({ cmd: "Input", prompt: prompt, eid: eid, exmode: mode }, null);
        cxt.status = Status.blocked;
        _suspendedContext[eid] = cxt;
        return { status: "INPUT", ret: ReturnCode.blocking, outputInOrder: [NumberToken.NewInstance(eid), null, null, null] };
    }
    ;
    static ALRT(mode, cxt, inTokenInOrder, option) {
        var val = inTokenInOrder[0].ToLiteral();
        var prompt = null;
        if (option !== undefined && option !== null && option !== '')
            prompt = Token.FromLiteral(option).val.ToLiteral();
        var outs = prompt !== null ? prompt + " : " + val : val;
        var eid = _NewEventId();
        cxt.status = Status.blocked;
        _suspendedContext[eid] = cxt;
        _suspendedRetVal[eid] = [inTokenInOrder[0], null, null, null];
        postMessage({ cmd: 'Alert', msg: outs, eid: eid, exmode: mode }, null);
        return { status: "ALRT", ret: ReturnCode.blocking, outputInOrder: [NumberToken.NewInstance(eid), null, null, null] };
    }
    ;
    static END(mode, cxt, inTokenInOrder, option) {
        return { status: "END", ret: ReturnCode.ok, outputInOrder: [null, null, null] };
    }
    ;
    static STOP(mode, cxt, inTokenInOrder, option) {
        var val = JSON.stringify(inTokenInOrder[0]);
        return { status: "STOP", ret: ReturnCode.executionHALT, outputInOrder: [null, null, null] };
    }
    ;
    static SWITCH(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] == null || inTokenInOrder[1] == null)
            return { status: "SWITCH on T", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null, null] };
        if (inTokenInOrder[1].AsBool())
            return { status: "SWITCH on T", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null, null] };
        else
            return { status: "SWITCH on NIL", ret: ReturnCode.ok, outputInOrder: [null, inTokenInOrder[0], null, null] };
    }
    ;
    /*
        APPLY [targetObject, [[in1, in2, in3], option], opname, null]->[[out0, out1, out2], void, void, void];
     */
    static APPLY(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null || inTokenInOrder[1] === null || inTokenInOrder[2] === null)
            return { status: "APPLY on T", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null, null] };
        var opname = inTokenInOrder[2].AsString();
        var opt = inTokenInOrder[1].Get(1).AsString();
        var tmp;
        var topWqe = new WaitingQeueuEntry();
        var cbContext = new VPGLContext(null, _NewEventId());
        cbContext.depthlevel = 0;
        cbContext.Install(inTokenInOrder[0], opname, opt, [inTokenInOrder[0],
            inTokenInOrder[1].Get(0).Get(0),
            inTokenInOrder[1].Get(0).Get(1),
            inTokenInOrder[1].Get(0).Get(2)]);
        cbContext.parent = topWqe;
        cbContext.position = "A2";
        cbContext.outdir = "B";
        topWqe.child = cbContext;
        topWqe.parent = null;
        tmp = cbContext.Go(mode);
        if (tmp.ret === ReturnCode.error)
            return { status: "APPLY : ret - ERROR code: " + tmp.ret + " -- " + tmp.status, ret: ReturnCode.error, outputInOrder: [null, null, null] };
        if (tmp.ret === ReturnCode.breakStop) {
            var topcontext = cbContext;
            while (topcontext.parent !== undefined && topcontext.parent !== null
                && topcontext.parent.parent !== undefined && topcontext.parent.parent !== null) {
                topcontext = topcontext.parent.parent;
            }
            ;
            var tg = topcontext.TraceSearch();
            if (tg !== null) {
                if (tg.parent.classname === 'UserDefined')
                    _ForceUiRedraw(tg.parent.arrivedTokensInOrder[0].typeid, tg.parent.opname, tg.parent);
                else
                    _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
            }
        }
        ; // breakstop
        var val = [];
        if (tmp.outputInOrder !== null)
            for (var i = 0; i < tmp.outputInOrder.length; i++)
                if (tmp.outputInOrder[i] === null || tmp.outputInOrder[i] === undefined)
                    val.push(VoidToken.NewInstance(null));
                else
                    val.push(tmp.outputInOrder[i]);
        return { status: "APPLY : " + tmp.status, ret: tmp.ret,
            outputInOrder: [Token.NewInstance('Array', val), null, null, null] };
    }
    ;
    static LOOP(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return { status: "LOOP on T", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        var opname = inTokenInOrder[1].AsString();
        opname = opname.slice(1, opname.length - 1);
        var loop = true;
        var tmp = null;
        while (loop) {
            var topWqe = new WaitingQeueuEntry();
            var cbContext = new VPGLContext(null, _NewEventId());
            cbContext.depthlevel = 0;
            cbContext.Install(inTokenInOrder[0], opname, null, [inTokenInOrder[0], null, null, null]);
            cbContext.parent = topWqe;
            cbContext.position = "A2";
            cbContext.outdir = "B";
            topWqe.child = cbContext;
            topWqe.parent = null;
            tmp = cbContext.Go(mode);
            if (tmp.outputInOrder[0] !== null)
                loop = tmp.outputInOrder[0].AsBool();
            loop = (loop === null) ? false : !loop; // exit loop if out0 is true.
        }
        return { status: "LOOP on T", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null] };
    }
    ;
    static JOIN(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] == null || inTokenInOrder[1] == null)
            return { status: "JOIN on T", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null, null] };
        return { status: "JOIN on T", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null, null] };
    }
    ;
    static XXX(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === undefined || inTokenInOrder[0] === null)
            return { status: "XXX on T", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var tmp = inTokenInOrder[0].ToLiteral();
        var caption = option !== null ? option + " : " : "";
        //postMessage({cmd:"Alert", msg:(caption + tmp)}, null);
        return { status: "XXX on T", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null] };
    }
    static FLOW(mode, cxt, inTokenInOrder, option) {
        if (cxt.outdir.length === 0) // No out case is n-Way END
            return { status: "END", ret: ReturnCode.ok, outputInOrder: [null, null, null, null] };
        var tmp = null;
        var idx = 0;
        for (idx = 0; idx < 3; idx++) {
            tmp = inTokenInOrder[idx];
            if (tmp !== null)
                break;
        }
        if (cxt.outdir.length === 1) // PASS OR MRG2 OR MRG3
            return { status: "FLOW", ret: ReturnCode.ok, outputInOrder: [tmp, null, null, null] };
        if (cxt.outdir.length === 3) // COPY3
            return { status: "FLOW", ret: ReturnCode.ok, outputInOrder: [tmp, tmp, tmp, null] };
        if (cxt.incond.length === 2 && cxt.outdir.length === 2) { // JCT
            var rr = [null, null, null, null];
            rr[idx] = tmp;
            return { status: "FLOW", ret: ReturnCode.ok, outputInOrder: rr };
        }
        if (cxt.outdir.length === 2) // COPY2
            return { status: "FLOW", ret: ReturnCode.ok, outputInOrder: [tmp, tmp, null, null] };
        return { status: "ERROR IN FLOW", ret: ReturnCode.error, outputInOrder: [null, null, null, null] };
    }
    ;
    static PAUSE(mode, cxt, inTokenInOrder, option) {
        var waitval;
        if (option !== null && option !== undefined) {
            var tmp = Math.floor(Number.parseFloat(option));
            if (tmp !== undefined)
                waitval = tmp;
            else
                return ({ status: "PAUSE - malformed option", ret: ReturnCode.error, outputInOrder: [null, null, null, null] });
        }
        else
            return ({ status: "PAUSE - need option in number", ret: ReturnCode.error, outputInOrder: [null, null, null, null] });
        var eid = _NewEventId();
        postMessage({ cmd: "Pause", msec: waitval, eid: eid, exmode: mode }, null);
        cxt.status = Status.blocked;
        ;
        _suspendedContext[eid] = cxt;
        _suspendedRetVal[eid] = [inTokenInOrder[0], null, null, null];
        return { status: "PAUSE", ret: ReturnCode.blocking, outputInOrder: [NumberToken.NewInstance(eid), null, null, null] };
    }
    ;
    static THREED(mode, cxt, inTokenInOrder, option) {
        return { status: "T3D", ret: ReturnCode.ok, outputInOrder: [ThreeDToken.NewInstance(null), null, null, null] };
    }
    ;
    static TIMER(mode, cxt, inTokenInOrder, option) {
        return { status: "TTIMER", ret: ReturnCode.ok, outputInOrder: [TimerToken.NewInstance(null), null, null, null] };
    }
    ;
    static RegisterSelf() {
        Token.InstallClass("T", TToken.NewInstance, TToken.FromLiteral, TToken.JSONRcv, TToken.JSONRpl);
        var initval = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("Void")]));
        this.subrcoll["NOT"] = SUBRToken.NewInstance(TToken.TNOT);
        this.subrcoll["CONST"] = SUBRToken.NewInstance(TToken.CONST);
        this.subrcoll["OPTION"] = SUBRToken.NewInstance(TToken.OPTION);
        this.subrcoll["=="] = SUBRToken.NewInstance(TToken.EQ);
        this.subrcoll["GDB"] = SUBRToken.NewInstance(TToken.GDB);
        this.subrcoll["RANDOM"] = SUBRToken.NewInstance(TToken.RANDOM);
        this.subrcoll["ARRAY2"] = SUBRToken.NewInstance(TToken.ARRAY2);
        this.subrcoll["ARRAY3"] = SUBRToken.NewInstance(TToken.ARRAY3);
        this.subrcoll["ALRT"] = SUBRToken.NewInstance(TToken.ALRT);
        this.subrcoll["INPUT"] = SUBRToken.NewInstance(TToken.INPUT);
        this.subrcoll["END"] = SUBRToken.NewInstance(TToken.END);
        this.subrcoll["STOP"] = SUBRToken.NewInstance(TToken.STOP);
        this.subrcoll["SWITCH"] = SUBRToken.NewInstance(TToken.SWITCH);
        //        this.subrcoll["APPLY"]  = SUBRToken.NewInstance(TToken.APPLY);
        //        this.subrcoll["LOOP"]   = SUBRToken.NewInstance(TToken.LOOP);
        this.subrcoll["JOIN"] = SUBRToken.NewInstance(TToken.JOIN);
        this.subrcoll["FLOW"] = SUBRToken.NewInstance(TToken.FLOW);
        this.subrcoll["PAUSE"] = SUBRToken.NewInstance(TToken.PAUSE);
        this.subrcoll["3D"] = SUBRToken.NewInstance(TToken.THREED);
        this.subrcoll["TIMER"] = SUBRToken.NewInstance(TToken.TIMER);
        //        this.subrcoll["XXX"]    = SUBRToken.NewInstance(TToken.XXX);
        _SUBRDepo["T"] = this.subrcoll;
        VPGLGlobalDataBase.Put("T", initval, false);
    }
    ;
}
TToken.subrcoll = [];
TToken.classidstr = "T";
TToken.theT = new TToken();
;
class NILToken extends TToken {
    constructor() { super(); this.classid = NILToken.classidstr; this.val = null; }
    ;
    static NewInstance(val) {
        var tk = NILToken.theNIL;
        return tk;
    }
    ;
    static FromLiteral(literal) {
        var result = Token.lex(literal);
        if (result.val === "NIL")
            return { val: NILToken.theNIL, rest: result.rest };
        else
            return null;
    }
    ;
    Clone() { return NILToken.theNIL; }
    ;
    ToJSStruct() { return false; }
    ;
    static JSONRcv(key, value) { return NILToken.theNIL; }
    ;
    static JSONRpl(key, value) { return { classid: "NIL" }; }
    ;
    Put(key, val) { }
    ;
    Get(key) { return null; }
    ;
    AsBool() { return false; }
    AsString() { return "NIL"; }
    ;
    static NOT(mode, cxt, inTokenInOrder, option) {
        var result = inTokenInOrder[0].AsBool();
        result = (result === null) ? false : (!result);
        return { status: "NOT OF NIL", ret: ReturnCode.ok, outputInOrder: [TToken.NewInstance(null), null, null, null] };
    }
    ;
    static RegisterSelf() {
        Token.InstallClass("NIL", NILToken.NewInstance, NILToken.FromLiteral, NILToken.JSONRcv, NILToken.JSONRpl);
        var initval = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("T")]));
        NILToken.subrcoll["NOT"] = SUBRToken.NewInstance(NILToken.NOT);
        _SUBRDepo["NIL"] = NILToken.subrcoll;
        VPGLGlobalDataBase.Put("NIL", initval, false);
    }
    ;
}
NILToken.subrcoll = [];
NILToken.classidstr = "NIL";
NILToken.theNIL = new NILToken();
;
class ArrayToken extends TToken {
    constructor() { super(); this.classid = ArrayToken.classidstr; this.val = []; }
    ;
    static NewInstance(val) {
        var rst = new ArrayToken();
        if (val.classid === "Array")
            rst.val = val.arrayval;
        else
            rst.val = val;
        return rst;
    }
    ;
    static FromLiteral(literal) {
        var val = [];
        var tmp;
        if (literal.length < 2 || literal.charAt(0) !== '[')
            return null;
        tmp = literal.slice(1);
        while (tmp.length !== 0) {
            tmp = tmp.trim();
            if (tmp.length === 0)
                return null;
            if (tmp.charAt(0) === ']') {
                tmp = tmp.slice(1);
                break;
            }
            ;
            var elem = Token.FromLiteral(tmp);
            if (elem === null)
                return null;
            val.push(elem.val);
            tmp = elem.rest;
        }
        ;
        return { val: ArrayToken.NewInstance(val), rest: tmp };
    }
    ;
    Clone() {
        return ArrayToken.NewInstance([].concat(this.val));
    }
    ;
    ToJSStruct() {
        var result = [];
        for (var idx = 0; idx < this.val.val.length; idx++) {
            result[idx] = this.val.val[idx].ToJSStruct();
        }
        ;
        return result;
    }
    ;
    static JSONRcv(key, value) { return ArrayToken.NewInstance(value.val); }
    ;
    static JSONRpl(key, value) {
        return { classid: "Array", val: value.val };
    }
    ;
    AsString() {
        var result = '[';
        var elems = this.val;
        for (var i = 0; i < elems.length; i++)
            result = result + elems[i].AsString() + ' ';
        return result.trim() + ']';
    }
    ForAll(f) {
        for (var idx = 0; idx < this.val.length; idx++)
            if (f("" + idx, this.val[idx]))
                break;
    }
    ;
    Put(key, val) {
        var idx = Number.parseInt(key);
        if (idx !== undefined && idx !== null && !isNaN(idx))
            this.val[idx] = val;
    }
    ;
    Get(key) {
        var idx = Number.parseInt(key);
        if (idx === undefined || idx === null || isNaN(idx))
            return null;
        return this.val[idx];
    }
    ;
    Length() { return this.val.length; }
    ;
    Push(entry) { this.val.push(entry); }
    ;
    // SUBRs
    static DUP(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0].ClassId() == "Array")
            return { status: "ARRAYDUP", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0].Clone(), null, null] };
        else
            var result = inTokenInOrder[0].Clone();
        //(<ArrayToken>result).val.val = [].concat((<ArrayToken>inTokenInOrder[0]).val.val);
        return { status: "ARRAYDUP", ret: ReturnCode.ok, outputInOrder: [result, null, null] };
    }
    static PUSH(mode, cxt, inTokenInOrder, option) {
        var optional = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] === null || inTokenInOrder[1] === null))
            return { status: "ARRAYPUSH", ret: ReturnCode.needMoreToken, outputInOrder: null };
        if (optional && inTokenInOrder[0] === null)
            return { status: "ARRAYPUSH", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var toBePushed = null;
        if (optional)
            toBePushed = Token.FromLiteral(option).val;
        else
            toBePushed = inTokenInOrder[1];
        if (toBePushed === null)
            return { status: "ARRAYPUSH invalid to be pushed item.", ret: ReturnCode.malformed, outputInOrder: null };
        var arry = inTokenInOrder[0];
        arry.val = [toBePushed].concat(inTokenInOrder[0].val);
        return { status: "ARRAYPUSH", ret: ReturnCode.ok, outputInOrder: [arry, null, null] };
    }
    ;
    static TENQ(mode, cxt, inTokenInOrder, option) {
        var optional = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] === null || inTokenInOrder[1] === null))
            return { status: "ARRAYYENQ", ret: ReturnCode.needMoreToken, outputInOrder: null };
        if (optional && inTokenInOrder[0] === null)
            return { status: "ARRAYENQ", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var toBeENQed = null;
        if (optional)
            toBeENQed = Token.FromLiteral(option).val;
        else
            toBeENQed = inTokenInOrder[1];
        if (toBeENQed === null)
            return { status: "ARRAYENQ invalid to be pushed item.", ret: ReturnCode.malformed, outputInOrder: null };
        var arry = inTokenInOrder[0];
        arry.val = inTokenInOrder[0].val.concat([toBeENQed]);
        return { status: "ARRAYENG", ret: ReturnCode.ok, outputInOrder: [arry, null, null] };
    }
    ;
    static HEAD(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "ARRAYHEAD", ret: ReturnCode.needMoreToken, outputInOrder: null };
        if (inTokenInOrder[0].val.length <= 0)
            return { status: "ARRAYHEAD: Empty Array", ret: ReturnCode.error, outputInOrder: null };
        return { status: "Array::HEAD", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0].val[0], null, null] };
    }
    ;
    static GET(mode, cxt, inTokenInOrder, option) {
        var optional = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] === null || inTokenInOrder[1] === null))
            return { status: "ARRAYGET", ret: ReturnCode.needMoreToken, outputInOrder: null };
        if (optional && inTokenInOrder[0] === null)
            return { status: "ARRAYGET", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var idx;
        if (optional)
            idx = Token.FromLiteral(option).val.AsNumber();
        else
            idx = inTokenInOrder[1].AsNumber();
        if (idx === undefined || idx === null)
            return { status: "Array::GET : index is not number", ret: ReturnCode.error, outputInOrder: null };
        var result = inTokenInOrder[0].Get(idx);
        if (result === undefined || result === null)
            return { status: "Array::GET : index is not valid at", ret: ReturnCode.error, outputInOrder: null };
        return { status: "Array::GET", ret: ReturnCode.ok, outputInOrder: [result, null, null] };
    }
    ;
    static PUT(mode, cxt, inTokenInOrder, option) {
        var optional = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] === null || inTokenInOrder[1] === null || inTokenInOrder[2] === null))
            return { status: "ARRAYPUT", ret: ReturnCode.needMoreToken, outputInOrder: null };
        if (optional && inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return { status: "ARRAYPUT", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var idx;
        var toBeSet = null;
        if (optional) {
            idx = Token.FromLiteral(option).val.AsNumber();
            toBeSet = inTokenInOrder[1];
        }
        else {
            idx = inTokenInOrder[1].AsNumber();
            toBeSet = inTokenInOrder[2];
        }
        ;
        var arry = null;
        if (inTokenInOrder[0].ClassId() == "Array")
            arry = inTokenInOrder[0].val;
        else
            arry = inTokenInOrder[0].val.val;
        if (idx === undefined || idx === null)
            return { status: "Array::PUT : index is not number", ret: ReturnCode.error, outputInOrder: null };
        if (idx < 0)
            arry.unshift(toBeSet);
        else if (idx > arry.length)
            arry.push(toBeSet);
        else
            arry[idx] = toBeSet;
        return { status: "Array::PUT", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null] };
    }
    ;
    static PICK(mode, cxt, inTokenInOrder, option) {
        var optional = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] === null || inTokenInOrder[1] === null || inTokenInOrder[2] === null))
            return { status: "ARRAYPICK", ret: ReturnCode.needMoreToken, outputInOrder: null };
        if (optional && inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return { status: "ARRAYPICK", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var idx;
        var toBeSet = null;
        if (optional) {
            idx = Token.FromLiteral(option).val.AsNumber();
            toBeSet = inTokenInOrder[1];
        }
        else {
            idx = inTokenInOrder[1].AsNumber();
            toBeSet = inTokenInOrder[2];
        }
        ;
        var arry = null;
        if (inTokenInOrder[0].ClassId() == "Array")
            arry = inTokenInOrder[0].val;
        else
            arry = inTokenInOrder[0].val.val;
        if (idx === undefined || idx === null)
            return { status: "Array::PICK : index is not number", ret: ReturnCode.error, outputInOrder: null };
        if (idx < 0 || idx >= arry.length)
            return { status: "Array::PICK : index is out of range", ret: ReturnCode.error, outputInOrder: null };
        else {
            var resarry = arry.splice(idx, 1);
            if (inTokenInOrder[0].ClassId() == "Array")
                inTokenInOrder[0].val = resarry;
            else
                inTokenInOrder[0].val.val = resarry;
        }
        return { status: "Array::PUT", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null] };
    }
    ;
    static MEMBER(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return { status: "ARYMEMBER", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var result = NILToken.NewInstance(null);
        var target = inTokenInOrder[0];
        for (var i = 0; i < target.val.length; i++) {
            if (inTokenInOrder[1].EQ(inTokenInOrder[0].Get(i))) {
                result = TToken.NewInstance(null);
                break;
            }
        }
        return { status: "Array::MEMBER", ret: ReturnCode.ok, outputInOrder: [result, null, null] };
    }
    ;
    static LENGTH(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "ARYLENGTH", ret: ReturnCode.needMoreToken, outputInOrder: null };
        return { status: "Array::LENGTH", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(inTokenInOrder[0].val.length), null, null] };
    }
    ;
    static EMPTY(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "ARYEMPTY", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var result = true;
        if (inTokenInOrder[0].val.val !== undefined)
            result = (inTokenInOrder[0].val.val.length === 0);
        else
            result = (inTokenInOrder[0].val.length === 0);
        return { status: "Array::LENGTH", ret: ReturnCode.ok, outputInOrder: [result ? TToken.NewInstance(null) : NILToken.NewInstance(null), null, null] };
    }
    ;
    static REST(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "ARYPOP", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var result = null;
        if (inTokenInOrder[0].ClassId() !== "Array") {
            var rest = inTokenInOrder[0].val.val;
            rest = rest.slice(1);
            result = inTokenInOrder[0];
            result.val.val = rest;
        }
        else {
            var rest = inTokenInOrder[0].val;
            result = inTokenInOrder[0];
            rest = rest.slice(1);
            result.val = rest;
        }
        return { status: "Array::REST", ret: ReturnCode.ok, outputInOrder: [result, null, null] };
    }
    ;
    static TDEQ(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "ARYTDEQ", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var result = null;
        if (inTokenInOrder[0].ClassId() !== "Array") {
            var rest = inTokenInOrder[0].val.val;
            var oldlength = rest.length;
            rest = rest.splice(oldlength - 1, 1);
            var result = inTokenInOrder[0].Clone();
            result.val = ArrayToken.NewInstance(rest);
        }
        else {
            var rest = inTokenInOrder[0].val;
            rest = rest.slice(1);
            result = ArrayToken.NewInstance(rest);
        }
        return { status: "Array::TDEQ", ret: ReturnCode.ok, outputInOrder: [result, null, null] };
    }
    ;
    // arrayには、forallかイテレータが必要。後者は新規のクラスかもしれない。
    // forallは、新規クラスの導入は必要ないが、外部仕様についての詰めた検討が必要
    // forall in0:array in1: callbackを持つオブジェクト, in2:proc名(option) -> out0: array,
    // callback (in0: callbackのオーナー, in1: [array,index,val])->out:NILなら続行。NIL以外ならコールバックの呼び出しは終了。
    // こうなると、GET/PUT/PUSH/MAPだけでよくないか?
    static RegisterSelf() {
        Token.InstallClass("Array", ArrayToken.NewInstance, ArrayToken.FromLiteral, ArrayToken.JSONRcv, ArrayToken.JSONRpl);
        var initval = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("T")]));
        ArrayToken.subrcoll["PUSH"] = SUBRToken.NewInstance(ArrayToken.PUSH);
        ArrayToken.subrcoll["HENQ"] = SUBRToken.NewInstance(ArrayToken.PUSH);
        ArrayToken.subrcoll["HDEQ"] = SUBRToken.NewInstance(ArrayToken.REST);
        ArrayToken.subrcoll["TENQ"] = SUBRToken.NewInstance(ArrayToken.TENQ);
        ArrayToken.subrcoll["TDEQ"] = SUBRToken.NewInstance(ArrayToken.TDEQ);
        ArrayToken.subrcoll["HEAD"] = SUBRToken.NewInstance(ArrayToken.HEAD);
        ArrayToken.subrcoll["DUP"] = SUBRToken.NewInstance(ArrayToken.DUP);
        ArrayToken.subrcoll["GET"] = SUBRToken.NewInstance(ArrayToken.GET);
        ArrayToken.subrcoll["PUT"] = SUBRToken.NewInstance(ArrayToken.PUT);
        ArrayToken.subrcoll["PICK"] = SUBRToken.NewInstance(ArrayToken.PICK);
        ArrayToken.subrcoll["MEMBER"] = SUBRToken.NewInstance(ArrayToken.MEMBER);
        ArrayToken.subrcoll["LENGTH"] = SUBRToken.NewInstance(ArrayToken.LENGTH);
        ArrayToken.subrcoll["EMPTY?"] = SUBRToken.NewInstance(ArrayToken.EMPTY);
        ArrayToken.subrcoll["REST"] = SUBRToken.NewInstance(ArrayToken.REST);
        _SUBRDepo["Array"] = ArrayToken.subrcoll;
        VPGLGlobalDataBase.Put("Array", initval, false);
    }
    ;
}
ArrayToken.subrcoll = [];
ArrayToken.classidstr = "Array";
;
class StringToken extends TToken {
    constructor() { super(); this.classid = StringToken.classidstr; this.val = null; }
    ;
    static NewInstance(val) {
        var tk = new StringToken();
        if (val.classid === "String")
            tk.val = val.stringval;
        else
            tk.val = val;
        return tk;
    }
    ;
    static FromLiteral(literal) {
        var result = null;
        literal = literal.trim();
        if (literal.charAt(0) !== '"' && literal.charAt(0) !== "'")
            return null;
        var endp = 0;
        var brk = literal.charAt(0);
        for (endp = 1; endp < literal.length; endp++)
            if (literal.charAt(endp) === '\\') {
                endp++;
                continue;
            }
            else if (literal.charAt(endp) === brk) {
                break;
            }
            else
                continue;
        if (endp >= literal.length)
            return null;
        return { val: StringToken.NewInstance(literal.slice(1, endp)), rest: literal.slice(endp + 1) };
    }
    ;
    Clone() {
        var val = "" + this.val;
        return StringToken.NewInstance(val);
    }
    ;
    ToJSStruct() { return this.val; }
    ;
    static JSONRcv(key, value) { return StringToken.NewInstance(value.val); }
    ;
    static JSONRpl(key, value) { return { classid: "String", val: value.val }; }
    ;
    AsString() { return this.val; }
    ;
    EQ(dest) { return this.val === dest.AsString(); }
    ;
    Put(key, val) { }
    ;
    Get(key) { return null; }
    ;
    static CONCAT(mode, cxt, inTokenInOrder, option) {
        var optional = (option !== undefined && option !== null && option !== '');
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return { status: "CONCAT on String", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        if (optional && inTokenInOrder[0] == null)
            return { status: "CONCAT on String", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        var str2, str1;
        str1 = inTokenInOrder[0].AsString();
        if (optional)
            str2 = Token.FromLiteral(option).val.AsString();
        else
            str2 = inTokenInOrder[1].AsString();
        if (str2 === undefined || str2 === null || str1 === undefined || str1 === null)
            return { status: "CONCAT invalid arg", ret: ReturnCode.error, outputInOrder: null };
        var val = str1 + str2;
        return { status: "CONCAT on STRING", ret: ReturnCode.ok, outputInOrder: [StringToken.NewInstance(val), null, null] };
    }
    ;
    static RegisterSelf() {
        Token.InstallClass("String", StringToken.NewInstance, StringToken.FromLiteral, StringToken.JSONRcv, StringToken.JSONRpl);
        var initval = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("T")]));
        _SUBRDepo["String"] = StringToken.subrcoll;
        StringToken.subrcoll["CONCAT"] = SUBRToken.NewInstance(StringToken.CONCAT);
        VPGLGlobalDataBase.Put("String", initval, false);
    }
    ;
}
StringToken.subrcoll = [];
StringToken.classidstr = "String";
;
class NumberToken extends TToken {
    constructor() { super(); this.classid = NumberToken.classidstr; this.val = null; }
    ;
    static NewInstance(val) {
        var tk = new NumberToken();
        if (val.classid === "Number")
            tk.val = val.val;
        else
            tk.val = val;
        return tk;
    }
    ;
    static FromLiteral(literal) {
        var result = null;
        var rnum;
        var tokens = [literal, ''];
        for (var i = 0; i < literal.length; i++)
            if (" \t\n\\r\"'{[}]".indexOf(literal.charAt(i)) !== -1) {
                tokens[0] = literal.slice(0, i);
                tokens[1] = literal.slice(i, literal.length);
                break;
            }
        try {
            rnum = Number.parseFloat(tokens[0]);
        }
        catch (e) {
            return null;
        }
        ;
        if (Number.isNaN(rnum))
            return null;
        return { val: NumberToken.NewInstance(rnum), rest: tokens[1] };
    }
    ;
    Clone() { return NumberToken.NewInstance(this.val); }
    ;
    ToJSStruct() { return this.val; }
    ;
    AsString() { return "" + this.val; }
    ;
    Put(key, val) { }
    ;
    Get(key) { return null; }
    ;
    EQ(v) {
        var dest = v.AsNumber();
        if (dest === undefined || dest === null)
            return false;
        if (Math.abs(this.val - dest) < 1e-5)
            return true;
        else
            return false;
    }
    ;
    static JSONRcv(key, value) { return NumberToken.NewInstance(value.val); }
    ;
    static JSONRpl(key, value) { return { classid: "Number", val: value.val }; }
    ;
    AsNumber() { return this.val; }
    ;
    static ADD1(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "NUMADD1", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var val = inTokenInOrder[0].AsNumber() + 1;
        return { status: "ADD1 on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null] };
    }
    ;
    static SUB1(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "NUMSUB1", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var val = inTokenInOrder[0].AsNumber() - 1;
        return { status: "SUB1 on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null] };
    }
    ;
    static ABS(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "NUMABS", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var val = Math.abs(inTokenInOrder[0].AsNumber());
        return { status: "ABS on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null] };
    }
    ;
    static ROUND(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "NUMROUND", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var val = Math.round(inTokenInOrder[0].AsNumber());
        return { status: "ROUND on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null] };
    }
    ;
    static SIN(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "NUMSIN", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var val = Math.sin(inTokenInOrder[0].AsNumber());
        return { status: "SINE on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null] };
    }
    ;
    static COS(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "NUMCOS", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var val = Math.sin(inTokenInOrder[0].AsNumber() + Math.PI / 2);
        return { status: "COSINE on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null] };
    }
    ;
    static ADD(mode, cxt, inTokenInOrder, option) {
        var optional = (option !== undefined && option !== null && option !== '');
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return { status: "ADD on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        if (optional && inTokenInOrder[0] == null)
            return { status: "ADD on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        var add2, add1;
        add1 = inTokenInOrder[0].AsNumber();
        if (optional)
            add2 = Token.FromLiteral(option).val.AsNumber();
        else
            add2 = inTokenInOrder[1].AsNumber();
        if (add2 === undefined || add2 === null || add1 === undefined || add1 === null)
            return { status: "ADD invalid arg", ret: ReturnCode.error, outputInOrder: null };
        var val = add1 + add2;
        return { status: "ADD on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null] };
    }
    ;
    static SUB(mode, cxt, inTokenInOrder, option) {
        var optional = (option !== undefined && option !== null && option !== '');
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return { status: "SUB on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        if (optional && inTokenInOrder[0] == null)
            return { status: "SUB on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        var sub1, sub2;
        sub1 = inTokenInOrder[0].AsNumber();
        if (optional)
            sub2 = Token.FromLiteral(option).val.AsNumber();
        else
            sub2 = inTokenInOrder[1].AsNumber();
        if (sub2 === undefined || sub2 === null || sub1 === undefined || sub1 === null)
            return { status: "SUB invalid arg", ret: ReturnCode.error, outputInOrder: null };
        var val = sub1 - sub2;
        return { status: "SUB on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null] };
    }
    ;
    static MUL(mode, cxt, inTokenInOrder, option) {
        var optional = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return { status: "MUL on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        if (optional && inTokenInOrder[0] == null)
            return { status: "MUL on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        var mul2, mul1;
        mul1 = inTokenInOrder[0].AsNumber();
        if (optional)
            mul2 = Token.FromLiteral(option).val.AsNumber();
        else
            mul2 = inTokenInOrder[1].AsNumber();
        if (mul2 === undefined || mul2 === null || mul1 === undefined || mul1 === null)
            return { status: "MUL invalid arg", ret: ReturnCode.error, outputInOrder: null };
        var val = mul1 * mul2;
        return { status: "MUL on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null] };
    }
    ;
    static DIV(mode, cxt, inTokenInOrder, option) {
        var optional = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return { status: "DIV on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        if (optional && inTokenInOrder[0] == null)
            return { status: "DIV on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        var div2, div1;
        div1 = inTokenInOrder[0].AsNumber();
        if (optional)
            div2 = Token.FromLiteral(option).val.AsNumber();
        else
            div2 = inTokenInOrder[1].AsNumber();
        if (div2 === undefined || div2 === null || div1 === undefined || div1 === null)
            return { status: "DIV invalid arg", ret: ReturnCode.error, outputInOrder: null };
        var val = div1 / div2;
        return { status: "DIV on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null] };
    }
    ;
    static MOD(mode, cxt, inTokenInOrder, option) {
        var optional = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return { status: "MOD on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        if (optional && inTokenInOrder[0] == null)
            return { status: "MOD on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        var mod2, mod1;
        mod1 = inTokenInOrder[0].AsNumber();
        if (optional)
            mod2 = Token.FromLiteral(option).val.AsNumber();
        else
            mod2 = inTokenInOrder[1].AsNumber();
        if (mod1 === undefined || mod1 === null || mod2 === undefined || mod2 === null)
            return { status: "MUL invalid arg", ret: ReturnCode.error, outputInOrder: null };
        var val = mod1 % mod2;
        return { status: "MOD on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null] };
    }
    ;
    static GT(mode, cxt, inTokenInOrder, option) {
        var optional = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return { status: "GT on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        if (optional && inTokenInOrder[0] === null)
            return { status: "GT on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        var comparer;
        if (optional)
            comparer = Token.FromLiteral(option).val.AsNumber();
        else
            comparer = inTokenInOrder[1].AsNumber();
        if (comparer === undefined || comparer === null)
            return { status: "Number:GT : comparer is not number", ret: ReturnCode.error, outputInOrder: null };
        var val = inTokenInOrder[0].AsNumber() > comparer;
        return { status: "GT on Number", ret: ReturnCode.ok, outputInOrder: [val ? TToken.NewInstance(null) : NILToken.NewInstance(null), null, null] };
    }
    ;
    static GE(mode, cxt, inTokenInOrder, option) {
        var optional = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return { status: "GE on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        if (optional && inTokenInOrder[0] === null)
            return { status: "GE on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null] };
        var comparer;
        if (optional)
            comparer = Token.FromLiteral(option).val.AsNumber();
        else
            comparer = inTokenInOrder[1].AsNumber();
        if (comparer === undefined || comparer === null)
            return { status: "Number:GT : comparer is not number", ret: ReturnCode.error, outputInOrder: null };
        var val = inTokenInOrder[0].AsNumber() >= comparer;
        return { status: "GE on Number", ret: ReturnCode.ok, outputInOrder: [val ? TToken.NewInstance(null) : NILToken.NewInstance(null), null, null] };
    }
    ;
    static NUMPAUSE(mode, cxt, inTokenInOrder, option) {
        var waitval = inTokenInOrder[0].AsNumber();
        if (option !== null && option !== undefined) {
            var tmp = Math.floor(Number.parseFloat(option));
            if (tmp !== undefined)
                waitval = tmp;
            else
                return ({ status: "PAUSE - malformed option", ret: ReturnCode.error, outputInOrder: [null, null, null] });
        }
        ;
        var eid = _NewEventId();
        postMessage({ cmd: "Pause", msec: waitval, eid: eid, exmode: mode }, null);
        cxt.status = Status.blocked;
        _suspendedContext[eid] = cxt;
        _suspendedRetVal[eid] = [inTokenInOrder[0], null, null, null];
        return { status: "PAUSE", ret: ReturnCode.blocking, outputInOrder: [NumberToken.NewInstance(eid), null, null] };
    }
    ;
    static RegisterSelf() {
        Token.InstallClass("Number", NumberToken.NewInstance, NumberToken.FromLiteral, NumberToken.JSONRcv, NumberToken.JSONRpl);
        var initval = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("T")]));
        NumberToken.subrcoll["N+1"] = SUBRToken.NewInstance(NumberToken.ADD1);
        NumberToken.subrcoll["N-1"] = SUBRToken.NewInstance(NumberToken.SUB1);
        NumberToken.subrcoll["ABS"] = SUBRToken.NewInstance(NumberToken.ABS);
        NumberToken.subrcoll["ROUND"] = SUBRToken.NewInstance(NumberToken.ROUND);
        NumberToken.subrcoll["SIN"] = SUBRToken.NewInstance(NumberToken.SIN);
        NumberToken.subrcoll["COS"] = SUBRToken.NewInstance(NumberToken.COS);
        NumberToken.subrcoll["A+B"] = SUBRToken.NewInstance(NumberToken.ADD);
        NumberToken.subrcoll["A-B"] = SUBRToken.NewInstance(NumberToken.SUB);
        NumberToken.subrcoll["A*B"] = SUBRToken.NewInstance(NumberToken.MUL);
        NumberToken.subrcoll["A/B"] = SUBRToken.NewInstance(NumberToken.DIV);
        NumberToken.subrcoll["A%B"] = SUBRToken.NewInstance(NumberToken.MOD);
        NumberToken.subrcoll["GT"] = SUBRToken.NewInstance(NumberToken.GT);
        NumberToken.subrcoll["GE"] = SUBRToken.NewInstance(NumberToken.GE);
        NumberToken.subrcoll["PAUSE"] = SUBRToken.NewInstance(NumberToken.NUMPAUSE);
        _SUBRDepo["Number"] = NumberToken.subrcoll;
        VPGLGlobalDataBase.Put("Number", initval, false);
    }
    ;
}
NumberToken.subrcoll = [];
NumberToken.classidstr = 'Number';
;
class TimerToken extends TToken {
    constructor() { super(); this.classid = TimerToken.classidstr; this.val = null; }
    ;
    static NewInstance(val) { return TimerToken.theTimer; }
    ;
    static FromLiteral(literal) {
        var result = Token.lex(literal);
        if (result.val === "Timer")
            return { val: TimerToken.theTimer, rest: result.rest };
        else
            return null;
    }
    ;
    Clone() { return TimerToken.theTimer; }
    ;
    ToJSStruct() { return { typeid: "Timer" }; }
    ;
    static JSONRcv(key, value) { return TimerToken.theTimer; }
    ;
    static JSONRpl(key, value) { return '{"typeid": "Timer"}'; }
    ;
    // SUBR Definitions
    static SETINTERVAL(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "TIMER::TICK", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var interval = null;
        if (option !== null && option !== "")
            interval = Token.FromLiteral(option).val.AsNumber();
        else if (inTokenInOrder[1] === null)
            return { status: "TIMER::TICK", ret: ReturnCode.needMoreToken, outputInOrder: null };
        else
            interval = inTokenInOrder[1].AsNumber();
        if (interval === null)
            return { status: "TIMER::TICK : invalid interval type", ret: ReturnCode.error, outputInOrder: null };
        interval = Math.round(interval);
        TimerToken.theTimer.val = interval;
        return { status: "Timer::SETINTERVAL-TICK", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null] };
    }
    static ATTACH(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return { status: "TIMER::ATTACH", ret: ReturnCode.needMoreToken, outputInOrder: null };
        if (inTokenInOrder[2] === null && option !== null && option !== '')
            inTokenInOrder[2] = Token.FromLiteral(option).val;
        if (inTokenInOrder[2] === null)
            return { status: "TIMER::ATTACH", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var tmp = inTokenInOrder[2].Get("msg");
        if (tmp === undefined || tmp === null)
            return { status: "3D::ATTACH - msg not found", ret: ReturnCode.error, outputInOrder: null };
        var msg = tmp.AsString();
        if (msg === undefined || msg === null)
            return { status: "3D::ATTACH - ivalid msg", ret: ReturnCode.error, outputInOrder: null };
        tmp = inTokenInOrder[2].Get("evt");
        if (tmp === undefined || tmp === null)
            return { status: "3D::ATTACH - evt not found", ret: ReturnCode.error, outputInOrder: null };
        var evt = tmp.AsString();
        if (evt === undefined || evt === null || evt !== 'OnTick')
            return { status: "3D::ATTACH - invalid evt evt='OnTick' only.", ret: ReturnCode.error, outputInOrder: null };
        _CBTable.push({ scn: null, target: null, opname: msg, event: evt, obj: inTokenInOrder[1], exmode: mode });
        return { status: "Timer::ATTACH", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null] };
    }
    static START(mode, cxt, inTokenInOrder, option) {
        if (TimerToken.theTimer.val === undefined || TimerToken.theTimer.val === null)
            return { status: "Timer::START - interval is not specified", ret: ReturnCode.error, outputInOrder: null };
        postMessage({ cmd: 'StartTimer', interval: TimerToken.theTimer.val }, null);
        return { status: "Timer::START", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null] };
    }
    static STOPTIMER(mode, cxt, inTokenInOrder, option) {
        postMessage({ cmd: 'StopTimer' }, null);
        return { status: "Timer::STOP", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null] };
    }
    static RegisterSelf() {
        Token.InstallClass("Timer", TimerToken.NewInstance, TimerToken.FromLiteral, TimerToken.JSONRcv, TimerToken.JSONRpl);
        var initval = TimerToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("T")]));
        TimerToken.subrcoll["TICK"] = SUBRToken.NewInstance(TimerToken.SETINTERVAL);
        TimerToken.subrcoll["ATTACH"] = SUBRToken.NewInstance(TimerToken.ATTACH);
        TimerToken.subrcoll["START"] = SUBRToken.NewInstance(TimerToken.START);
        TimerToken.subrcoll["TMSTOP"] = SUBRToken.NewInstance(TimerToken.STOPTIMER);
        _SUBRDepo["Timer"] = TimerToken.subrcoll;
        VPGLGlobalDataBase.Put("Timer", initval, false);
    }
    ;
}
TimerToken.classidstr = "Timer";
TimerToken.theTimer = new TimerToken();
class DictToken extends TToken {
    constructor() { super(); this.classid = DictToken.classidstr; this.val = null; }
    ;
    static NewInstance(val) {
        var tk = new DictToken();
        tk.val = val;
        return tk;
    }
    ;
    static NewInstance2(val) {
        var tk = new DictToken();
        var xx = [];
        for (let key in val) {
            var elem;
            if (val[key] === undefined || val[key] === null)
                continue;
            switch (typeof val[key]) {
                case "number":
                    elem = NumberToken.NewInstance(val[key]);
                    break;
                case "string":
                    elem = StringToken.NewInstance(val[key]);
                    break;
                case "boolean":
                    if (val[key])
                        elem = TToken.NewInstance(true);
                    else
                        elem = NILToken.NewInstance(false);
                    break;
                default:
                    continue;
            }
            ;
            xx[key] = elem;
        }
        ;
        tk.val = xx;
        return tk;
    }
    ;
    static FromTokenArray(src) {
        return DictToken.NewInstance(src);
    }
    ;
    static ToTokenArray(val) {
        var xx = {};
        for (let key in val) {
            var elem;
            if (val[key] === undefined || val[key] === null)
                continue;
            switch (typeof val[key]) {
                case "number":
                    elem = NumberToken.NewInstance(val[key]);
                    break;
                case "string":
                    elem = StringToken.NewInstance(val[key]);
                    break;
                case "boolean":
                    if (val[key])
                        elem = TToken.NewInstance(true);
                    else
                        elem = NILToken.NewInstance(false);
                    break;
                default:
                    continue;
            }
            ;
            xx[key] = elem;
        }
        ;
        return xx;
    }
    ;
    static FromLiteral(literal) {
        var tmp = null;
        var tokenval = {};
        literal = literal.trim();
        if (literal.charAt(0) !== '{')
            return null;
        literal = literal.slice(1);
        while (literal.length > 0 && literal.charAt(0) !== '}') {
            tmp = StringToken.FromLiteral(literal);
            if (tmp === null || tmp === undefined)
                return null;
            var elemkey = tmp.val.AsString();
            literal = tmp.rest.trim();
            if (literal.charAt(0) !== ':')
                return null;
            literal = literal.slice(1).trim();
            tmp = Token.FromLiteral(literal);
            if (tmp === null || tmp === undefined)
                return null;
            var elemval = tmp.val;
            literal = tmp.rest.trim();
            tokenval[elemkey] = elemval;
        }
        ;
        if (literal.length <= 0)
            return null;
        return { val: DictToken.NewInstance(tokenval), rest: literal.slice(1) };
    }
    ;
    Clone() { return DictToken.NewInstance(this.val); }
    ;
    ToJSStruct() {
        var result = {};
        this.ForAll(function (key, val) {
            result[key] = val.ToJSStruct();
            return false;
        });
        return result;
    }
    ;
    static JSONRcv(key, value) { return DictToken.NewInstance(value.val); }
    ;
    static JSONRpl(key, value) {
        return { classid: "Dictionary", val: value.val };
    }
    ;
    AsString() {
        var result = "{";
        for (let key in this.val) {
            result = result + ' "' + key + '" : ' + this.val[key].AsString() + ' ';
        }
        return result.trim() + '}';
    }
    ;
    Get(key) { return this.val[key]; }
    ;
    Put(key, val) {
        if (val === null)
            delete this.val[key];
        else
            this.val[key] = val;
    }
    ;
    ForAll(f) {
        for (let kk in this.val) {
            if (f(kk, this.val[kk]))
                break;
        }
    }
    ;
    // SUBR Definitions
    static GET(mode, cxt, inTokenInOrder, option) {
        if ((option !== null && option !== "") && (inTokenInOrder[0] === null))
            return { status: "Dict:Get", ret: ReturnCode.needMoreToken, outputInOrder: null };
        if ((option === null || option === "") && (inTokenInOrder[0] === null || inTokenInOrder[1] === null))
            return { status: "Dict:Get", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var key;
        if (option === null || option === "") {
            key = inTokenInOrder[1].AsString();
        }
        else {
            key = Token.FromLiteral(option).val.AsString();
        }
        ;
        var dict = inTokenInOrder[0];
        var val = dict.Get(key);
        if (val === undefined || val === null)
            return { status: 'Dict::GET value not found of  ' + key, ret: ReturnCode.error, outputInOrder: null };
        return { status: "GET", ret: ReturnCode.ok, outputInOrder: [val, null, null, null] };
    }
    ;
    static PICK(mode, cxt, inTokenInOrder, option) {
        if ((option !== null && option !== "") && (inTokenInOrder[0] === null))
            return { status: "Dict:PICK", ret: ReturnCode.needMoreToken, outputInOrder: null };
        if ((option === null || option === "") && (inTokenInOrder[0] === null || inTokenInOrder[1] === null))
            return { status: "Dict:PICK", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var key;
        if (option === null || option === "") {
            key = inTokenInOrder[1].AsString();
        }
        else {
            key = Token.FromLiteral(option).val.AsString();
        }
        ;
        var dict = inTokenInOrder[0];
        if (dict.val[key] === undefined)
            return { status: 'Dict::PICK value not found of  ' + key, ret: ReturnCode.error, outputInOrder: null };
        delete dict.val.key;
        return { status: "PICK", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null, null] };
    }
    ;
    static PUT(mode, cxt, inTokenInOrder, option) {
        if ((option === null || option === "") && (inTokenInOrder[0] == null || inTokenInOrder[1] === null || inTokenInOrder[2] === null))
            return { status: "PUT on Dict", ret: ReturnCode.needMoreToken, outputInOrder: null };
        if ((option !== null && option !== "") && (inTokenInOrder[0] === null || inTokenInOrder[1] === null))
            return { status: "PUT on Dict", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var dict = inTokenInOrder[0];
        var key = null;
        var putval = null;
        if (option !== null && option.length > 0) {
            key = Token.FromLiteral(option).val.AsString();
            putval = inTokenInOrder[1];
        }
        else {
            key = inTokenInOrder[1].AsString();
            putval = inTokenInOrder[2];
        }
        //Remove this entry when putval is VoidToken.
        if (putval.EQ(VoidToken.theVOID))
            putval = null;
        dict.Put(key, putval);
        return { status: "PUT", ret: ReturnCode.ok, outputInOrder: [dict, null, null, null] };
    }
    ;
    // この実装の辞書のコピーはディープコピーなので、やりすぎ、
    //　shallowコピーなら提示してもよいが
    static DUPLICATEDICT(mode, cxt, inTokenInOrder, option) {
        var org = inTokenInOrder[0];
        var result = JSON.parse(JSON.stringify(org, Token.JSONReplacer), Token.JSONReciver);
        return { status: "DUPLICATEDICT", ret: ReturnCode.ok, outputInOrder: [result, null, null, null] };
    }
    ;
    // ForAllかイテレータが必要。後者は、新規のクラスかもしれない
    static RegisterSelf() {
        Token.InstallClass("Dictionary", DictToken.NewInstance, DictToken.FromLiteral, DictToken.JSONRcv, DictToken.JSONRpl);
        var initval = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("T")]));
        DictToken.subrcoll["GET"] = SUBRToken.NewInstance(DictToken.GET);
        DictToken.subrcoll["PUT"] = SUBRToken.NewInstance(DictToken.PUT);
        DictToken.subrcoll["PICK"] = SUBRToken.NewInstance(DictToken.PICK);
        DictToken.subrcoll["DUP"] = SUBRToken.NewInstance(DictToken.DUPLICATEDICT);
        _SUBRDepo["Dictionary"] = DictToken.subrcoll;
        VPGLGlobalDataBase.Put("Dictionary", initval, false);
    }
    ;
}
DictToken.subrcoll = [];
DictToken.classidstr = "Dictionary";
;
class AppToken extends DictToken {
    constructor() { super(); this.classid = AppToken.classidstr; this.val = {}; }
    ;
    static NewInstance(val) {
        var tk = new AppToken();
        tk.val = val;
        return tk;
    }
    ;
    static FromLiteral(literal) { return null; }
    ;
    Clone() { return AppToken.NewInstance(this.val); }
    ;
    ToJSStruct() {
        return { typeid: "App", val: this.val.ToJSStruct() };
    }
    ;
    static JSONRcv(key, value) { return AppToken.NewInstance(value.val); }
    ;
    static JSONRpl(key, value) {
        return { classid: "App", val: value.val };
    }
    ;
    static RegisterSelf() {
        Token.InstallClass("App", AppToken.NewInstance, AppToken.FromLiteral, AppToken.JSONRcv, AppToken.JSONRpl);
        var initval = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("Dictionary")]));
        _SUBRDepo["App"] = AppToken.subrcoll;
        VPGLGlobalDataBase.Put("App", initval, false);
    }
    ;
}
AppToken.subrcoll = [];
AppToken.classidstr = "App";
;
class ThreeDToken extends DictToken {
    constructor() { super(); this.classid = ThreeDToken.classidstr; this.val = {}; }
    ;
    static NewInstance(val) { return ThreeDToken.the3D; }
    ;
    static FromLiteral(literal) {
        var result = Token.lex(literal);
        if (result.val === "ThreeD")
            return { val: ThreeDToken.the3D, rest: result.rest };
        else
            return null;
    }
    ;
    Clone() { return ThreeDToken.the3D; }
    ;
    ToJSStruct() { return { typeid: "3D" }; }
    ;
    static JSONRcv(key, value) { return ThreeDToken.the3D; }
    ;
    static JSONRpl(key, value) { return '{"typeid": "ThreeD"}'; }
    ;
    static RESET(mode, cxt, inTokenInOrder, option) {
        postMessage({ cmd: 'Init3D' }, null);
        return { status: "3DINIT", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null, null] };
    }
    ;
    static SCENE(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "3DSCENE", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var scenename = null;
        if (option !== null && option !== "")
            scenename = Token.FromLiteral(option).val.AsString();
        else if (inTokenInOrder[1] === null)
            return { status: "3DSCENE", ret: ReturnCode.needMoreToken, outputInOrder: null };
        else
            scenename = inTokenInOrder[1].AsString();
        if (scenename === null)
            return { status: "3DSCENE : invalid scene name type", ret: ReturnCode.error, outputInOrder: null };
        return { status: "3DSCENE", ret: ReturnCode.ok, outputInOrder: [Scene3DToken.NewInstance(scenename), null, null, null] };
    }
    ;
    static GEO(mode, cxt, inTokenInOrder, option) {
        if ((inTokenInOrder[1] === undefined || inTokenInOrder[1] === null) && option !== "") {
            inTokenInOrder[1] = Token.FromLiteral(option).val;
            if (inTokenInOrder[1] === null)
                return { status: "invalid option in 3DGETGEO : " + option, ret: ReturnCode.error, outputInOrder: null };
        }
        if (inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return { status: "3DGETGEO", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var tmp = inTokenInOrder[1].Get("Scene");
        if (tmp === undefined || tmp === null)
            return { status: "3DGETGEO Scene not specified", ret: ReturnCode.error, outputInOrder: null };
        var scn = tmp.AsString();
        if (scn === undefined || scn === null || scn === "")
            return { status: "3DGETGEO invalid Scene value", ret: ReturnCode.error, outputInOrder: null };
        tmp = inTokenInOrder[1].Get("Geo");
        if (tmp === undefined || tmp === null)
            return { status: "3DGETGEO Geometry not specified", ret: ReturnCode.error, outputInOrder: null };
        var geo = tmp.AsString();
        if (geo === undefined || geo === null || geo === "")
            return { status: "3DGEGEO invalid Geometry value", ret: ReturnCode.error, outputInOrder: null };
        return { status: "3DGETGEO", ret: ReturnCode.ok, outputInOrder: [Geometry3DToken.NewInstance({ sceneName: scn, geoName: geo }), null, null] };
    }
    ;
    static SETSCENE(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "3DSETSCENE", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var scenename = null;
        if (option !== null && option !== "")
            scenename = Token.FromLiteral(option).val.AsString();
        else if (inTokenInOrder[1] === null)
            return { status: "3DSETSCENE", ret: ReturnCode.needMoreToken, outputInOrder: null };
        else
            scenename = inTokenInOrder[1].AsString();
        if (scenename === null)
            return { status: "3DSETSCENE : invalid scene name type", ret: ReturnCode.error, outputInOrder: null };
        postMessage({ cmd: "3DSETSCENE", scn: scenename }, null);
        return { status: "3DSETSCENE", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null, null] };
    }
    ;
    // ATTACH   in0: 3DObject
    //          in1: object to be attached
    //          in2/option: {"scene": sceneName, "geo": geometryName "msg" : methodname "evt": eventname}
    // 
    //          out0: in0 - 3DObject
    //
    static ATTACH(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return { status: "3DATTACH", ret: ReturnCode.needMoreToken, outputInOrder: null };
        if (inTokenInOrder[2] === null && option !== null && option !== '')
            inTokenInOrder[2] = Token.FromLiteral(option).val;
        if (inTokenInOrder[2] === null)
            return { status: "3DATTACH", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var tmp = inTokenInOrder[2].Get("Scene");
        if (tmp === undefined || tmp === null)
            return { status: "3D::ATTACH - Scene not found", ret: ReturnCode.error, outputInOrder: null };
        var scn = tmp.AsString();
        if (scn === undefined || scn === null)
            return { status: "3D::ATTACH - Invalid Secne", ret: ReturnCode.error, outputInOrder: null };
        tmp = inTokenInOrder[2].Get("Geo");
        if (tmp === undefined || tmp === null)
            return { status: "3D::ATTACH -Geo not found", ret: ReturnCode.error, outputInOrder: null };
        var geo = tmp.AsString();
        if (geo === undefined || geo === null)
            return { status: "3D::ATTACH - Invalid Geo", ret: ReturnCode.error, outputInOrder: null };
        tmp = inTokenInOrder[2].Get("msg");
        if (tmp === undefined || tmp === null)
            return { status: "3D::ATTACH - msg not found", ret: ReturnCode.error, outputInOrder: null };
        var msg = tmp.AsString();
        if (msg === undefined || msg === null)
            return { status: "3D::ATTACH - ivalid msg", ret: ReturnCode.error, outputInOrder: null };
        tmp = inTokenInOrder[2].Get("evt");
        if (tmp === undefined || tmp === null)
            return { status: "3D::ATTACH - evt not found", ret: ReturnCode.error, outputInOrder: null };
        var evt = tmp.AsString();
        if (evt === undefined || evt === null)
            return { status: "3D::ATTACH - invalid evt", ret: ReturnCode.error, outputInOrder: null };
        _CBTable.push({ scn: scn, target: geo, opname: msg, event: evt, obj: inTokenInOrder[1], exmode: mode });
        return { status: "3D::ATTACH", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null] };
    }
    ;
    static UPDATE(mode, cxt, inTokenInOrder, option) {
        postMessage({ cmd: 'Update3D' }, null);
        return { status: "3DUPDATE", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null, null] };
    }
    ;
    static TDGET(mode, cxt, inTokenInOrder, option) {
        return { status: "3DGET : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null] };
    }
    ;
    static TDPUT(mode, cxt, inTokenInOrder, option) {
        return { status: "3DPUT : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null] };
    }
    ;
    static TDDUPLICATE(mode, cxt, inTokenInOrder, option) {
        return { status: "3DDUP : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null] };
    }
    ;
    static RegisterSelf() {
        Token.InstallClass("ThreeD", ThreeDToken.NewInstance, ThreeDToken.FromLiteral, ThreeDToken.JSONRcv, ThreeDToken.JSONRpl);
        var initval = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("Dictionary")]));
        ThreeDToken.subrcoll["RESET"] = SUBRToken.NewInstance(ThreeDToken.RESET);
        ThreeDToken.subrcoll["SCENE"] = SUBRToken.NewInstance(ThreeDToken.SCENE);
        ThreeDToken.subrcoll["GEO"] = SUBRToken.NewInstance(ThreeDToken.GEO);
        ThreeDToken.subrcoll["SETSCN"] = SUBRToken.NewInstance(ThreeDToken.SETSCENE);
        ThreeDToken.subrcoll["UPDATE"] = SUBRToken.NewInstance(ThreeDToken.UPDATE);
        ThreeDToken.subrcoll["ATTACH"] = SUBRToken.NewInstance(ThreeDToken.ATTACH);
        ThreeDToken.subrcoll["GET"] = SUBRToken.NewInstance(ThreeDToken.TDGET);
        ThreeDToken.subrcoll["PUT"] = SUBRToken.NewInstance(ThreeDToken.TDPUT);
        ThreeDToken.subrcoll["DUP"] = SUBRToken.NewInstance(ThreeDToken.TDDUPLICATE);
        _SUBRDepo["ThreeD"] = ThreeDToken.subrcoll;
        VPGLGlobalDataBase.Put("ThreeD", initval, false);
    }
}
ThreeDToken.subrcoll = [];
ThreeDToken.classidstr = "ThreeD";
ThreeDToken.the3D = new ThreeDToken();
;
class Scene3DToken extends DictToken {
    constructor() { super(); this.classid = Scene3DToken.classidstr; this.scenename = null; this.val = {}; }
    ;
    static NewInstance(val) {
        var tk = new Scene3DToken();
        tk.scenename = val;
        return tk;
    }
    ;
    static FromLiteral(literal) { return null; }
    ; // < "Scene3D" { "scenename" "foo"}>
    Clone() { return Scene3DToken.NewInstance(this.val); }
    ;
    ToJSStruct() { return { typeid: "3DSCENE" }; }
    ;
    static JSONRcv(key, value) { return Scene3DToken.NewInstance(value.val); }
    ;
    static JSONRpl(key, value) { return '{"typeid": "Scene3D",val: ' + JSON.stringify(value.val, Token.JSONReplacer) + '" }"'; }
    ;
    static GEO(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "3DSCENEGEO", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var geoname = null;
        if (option !== null && option !== "")
            geoname = Token.FromLiteral(option).val.AsString();
        else if (inTokenInOrder[1] === null)
            return { status: "3DSCENEGEO", ret: ReturnCode.needMoreToken, outputInOrder: null };
        else
            geoname = inTokenInOrder[1].AsString();
        if (geoname === null)
            return { status: "3DSCENEGEO : invalid scene name type", ret: ReturnCode.error, outputInOrder: null };
        var scenename = inTokenInOrder[0].scenename;
        return { status: "3DSCENEGEO", ret: ReturnCode.ok, outputInOrder: [Geometry3DToken.NewInstance({ sceneName: scenename, geoName: geoname }), null, null, null] };
    }
    ;
    static SCNSETCAM(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === undefined || inTokenInOrder[0] === null)
            return { status: "3DSCNSETCAM", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var camname = null;
        if (option !== null && option !== "")
            camname = Token.FromLiteral(option).val.AsString();
        else if (inTokenInOrder[1] === undefined || inTokenInOrder[1] === null)
            return { status: "3DSCNSETCAM", ret: ReturnCode.needMoreToken, outputInOrder: null };
        else
            camname = inTokenInOrder[1].AsString();
        var scenename = inTokenInOrder[0].scenename;
        if (camname === null)
            return { status: "3DSETCAM: malformed Camera", ret: ReturnCode.malformed, outputInOrder: null };
        postMessage({ cmd: '3DSetCamera', scn: scenename, camname: camname }, null);
        return { status: "3DSETCAM", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null, null] };
    }
    ;
    static SCNGET(mode, cxt, inTokenInOrder, option) {
        return { status: "3DSCENEGET : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null] };
    }
    ;
    static SCNPUT(mode, cxt, inTokenInOrder, option) {
        return { status: "3DSCENEPUT : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null] };
    }
    ;
    static SCNDUPLICATE(mode, cxt, inTokenInOrder, option) {
        return { status: "3DSCENEDUP : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null] };
    }
    ;
    static RegisterSelf() {
        Token.InstallClass("Scene3D", Scene3DToken.NewInstance, Scene3DToken.FromLiteral, Scene3DToken.JSONRcv, Scene3DToken.JSONRpl);
        var initval = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("Dictionary")]));
        Scene3DToken.subrcoll["GEO"] = SUBRToken.NewInstance(Scene3DToken.GEO);
        Scene3DToken.subrcoll["CAM"] = SUBRToken.NewInstance(Scene3DToken.SCNSETCAM);
        Scene3DToken.subrcoll["GET"] = SUBRToken.NewInstance(Scene3DToken.SCNGET);
        Scene3DToken.subrcoll["PUT"] = SUBRToken.NewInstance(Scene3DToken.SCNPUT);
        Scene3DToken.subrcoll["DUP"] = SUBRToken.NewInstance(Scene3DToken.SCNDUPLICATE);
        _SUBRDepo["Scene3D"] = Scene3DToken.subrcoll;
        VPGLGlobalDataBase.Put("Scene3D", initval, false);
    }
}
Scene3DToken.subrcoll = [];
Scene3DToken.classidstr = "Scene3D";
;
class Geometry3DToken extends DictToken {
    constructor() { super(); this.classid = Geometry3DToken.classidstr; this.sceneName = null; this.geoName = null; this.val = {}; }
    ;
    static NewInstance(val) {
        var tk = new Geometry3DToken();
        tk.sceneName = val.sceneName;
        tk.geoName = val.geoName;
        return tk;
    }
    ;
    Clone() { return Geometry3DToken.NewInstance(this.val); }
    ;
    ToJSStruct() { return { typeid: "3DGEO" }; }
    ;
    static GEOGET(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "3DGEOGET", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var eid = _NewEventId();
        cxt.status = Status.blocked;
        _suspendedContext[eid] = cxt;
        var me = inTokenInOrder[0];
        postMessage({ cmd: "GEO3DGET", scn: me.sceneName, geo: me.geoName, eid: eid, exmode: mode }, null);
        return { status: "GET on Geometry3D", ret: ReturnCode.blocking, outputInOrder: [NumberToken.NewInstance(eid), null, null] };
    }
    ;
    static GEOPUT(mode, cxt, inTokenInOrder, option) {
        return { status: "3DGEOPUT : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null] };
    }
    ;
    static GEODUPLICATE(mode, cxt, inTokenInOrder, option) {
        return { status: "3DGEODUP : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null] };
    }
    ;
    static SET(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null)
            return { status: "GEO3DSET", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var toBeSubmittedToken = null;
        if (option !== null && option !== "")
            toBeSubmittedToken = Token.FromLiteral(option).val;
        else if (inTokenInOrder[1] === null)
            return { status: "3DGEOSET", ret: ReturnCode.needMoreToken, outputInOrder: null };
        else
            toBeSubmittedToken = inTokenInOrder[1];
        if (toBeSubmittedToken === undefined || toBeSubmittedToken === null)
            return { status: "3DGEOSET : invalid scene name type", ret: ReturnCode.error, outputInOrder: null };
        var toBeSubmitted = toBeSubmittedToken.ToJSStruct();
        if (toBeSubmitted === undefined || toBeSubmitted === null)
            return { status: "3DGEOSET : invalid setting value", ret: ReturnCode.error, outputInOrder: null };
        var eid = _NewEventId();
        cxt.status = Status.blocked;
        _suspendedContext[eid] = cxt;
        var me = inTokenInOrder[0];
        postMessage({ cmd: "GEO3DSET", scn: me.sceneName, geo: me.geoName, tobeset: toBeSubmitted, eid: eid, exmode: mode }, null);
        return { status: "SET on Geometry3D", ret: ReturnCode.blocking, outputInOrder: [NumberToken.NewInstance(eid), null, null] };
    }
    ;
    static GEOLOOK(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return { status: "GEOLOOK", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var atx = inTokenInOrder[1].Get(0).AsNumber();
        var aty = inTokenInOrder[1].Get(1).AsNumber();
        var atz = inTokenInOrder[1].Get(2).AsNumber();
        if (atx === null || aty === null || atz === null)
            return { status: "GEOLOOK - INVALID ARG", ret: ReturnCode.error, outputInOrder: null };
        var eid = _NewEventId();
        cxt.status = Status.blocked;
        _suspendedContext[eid] = cxt;
        var me = inTokenInOrder[0];
        postMessage({ cmd: "GEO3DLOOK", scn: me.sceneName, geo: me.geoName, x: atx, y: aty, z: atz, eid: eid, exmode: mode }, null);
        return { status: "LOOK at GEO3D", ret: ReturnCode.blocking, outputInOrder: [NumberToken.NewInstance(eid), null, null] };
    }
    ;
    /*
        private static ANGLE(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
            if(inTokenInOrder[0] === null || inTokenInOrder[1] === null )
                return {status: "GEO3DANGLE", ret: ReturnCode.needMoreToken, outputInOrder: null};
            var angle: Token = inTokenInOrder[1]; // must be Array
            var rotx: number = angle.Get(0).AsNumber();
            var roty: number = angle.Get(1).AsNumber();
            var rotz: number = angle.Get(2).AsNumber();
            if (rotx === null || roty === null || rotz === null)
                return {status: "GEO3DANGLE : invalid angle", ret: ReturnCode.error, outputInOrder: null};
            var refs: string[] = (<Geometry3DToken>inTokenInOrder[0]).refstr.split('<');
            var geoname = refs[0];
            var scnname = refs[1];
    
            var eid: number = _NewEventId();
            cxt.status = Status.blocked;
            _suspendedContext[eid] = cxt;
    
            postMessage({cmd: "GEO3DANGLE", scn: scnname, geo: geoname, x: rotx, y: roty, z: rotz, eid:eid, exmode: mode}, null);
            return {status: "ANGLE on Geometry3D", ret: ReturnCode.blocking, outputInOrder: [NumberToken.NewInstance(eid), null, null]};
        };
    
        private static APPEAR(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
            var optional : boolean = (option !== undefined && option !== null);
            if(optional && inTokenInOrder[0] === null)
                return {status: "GEO3DAPPEAR", ret: ReturnCode.needMoreToken, outputInOrder: null};
            if(!optional && (inTokenInOrder[0] === null || inTokenInOrder[1] === null))
                return {status: "GEO3DAPPEAR", ret: ReturnCode.needMoreToken, outputInOrder: null};
            var appearance : boolean = (optional)?Token.FromLiteral(option).val.AsBool():inTokenInOrder[1].AsBool();
            if (appearance === undefined || appearance === null)
            return {status: "GEO3DAPPEAR : invalid value", ret: ReturnCode.error, outputInOrder: null};
            var refs = (<Geometry3DToken>inTokenInOrder[0]).refstr.split('<');
            var geoname = refs[0];
            var scnname = refs[1];
            postMessage({cmd: 'GEO3DAPPEAR', scn: scnname, geo: geoname, appearance: appearance, exmode:mode}, null);
            return {status: "Geometry3D:APPEAR", ret: ReturnCode.ok, outputInOrder:[inTokenInOrder[0],null, null]};
        };
    
        private static POS(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
            if(inTokenInOrder[0] === null || inTokenInOrder[1] === null )
                return {status: "GEO3DPOS", ret: ReturnCode.needMoreToken, outputInOrder: null};
            var pos: Token = inTokenInOrder[1];
            var posx:number = pos.Get(0).AsNumber();
            var posy:number = pos.Get(1).AsNumber();
            var posz:number = pos.Get(2).AsNumber();
            if (posx === null || posy === null || posz === null)
                return {status: "GEO3DPOS : invalid position", ret: ReturnCode.error, outputInOrder: null};
            var refs: string[] = (<Geometry3DToken>inTokenInOrder[0]).refstr.split('<');
            var geoname = refs[0];
            var scnname = refs[1];
    
            var eid: number = _NewEventId();
            cxt.status = Status.blocked;
            _suspendedContext[eid] = cxt;
    
            postMessage({cmd: 'GEO3DPOS', scn: scnname, geo: geoname, x: posx, y: posy, z: posz, eid: eid, exmode:mode}, null);
            return {status: "POS on Geometry3D", ret: ReturnCode.blocking, outputInOrder: [NumberToken.NewInstance(eid), null, null]};
        };
    */
    // GEO::ATTACH
    //      in0 : geomery3D
    //      in1 : object to be attached
    //      in2 : {"msg": methodName, "ect": eventName}
    //
    //      out0: in0 - geometry3D
    //
    static ATTACH(mode, cxt, inTokenInOrder, option) {
        if (inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return { status: "GEO::ATTACH", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var geo = inTokenInOrder[0];
        if (inTokenInOrder[2] === null && option !== null && option !== '')
            inTokenInOrder[2] = Token.FromLiteral(option).val;
        if (inTokenInOrder[2] === undefined || inTokenInOrder[2] === null)
            return { status: "GEO::ATTACH", ret: ReturnCode.needMoreToken, outputInOrder: null };
        var tmp = inTokenInOrder[2].Get("msg");
        if (tmp === undefined || tmp === null)
            return { status: "GEO::ATTACH - msg not found", ret: ReturnCode.error, outputInOrder: null };
        var msg = tmp.AsString();
        if (msg === undefined || msg === null)
            return { status: "GEO::ATTACH - invalid msg", ret: ReturnCode.error, outputInOrder: null };
        tmp = inTokenInOrder[2].Get("evt");
        if (tmp === undefined || tmp === null)
            return { status: "GEO::ATTACH - evt not found", ret: ReturnCode.error, outputInOrder: null };
        var evt = tmp.AsString();
        if (evt === undefined || evt === null)
            return { status: "GEO:ATTACH - invlid msg", ret: ReturnCode.error, outputInOrder: null };
        _CBTable.push({ scn: geo.sceneName, target: geo.geoName, opname: msg, event: evt, obj: inTokenInOrder[1], exmode: mode });
        return { status: "3DGeo::ATTACH", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null] };
    }
    ;
    static RegisterSelf() {
        Token.InstallClass("Geometry3D", Geometry3DToken.NewInstance, Geometry3DToken.FromLiteral, Geometry3DToken.JSONRcv, Geometry3DToken.JSONRpl);
        var initval = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("Dictionary")]));
        Geometry3DToken.subrcoll["SET"] = SUBRToken.NewInstance(Geometry3DToken.SET);
        Geometry3DToken.subrcoll["LOOK"] = SUBRToken.NewInstance(Geometry3DToken.GEOLOOK);
        Geometry3DToken.subrcoll["ATTACH"] = SUBRToken.NewInstance(Geometry3DToken.ATTACH);
        Geometry3DToken.subrcoll["GET"] = SUBRToken.NewInstance(Geometry3DToken.GEOGET);
        //Geometry3DToken.subrcoll["PUT"] = SUBRToken.NewInstance(Geometry3DToken.GEOPUT);
        //Geometry3DToken.subrcoll["DUP"] = SUBRToken.NewInstance(Geometry3DToken.GEODUPLICATE);
        _SUBRDepo["Geometry3D"] = Geometry3DToken.subrcoll;
        VPGLGlobalDataBase.Put("Geometry3D", initval, false);
    }
}
Geometry3DToken.subrcoll = [];
Geometry3DToken.classidstr = "Geometry3D";
;
class GridToken extends DictToken {
    constructor() { super(); this.classid = GridToken.classidstr; this.val = null; this.val = {}; }
    ;
    static NewInstance(val) {
        var tk = new GridToken();
        if (val.val !== undefined)
            tk.val = (val.val);
        else
            tk.val = val;
        return tk;
    }
    ;
    static FromLiteral(literal) { return null; }
    ;
    Clone() { return GridToken.NewInstance(this.val); }
    ;
    ToJSStruct() { return { typeid: "Grid" }; }
    ;
    static JSONRcv(key, value) { return GridToken.NewInstance(value.val); }
    ;
    static JSONRpl(key, value) { return { classid: "Grid", val: value.val }; }
    ;
    static MakeWaitingQueue(grid, cxt, inTokenInOrder) {
        var method = grid;
        var incondStr = method.Get("indir").AsString();
        var gridSize = method.Get("size").AsNumber();
        var center = Math.floor(gridSize / 2);
        var pos = [{ x: center, y: 0 }, { x: 0, y: center }, { x: gridSize - 1, y: center }, { x: center, y: gridSize - 1 }];
        for (var i = 0; i < incondStr.length; i++) {
            var edge = "TLRB".indexOf(incondStr[i]);
            var edgePosition = "ABCDEFG".charAt(pos[edge].x) + "1234567".charAt(pos[edge].y);
            var tile = method.Get(edgePosition);
            var childWqe = new WaitingQeueuEntry();
            var childContext = new VPGLContext(childWqe, _NewEventId());
            var tmp;
            childContext.classname = null;
            for (var ii = 0; ii < inTokenInOrder.length; ii++) {
                if ((tmp = inTokenInOrder[ii]) !== null) {
                    childContext.classname = tmp.ClassId();
                    break;
                }
            }
            childContext.opname = tile.Get("opname").AsString();
            childContext.option = tile.Get("option").AsString();
            childContext.incond = tile.Get("indir").AsString();
            childContext.outdir = tile.Get("outdir").AsString();
            childContext.targetTile = tile;
            childContext.position = edgePosition;
            var counterInNumber = childContext.incond.indexOf("TLRB"[edge]);
            childContext.arrivedTokensInOrder[counterInNumber] = inTokenInOrder[i];
            childContext.status = Status.canbetry;
            childWqe.child = childContext;
            childWqe.parent = cxt;
            childContext.depthlevel = childWqe.parent.depthlevel + 1;
            cxt.PutWaitingQueue(childWqe);
        }
        ;
        cxt.gridobj = grid;
        return { status: "Grid installs its new context", ret: ReturnCode.canDoMore, outputInOrder: null };
    }
    ;
    static CanFire(inCond, ifAll, inTokenInOrder) {
        var effectiveTokenCount = 0;
        if (inCond === null)
            return false;
        for (var i = 0; i < inCond.length; i++)
            if (inTokenInOrder[i] !== null)
                effectiveTokenCount++;
        if (ifAll)
            return (effectiveTokenCount >= inCond.length);
        else
            return (effectiveTokenCount >= 1);
    }
    ;
    EvalStep(mode, cxt, opname, option, inTokenInOrder) {
        var tmp;
        var gridop = this.Get("opname").AsString();
        if (gridop !== opname)
            // return this.superClasses[0].EvalStep(mode, self, cxt, opname, option, inTokenInOrder);
            return { status: "Grid:EvalStep() - SuperClass case is not implemented", ret: ReturnCode.notImplementedCase, outputInOrder: null };
        ;
        var incond = this.Get("indir").AsString();
        var ifall = this.Get("ifall").AsBool();
        if (!GridToken.CanFire(incond, ifall, inTokenInOrder))
            return { status: "Input1-3 not satisfied", ret: ReturnCode.needMoreToken, outputInOrder: null };
        if (cxt.gridobj === null) {
            return GridToken.MakeWaitingQueue(this, cxt, inTokenInOrder);
        }
        ;
        return { status: "Grid:EvalStep() - already Expanded", ret: ReturnCode.notImplementedCase, outputInOrder: null };
    }
    ;
    static GRIDGET(mode, cxt, inTokenInOrder, option) {
        return { status: "GRIDGET : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null] };
    }
    ;
    static GRIDPUT(mode, cxt, inTokenInOrder, option) {
        return { status: "GRIDPUT : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null] };
    }
    ;
    static GRIDDUPLICATE(mode, cxt, inTokenInOrder, option) {
        return { status: "GRIDDUP : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null] };
    }
    ;
    static RegisterSelf() {
        Token.InstallClass("Grid", GridToken.NewInstance, GridToken.FromLiteral, GridToken.JSONRcv, GridToken.JSONRpl);
        var initval = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("Dictionary")]));
        GridToken.subrcoll["GET"] = SUBRToken.NewInstance(GridToken.GRIDGET);
        GridToken.subrcoll["PUT"] = SUBRToken.NewInstance(GridToken.GRIDPUT);
        GridToken.subrcoll["DUP"] = SUBRToken.NewInstance(GridToken.GRIDDUPLICATE);
        _SUBRDepo["Grid"] = GridToken.subrcoll;
        VPGLGlobalDataBase.Put("Grid", initval, false);
    }
    ;
}
GridToken.subrcoll = [];
GridToken.classidstr = "Grid";
; // GridClass
class SUBRToken extends TToken {
    constructor() { super(); this.classid = SUBRToken.classidstr; this.proc = null; }
    ;
    static NewInstance(val) {
        var tk = new SUBRToken();
        tk.proc = val;
        return tk;
    }
    ;
    static FromLiteral(literal) { return null; }
    ;
    static JSONRcv(key, value) { return null; }
    ;
    static JSONRpl(key, value) { return null; }
    ;
    Clone() { return this; }
    ;
    ToJSStruct() { return { typeid: "SUBR" }; }
    ;
    Subr() { return this.proc; }
    ;
    EvalStep(mode, cxt, opname, option, inTokenInOrder) {
        return this.proc(mode, cxt, inTokenInOrder, option);
    }
    ;
    static RegisterSelf() {
        Token.InstallClass("SUBR", SUBRToken.NewInstance, SUBRToken.FromLiteral, SUBRToken.JSONRcv, SUBRToken.JSONRpl);
        var initval = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("T")]));
        _SUBRDepo["SUBR"] = SUBRToken.subrcoll;
        VPGLGlobalDataBase.Put("SUBR", initval, false);
    }
    ;
}
SUBRToken.subrcoll = [];
SUBRToken.classidstr = "SUBR";
;
class TileToken extends DictToken {
    constructor() { super(); this.classid = TileToken.classidstr; this.val = null; this.val = {}; }
    ;
    static NewInstance(val) {
        var tk = new TileToken();
        if (val.classid !== undefined)
            tk.val = val.val;
        else
            tk.val = val;
        return tk;
    }
    ;
    static FromLiteral(literal) { return null; }
    ;
    Clone() { return TileToken.NewInstance(this.val); }
    ;
    ToJSStruct() { return { typeid: "Tile" }; }
    ;
    static JSONRcv(key, value) { return TileToken.NewInstance(value.val); }
    ;
    static JSONRpl(key, value) { return { classid: "Tile", val: value.val }; }
    ;
    static EvalStep(mode, self, cxt, opname, option, inTokenInOrder) {
        var tmp;
        var target = inTokenInOrder[0];
        if (target !== null) {
            var exeTk = target.Where(opname);
            if (exeTk === null || exeTk === undefined)
                if (cxt.parent.parent !== undefined && cxt.parent.parent !== null)
                    return { status: "NoSuchOp : " + opname + " for " + cxt.classname + " at: " + cxt.position + " of " + cxt.parent.parent.classname + "::" + cxt.parent.parent.opname, ret: ReturnCode.noSuchOp, outputInOrder: null };
                else
                    return { status: "NoSuchOp : " + opname, ret: ReturnCode.noSuchOp, outputInOrder: null };
            return exeTk.EvalStep(mode, cxt, opname, option, inTokenInOrder);
        }
        ;
        for (var i = 0; i < inTokenInOrder.length; i++)
            if ((target = inTokenInOrder[i]) !== null)
                break;
        if (target !== null) { // try whether opname is ifall===false;
            var exeTk = target.Where(opname);
            if (exeTk === undefined || exeTk === null)
                return { status: "input0 is not arrived.", ret: ReturnCode.needMoreToken, outputInOrder: null };
            var result = exeTk.EvalStep(mode, cxt, opname, option, inTokenInOrder);
            if (result.ret === ReturnCode.ok || result.ret === ReturnCode.canDoMore || result.ret === ReturnCode.stepStop)
                return result;
            else
                return { status: "Need more tokens", ret: ReturnCode.needMoreToken, outputInOrder: null };
        }
        else
            return { status: "input0 is not arrived.", ret: ReturnCode.needMoreToken, outputInOrder: null };
    }
    ;
    static TILEGET(mode, cxt, inTokenInOrder, option) {
        return { status: "TILEGET : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null] };
    }
    ;
    static TILEPUT(mode, cxt, inTokenInOrder, option) {
        return { status: "TILEPUT : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null] };
    }
    ;
    static TILEDUPLICATE(mode, cxt, inTokenInOrder, option) {
        return { status: "TILEDUP : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null] };
    }
    ;
    static RegisterSelf() {
        Token.InstallClass("Tile", TileToken.NewInstance, TileToken.FromLiteral, TileToken.JSONRcv, TileToken.JSONRpl);
        var initval = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("Dictionary")]));
        TileToken.subrcoll["GET"] = SUBRToken.NewInstance(TileToken.TILEGET);
        TileToken.subrcoll["PUT"] = SUBRToken.NewInstance(TileToken.TILEPUT);
        TileToken.subrcoll["DUP"] = SUBRToken.NewInstance(TileToken.TILEDUPLICATE);
        _SUBRDepo["Tile"] = TileToken.subrcoll;
        VPGLGlobalDataBase.Put("Tile", initval, false);
    }
    ;
}
TileToken.subrcoll = [];
TileToken.classidstr = "Tile";
; // TileClass
class UserDefinedClassToken extends Token {
    constructor() { super(); this.classid = UserDefinedClassToken.classidstr, this.val = null; }
    ;
    static NewInstance(val) {
        var tk = new UserDefinedClassToken();
        tk.typeid = val.typeid;
        tk.val = val.val;
        return tk;
    }
    static JSONRcv(key, value) { return UserDefinedClassToken.NewInstance(value.val); }
    ;
    static JSONRpl(key, value) { return '{"typeid": "' + value.typeid + '", "val" : ' + JSON.stringify(value.val, Token.JSONReplacer) + '}'; }
    ;
    static FromLiteral(literal) {
        var tmp = null;
        literal = literal.trim();
        if (literal.charAt(0) !== '<')
            return null;
        literal = literal.slice(1);
        if ((tmp = StringToken.FromLiteral(literal)) === null || tmp === undefined)
            return null;
        var clsname = tmp.val.AsString();
        if (VPGLGlobalDataBase.Get(clsname) === undefined)
            return null;
        var val = null;
        literal = tmp.rest.trim();
        if (literal.charAt(0) === '>')
            return { val: UserDefinedClassToken.NewInstance({ typeid: clsname, val: null }), rest: literal.slice(1) };
        if ((tmp = Token.FromLiteral(literal)) === null || tmp === undefined)
            return null;
        val = tmp.val;
        literal = tmp.rest.trim();
        if (literal.charAt(0) === '>')
            return { val: UserDefinedClassToken.NewInstance({ typeid: clsname, val: val }), rest: literal.slice(1) };
        return null;
    }
    ;
    Clone() { return UserDefinedClassToken.NewInstance({ typeid: this.typeid, val: this.val.Clone() }); }
    ;
    ToJSStruct() { return { typeid: this.typeid, val: this.val.ToJSStruct() }; }
    ;
    SearchSC(cls, key) {
        var result = null;
        if (cls === UserDefinedClassToken.classidstr)
            cls = this.typeid;
        var clsdef = VPGLGlobalDataBase.Get(cls);
        if (clsdef === undefined || clsdef === null)
            return null;
        var sclist = clsdef.Get(SuperClassesKey);
        var self = this;
        sclist.ForAll(function (xkey, val) {
            var clsname = val.AsString();
            if (clsname === undefined || clsname === null)
                return false;
            var cld = VPGLGlobalDataBase.Get(clsname);
            if (cld !== undefined && cld !== null) {
                result = cld.Get(key);
                if (result !== undefined && result !== null)
                    return true;
            }
            if (_SUBRDepo[clsname] !== undefined && _SUBRDepo[clsname] !== null) {
                result = _SUBRDepo[clsname][key];
                if (result !== undefined && result !== null)
                    return true;
            }
            result = self.SearchSC(clsname, key);
            if (result !== undefined && result !== null)
                return true;
            return false;
        });
        return result;
    }
    ;
    Where(key) {
        var result = this.Get(key);
        if (result !== undefined && result !== null)
            return result;
        var clsdef = VPGLGlobalDataBase.Get(this.typeid);
        if (clsdef !== undefined && clsdef !== null) {
            result = clsdef.Get(key);
            if (result !== undefined && result !== null)
                return result;
        }
        ;
        return super.Where(key);
    }
    ;
    AsString() {
        return '< ' + this.typeid + ' ' + ((this.val === null) ? "" : this.val.AsString()) + ' >';
    }
    ;
    static RegisterSelf() {
        Token.InstallClass("UserDefinedToken", UserDefinedClassToken.NewInstance, UserDefinedClassToken.FromLiteral, UserDefinedClassToken.JSONRcv, UserDefinedClassToken.JSONRpl);
    }
    ;
}
UserDefinedClassToken.subrcoll = [];
UserDefinedClassToken.classidstr = "UserDefined";
;
class WaitingQeueuEntry {
    constructor() {
        this.parent = null;
        this.child = null;
    }
    GetStatus() { return this.child.status; }
    GetNextPosition(pos, dir) {
        if (dir < 0) {
            postMessage({ cmd: 'ERRROR', msg: "in-out mismatch Check:" + this.parent.opname + " : " + pos }, null);
            return null;
        }
        ;
        var offsets = [{ x: 0, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
        var nextX = "WABCDEFGX".charAt("ABCDEFG".indexOf(pos[0]) + 1 + offsets[dir].x);
        var nextY = "Y1234567Z".charAt("1234567".indexOf(pos[1]) + 1 + offsets[dir].y);
        return nextX + nextY;
    }
    ;
    IsOutOfBounds(pos, gSize) {
        var x = "WABCDEFGX".indexOf(pos[0]) - 1;
        var y = "Y1234567Z".indexOf(pos[1]) - 1;
        if (x < 0)
            return DirectionW.left;
        if (x >= gSize)
            return DirectionW.right;
        if (y < 0)
            return DirectionW.top;
        if (y >= gSize)
            return DirectionW.bottom;
        return DirectionW.void;
    }
    ;
    DeliverOut(outputs) {
        var somethingDelivered = false;
        if (outputs === null || outputs === undefined)
            return;
        for (var i = 0; i < outputs.length; i++) {
            if (outputs[i] === null)
                continue;
            var tmp;
            var dir = "TLRB".indexOf(this.child.outdir[i]);
            var obDir;
            var nextPosition = this.GetNextPosition(this.child.position, dir);
            if (nextPosition === null)
                return;
            if (this.parent === null)
                return;
            if ((obDir = this.IsOutOfBounds(nextPosition, this.parent.gridobj.Get("size").AsNumber()))
                === DirectionW.void) { // in bounds case
                var newContext = this.parent.GetContext(nextPosition);
                if (newContext === null) {
                    newContext = new VPGLContext(this, _NewEventId());
                    var wqe = new WaitingQeueuEntry();
                    wqe.child = newContext;
                    wqe.parent = this.parent;
                    newContext.parent = wqe;
                    newContext.depthlevel = wqe.parent.depthlevel + 1;
                    this.parent.PutWaitingQueue(wqe);
                }
                ;
                newContext.position = nextPosition;
                tmp = this.parent.gridobj;
                newContext.targetTile = tmp.Get(nextPosition);
                if (newContext.targetTile === undefined || newContext === null) {
                    postMessage({ cmd: "ERROR", message: "No Tile at " + nextPosition + " of " + tmp.Get("opname").AsString() + " in " + this.parent.classname }, null);
                    return;
                }
                if (newContext.classname === null) {
                    newContext.classname = outputs[i].ClassId();
                }
                ;
                newContext.opname = newContext.targetTile.Get("opname").AsString();
                newContext.option = newContext.targetTile.Get("option").AsString();
                newContext.incond = newContext.targetTile.Get("indir").AsString();
                newContext.outdir = newContext.targetTile.Get("outdir").AsString();
                newContext.status = Status.canbetry;
                var dstInput = newContext.incond.indexOf("BRLT".charAt(dir));
                newContext.arrivedTokensInOrder[dstInput] = outputs[i];
                if (this.child.activeChild === null && this.child.waitingQueue.length <= 0) {
                    var wqe = this;
                    while (wqe !== undefined && wqe !== null && wqe.child !== null && wqe.child.activeChild === null && wqe.child.waitingQueue.length <= 0) {
                        _DeleteFromActiveContext(wqe.child);
                        if (wqe.parent !== undefined && wqe.parent !== null) {
                            wqe.parent.activeChild = null;
                            wqe = wqe.parent.parent;
                        }
                        else
                            break;
                    }
                    ;
                }
            }
            else { // getting out from this Grid with DirectionW:obDir
                var contextToReturn = this.parent.parent;
                var position = this.GetNextPosition(this.parent.position, obDir);
                tmp = this.parent.gridobj;
                var godir = tmp.Get("outdir").AsString();
                //var ifall : boolean = (tmp2 = tmp.Attributes().Search("IFALL")).AsBool(tmp2).val;
                this.parent.toBeEmittedInOrder[godir.indexOf("TLRB"[obDir])] = outputs[i];
                //if (!ifall || (this.parent.activeChild == null && this.parent.waitingQueue.length === 0))
                this.parent.parent.DeliverOut(this.parent.toBeEmittedInOrder);
                for (var k = 0; k < 4; k++)
                    this.parent.toBeEmittedInOrder[k] = null;
            }
            ;
            somethingDelivered = true;
        }
        ;
        // The case on the child context emits no token.
        if (!somethingDelivered) {
            var wqe = this;
            while (wqe !== undefined && wqe !== null && wqe.child !== null && wqe.child.activeChild === null && wqe.child.waitingQueue.length <= 0) {
                _DeleteFromActiveContext(wqe.child);
                if (wqe.parent !== undefined && wqe.parent !== null) {
                    wqe.parent.activeChild = null;
                    wqe = wqe.parent.parent;
                }
                else
                    break;
            }
        }
        ;
    }
    ;
    ExecOne(mode) {
        var childContext = this.child;
        if (childContext !== null) {
            if (this.GetStatus() === Status.resumeFromWaiting) {
                this.DeliverOut(childContext.toBeEmittedInOrder);
                return { status: "Resuming from Waiting", ret: ReturnCode.ok, outputInOrder: [null, null, null] };
            }
            ;
            var result = childContext.OneStep(mode);
            if (result.ret === ReturnCode.ok || result.ret === ReturnCode.stepStop) {
                this.DeliverOut(result.outputInOrder);
                result.status = "Deiver outputs";
                return result;
            }
            ;
            return result;
        }
        else
            return { status: "WQE:ExecOne() - no child", ret: ReturnCode.malformed, outputInOrder: null };
    }
    ;
}
; // class WaitingQueueEntry
class VPGLContext {
    ConvertToOrder2(inputsInDirection, incondstr) {
        if (inputsInDirection === null)
            return null;
        if (incondstr !== null) {
            var resultInOrder = [null, null, null, null];
            for (var i = 0; i < incondstr.length; i++) {
                resultInOrder[i] = inputsInDirection["TRLB".indexOf(incondstr.charAt(i))];
            }
            ;
            return resultInOrder;
        }
        ;
        return null;
    }
    constructor(parent, identifier) {
        this.identifier = -1;
        this.depthlevel = -1;
        this.parent = null;
        this.activeChild = null;
        this.waitingQueue = null;
        this.arrivedTokensInOrder = [null, null, null, null];
        this.toBeEmittedInOrder = [null, null, null];
        this.gridobj = null;
        this.targetTile = null;
        this.position = null;
        this.incond = null;
        this.outdir = null;
        this.opname = null;
        this.classname = null;
        this.option = null;
        this.identifier = identifier;
        this.parent = parent;
        this.waitingQueue = [];
        _activeContexts.push(this);
    }
    ;
    PutWaitingQueue(wqe) {
        this.waitingQueue = [wqe].concat(this.waitingQueue);
    }
    ;
    GetContext(pos) {
        for (var i = 0; i < this.waitingQueue.length; i++)
            if (this.waitingQueue[i].child.position === pos)
                return this.waitingQueue[i].child;
        return null;
    }
    ;
    Install(target, opname, option, inputsInDirection) {
        var inputsInOrder = this.ConvertToOrder2(inputsInDirection, "TLRB");
        this.arrivedTokensInOrder = inputsInOrder;
        this.position = null;
        this.opname = opname;
        this.classname = target.ClassId();
        this.option = option;
        this.status = Status.canbetry;
        var methodDefinition = null;
        if (target.ClassId() === 'UserDefined')
            methodDefinition = VPGLGlobalDataBase.Get(target.typeid).Get(opname);
        else
            methodDefinition = VPGLGlobalDataBase.Get(target.ClassId()).Get(opname);
        if (methodDefinition === undefined || methodDefinition === null) {
            postMessage({ cmd: "ERROR", msg: "Nosuch CallBack Proc : " + opname }, null);
            return; // error
        }
        ;
        GridToken.MakeWaitingQueue(methodDefinition, this, inputsInDirection);
    }
    ;
    CanFire() {
        var ifall = true;
        if (this.opname === "FLOW")
            ifall = false;
        return GridToken.CanFire(this.incond, ifall, this.arrivedTokensInOrder);
    }
    TraceSearch() {
        var result = null;
        if (this.activeChild !== null) {
            result = this.activeChild.child.TraceSearch();
            if (result !== null)
                return result;
        }
        ;
        if (this.waitingQueue !== null && this.waitingQueue.length > 0) {
            for (var i = 0; i < this.waitingQueue.length; i++) {
                var wqe = this.waitingQueue[i];
                var wqeStatus = wqe.GetStatus();
                if (wqeStatus === Status.canbetry || wqeStatus === Status.resumeFromWaiting) {
                    if (wqe.child.CanFire())
                        return wqe;
                }
                ;
            }
            ;
        }
        ;
        return null;
    }
    ;
    TraceSearch2(className, methodName, posstr) {
        var opname = null;
        var tmp, tmp2, tmp3, tmp4;
        if ((tmp = VPGLGlobalDataBase.Get(className)) !== undefined && tmp !== null
            && (tmp2 = tmp.Get(methodName)) !== undefined && tmp2 !== null
            && (tmp3 = tmp2.Get(posstr)) !== undefined && tmp3 !== null
            && (tmp4 = tmp3.Get("opname")) !== undefined && tmp4 !== null)
            opname = tmp4.AsString();
        if (opname !== null)
            return this.TraceSearch3(opname, posstr);
        else
            return null;
    }
    ;
    TraceSearch3(opname, posstr) {
        var result = null;
        if (this.activeChild !== null) {
            result = this.activeChild.child.TraceSearch3(opname, posstr);
            if (result !== null)
                return result;
        }
        ;
        if (this.waitingQueue !== null && this.waitingQueue.length > 0) {
            for (var i = 0; i < this.waitingQueue.length; i++) {
                var wqe = this.waitingQueue[i];
                if (wqe.child.opname === opname && wqe.child.position === posstr)
                    return wqe;
            }
            ;
        }
        ;
        return null;
    }
    FindOne() {
        var result = null;
        if (this.activeChild !== null) {
            result = this.activeChild.child.FindOne();
            if (result !== null)
                return result;
        }
        ;
        if (this.waitingQueue !== null && this.waitingQueue.length > 0) {
            for (var i = 0; i < this.waitingQueue.length; i++) {
                var wqe = this.waitingQueue[i];
                var wqeStatus = wqe.GetStatus();
                if (wqeStatus === Status.canbetry || wqeStatus === Status.resumeFromWaiting) {
                    this.waitingQueue.splice(i, 1);
                    return wqe;
                }
                ;
            }
            ;
        }
        ;
        return null;
    }
    ;
    GetBlocked() {
        var result = null;
        if (this.activeChild !== null) {
            result = this.activeChild.child.GetBlocked();
            if (result !== null)
                return result;
        }
        ;
        if (this.waitingQueue !== null && this.waitingQueue.length > 0) {
            for (var i = 0; i < this.waitingQueue.length; i++) {
                var wqe = this.waitingQueue[i];
                if (wqe.GetStatus() === Status.blocked)
                    return wqe;
            }
        }
        ;
        return null;
    }
    OneStep(mode) {
        var wqe;
        var result;
        if (this.status === Status.resumeFromWaiting)
            return this.parent.parent.OneStep(mode);
        if (this.gridobj === null)
            return TileToken.EvalStep(mode, this.targetTile, this, this.opname, this.option, this.arrivedTokensInOrder);
        if ((wqe = this.FindOne()) !== null) {
            if (_wkdebugging) {
                var bptk = null;
                var bp = -1;
                if (wqe.child.targetTile !== undefined && wqe.child.targetTile !== null && (bptk = wqe.child.targetTile.Get(BreakPointKey)) !== undefined && bptk !== null
                    && (bp = bptk.AsNumber()) !== undefined && bp !== null
                    && bp !== BreakPointState.off && bp !== BreakPointState.absent) {
                    if (bp === BreakPointState.hit) {
                        wqe.child.targetTile.Put(BreakPointKey, NumberToken.NewInstance(BreakPointState.on));
                    }
                    else {
                        if (GridToken.CanFire(wqe.child.incond, (wqe.child.opname !== "FLOW"), wqe.child.arrivedTokensInOrder)) {
                            wqe.parent.PutWaitingQueue(wqe);
                            wqe.child.targetTile.Put(BreakPointKey, NumberToken.NewInstance(BreakPointState.hit));
                            var clsname = wqe.parent.classname;
                            if (clsname === 'UserDefined')
                                clsname = wqe.parent.arrivedTokensInOrder[0].typeid;
                            _ForceUiRedraw(clsname, wqe.parent.opname, wqe.child);
                            return { status: "Stop with Break", ret: ReturnCode.breakStop, outputInOrder: null };
                        }
                    }
                }
            }
            result = wqe.ExecOne(mode);
            if (result.ret === ReturnCode.error || result.ret === ReturnCode.noSuchOp) {
                var opname = (wqe.parent !== null) ? wqe.parent.opname : "---";
                result.status += "At: " + wqe.child.position + " of " + wqe.child.classname + "::" + opname;
            }
            ;
            if (result.ret === ReturnCode.blocking) {
                if (_wkdebugging) {
                    var bptk = wqe.child.targetTile.Get(BreakPointKey);
                    var bp = BreakPointState.absent;
                    if (bptk !== undefined && bptk !== null)
                        bp = bptk.AsNumber();
                    var bpst = (bp !== null) ? bp : BreakPointState.off;
                    if (bpst === BreakPointState.on)
                        wqe.child.targetTile.Put(BreakPointKey, NumberToken.NewInstance(BreakPointState.hit));
                }
                if (wqe.child.status !== Status.resumeFromWaiting)
                    wqe.parent.PutWaitingQueue(wqe);
            }
            else if (result.ret === ReturnCode.needMoreToken) {
                wqe.child.status = Status.waiting;
                wqe.parent.PutWaitingQueue(wqe);
                result = { status: "need more token in this context, put back", ret: ReturnCode.ok, outputInOrder: [null, null, null, null] };
            }
            else if (result.ret === ReturnCode.canDoMore) {
                wqe.child.status = Status.canbetry;
                wqe.parent.activeChild = wqe;
            }
            else if (result.ret === ReturnCode.exhausted) {
                wqe.parent.activeChild = null;
            }
            ;
            return result;
        }
        ;
        if (this.GetBlocked() !== null)
            return { status: "Has blocked items", ret: ReturnCode.blocking, outputInOrder: null };
        if (this.waitingQueue.length <= 0 && this.activeChild === null)
            return { status: "Completed", ret: ReturnCode.exhausted, outputInOrder: null };
        else {
            var remaind = this.FindOne();
            return { status: "No Entry to be executable. But some tokens remain.", ret: ReturnCode.somethingRemain, outputInOrder: null };
        }
    }
    ;
    Go(mode) {
        var stopContext = null;
        var result = { status: "", ret: ReturnCode.ok, outputInOrder: null };
        while (result.ret === ReturnCode.canDoMore || result.ret === ReturnCode.ok || result.ret === ReturnCode.needMoreToken) {
            var tmpwqe = null;
            if (mode === ExecOption.stepIn && result.ret === ReturnCode.canDoMore)
                break;
            if (mode === ExecOption.stepOver && result.ret === ReturnCode.canDoMore)
                stopContext = (stopContext === null) ?
                    ((tmpwqe = this.TraceSearch().parent.parent) === undefined || tmpwqe == null) ? null : tmpwqe.parent
                    : stopContext;
            if (mode === ExecOption.stepOut) {
                var tmpwqe = this.TraceSearch();
                stopContext = (stopContext === null) ?
                    (tmpwqe === null || tmpwqe.parent.parent === undefined) ? null : tmpwqe.parent
                    : stopContext;
            }
            var outsave = result.outputInOrder;
            result = this.OneStep(mode);
            if (result.ret === ReturnCode.exhausted) {
                result.outputInOrder = outsave;
                break;
            }
            ;
            if (result.ret === ReturnCode.somethingRemain) {
                break;
            }
            _execcount++;
            if (_warningcount > 0 && _execcount > _warningcount) {
                _execcount = 0;
                if (!window.confirm("Execlimt:" + _warningcount + " is exceeded. continue?"))
                    break;
            }
            ;
            if (_wkdebugging && result.ret === ReturnCode.breakStop)
                break;
            if (_wkdebugging && mode === ExecOption.stepIn && (result.ret === ReturnCode.stepStop || result.ret === ReturnCode.ok)) {
                break;
            }
            ;
            if (_wkdebugging && mode === ExecOption.stepOver
                && (result.ret === ReturnCode.stepStop || result.ret === ReturnCode.ok)) {
                var htg = this.TraceSearch();
                var tmp;
                if (htg !== null && htg.parent !== null)
                    tmp = (stopContext === null ? true : (htg.parent.depthlevel <= stopContext.depthlevel));
                else
                    tmp = true;
                if (tmp)
                    break;
                else
                    result.ret = ReturnCode.ok;
            }
            ;
            if (_wkdebugging && mode === ExecOption.continue && result.ret === ReturnCode.stepStop)
                result.ret = ReturnCode.ok;
            if (_wkdebugging && mode === ExecOption.stepOut && result.ret === ReturnCode.stepStop) {
                var htg = this.TraceSearch();
                var tmp = (stopContext === null ? true : (htg.parent.depthlevel <= stopContext.depthlevel));
                if (tmp)
                    break;
                else
                    result.ret = ReturnCode.ok;
            }
            ;
        }
        ;
        if (result.ret === ReturnCode.blocking)
            _continueMode = mode;
        //        else if(result.ret !== ReturnCode.ok && result.ret !== ReturnCode.breakStop 
        //                && result.ret !== ReturnCode.stepStop && result.ret !== ReturnCode.canDoMore)
        //            gui.Alert("VPGL Executor", "End with\n"+result.status, null,'jqconsole-warning');
        return result;
    }
    ;
    TraceInfo(className, methodName, tx, ty) {
        var result = { toDoNext: false, setBP: false, topToken: "", leftToken: "", rightToken: "", bottomToken: "" };
        var posstr = "ABCDEFG".charAt(tx) + "1234567".charAt(ty);
        var tg = this.TraceSearch2(className, methodName, posstr);
        if (tg === null || tg.child === null) {
            var bp = false;
            var tmp, tmp2, tmp3, tmp4;
            var tmp5 = BreakPointState.off;
            if ((tmp = VPGLGlobalDataBase.Get(className)) !== undefined && tmp !== null) {
                if ((tmp2 = tmp.Get(methodName)) !== undefined && tmp2 !== null) {
                    if ((tmp3 = tmp2.Get(posstr)) !== undefined && tmp3 !== null) {
                        if ((tmp4 = tmp3.Get(BreakPointKey)) !== undefined && tmp4 !== null) {
                            if ((tmp5 = tmp4.AsNumber()) === undefined || tmp5 === null)
                                tmp5 = BreakPointState.off;
                        }
                        ;
                    }
                    ;
                }
                ;
            }
            ;
            if (tmp5 !== BreakPointState.off)
                bp = true;
            return { toDoNext: false, setBP: bp, topToken: null, leftToken: null, rightToken: null, bottomToken: null };
        }
        ;
        var matchClass = (tg.parent.classname === "UserDefined") ?
            (tg.parent.arrivedTokensInOrder[0].typeid === className)
            : tg.parent.classname === className;
        if (matchClass && tg.parent.opname === methodName
            && tg.child.position === posstr) {
            result.toDoNext = (tg.child.CanFire() || tg.child.status === Status.resumeFromWaiting);
            var tmp8 = tg.child.targetTile.Get(BreakPointKey);
            if (tmp8 === undefined || tmp === null)
                result.setBP = false;
            else {
                result.setBP = true;
            }
            var dirTokens = [null, null, null, null];
            for (var i = 0; i < tg.child.incond.length; i++) {
                dirTokens["TLRB".indexOf(tg.child.incond.charAt(i))] = tg.child.arrivedTokensInOrder[i];
            }
            result.topToken = dirTokens[DirectionW.top] === null ? "" : dirTokens[DirectionW.top].ToLiteral();
            result.leftToken = dirTokens[DirectionW.left] === null ? "" : dirTokens[DirectionW.left].ToLiteral();
            result.rightToken = dirTokens[DirectionW.right] === null ? "" : dirTokens[DirectionW.right].ToLiteral();
            result.bottomToken = dirTokens[DirectionW.bottom] === null ? "" : dirTokens[DirectionW.bottom].ToLiteral();
            return result;
        }
        else {
            result.toDoNext = false;
            var i;
            var tgx = null;
            for (i = 0; i < tg.parent.waitingQueue.length; i++)
                if (tg.parent.waitingQueue[i].child.position === posstr) {
                    tgx = tg.parent.waitingQueue[i];
                    break;
                }
            if (tgx === null) {
                var classtoken = VPGLGlobalDataBase.Get(className);
                var methodtoken = (classtoken !== null) ? classtoken.Get(methodName) : null;
                var tiletoken = (methodtoken !== null) ? methodtoken.Get(posstr) : null;
                var bpstate = (tiletoken !== null) ? (tiletoken.Get(BreakPointKey).AsNumber()) : null;
                var bp = (bpstate !== null && bpstate !== BreakPointState.off);
                return { toDoNext: false, setBP: bp, topToken: null, leftToken: null, rightToken: null, bottomToken: null };
            }
            var tmp9 = tgx.child.targetTile.Get(BreakPointKey);
            if (tmp9 === undefined || tmp9 === null)
                result.setBP = false;
            else {
                result.setBP = true;
            }
            ;
            var dirTokens = [null, null, null, null];
            for (var i = 0; i < tgx.child.incond.length; i++) {
                dirTokens["TLRB".indexOf(tgx.child.incond.charAt(i))] = tgx.child.arrivedTokensInOrder[i];
            }
            result.topToken = dirTokens[DirectionW.top] === null ? "" : dirTokens[DirectionW.top].ToLiteral();
            result.leftToken = dirTokens[DirectionW.left] === null ? "" : dirTokens[DirectionW.left].ToLiteral();
            result.rightToken = dirTokens[DirectionW.right] === null ? "" : dirTokens[DirectionW.right].ToLiteral();
            result.bottomToken = dirTokens[DirectionW.bottom] === null ? "" : dirTokens[DirectionW.bottom].ToLiteral();
            return result;
        }
    }
    ;
    StepIn() {
        var rcode = this.Go(ExecOption.stepIn).ret;
        var topcontext = this;
        while (topcontext.parent !== undefined && topcontext.parent !== null
            && topcontext.parent.parent !== undefined && topcontext.parent.parent !== null) {
            topcontext = topcontext.parent.parent;
        }
        ;
        var tg = topcontext.TraceSearch();
        if (tg !== null) {
            if (tg.parent.classname === 'UserDefined')
                _ForceUiRedraw(tg.parent.arrivedTokensInOrder[0].typeid, tg.parent.opname, tg.parent);
            else
                _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
        }
        else if (rcode === ReturnCode.blocking)
            return;
        else {
            _ForceUiRedraw("App", "Mainline");
        }
        ;
    }
    ;
    StepOver() {
        var rcode = this.Go(ExecOption.stepOver).ret;
        var topcontext = this;
        while (topcontext.parent !== undefined && topcontext.parent !== null
            && topcontext.parent.parent !== undefined && topcontext.parent.parent !== null) {
            topcontext = topcontext.parent.parent;
        }
        ;
        var tg = topcontext.TraceSearch();
        if (tg !== null)
            if (tg.parent.classname === 'UserDefined')
                _ForceUiRedraw(tg.parent.arrivedTokensInOrder[0].typeid, tg.parent.opname, tg.parent);
            else
                _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
        else if (rcode === ReturnCode.blocking)
            return;
        else {
            _ForceUiRedraw("App", "Mainline");
        }
        ;
    }
    ;
    StepOut() {
        var rcode = this.Go(ExecOption.stepOut).ret;
        var topcontext = this;
        while (topcontext.parent !== undefined && topcontext.parent !== null
            && topcontext.parent.parent !== undefined && topcontext.parent.parent !== null) {
            topcontext = topcontext.parent.parent;
        }
        ;
        var tg = topcontext.TraceSearch();
        if (tg !== null)
            if (tg.parent.classname === 'UserDefined')
                _ForceUiRedraw(tg.parent.arrivedTokensInOrder[0].typeid, tg.parent.opname, tg.parent);
            else
                _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
        else if (rcode === ReturnCode.blocking)
            return;
        else {
            _ForceUiRedraw("App", "Mainline");
        }
        ;
    }
    ;
    Continue() {
        var rcode = this.Go(ExecOption.continue).ret;
        var topcontext = this;
        while (topcontext.parent !== undefined && topcontext.parent !== null
            && topcontext.parent.parent !== undefined && topcontext.parent.parent !== null) {
            topcontext = topcontext.parent.parent;
        }
        ;
        var tg = topcontext.TraceSearch();
        if (rcode === ReturnCode.blocking) {
            return;
        }
        else if (tg !== null) {
            var clsname = tg.parent.classname;
            if (clsname === 'UserDefined')
                clsname = (tg.parent.arrivedTokensInOrder[0]).typeid;
            _ForceUiRedraw(clsname, tg.parent.opname, tg.parent);
        }
        else {
            _ForceUiRedraw("App", "Mainline");
        }
        ;
    }
    ;
}
; // class VPGLContext
var count = 0;
var _execcount = 0;
var _warningcount = 0;
var _continueMode = ExecOption.continue;
var gDB = new VPGLGlobalDataBase();
function _ListUpMethods() {
    var result = [];
    var tmp = {};
    VPGLGlobalDataBase.constlist.ForAll(function (cls, val) {
        var subrs = _SUBRDepo[cls];
        for (let mtd in subrs) {
            tmp[mtd] = true;
        }
        ;
        val.ForAll(function (mtd, def) {
            if (mtd === SuperClassesKey)
                return false;
            tmp[mtd] = true;
            return false;
        });
        return false;
    });
    for (let mtd in tmp) {
        result.push(mtd);
    }
    result.sort();
    return result;
}
;
function _ForceUiRedraw(className, methodName, cxt = null) {
    if (className === "UserDefined")
        if (cxt === null)
            return;
        else
            className = cxt.arrivedTokensInOrder[0].typeid;
    var classes = VPGLGlobalDataBase.Classes();
    var methods = VPGLGlobalDataBase.Members(className);
    if (methods === undefined || methods === null)
        return;
    if (methodName === "")
        methodName = methods[0];
    var tgt = VPGLGlobalDataBase.Get(className).DeepFindMethod(className, methodName);
    var target = tgt.target;
    className = tgt.clsname;
    if (target === undefined)
        target = null;
    var traceinfo = {};
    if (_wkdebugging && cxt !== null && target !== undefined && target !== null) {
        for (var i = 0; i < 7; i++)
            for (var j = 0; j < 7; j++) {
                var posstr = "ABCDEFG".charAt(j) + "1234567".charAt(i);
                if (target.Get(posstr) == undefined)
                    continue;
                var tinfo = cxt.TraceInfo(className, methodName, j, i);
                if (tinfo !== undefined && tinfo !== null)
                    traceinfo[posstr] = tinfo;
            }
    }
    var cxtid = (cxt !== null) ? cxt.identifier : -1;
    postMessage({ cmd: "DrawUI", currentClass: className,
        currentMethod: methodName, classes: classes, methods: methods,
        allmethods: _ListUpMethods(),
        grid: target, traceinfo: traceinfo, cxtid: cxtid }, null);
}
;
function _ResetSystem(cmd) {
    _enable3D = cmd.d3;
    _wkdebugging = false;
    gDB.Initialize();
    _eventid = 0;
    _suspendedContext = {};
    _suspendedRetVal = {};
    _activeContexts = [];
    _CBTable = [];
    _ForceUiRedraw("App", "Mainline");
}
;
var _breakcount = 1000;
var _topcxtid = -1;
var _activeContexts = [];
var _suspendedContext = {};
var _suspendedRetVal = {};
var _topWqe = null;
var _wkdebugging = false;
var _enable3D = true;
var _CBTable = [];
function _DeleteFromActiveContext(tbd) {
    var id = tbd.identifier;
    if (id < 0)
        return;
    for (var i = 0; i < _activeContexts.length; i++) {
        if (_activeContexts[i].identifier !== id)
            continue;
        _activeContexts.splice(i, 1);
        break;
    }
}
;
function _FindContextFromActiveContexts(cxtid) {
    for (var i = 0; i < _activeContexts.length; i++) {
        if (_activeContexts[i].identifier !== cxtid)
            continue;
        return _activeContexts[i];
    }
    return null;
}
;
function _StartExec() {
    postMessage({ cmd: 'CancelMove' }, null);
    _execcount = 0;
    _warningcount = 0;
    _topWqe = new WaitingQeueuEntry();
    var app = Token.NewInstance('App', []);
    _activeContexts = [];
    _CBTable = [];
    var _topContext = new VPGLContext(null, (_topcxtid = _NewEventId()));
    _topContext.depthlevel = 0;
    _topContext.Install(app, "Mainline", null, [app, null, null, null]);
    _topContext.parent = _topWqe;
    _topWqe.child = _topContext;
    _topWqe.parent = null;
    _execcount = 0;
    if (!_wkdebugging) {
        var result = _topContext.Go(ExecOption.normal);
        if (result.ret === ReturnCode.exhausted)
            return;
        else if (result.ret === ReturnCode.canDoMore)
            postMessage({ cmd: "CanDoMore" }, null);
        else if (result.ret === ReturnCode.executionHALT)
            postMessage({ cmd: 'Terminated', msg: " " + result.status }, null);
        else if (result.ret === ReturnCode.error || result.ret === ReturnCode.noSuchOp || result.ret === ReturnCode.somethingRemain)
            postMessage({ cmd: 'ERROR', msg: "ERROR - " + result.status }, null);
    }
    else {
        _ForceUiRedraw("App", "Mainline", _topContext);
    }
    ;
}
;
function _StepIn(cmd) {
    if (cmd.cxtid <= 0)
        _FindContextFromActiveContexts(_topcxtid).StepIn();
    else {
        var cxt = _FindContextFromActiveContexts(cmd.cxtid);
        if (cxt !== undefined && cxt !== null)
            cxt.StepIn();
    }
}
;
function _StepOver(cmd) {
    if (cmd.cxtid <= 0)
        _FindContextFromActiveContexts(_topcxtid).StepOver();
    else {
        var cxt = _FindContextFromActiveContexts(cmd.cxtid);
        if (cxt !== undefined && cxt !== null)
            cxt.StepOver();
    }
}
;
function _StepOut(cmd) {
    if (cmd.cxtid <= 0)
        _FindContextFromActiveContexts(_topcxtid).StepOut();
    else {
        var cxt = _FindContextFromActiveContexts(cmd.cxtid);
        if (cxt !== undefined && cxt !== null)
            cxt.StepOut();
    }
}
;
function _StepContinue(cmd) {
    if (cmd.cxtid <= 0)
        _FindContextFromActiveContexts(_topcxtid).Continue();
    else {
        var cxt = _FindContextFromActiveContexts(cmd.cxtid);
        if (cxt !== undefined && cxt !== null)
            cxt.Continue();
    }
}
;
function _ClearBP(cmd) {
    VPGLGlobalDataBase.ClearAllBreakPoints();
}
function _ToggleBP(cmd) {
    _WKToggleBreakPoint(cmd.class, cmd.method, cmd.pos, cmd.cxtid);
}
;
function _WKToggleBreakPoint(cls, mtd, posstr, cxtid) {
    var tile = VPGLGlobalDataBase.Get(cls).Get(mtd).Get(posstr);
    var bp = tile.Get(BreakPointKey);
    if (bp === undefined || bp === null) {
        tile.Put(BreakPointKey, NumberToken.NewInstance(BreakPointState.on));
        VPGLGlobalDataBase.RegisterBreakPoint(cls, mtd, posstr);
    }
    else {
        tile.Put(BreakPointKey, null);
        VPGLGlobalDataBase.UnregisterBreakPoint(cls, mtd, posstr);
    }
    var cxt = _FindContextFromActiveContexts((cxtid > 0) ? cxtid : _topcxtid);
    if (cxt !== undefined && cxt !== null)
        _ForceUiRedraw(cls, mtd, cxt);
    else
        _ForceUiRedraw(cls, mtd);
}
;
function _ContinueExec(cmd) {
    var result = { status: "", ret: ReturnCode.error, outputInOrder: null };
    if (cmd.eid === undefined)
        return;
    else if (_suspendedContext[cmd.eid] !== undefined && _suspendedContext[cmd.eid] !== null) {
        var cxtToBeExecuted = _suspendedContext[cmd.eid];
        // find the root context of this suspended context. It should Go() on this root.
        while (cxtToBeExecuted.parent !== undefined && cxtToBeExecuted.parent !== null
            && cxtToBeExecuted.parent.parent !== undefined && cxtToBeExecuted.parent.parent !== null)
            cxtToBeExecuted = cxtToBeExecuted.parent.parent;
        delete _suspendedContext[cmd.eid];
        result = cxtToBeExecuted.Go(cmd.exmode);
    }
    else
        result = { status: "Context Not Found in Continue", ret: ReturnCode.error, outputInOrder: null };
    if (result.ret === ReturnCode.error)
        postMessage({ cmd: 'ERROR', msg: result.status }, null);
    if (result.ret === ReturnCode.exhausted || result.ret === ReturnCode.breakStop)
        return;
    else if (result.ret === ReturnCode.canDoMore)
        postMessage({ cmd: "CanDoMore" }, null);
    else if (result.ret === ReturnCode.executionHALT)
        postMessage({ cmd: 'Terminated', msg: " " + result.status }, null);
    else if (result.ret !== ReturnCode.ok && result.ret !== ReturnCode.blocking)
        postMessage({ cmd: "ERROR", msg: "code:" + result.ret + " " + result.status }, null);
    //_topWqe.child.Go(ExecOption.normal); // _topWqe.child is the top context.
}
;
function _UpdateTile(operand) {
    var grid = VPGLGlobalDataBase.Get(operand['class']).Get(operand['method']);
    if (operand.val === null)
        grid.Put(operand['pos'], null);
    else {
        var val = DictToken.NewInstance({});
        val.Put("opname", StringToken.NewInstance(operand.val.val.opname.val));
        val.Put("option", StringToken.NewInstance(operand.val.val.option.val));
        val.Put("indir", StringToken.NewInstance(operand.val.val.indir.val));
        val.Put("outdir", StringToken.NewInstance(operand.val.val.outdir.val));
        grid.Put(operand['pos'], Token.NewInstance(operand.val.classid, val));
    }
    ;
    _ForceUiRedraw(operand['class'], operand['method']);
}
;
function _NewMethodHandler(operand) {
    var contents = DictToken.ToTokenArray(operand.val);
    VPGLGlobalDataBase.Get(operand['class']).Put(operand['method'], GridToken.NewInstance(contents));
    var defs = VPGLGlobalDataBase.Get(operand['class']);
    VPGLGlobalDataBase.Put(operand['class'], defs, true);
    _ForceUiRedraw(operand['class'], operand['method']);
}
;
function _NewClassHandler(operand) {
    var supers = [];
    for (var i = 0; i < operand.supers.length; i++) {
        supers.push(StringToken.NewInstance(operand.supers[i]));
    }
    var initval = DictToken.NewInstance({});
    initval.Put(SuperClassesKey, ArrayToken.NewInstance(supers));
    VPGLGlobalDataBase.Put(operand.class, initval, true);
    _ForceUiRedraw(operand.class, "");
}
;
function _UpdateMethodHandler(operand) {
    var clsTk = VPGLGlobalDataBase.Get(operand.class);
    var mtdTk = clsTk.Get(operand.method);
    if (operand.val.indir !== undefined)
        mtdTk.Put("indir", StringToken.NewInstance(operand.val.indir));
    if (operand.val.outdir !== undefined)
        mtdTk.Put("outdir", StringToken.NewInstance(operand.val.outdir));
    if (operand.val.ifall !== undefined)
        mtdTk.Put("ifall", operand.val.ifall ? TToken.NewInstance(null) : NILToken.NewInstance(null));
    if (operand.val.remark !== undefined)
        mtdTk.Put("remark", StringToken.NewInstance(operand.val.remark));
    _ForceUiRedraw(operand.class, operand.method);
}
;
function _UpdateHandler(operand) {
    switch (operand.opr) {
        case 'NewMethod':
            _NewMethodHandler(operand);
            break;
        case 'NewClass':
            _NewClassHandler(operand);
            break;
        case 'UpdateMethod':
            _UpdateMethodHandler(operand);
            break;
        default:
            postMessage({ cmd: 'ERROR', msg: 'No Such Grid Operation: ' + operand.opr }, null);
            break;
    }
    ;
}
;
function _StopDebug() {
    _wkdebugging = false;
    VPGLGlobalDataBase.BPHitToOn();
}
;
function _StartDebug() {
    _wkdebugging = true;
}
function _AllVMHandler() {
    postMessage({ cmd: 'VMContents', val: VPGLGlobalDataBase.SourceOut() }, null);
}
;
function _LoadVMHandler(cmd) {
    VPGLGlobalDataBase.SourceIn(cmd.val, cmd.overwrite);
    _ForceUiRedraw("App", "Mainline");
}
;
function _UserInputHandler(operand) {
    var cxt = _suspendedContext[operand.eid];
    var got = Token.FromLiteral(operand.val);
    if (got === null)
        postMessage({ cmd: 'ERROR', msg: "INPUT IS MALFOMED" }, null);
    cxt.toBeEmittedInOrder[0] = got.val;
    cxt.status = Status.resumeFromWaiting;
    postMessage({ cmd: 'CanBreak', eid: operand.eid, exmode: operand.exmode }, null);
}
;
function _DragHandler(operand) {
    //operand.target;
    //operand.z;
    //operand.x;
    // operand.y;
    var cbobject = null;
    for (var i = 0; i < _CBTable.length; i++) {
        var entry = _CBTable[i];
        if (entry.scn === operand.scn && entry.target === operand.target && entry.event === "OnDrag") {
            cbobject = entry.obj;
            var topWqe = new WaitingQeueuEntry();
            var cbContext = new VPGLContext(null, _NewEventId());
            var tmp;
            var tgopname = entry.opname;
            if (tgopname === undefined || tgopname === "")
                continue;
            cbContext.depthlevel = 0;
            var arg1 = DictToken.NewInstance({ target: StringToken.NewInstance(operand.target), spec: DictToken.NewInstance2(operand.spec), x: NumberToken.NewInstance(operand.x), y: NumberToken.NewInstance(operand.y), z: NumberToken.NewInstance(operand.z) });
            cbContext.Install(cbobject, tgopname, null, [cbobject, arg1, null, null]);
            cbContext.parent = topWqe;
            cbContext.position = "A2";
            cbContext.outdir = "B";
            topWqe.child = cbContext;
            topWqe.parent = null;
            tmp = cbContext.Go(entry.exmode);
            if (tmp.ret === ReturnCode.executionHALT)
                postMessage({ cmd: 'Terminated', msg: tmp.status }, null);
            if (tmp.ret === ReturnCode.error || tmp.ret === ReturnCode.noSuchOp)
                postMessage({ cmd: 'ERROR', msg: tmp.status }, null);
            if (tmp.ret === ReturnCode.breakStop) {
                var tg = cbContext.TraceSearch();
                if (tg !== null)
                    _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
            }
            ;
        }
        ;
    }
}
;
function _1TouchHandler(operand) {
    //operand.target;
    //operand.z;
    //operand.x;
    // operand.y;
    var cbobject = null;
    for (var i = 0; i < _CBTable.length; i++) {
        var entry = _CBTable[i];
        if (entry.scn === operand.scn && entry.target === operand.target && entry.event === "On1Touch") {
            cbobject = entry.obj;
            var topWqe = new WaitingQeueuEntry();
            var cbContext = new VPGLContext(null, _NewEventId());
            var tmp;
            var tgopname = entry.opname;
            if (tgopname === undefined || tgopname === "")
                continue;
            cbContext.depthlevel = 0;
            var arg1 = DictToken.NewInstance({ target: StringToken.NewInstance(operand.target), spec: DictToken.NewInstance2(operand.spec), x: NumberToken.NewInstance(operand.x), y: NumberToken.NewInstance(operand.y), z: NumberToken.NewInstance(operand.z) });
            cbContext.Install(cbobject, tgopname, null, [cbobject, arg1, null, null]);
            cbContext.parent = topWqe;
            cbContext.position = "A2";
            cbContext.outdir = "B";
            topWqe.child = cbContext;
            topWqe.parent = null;
            tmp = cbContext.Go(entry.exmode);
            if (tmp.ret === ReturnCode.executionHALT)
                postMessage({ cmd: 'Terminated', msg: tmp.status }, null);
            if (tmp.ret === ReturnCode.error || tmp.ret === ReturnCode.noSuchOp)
                postMessage({ cmd: 'ERROR', msg: tmp.status }, null);
            if (tmp.ret === ReturnCode.breakStop) {
                var tg = cbContext.TraceSearch();
                if (tg !== null)
                    _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
            }
            ;
        }
        ;
    }
}
;
function _2TouchHandler(operand) {
    //operand.target;
    //operand.z;
    //operand.x;
    // operand.y;
    var cbobject = null;
    for (var i = 0; i < _CBTable.length; i++) {
        var entry = _CBTable[i];
        if (entry.scn === operand.scn && entry.target === operand.target && entry.event === "On2Touch") {
            cbobject = entry.obj;
            var topWqe = new WaitingQeueuEntry();
            var cbContext = new VPGLContext(null, _NewEventId());
            var tmp;
            var tgopname = entry.opname;
            if (tgopname === undefined || tgopname === "")
                continue;
            cbContext.depthlevel = 0;
            var arg1 = DictToken.NewInstance({ target: StringToken.NewInstance(operand.target), spec: DictToken.NewInstance2(operand.spec), x: NumberToken.NewInstance(operand.x), y: NumberToken.NewInstance(operand.y), z: NumberToken.NewInstance(operand.z) });
            cbContext.Install(cbobject, tgopname, null, [cbobject, arg1, null, null]);
            cbContext.parent = topWqe;
            cbContext.position = "A2";
            cbContext.outdir = "B";
            topWqe.child = cbContext;
            topWqe.parent = null;
            tmp = cbContext.Go(entry.exmode);
            if (tmp.ret === ReturnCode.executionHALT)
                postMessage({ cmd: 'Terminated', msg: tmp.status }, null);
            if (tmp.ret === ReturnCode.error || tmp.ret === ReturnCode.noSuchOp)
                postMessage({ cmd: 'ERROR', msg: tmp.status }, null);
            if (tmp.ret === ReturnCode.breakStop) {
                var tg = cbContext.TraceSearch();
                if (tg !== null)
                    _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
            }
            ;
        }
        ;
    }
}
;
function _ClickHandler(operand) {
    var cbobject = null;
    for (var i = 0; i < _CBTable.length; i++) {
        var entry = _CBTable[i];
        if (entry.scn === operand.scn && entry.target === operand.target && entry.event === "OnClick") {
            cbobject = entry.obj;
            var topWqe = new WaitingQeueuEntry();
            var cbContext = new VPGLContext(null, _NewEventId());
            var tmp;
            //if (operand.spec === undefined || operand.spec === null) continue;
            //var tgopname: string = operand.spec["OnClick"];
            var tgopname = entry.opname;
            if (tgopname === undefined || tgopname === "")
                continue;
            cbContext.depthlevel = 0;
            var clickParam = DictToken.NewInstance({ target: StringToken.NewInstance(operand.target), spec: DictToken.NewInstance2(operand.spec) });
            cbContext.Install(cbobject, tgopname, null, [cbobject, clickParam, null, null]);
            cbContext.parent = topWqe;
            cbContext.position = "A2";
            cbContext.outdir = "B";
            topWqe.child = cbContext;
            topWqe.parent = null;
            tmp = cbContext.Go(entry.exmode);
            if (tmp.ret === ReturnCode.executionHALT)
                postMessage({ cmd: 'Terminated', msg: tmp.status }, null);
            if (tmp.ret === ReturnCode.breakStop) {
                var tg = cbContext.TraceSearch();
                if (tg !== null)
                    _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
                false;
            }
            ;
            if (tmp.ret === ReturnCode.error || tmp.ret === ReturnCode.noSuchOp) {
                postMessage({ cmd: 'ERROR', msg: tmp.status }, null);
                break;
            }
        }
        ;
    }
}
;
function _ChangeValHandler(operand) {
    var cbobject = null;
    for (var i = 0; i < _CBTable.length; i++) {
        var entry = _CBTable[i];
        if (entry.scn === operand.scn && entry.target === operand.target && entry.event === "OnChange") {
            cbobject = entry.obj;
            var topWqe = new WaitingQeueuEntry();
            var cbContext = new VPGLContext(null, _NewEventId());
            var tmp;
            //if (operand.spec === undefined || operand.spec === null) continue;
            //var tgopname: string = operand.spec["OnChange"];
            var tgopname = entry.opname;
            if (tgopname === undefined || tgopname === null || tgopname === "")
                continue;
            cbContext.depthlevel = 0;
            var vallit = "" + operand.val;
            var cvParam = DictToken.NewInstance({ target: StringToken.NewInstance(operand.target), spec: DictToken.NewInstance2(operand.spec), val: Token.FromLiteral(vallit).val });
            cbContext.Install(cbobject, tgopname, null, [cbobject, cvParam, null, null]);
            cbContext.parent = topWqe;
            cbContext.position = "A2";
            cbContext.outdir = "B";
            topWqe.child = cbContext;
            topWqe.parent = null;
            tmp = cbContext.Go(entry.exmode);
            if (tmp.ret === ReturnCode.executionHALT)
                postMessage({ cmd: 'Terminated', msg: tmp.status }, null);
            if (tmp.ret === ReturnCode.error || tmp.ret === ReturnCode.noSuchOp || tmp.ret === ReturnCode.somethingRemain)
                postMessage({ cmd: 'ERROR', msg: tmp.status }, null);
            if (tmp.ret === ReturnCode.breakStop) {
                var tg = cbContext.TraceSearch();
                if (tg !== null)
                    _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
                false;
            }
            ;
        }
        ;
    }
}
;
function _TimerRunOutHandler(operand) {
    var cbobject = null;
    for (var i = 0; i < _CBTable.length; i++) {
        var entry = _CBTable[i];
        //var operator : Token = entry.obj.Where(operand.opname);
        if (entry.event === "OnTick") {
            cbobject = entry.obj;
            var topWqe = new WaitingQeueuEntry();
            var cbContext = new VPGLContext(null, _NewEventId());
            var tmp;
            var tgopname = entry.opname;
            if (tgopname === undefined || tgopname === null)
                continue;
            cbContext.depthlevel = 0;
            var tickParam = DictToken.NewInstance({ count: NumberToken.NewInstance(operand.count) });
            cbContext.Install(cbobject, tgopname, null, [cbobject, tickParam, null, null]);
            cbContext.parent = topWqe;
            cbContext.position = "A2";
            cbContext.outdir = "B";
            topWqe.child = cbContext;
            topWqe.parent = null;
            tmp = cbContext.Go(entry.exmode);
            if (tmp.ret === ReturnCode.executionHALT)
                postMessage({ cmd: 'Terminated', msg: tmp.status }, null);
            if (tmp.ret === ReturnCode.error || tmp.ret === ReturnCode.noSuchOp)
                postMessage({ cmd: 'ERROR', msg: tmp.status }, null);
            if (tmp.ret === ReturnCode.breakStop) {
                var tg = cbContext.TraceSearch();
                if (tg !== null)
                    _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
                false;
            }
            ;
        }
        ;
    }
    postMessage({ cmd: "TimerResponseComplete" }, null);
}
function _CollisionReportHandler(operand) {
    var cxt = _suspendedContext[operand.eid];
    if (cxt === undefined || cxt === null)
        return;
    var target = operand.target;
    var got = ArrayToken.NewInstance([]);
    //ArrayClass.Push(got, TokenX.NewInstance('String', operand.obj, null));
    for (var i = 0; i < target.length; i++) {
        var collentry = { obj: StringToken.NewInstance(target[i].obj), src: DictToken.NewInstance2(target.src),
            dx: NumberToken.NewInstance(target[i].dx), dy: NumberToken.NewInstance(target[i].dy), dz: NumberToken.NewInstance(target[i].dz) };
        //       var collentry = {obj: StringToken.NewInstance(target[i].obj), src: DictToken.NewInstance2(target.src),
        //             theta: NumberToken.NewInstance(target[i].theta), psy: NumberToken.NewInstance(target[i].psy)};
        got.Push(DictToken.NewInstance(collentry));
    }
    ;
    if (got === null)
        postMessage({ cmd: 'ERROR', msg: "COLLISION REPORT IS MALFOMED" }, null);
    cxt.toBeEmittedInOrder[0] = got;
    cxt.status = Status.resumeFromWaiting;
    postMessage({ cmd: 'CanBreak', eid: operand.eid, exmode: operand.exmode }, null);
}
;
function _ObjReportHandler(operand) {
    var cxt = _suspendedContext[operand.eid];
    if (cxt === undefined || cxt === null)
        return;
    var target = operand.target;
    var got = ArrayToken.NewInstance([]);
    for (var i = 0; i < target.length; i++) {
        var collentry = DictToken.NewInstance2(target[i]);
        got.Push(collentry);
    }
    ;
    if (got === null)
        postMessage({ cmd: 'ERROR', msg: "Object REPORT IS MALFORMED" }, null);
    cxt.toBeEmittedInOrder[0] = got;
    cxt.status = Status.resumeFromWaiting;
    postMessage({ cmd: 'CanBreak', eid: operand.eid, exmode: operand.exmode }, null);
}
;
function _GetReportHandler(operand) {
    var cxt = _suspendedContext[operand.eid];
    if (cxt === undefined || cxt === null)
        return;
    var got = DictToken.NewInstance2(operand.obj);
    if (got === null)
        postMessage({ cmd: 'ERROR', msg: "Get REPORT IS MALFORMED" }, null);
    cxt.toBeEmittedInOrder[0] = got;
    cxt.status = Status.resumeFromWaiting;
    postMessage({ cmd: "CanBreak", eid: operand.eid, exmode: operand.exmode }, null);
}
;
function _GridClearHandler(operand) {
    var cname = operand.class;
    var mname = operand.method;
    var cdef = VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null) {
        postMessage({ cmd: 'ERROR', msg: "Grid Clear: no such class - " + cname }, null);
        return;
    }
    ;
    var mdef = cdef.Get(mname);
    if (mdef === undefined || mdef === null) {
        postMessage({ cmd: 'ERROR', msg: "Grid Clear: no such method - " + cname + "::" + mname }, null);
        return;
    }
    ;
    mdef.ForAll(function (key, val) {
        switch (key) {
            case 'size':
            case 'opname':
            case 'indir':
            case 'outdir':
            case 'ifall':
                break;
            default:
                mdef.Put(key, null);
                break;
        }
        ; // switch
        return false;
    });
    _ForceUiRedraw(cname, mname);
}
;
function _GridDeleteHandler(operand) {
    var cname = operand.class;
    var mname = operand.method;
    var cdef = VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null) {
        postMessage({ cmd: 'ERROR', msg: "Grid Delete : no such class - " + cname }, null);
        return;
    }
    cdef.Put(mname, null);
    var newmname = null;
    cdef.ForAll(function (key, val) {
        newmname = key;
        return true;
    });
    if (newmname === null) {
        cname = 'App';
        newmname = 'Mainline';
    }
    _ForceUiRedraw(cname, newmname);
}
;
function _GridRenameHandler(operand) {
    var cname = operand.class;
    var mname = operand.method;
    var cdef = VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null) {
        postMessage({ cmd: 'ERROR', msg: "Grid Rename : no such class - " + cname }, null);
        return;
    }
    var mdef = cdef.Get(mname);
    cdef.Put(mname, null);
    var newmname = operand.newname;
    mdef.Put("opname", StringToken.NewInstance(newmname));
    cdef.Put(newmname, mdef);
    _ForceUiRedraw(cname, newmname);
}
;
function _GridCopyHandler(operand) {
    var cname = operand.class;
    var mname = operand.method;
    var newmname = operand.newname;
    var cdef = VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null) {
        postMessage({ cmd: 'ERROR', msg: "Grid Copy : no such class - " + cname }, null);
        return;
    }
    var mdef = cdef.Get(mname);
    var deepcopied = JSON.parse(JSON.stringify(mdef, Token.JSONReplacer), Token.JSONReciver);
    deepcopied.Put("opname", StringToken.NewInstance(newmname));
    cdef.Put(newmname, deepcopied);
    _ForceUiRedraw(cname, newmname);
}
;
function _GridExpandHandler(operand) {
    var cname = operand.class;
    var mname = operand.method;
    var cdef = VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null) {
        postMessage({ cmd: 'ERROR', msg: "Grid Expand: no such class - " + cname }, null);
        return;
    }
    ;
    var mdef = cdef.Get(mname);
    if (mdef === undefined || mdef === null) {
        postMessage({ cmd: 'ERROR', msg: "Grid Expand: no such method - " + cname + "::" + mname }, null);
        return;
    }
    ;
    var sz = mdef.Get('size').AsNumber();
    if (sz >= 7) {
        postMessage({ cmd: 'ERROR', msg: "Grid Expand : Grid is the max size." }, null);
        return;
    }
    ;
    mdef.Put('size', NumberToken.NewInstance(sz + 2));
    _ForceUiRedraw(cname, mname);
}
;
function _FromKeyPos(pos) {
    if (pos.length !== 2)
        return null;
    if (pos.match("[A-G][1-7]") === null)
        return null;
    return { x: "ABCDEFG".indexOf(pos.charAt(0)), y: "1234567".indexOf(pos.charAt(1)) };
}
;
function _TrimGrid(grid, newsize) {
    var g = grid;
    g.ForAll(function (key, val) {
        var pos = _FromKeyPos(key);
        if (pos === null)
            return false;
        if (pos.x >= newsize || pos.y >= newsize)
            grid.Put(key, null);
        return false;
    });
}
;
function _GridShrinkHandler(operand) {
    var cname = operand.class;
    var mname = operand.method;
    var cdef = VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null) {
        postMessage({ cmd: 'ERROR', msg: "Grid Shrink : no such class - " + cname }, null);
        return;
    }
    ;
    var mdef = cdef.Get(mname);
    if (mdef === undefined || mdef === null) {
        postMessage({ cmd: 'ERROR', msg: "Grid Shrink: no such method - " + cname + "::" + mname }, null);
        return;
    }
    ;
    var sz = mdef.Get('size').AsNumber();
    if (sz <= 3) {
        postMessage({ cmd: 'ERROR', msg: "Grid Shrink : Grid is the minimum size." }, null);
        return;
    }
    ;
    mdef.Put('size', NumberToken.NewInstance(sz - 2));
    _TrimGrid(mdef, sz - 2);
    _ForceUiRedraw(cname, mname);
}
;
function _ToKeyPos(x, y) {
    if (x < 0 || x > 6 || y < 0 || y > 6)
        return null;
    return ("ABCDEFG".charAt(x) + "1234567".charAt(y));
}
;
function _GridShiftHandler(operand) {
    var cname = operand.class;
    var mname = operand.method;
    var x = operand.x;
    var y = operand.y;
    var cdef = VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null) {
        postMessage({ cmd: 'ERROR', msg: "Grid Shift : no such class - " + cname }, null);
        return;
    }
    ;
    var mdef = cdef.Get(mname);
    if (mdef === undefined || mdef === null) {
        postMessage({ cmd: 'ERROR', msg: "Grid Shift: no such method - " + cname + "::" + mname }, null);
        return;
    }
    ;
    var newmdef = GridToken.NewInstance({});
    mdef.ForAll(function (key, val) {
        var pos = _FromKeyPos(key);
        if (pos === null) {
            newmdef.Put(key, mdef.Get(key));
            return false;
        }
        var newpos = _ToKeyPos(pos.x + x, pos.y + y);
        if (newpos === null)
            return false;
        newmdef.Put(newpos, mdef.Get(key));
        return false;
    });
    _TrimGrid(newmdef, mdef.Get('size').AsNumber());
    cdef.Put(mname, newmdef);
    _ForceUiRedraw(cname, mname);
}
;
function _TileMoveHandler(operand) {
    var cname = operand.class;
    var mname = operand.method;
    var moves = operand.moves;
    var x = operand.x;
    var y = operand.y;
    var cdef = VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null) {
        postMessage({ cmd: 'ERROR', msg: "TileMove : no such class - " + cname }, null);
        return;
    }
    ;
    var mdef = cdef.Get(mname);
    if (mdef === undefined || mdef === null) {
        postMessage({ cmd: 'ERROR', msg: "TileMove: no such method - " + cname + "::" + mname }, null);
        return;
    }
    ;
    var move;
    while (moves.length > 0) {
        move = moves.pop();
        var from = _ToKeyPos(move.fromx, move.fromy);
        var to = _ToKeyPos(move.tox, move.toy);
        var tile = mdef.Get(from);
        mdef.Put(from, null);
        mdef.Put(to, tile);
    }
    ;
    _ForceUiRedraw(cname, mname);
}
;
function _ResumeHandler(operand) {
    var cxt = _suspendedContext[operand.eid];
    //var out0 = NumberClass.NewNumber(operand.msec);
    cxt.toBeEmittedInOrder[0] = _suspendedRetVal[operand.eid][0];
    cxt.status = Status.resumeFromWaiting;
    //delete _suspendedContext[operand.eid];
    //delete _suspendedRetVal[operand.eid];
    postMessage({ cmd: 'CanBreak', eid: operand.eid, exmode: operand.exmode }, null);
}
function _StopHandler(operand) {
    _eventid = 0;
    _suspendedContext = {};
    _suspendedRetVal = {};
    _activeContexts = [];
    _CBTable = [];
}
console.log("Worker: VPGLWorker is ready.");
self.addEventListener("message", function (e) {
    //    try {
    switch (e.data.cmd) {
        case 'ResetSystem':
            _ResetSystem(e.data);
            break;
        case 'StartDebug':
            _StartDebug();
            break;
        case 'StopDebug':
            _StopDebug();
            break;
        case 'Run':
            _StartExec();
            break;
        case 'StepIn':
            _StepIn(e.data);
            break;
        case 'StepOver':
            _StepOver(e.data);
            break;
        case 'StepOut':
            _StepOut(e.data);
            break;
        case 'DebugContinue':
            _StepContinue(e.data);
            break;
        case 'ClearBreakPoints':
            _ClearBP(e.data);
            break;
        case 'ToggleBP':
            _ToggleBP(e.data);
            break;
        case 'Continue':
            _ContinueExec(e.data);
            break;
        case 'UiUpdate':
            _ForceUiRedraw(e.data.curClass, e.data.curMethod);
            break;
        case 'UpdateTile':
            _UpdateTile(e.data);
            break;
        case 'Update':
            _UpdateHandler(e.data);
            break;
        case 'AllVM':
            _AllVMHandler();
            break;
        case 'LoadVM':
            _LoadVMHandler(e.data);
            break;
        case 'UserInput':
            _UserInputHandler(e.data);
            break;
        case 'Resume':
            _ResumeHandler(e.data);
            break;
        case 'TimerRunOut':
            _TimerRunOutHandler(e.data);
            break;
        case 'Drag':
            _DragHandler(e.data);
            break;
        case 'SingleTouch':
            _1TouchHandler(e.data);
            break;
        case 'DoubleTouch':
            _2TouchHandler(e.data);
            break;
        case 'Click':
            _ClickHandler(e.data);
            break;
        case 'ChangeVal':
            _ChangeValHandler(e.data);
            break;
        case 'CollisionReport':
            _CollisionReportHandler(e.data);
            break;
        case 'ObjReport':
            _ObjReportHandler(e.data);
            break;
        case 'GetReport':
            _GetReportHandler(e.data);
            break;
        case 'GridClear':
            _GridClearHandler(e.data);
            break;
        case 'GridDelete':
            _GridDeleteHandler(e.data);
            break;
        case 'GridRename':
            _GridRenameHandler(e.data);
            break;
        case 'GridCopy':
            _GridCopyHandler(e.data);
            break;
        case 'GridExpand':
            _GridExpandHandler(e.data);
            break;
        case 'GridShrink':
            _GridShrinkHandler(e.data);
            break;
        case 'GridShift':
            _GridShiftHandler(e.data);
            break;
        case 'TileMove':
            _TileMoveHandler(e.data);
            break;
        case 'Break':
            _StopHandler(e.data);
            postMessage({ cmd: "Terminated", msg: ">>> Aborted." }, null);
            break;
        default:
            postMessage({ cmd: "ERROR", msg: "Nosuch CMD: " + e.data.cmd }, null);
            break;
    }
    //   } catch(error) {
    //       postMessage({cmd: 'ERROR', msg: error}, null);
    //   };
}, false);
export {};
//
//
//
/*
class DictExtra extends DictToken {

    // RRCar::STEPON(r: RRail) : RRCar
    // rのレールをなぞってthis::RRCarを一ステップ進める。
    public static SBSTEPON(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        
        if(inTokenInOrder[0] === undefined || inTokenInOrder[0] === null)
            return {status: "DictExt:STEPON", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var rrcar: Token = inTokenInOrder[0];
        var rrrail: Token = rrcar.Get("on");
        var pitch: number = rrcar.Get("pitch").AsNumber();
        var trj: string = rrrail.Get("trj").AsString();
        var x: number = rrcar.Get("px").AsNumber();
        var y: number = rrcar.Get("py").AsNumber();
        var dir: number = rrcar.Get("dir").AsNumber();
        var step: number = rrcar.Get("step").AsNumber();
        var offsetx = rrrail.Get("px").AsNumber();
        var offsety = rrrail.Get("py").AsNumber();
        var pi = 3.1415926536;
        var d90 = pi/2;
        var phi = d90/pitch;
        var COS = function(x) {return Math.sin(x+d90);}

        if(step<=0) {
            dir = (Math.round(dir/(pi/2)) % 4)*(pi/2);
            x = offsetx - 100*COS(dir); // 0:-100 90:0 180:100 270 0
            y = offsety - 100*Math.sin(dir); // 0:200 90:100 180:200 270:300
            step = 1;
        };
        if(trj === "BK"){
            dir = (dir+Math.PI);
            if(dir>Math.PI*2)
                dir = dir-Math.PI*2
            x = x + 11*Math.cos(dir);
            y = y + 11*Math.sin(dir);
            step = -1;
        } else if (trj === "ST"){
            //x = ((step-(pitch/2))*(200/pitch))*COS(dir) + offsetx;
            //y = ((step-(pitch)/2)*(200/pitch))*Math.sin(dir) + offsety;
            x = x+(200/pitch)*COS(dir);
            y = y+(200/pitch)*Math.sin(dir);
            step = (step>pitch)?-1:step+1;
        } else if (trj === "CCW"){
            var r = 100;
            //x = x+r*(COS(dir-d90+phi)-COS(dir-d90));
            // y = y+r*(Math.sin(dir-d90+phi)-Math.sin(dir-d90));
            x = x+r*(Math.sin(dir+phi)-Math.sin(dir));
            y = y+r*(-COS(dir+phi)+COS(dir));
            dir+=phi;
            step = (step>pitch)?-1:step+1;
        } else if (trj === "CW") {
            var r = 100;
            //x = x+r*(COS(dir+d90-phi)-COS(dir+d90));
            //y = y+r*(Math.sin(dir+d90-phi)-Math.sin(dir+d90));
            x = x+r*(-Math.sin(dir-phi)+Math.sin(dir));
            y = y+r*(COS(dir-phi)-COS(dir));
            dir-=phi;
            step = (step>pitch)?-1:step+1;
        };
        rrcar.Put("step", NumberToken.NewInstance(step));
        rrcar.Put("px", NumberToken.NewInstance(x));
        rrcar.Put("py", NumberToken.NewInstance(y));
        rrcar.Put("dir", NumberToken.NewInstance(dir));

       var result : Token = DictToken.NewInstance({posx: NumberToken.NewInstance(x), posy: NumberToken.NewInstance(y), rotz: NumberToken.NewInstance(dir)});

        return {status: "SBSTEPON on DictExtra", ret: ReturnCode.ok, outputInOrder: [result, null, null]};
    };

        
    public static Init() : void {
        DictToken.subrcoll["SBSTEPON"] = SUBRToken.NewInstance(DictExtra.SBSTEPON);
    };
};
DictExtra.Init();
*/ 
//# sourceMappingURL=vpglworker.js.map