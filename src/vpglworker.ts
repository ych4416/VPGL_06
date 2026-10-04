//import { post } from "jquery";
// import { arrayBuffer } from "stream/consumers";
import { ZeroCurvatureEnding } from "three";
// import { isRegularExpressionLiteral } from "typescript";


enum DirectionW {top, left, right, bottom, void};
enum ExecOption {normal, stepIn, stepOver, stepOut, continue};
enum Status {waiting, canbetry, waitingforchild, blocked, resumeFromWaiting, breaking};
enum ReturnCode {ok, canDoMore, exhausted, executionEND, executionHALT, executionComplete, error, noSuchOp, needMoreToken, notImplementedCase, blocking, /* waitingforuser, */ featureIsNotImplemeted,
    malformed, versionMismatch, subclassResponsibility, requireContext, rejectedByVoid, somethingRemain, breakStop, stepStop};
enum BreakPointState { off, on, absent, hit };

const BreakPointKey = "VPGLDebugBreakPoint";
const ClassNameKey = "CLASSNAME";
const SuperClassesKey = "SUPERCLASSES";
const SingletonKey = "SINGLETON"

var _SUBRDepo:SUBRToken[][] = [[]];

var _eventid: number = 0;
function _NewEventId() {
    _eventid++;
    return _eventid;
};

class MetaToken {
    public EvalStep(mode: ExecOption, cxT: VPGLContext, opname: string, option: string, inTokenInOrder: Token[]):{status: string, ret: ReturnCode, outputInOrder: Token[]}{
        return {status: "No Such Op: "+opname, ret: ReturnCode.noSuchOp, outputInOrder:[null, null, null]};
    };
};

abstract class Token extends MetaToken{
    protected static subrcoll: SUBRToken[];
    protected static classidstr: string;

    public tosave: boolean;
    protected classid: string | null;
    protected val: any;

    public constructor() { super(); this.tosave=true; this.classid=null; this.val=null; };

    private static builtInClasses: {
        newInstance: (val: any)=>Token,
        fromLiteral: (lit: string)=>{val:Token, rest: string},
        reciever: (key: any, value: any)=>any;
        replacer: (key: any, value: any)=>string;
    }[/* clasname: string */] = [];

    public static NewInstance(typeid: string, val: any): Token | null {
        if(Token.builtInClasses[typeid]===undefined) return null;
        return Token.builtInClasses[typeid].newInstance(val);
    };

    public static FromLiteral(literal: string) : {val: Token, rest: string} {
        literal = literal.trim();
        for(let cls in Token.builtInClasses) {
            var result : {val: Token, rest: string} = Token.builtInClasses[cls].fromLiteral(literal);
            if (result !== null) return result;
        }
        return {val: null, rest: literal};
    };

    public abstract Clone(): Token;
    public ToLiteral(): string { return this.AsString(); };

    private static IsDelimitter(char: string): boolean {
        return ("+- \t\n\\r\.,:\"'{[}]<>".indexOf(char.charAt(0))!== -1)
    }

    public static lex(lit:string): {val: string, rest: string} {
        lit = lit.trim();
        var rst: string = lit.substr(1);
        var cc: string = lit.substr(0,1);
        var ll: string = "";
        if(lit === null || lit === "") return {val: "", rest: ""};
        if(Token.IsDelimitter(cc)) return {val: cc, rest:rst};
        ll+=cc; cc=rst.substr(0,1); rst=rst.substr(1);
        while(!this.IsDelimitter(cc)) {
            if(rst==="") return {val: ll+cc, rest:""};
            ll+=cc; cc=rst.substr(0,1); rst=rst.substr(1);
        };
        return {val: ll, rest: cc+rst};
    };

    public static JSONReciver(key: any, value: any):any {
        if(value === null) return null;
        var typeid:any = value.classid;
        if(typeid === undefined) return value;
        var reciever = Token.builtInClasses[typeid].reciever;
        if(reciever === undefined) return value;
        return reciever(key, value);
    };

    public static JSONReplacer(key, value): any {
        if(value === undefined || value === null) 
            return;
        if(value.tosave !== undefined && !value.tosave) return;
        var classid:string = value.classid;
        if(classid === undefined)
            return value;
        var replacer = Token.builtInClasses[classid].replacer;
        if(replacer === undefined) return value;
        return replacer(key, value);
    };

    public static FromJSStruct(val: any ): Token | null {
        if(val.classid === undefined) return val;
        if(val.val === undefined && val.arrayval === undefined) return Token.NewInstance(val.classid, val);
        if(val.val !== undefined) {
            var tokenized: { [key: string]: Token | null } = {};
            for(let elemkey in val.val) {
                tokenized[elemkey] = Token.FromJSStruct(val.val[elemkey]);
            };
            return Token.NewInstance(val.classid, tokenized);
        }
        if(val.arrayval !== undefined) {
            var tokenizedA: (Token | null)[] = [];
            for(let idx in val.arrayval) {
                tokenizedA[idx] = Token.FromJSStruct(val.arrayval[idx]);
            };
            return Token.NewInstance(val.classid, tokenizedA);
        }
        return null;
    };

    public abstract ToJSStruct(): any;

    public static InstallClass(classname: string, ni:(any)=>Token, fl:(string)=>{val:Token, rest: string}, rc:(string,any)=>any, rp:(string, any)=>string): void {
        Token.builtInClasses[classname]={newInstance: ni, fromLiteral: fl, reciever: rc, replacer: rp};
    };

    public ClassId(): string {return this.classid; };
    // Overridden if needed.
    public IsVoid(): boolean {return false;};
    public AsNumber(): number {return null;};
    public AsString(): string {return null;};
    public AsBool(): boolean {return null;};
    public Put(key: any, val:Token):void { try { this.val.Put(key, val); }catch(e) {} };
    public Get(key: any): Token {var r:Token = null; try {r=this.val.Get(key);} catch(e) {r=null;} return r;};
    public EQ(dest: Token): boolean {return false;};
    public ForAll(f: (key: string, val: Token)=>boolean):void {};

    public EvalStep(mode: ExecOption, cxT: VPGLContext, opname: string, option: string, inTokenInOrder: Token[]):{status: string, ret: ReturnCode, outputInOrder: Token[]}{
        var clsdef: Token = VPGLGlobalDataBase.Get(this.classid);
        if(clsdef !== undefined) {
            var method: Token = clsdef.Get(opname);
            if(method !== undefined)
                return method.EvalStep(mode, cxT, opname, option, inTokenInOrder);
        };
        var subr: Token = this.Where(opname);
        if (subr === undefined) return super.EvalStep(mode, cxT, opname, option,inTokenInOrder);
        return subr.EvalStep(mode, cxT, opname, option, inTokenInOrder);
    };

    protected SearchSC(cls: string, key: string):Token {
        var result: Token = null;
        var clsdef: Token = VPGLGlobalDataBase.Get(cls);
        if (clsdef === undefined || clsdef === null) return null;
        var sclist:Token = clsdef.Get(SuperClassesKey);
        var self: Token = this;
        sclist.ForAll(function(xkey: string, val: Token): boolean{
            var clsname: string = val.AsString();
            if (clsname === undefined || clsname === null) return false;
            var cld: Token = VPGLGlobalDataBase.Get(clsname);
            if (cld !== undefined && cld !== null){ 
                result = cld.Get(key);
                if (result !== undefined && result !== null) return true;
            }
            if (_SUBRDepo[clsname] !== undefined && _SUBRDepo[clsname] !== null){
                 result = _SUBRDepo[clsname][key];
                if (result !== undefined && result !== null) return true;
            }
            result =  self.SearchSC(clsname, key);
            if (result !== undefined && result !== null) return true;
            return false;
        });
        return result;
    };

    public Where(key: string): Token {
        var result: Token = this.Get(key);
        if (result !== undefined && result !== null) return result;
        var clsdef : Token  = VPGLGlobalDataBase.Get(this.ClassId());
        if(clsdef !== undefined && clsdef !== null) {
            result = clsdef.Get(key)
            if (result !== undefined && result !== null) return result;
        };
        if(_SUBRDepo[this.ClassId()] !== undefined  && _SUBRDepo[this.ClassId()] !== null) {
            result = _SUBRDepo[this.ClassId()][key];
            if (result !== undefined && result !== null) return result;
        };
        return this.SearchSC(this.ClassId(), key);
    };

    public DeepFindMethod(cname: string, key: string): {target: Token, clsname: string} {
        if(key === '' || key === undefined || key === null) return {target: null, clsname: cname};
        var result: Token = this.val[key];
        if(result !== undefined && result !== null) return {target: result, clsname: cname};
        var clsdef : Token  = VPGLGlobalDataBase.Get(this.ClassId());
        if(clsdef !== undefined && clsdef !== null) {
            result = clsdef.Get(key)
            if (result !== undefined && result !== null) return {target: result, clsname: cname};
        };
        if(_SUBRDepo[this.ClassId()] !== undefined  && _SUBRDepo[this.ClassId()] !== null) {
            result = _SUBRDepo[this.ClassId()][key];
            if (result !== undefined && result !== null) return {target: result, clsname: cname};
        };
        var sc:Token = this.val[SuperClassesKey];
        if(sc !== undefined && sc !== null) {
            var scs: Token[] = sc.val;
            for(var i = 0; i<scs.length; i++) {
                var clss: string = scs[i].AsString();
                var sctoken: Token = VPGLGlobalDataBase.Get(clss);
                if(sctoken === undefined || sctoken === null) continue;
                var rstruct: { target: Token, clsname: string} = sctoken.DeepFindMethod(clss, key);
                if(rstruct !== null) return rstruct;
            };
        }
        return {target: null, clsname: cname};
    }
};

class VPGLGlobalDataBase {
    public static constlist : Token = null;
    public static breakPointList: {cname: string, mname: string, posstr: string}[] = [];
    public static Get(key: string) : Token {
        return this.constlist.Get(key);
    };

    public static ForAll(func: (key:string, val: Token)=>boolean): void {
        for(let key in this.constlist) {
            if (func(key, this.constlist[key])) break;
        };
    };
    public static Put(key: string, val: Token, tosave: boolean):void {
        val.tosave = tosave;
        this.constlist.Put(key,val);
    };

    public static Classes() : string[] {
        var result = [];
        VPGLGlobalDataBase.constlist.ForAll(
            function(key:string, val:Token):boolean{result.push(key); return false}
            );
        return result;
    };

    public static Members(clsname: string) : string[] {
        var result = [];
        var cls : Token = VPGLGlobalDataBase.Get(clsname);
        cls.ForAll(function(key:string, val:Token):boolean{
            if(key !== SuperClassesKey) result.push(key);
            return false;
        });
        return result;
    };

    private static PickUpForSourceOut(): Token {
        return VPGLGlobalDataBase.constlist;
    };

    public static SourceOut() : string {
        this.ClearAllBreakPoints();
        var loadimage : Token = this.PickUpForSourceOut();
        //return JSON.stringify(loadimage, Token.JSONReplacer , "  ");
        return JSON.stringify(loadimage, Token.JSONReplacer); // packed
    };

    public static SourceIn(source: any, overwrite: boolean): void {
        if(overwrite)
            gDB.Initialize();
        var newmembers: Token = JSON.parse(source, Token.JSONReciver).outload;
        newmembers.ForAll(function(key: string, val: Token): boolean {
            VPGLGlobalDataBase.Put(key, val, true); // keep it to save.
            return false;
        });
    };

    public Initialize() : void {
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
        if(_enable3D) {
            ThreeDToken.RegisterSelf();
            Scene3DToken.RegisterSelf();
            Geometry3DToken.RegisterSelf();
        };
        AppToken.RegisterSelf();
        UserDefinedClassToken.RegisterSelf();

        var appClass : Token = Token.NewInstance("App",{});
        var mainlineMethod : Token = GridToken.NewInstance(Token.FromLiteral('{"opname": "Mainline" "size": 7 "indir": "T" "outdir": "" "ifall": T}').val);
        mainlineMethod.Put("D1", Token.NewInstance("Tile", Token.FromLiteral('{"indir": "T" "outdir": "B" "opname": "CONST" "option": "\'HELLO WORLD\'" }').val));
        mainlineMethod.Put("D2", Token.NewInstance("Tile", Token.FromLiteral('{"indir": "T" "outdir": "B" "opname": "ALRT" "option": "" }').val));
        mainlineMethod.Put("D3", Token.NewInstance("Tile", Token.FromLiteral('{"indir": "T" "outdir": "" "opname": "STOP" "option": ""}').val));
        appClass.Put("Mainline", mainlineMethod);
        appClass.Put(SuperClassesKey,　Token.NewInstance("Array", [StringToken.NewInstance("Dictionary")]));
        VPGLGlobalDataBase.Put("App", appClass, true);
    };

    public static RegisterBreakPoint(classname:string, methodname: string, posstr: string): void {
        var len : number = VPGLGlobalDataBase.breakPointList.length;
        for (var i:number =0; i<len; i++) {
            var e: {cname: string, mname: string, posstr: string} = VPGLGlobalDataBase.breakPointList[i];
            if(e.cname === classname && e.mname === methodname && e.posstr === posstr)
                return;
        }
        VPGLGlobalDataBase.breakPointList[len] = {cname: classname, mname: methodname, posstr: posstr};
    };

    public static UnregisterBreakPoint(classname: string, methodname: string, posstr: string): void {
        var len : number = VPGLGlobalDataBase.breakPointList.length;
        for (var i:number =0; i<len; i++) {
            var e: {cname: string, mname: string, posstr: string} = VPGLGlobalDataBase.breakPointList[i];
            if(e.cname === classname && e.mname === methodname && e.posstr === posstr) {
                VPGLGlobalDataBase.breakPointList.splice(i,1);
                return;
            }
        }
        postMessage({cmd: 'ERROR', msg:"Unregister BP - No such BP: "+classname+":"+methodname+":"+posstr}, null);
    };

    public static ClearAllBreakPoints(): void {
        for (var i=0; i<VPGLGlobalDataBase.breakPointList.length; i++) {
            var e: {cname: string, mname: string, posstr: string} = VPGLGlobalDataBase.breakPointList[i];
            var ctk: Token = VPGLGlobalDataBase.Get(e.cname);
            if(ctk !== undefined && ctk !== null) {
                var mtk: Token = ctk.Get(e.mname);
                if(mtk !== undefined && mtk !== null){
                    var ptk: Token = mtk.Get(e.posstr);
                    if (ptk !== undefined && ptk !== null) {
                        ptk.Put(BreakPointKey, null);
                    };
                };
            }; 
        };
        VPGLGlobalDataBase.breakPointList = [];
    };

    public static BPHitToOn():void {
        for (var i=0; i<VPGLGlobalDataBase.breakPointList.length; i++) {
            var e: {cname: string, mname: string, posstr: string} = VPGLGlobalDataBase.breakPointList[i];
            var cls: Token = VPGLGlobalDataBase.Get(e.cname);
            var mtd: Token = cls.Get(e.mname)
            var ctk: Token = mtd.Get(e.posstr); 
            if(ctk !== undefined && ctk !== null) {
                var mtk: Token = ctk.Get(e.mname);
                if(mtk !== undefined && mtk !== null) {
                    var ptk = mtk.Get(e.posstr);
                    if(ptk !== undefined && ptk !== null) {
                        var btk: Token = ptk.Get(BreakPointKey);
                        if(btk !== undefined && btk !== null) {
                            var bp: number = btk.AsNumber();
                            if(bp === BreakPointState.hit)
                                btk.Put(BreakPointKey, NumberToken.NewInstance(BreakPointState.on));
                        };
                    };
                };
            };
        };
    };
};

type SubrProc = (mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string)=>{status: string, ret: ReturnCode, outputInOrder: Token[]}

class VoidToken extends Token {
    protected static subrcoll: SUBRToken[] = []; 
    protected static classidstr: string = "Void";

    protected classid: string;

    protected constructor () { super(); this.classid=VoidToken.classidstr; this.val=null; }

    public static theVOID : Token = new VoidToken();
    
    public static NewInstance(val: any){ return VoidToken.theVOID; };

    public static FromLiteral(literal: string):{val: Token, rest: string} {
        var result: {val: string, rest:string} = Token.lex(literal);
        if(result.val === "void")
            return {val: VoidToken.theVOID, rest: result.rest};
        else
            return null;
    };

    public Clone(): Token { return this; }
    public ToJSStruct(): any { return "void"; };

    protected static JSONRcv(key, value): any {return VoidToken.theVOID; };
    protected static JSONRpl(key, value): any {return { "classid": "void" }; };

    public IsVoid(): boolean { return true; };
    public Put(key:string, val:Token) {};
    public Get(key:string) {return null;};

    public static RegisterSelf() : void {
        Token.InstallClass("void", VoidToken.NewInstance, VoidToken.FromLiteral, VoidToken.JSONRcv, VoidToken.JSONRpl);
        var initval: Token = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([]));
        _SUBRDepo["void"]=VoidToken.subrcoll;
        VPGLGlobalDataBase.Put("Void",initval, false);
    };    
};

class TToken extends VoidToken {
    protected static subrcoll: SUBRToken[] = [];
    protected static classidstr: string = "T";

    private static theT : TToken = new TToken();

    protected constructor() { super(); this.classid = TToken.classidstr; this.val = null;};
    public static NewInstance(val: any): Token {return TToken.theT;};

    public static FromLiteral(literal: string): {val: Token, rest: string} {
        var result: {val: string, rest:string} = Token.lex(literal);
        if(result.val === "T")
            return {val: TToken.theT, rest: result.rest};
        else
            return null;
    };

    public Clone():Token { return TToken.theT; };
    public ToJSStruct(): any { return true; };

    protected static JSONRcv(key, value): any {return TToken.theT; };
    protected static JSONRpl(key, value): any {return {classid: "T"}; };

    public IsVoid(): boolean { return false; };
    public AsBool(): boolean { return true; };
    public AsString(): string {return "T"; };
    public EQ(dest: Token) : boolean {return false; };
    public Put(key:string, val:Token) {};
    public Get(key:string) {return null;};

    // SUBRs
    private static TNOT(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "T::GDB", ret: ReturnCode.ok, outputInOrder:[NILToken.NewInstance(null), null, null, null]};
    };

    private static CONST(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var val = Token.FromLiteral(option);
        if(val === null)
            return {status: "CONST: option is malformed", ret: ReturnCode.error, outputInOrder: [null, null, null]};
        return {status: "T::CONST", ret: ReturnCode.ok, outputInOrder:[val.val, null, null]};
    };

    private static OPTION(mode: ExecOption, cxt: VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var val = null;
        if(cxt.parent !== null && cxt.parent.parent !== null)
            val = Token.FromLiteral(cxt.parent.parent.option);
        var result: Token = null;
        if(val === null || val.val === null)
            result = VoidToken.NewInstance(null);
        else
            result = val.val;
        return {status: "T::OPTION", ret: ReturnCode.ok, outputInOrder: [result, null, null]};
    }

    private static GDB(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "T::GDB", ret: ReturnCode.ok, outputInOrder:[VPGLGlobalDataBase.constlist, null, null, null]};
    };

    private static EQ(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === undefined || inTokenInOrder[0] === null)
            return {status: "EQ of T", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var opttoken: Token = null;
        if (option !== undefined && option !== null && option !== '') 
            opttoken = Token.FromLiteral(option).val;
        if((opttoken === undefined || opttoken === null) && inTokenInOrder[1] === null)
            return {status: "EQ of T", ret: ReturnCode.needMoreToken, outputInOrder: null};

        var result: boolean = inTokenInOrder[0].EQ(opttoken!==null?opttoken:inTokenInOrder[1]);
        return {status: "T::EQ", ret: ReturnCode.ok, outputInOrder: [result?TToken.NewInstance(null):NILToken.NewInstance(null),null,null,null]};
    };

    private static RANDOM(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var range : number = 1;
        if (option !== undefined && option !== null && option !== '') {
            var opttoken: Token = Token.FromLiteral(option).val;
            range = opttoken.AsNumber();
            if (range === undefined || range === null)
                return {status: "T::RANDOM - option must be number", ret: ReturnCode.error, outputInOrder: null};
        }
        var result: number = Math.random()*range;
        return {status: "T::RANDOM", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(result),null,null,null]};
    };

    private static ARRAY2(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return {status: "TARRAY2", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var val : Token = Token.NewInstance('Array', [inTokenInOrder[0], inTokenInOrder[1]]);
        return {status: "T::ARRAY2", ret: ReturnCode.ok, outputInOrder: [val, null, null]};
    };

    private static ARRAY3(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null || inTokenInOrder[1] === null || inTokenInOrder[2] == null)
            return {status: "TARRAY3", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var val : Token = Token.NewInstance('Array', [inTokenInOrder[0], inTokenInOrder[1], inTokenInOrder[2]]);
        return {status: "T::ARRAY3", ret: ReturnCode.ok, outputInOrder: [val, null, null]};
    };

    private static INPUT (mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var eid: number = _NewEventId();
        var prompt: string = "Please Input";
        if (option !== undefined && option !== null) {
            var pt : Token = Token.FromLiteral(option).val;
            if (pt != undefined && pt !== null)
                prompt = pt.ToLiteral();
        };
        postMessage({cmd: "Input", prompt: prompt, eid: eid, exmode: mode}, null);
        cxt.status = Status.blocked;
        _suspendedContext[eid] = cxt;
        return {status: "INPUT", ret: ReturnCode.blocking, outputInOrder:[NumberToken.NewInstance(eid), null, null, null]};
    };

    private static ALRT(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var val : string = inTokenInOrder[0].ToLiteral();
        var prompt : string = null;
        if (option !== undefined && option !== null && option !== '')
            prompt = Token.FromLiteral(option).val.ToLiteral();
        var outs : string = prompt!==null?prompt+" : "+val:val;
        var eid: number = _NewEventId();
        cxt.status = Status.blocked;
        _suspendedContext[eid] = cxt;
        _suspendedRetVal[eid] = [inTokenInOrder[0], null, null, null];
        postMessage({cmd: 'Alert', msg: outs, eid: eid, exmode: mode}, null);
        return {status: "ALRT", ret: ReturnCode.blocking, outputInOrder:[NumberToken.NewInstance(eid), null, null, null]};
    };

    private static END(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "END", ret: ReturnCode.ok, outputInOrder: [null, null, null]};
    };

    private static STOP(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var val : string = JSON.stringify(inTokenInOrder[0]);
        return {status: "STOP", ret: ReturnCode.executionHALT, outputInOrder:[null, null, null]};
    };

    private static SWITCH(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if (inTokenInOrder[0] == null || inTokenInOrder[1] == null)
            return {status: "SWITCH on T", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null, null]};

        if(inTokenInOrder[1].AsBool())
            return {status: "SWITCH on T", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null, null]};
        else
            return {status: "SWITCH on NIL", ret: ReturnCode.ok, outputInOrder: [null, inTokenInOrder[0], null, null]};
    };

    /*
        APPLY [targetObject, [[in1, in2, in3], option], opname, null]->[[out0, out1, out2], void, void, void];
     */
    private static APPLY(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if (inTokenInOrder[0] === null || inTokenInOrder[1] === null || inTokenInOrder[2] === null)
            return {status: "APPLY on T", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null, null]};
        var opname : string = inTokenInOrder[2].AsString();
        var opt : string = inTokenInOrder[1].Get(1).AsString();
        var tmp : {status: string, ret: ReturnCode, outputInOrder: Token[]};
        
        var topWqe : WaitingQeueuEntry = new WaitingQeueuEntry();
        var cbContext : VPGLContext = new VPGLContext(null, _NewEventId());
        cbContext.depthlevel = 0;
        cbContext.Install(inTokenInOrder[0], opname, opt,  [inTokenInOrder[0], 
            inTokenInOrder[1].Get(0).Get(0),
            inTokenInOrder[1].Get(0).Get(1),
            inTokenInOrder[1].Get(0).Get(2)]);
        cbContext.parent = topWqe;
        cbContext.position = "A2";
        cbContext.outdir = "B";
        topWqe.child = cbContext;
        topWqe.parent = null;
             
        tmp = cbContext.Go(mode);     
        if(tmp.ret === ReturnCode.error)
            return {status: "APPLY : ret - ERROR code: "+tmp.ret+" -- "+tmp.status, ret: ReturnCode.error, outputInOrder: [null, null, null] };
        if(tmp.ret === ReturnCode.breakStop) {
            var topcontext: VPGLContext = cbContext;
            while(topcontext.parent !== undefined && topcontext.parent !== null 
                    && topcontext.parent.parent!==undefined && topcontext.parent.parent !== null){
                topcontext = topcontext.parent.parent;
            };
            var tg: WaitingQeueuEntry = topcontext.TraceSearch();
    
            if ( tg!== null) {
                if(tg.parent.classname === 'UserDefined')
                    _ForceUiRedraw((<UserDefinedClassToken>tg.parent.arrivedTokensInOrder[0]).typeid, tg.parent.opname, tg.parent);
                else
                    _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
            }
        }; // breakstop
        var val : Token[] = []
        if(tmp.outputInOrder !== null)
            for (var i =0; i<tmp.outputInOrder.length; i++)
                    if(tmp.outputInOrder[i] === null || tmp.outputInOrder[i] === undefined)
                        val.push(VoidToken.NewInstance(null));
                    else
                        val.push(tmp.outputInOrder[i]);
        return {status: "APPLY : "+ tmp.status, ret: tmp.ret, 
            outputInOrder: [Token.NewInstance('Array', val), null, null, null]};
    };

    private static LOOP(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if (inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return {status: "LOOP on T", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        var opname : string = inTokenInOrder[1].AsString();
        opname = opname.slice(1, opname.length-1);
        var loop: boolean = true;
        var tmp: {status: string, ret: ReturnCode, outputInOrder: Token[]} = null;
        while(loop) {
            var topWqe : WaitingQeueuEntry = new WaitingQeueuEntry();
            var cbContext : VPGLContext = new VPGLContext(null, _NewEventId());
            cbContext.depthlevel = 0;
            cbContext.Install(inTokenInOrder[0], opname, null, [inTokenInOrder[0], null, null, null]);
            cbContext.parent = topWqe;
            cbContext.position = "A2";
            cbContext.outdir = "B";
            topWqe.child = cbContext;
            topWqe.parent = null;
        
            tmp = cbContext.Go(mode);
            if(tmp.outputInOrder[0] !== null)
                loop = tmp.outputInOrder[0].AsBool();
                loop = (loop === null)?false:!loop; // exit loop if out0 is true.
        }
        return {status: "LOOP on T", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null]};
    };

    private static JOIN(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if (inTokenInOrder[0] == null || inTokenInOrder[1] == null)
            return {status: "JOIN on T", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null, null]};

        return {status: "JOIN on T", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null, null]};
    };

    private static XXX(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string) : {status: string, ret:ReturnCode, outputInOrder:Token[]} {
        if(inTokenInOrder[0] === undefined || inTokenInOrder[0] === null)
            return {status: "XXX on T", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var tmp: string = inTokenInOrder[0].ToLiteral();
        var caption: string = option!==null?option+" : ":"";
        //postMessage({cmd:"Alert", msg:(caption + tmp)}, null);
        return{status: "XXX on T", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null]};
    }

    private static FLOW(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if (cxt.outdir.length === 0) // No out case is n-Way END
            return {status: "END", ret: ReturnCode.ok, outputInOrder: [null, null, null, null]};
        var tmp: Token = null;
        var idx: number = 0;
        for (idx = 0; idx<3; idx++){
            tmp = inTokenInOrder[idx];
            if (tmp !== null) break;
        }
        if (cxt.outdir.length === 1) // PASS OR MRG2 OR MRG3
            return {status: "FLOW", ret: ReturnCode.ok, outputInOrder: [tmp, null, null, null]};
        if (cxt.outdir.length === 3) // COPY3
            return {status: "FLOW", ret: ReturnCode.ok, outputInOrder: [tmp, tmp, tmp, null]};
        if (cxt.incond.length === 2 && cxt.outdir.length === 2) { // JCT
            var rr: Token[] = [null, null, null, null];
            rr[idx] = tmp;
            return {status: "FLOW", ret: ReturnCode.ok, outputInOrder: rr};
        }
        if (cxt.outdir.length === 2) // COPY2
            return {status: "FLOW", ret: ReturnCode.ok, outputInOrder: [tmp, tmp, null, null]};
        return {status: "ERROR IN FLOW", ret: ReturnCode.error, outputInOrder: [null, null, null, null]}
    };

    private static PAUSE(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var waitval;
        if(option !==null && option !== undefined) {
            var tmp : number = Math.floor(Number.parseFloat(option));
            if (tmp !== undefined)
                waitval = tmp;
            else
                return({status: "PAUSE - malformed option", ret: ReturnCode.error, outputInOrder: [null, null, null, null]});
        } else
            return({status: "PAUSE - need option in number", ret: ReturnCode.error, outputInOrder: [null, null, null, null]});
        var eid: number = _NewEventId();
        postMessage({cmd: "Pause", msec: waitval, eid: eid, exmode: mode}, null);
        cxt.status = Status.blocked;;
        _suspendedContext[eid] = cxt;
        _suspendedRetVal[eid] = [inTokenInOrder[0], null, null, null];
        return {status: "PAUSE", ret: ReturnCode.blocking, outputInOrder:[NumberToken.NewInstance(eid), null, null, null]};
    };

    private static THREED(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "T3D", ret: ReturnCode.ok, outputInOrder: [ThreeDToken.NewInstance(null), null, null, null]}
    };

    private static TIMER(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "TTIMER", ret: ReturnCode.ok, outputInOrder: [TimerToken.NewInstance(null), null, null, null]}
    };

    public static RegisterSelf() : void {
        Token.InstallClass("T", TToken.NewInstance, TToken.FromLiteral, TToken.JSONRcv, TToken.JSONRpl);
        var initval: Token = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("Void")]));
        this.subrcoll["NOT"]    = SUBRToken.NewInstance(TToken.TNOT);
        this.subrcoll["CONST"]  = SUBRToken.NewInstance(TToken.CONST);
        this.subrcoll["OPTION"] = SUBRToken.NewInstance(TToken.OPTION);
        this.subrcoll["=="]     = SUBRToken.NewInstance(TToken.EQ);
        this.subrcoll["GDB"]    = SUBRToken.NewInstance(TToken.GDB);
        this.subrcoll["RANDOM"] = SUBRToken.NewInstance(TToken.RANDOM);
        this.subrcoll["ARRAY2"] = SUBRToken.NewInstance(TToken.ARRAY2);
        this.subrcoll["ARRAY3"] = SUBRToken.NewInstance(TToken.ARRAY3);
        this.subrcoll["ALRT"]   = SUBRToken.NewInstance(TToken.ALRT);
        this.subrcoll["INPUT"]  = SUBRToken.NewInstance(TToken.INPUT);
        this.subrcoll["END"]    = SUBRToken.NewInstance(TToken.END);
        this.subrcoll["STOP"]   = SUBRToken.NewInstance(TToken.STOP);
        this.subrcoll["SWITCH"] = SUBRToken.NewInstance(TToken.SWITCH);
//        this.subrcoll["APPLY"]  = SUBRToken.NewInstance(TToken.APPLY);
//        this.subrcoll["LOOP"]   = SUBRToken.NewInstance(TToken.LOOP);
        this.subrcoll["JOIN"]   = SUBRToken.NewInstance(TToken.JOIN);
        this.subrcoll["FLOW"]   = SUBRToken.NewInstance(TToken.FLOW);
        this.subrcoll["PAUSE"]  = SUBRToken.NewInstance(TToken.PAUSE);
        this.subrcoll["3D"]     = SUBRToken.NewInstance(TToken.THREED);
        this.subrcoll["TIMER"]  = SUBRToken.NewInstance(TToken.TIMER);
//        this.subrcoll["XXX"]    = SUBRToken.NewInstance(TToken.XXX);
        _SUBRDepo["T"] = this.subrcoll;
        VPGLGlobalDataBase.Put("T",initval, false);
    };
};

class NILToken extends TToken {
    protected static subrcoll: SUBRToken[] = [];
    protected static classidstr: string = "NIL";

    private static theNIL: NILToken = new NILToken();

    protected constructor() { super(); this.classid = NILToken.classidstr; this.val = null; };

    public static NewInstance(val: boolean) : Token {
        var tk: Token = NILToken.theNIL;
        return tk;
    };

    public static FromLiteral(literal: string):{val: Token, rest: string} {
        var result: {val: string, rest:string} = Token.lex(literal);
        if(result.val === "NIL")
            return {val: NILToken.theNIL, rest: result.rest};
        else
            return null;
    };

    public Clone(): Token { return NILToken.theNIL; };
    public ToJSStruct(): any { return false; };

    protected static JSONRcv(key, value): any {return NILToken.theNIL; };
    protected static JSONRpl(key, value): any {return {classid: "NIL"}; };
    public Put(key:string, val:Token) {};
    public Get(key:string) {return null;};

    public AsBool():boolean {return false;}
    public AsString() : string { return "NIL"; };

    private static NOT(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var result: boolean = inTokenInOrder[0].AsBool();
        result = (result===null)?false:(!result);
        return {status: "NOT OF NIL", ret: ReturnCode.ok, outputInOrder:[TToken.NewInstance(null), null, null, null]};
    };

    public static RegisterSelf() : void {
        Token.InstallClass("NIL", NILToken.NewInstance, NILToken.FromLiteral, NILToken.JSONRcv, NILToken.JSONRpl);
        var initval: Token = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("T")]));
        NILToken.subrcoll["NOT"] = SUBRToken.NewInstance(NILToken.NOT);
        _SUBRDepo["NIL"]=NILToken.subrcoll;
        VPGLGlobalDataBase.Put("NIL",initval,false);
    };    
};

class ArrayToken extends TToken {
    protected static subrcoll:SUBRToken[] = [];
    protected static classidstr: string = "Array";

    protected classid: string;

    protected constructor() {super(); this.classid = ArrayToken.classidstr; this.val=[]; };

    public static NewInstance(val : any): Token {
        var rst: ArrayToken = new ArrayToken();
        if(val.classid === "Array")
            rst.val = val.arrayval;
        else
            rst.val = val;
        return rst;
    };

    public static FromLiteral(literal: string) : {val : Token, rest: string} {
        var val : Token[] = [];
        var tmp: string;
        if (literal.length<2 || literal.charAt(0) !== '[') return null;
        tmp = literal.slice(1);
        while (tmp.length !== 0) {
            tmp = tmp.trim();
            if(tmp.length === 0) return null;
            if(tmp.charAt(0) === ']') {tmp=tmp.slice(1); break};
            var elem: {val: Token, rest: string} = Token.FromLiteral(tmp);
            if( elem === null) return null;
            val.push(elem.val);
            tmp = elem.rest;
        };
        return {val: ArrayToken.NewInstance(val), rest: tmp};
    };

    public Clone(): Token {
        return ArrayToken.NewInstance([].concat(this.val));
    };

    public ToJSStruct(): any {
        var result = [];
        for (var idx=0; idx < this.val.val.length; idx++){
            result[idx] = this.val.val[idx].ToJSStruct();
        };
        return result;
    };

    protected static JSONRcv(key, value): any {return ArrayToken.NewInstance(value.val); };
    protected static JSONRpl(key, value): any {
        return { classid: "Array", val: value.val}; };

    public AsString(): string {
        var result : string = '[';
        var elems: Token[] = this.val;
        for(var i = 0; i<elems.length; i++)
            result = result + elems[i].AsString()+ ' ';
        return result.trim() + ']';
    }

    public ForAll(f: (key: string, val: Token)=>boolean):void {
        for(var idx:number = 0; idx<this.val.length; idx++)
            if(f(""+idx, this.val[idx])) break;
    };

    public Put(key: string, val: Token):void{
        var idx:number = Number.parseInt(key);
        if(idx !== undefined && idx !== null && !isNaN(idx)) this.val[idx]=val;
    };

    public Get(key:string): Token {
        var idx: number = Number.parseInt(key);
        if(idx === undefined || idx === null || isNaN(idx)) return null;
        return this.val[idx];
    };

    public Length(): number {return this.val.length;};
    public Push(entry: Token): void {this.val.push(entry);};

    // SUBRs
    private static DUP(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0].ClassId() == "Array")
            return {status: "ARRAYDUP", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0].Clone(), null, null]};
        else
            var result: Token = inTokenInOrder[0].Clone();
            //(<ArrayToken>result).val.val = [].concat((<ArrayToken>inTokenInOrder[0]).val.val);
            return {status: "ARRAYDUP", ret: ReturnCode.ok, outputInOrder: [result, null, null]};
        }

    private static PUSH(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var optional: boolean = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] === null || inTokenInOrder[1] === null))
            return {status: "ARRAYPUSH", ret: ReturnCode.needMoreToken, outputInOrder: null};
        if (optional && inTokenInOrder[0] === null)
            return {status: "ARRAYPUSH", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var toBePushed: Token = null;
        if(optional)
            toBePushed = Token.FromLiteral(option).val;
        else
            toBePushed = inTokenInOrder[1];
        if(toBePushed === null)
            return {status: "ARRAYPUSH invalid to be pushed item.", ret: ReturnCode.malformed, outputInOrder: null};
        var arry: ArrayToken = <ArrayToken>inTokenInOrder[0];
        arry.val = [toBePushed].concat((<ArrayToken>inTokenInOrder[0]).val);
        return {status: "ARRAYPUSH", ret: ReturnCode.ok, outputInOrder: [arry, null, null]};
    };

    private static TENQ(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var optional: boolean = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] === null || inTokenInOrder[1] === null))
            return {status: "ARRAYYENQ", ret: ReturnCode.needMoreToken, outputInOrder: null};
        if (optional && inTokenInOrder[0] === null)
            return {status: "ARRAYENQ", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var toBeENQed: Token = null;
        if(optional)
            toBeENQed = Token.FromLiteral(option).val;
        else
            toBeENQed = inTokenInOrder[1];
        if(toBeENQed === null)
            return {status: "ARRAYENQ invalid to be pushed item.", ret: ReturnCode.malformed, outputInOrder: null};
        var arry: ArrayToken = <ArrayToken>inTokenInOrder[0];
        arry.val = (<ArrayToken>inTokenInOrder[0]).val.concat([toBeENQed]);
        return {status: "ARRAYENG", ret: ReturnCode.ok, outputInOrder: [arry, null, null]};
    };

    private static HEAD(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return {status: "ARRAYHEAD", ret: ReturnCode.needMoreToken, outputInOrder: null};
        if((<ArrayToken>inTokenInOrder[0]).val.length <= 0)
            return {status: "ARRAYHEAD: Empty Array", ret: ReturnCode.error, outputInOrder: null};
        return {status: "Array::HEAD", ret: ReturnCode.ok, outputInOrder: [(<ArrayToken>inTokenInOrder[0]).val[0], null, null]};
    };

    private static GET(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var optional : boolean = (option !== undefined && option !== null && option !== "");
        if(!optional && (inTokenInOrder[0] === null || inTokenInOrder[1] === null))
            return {status: "ARRAYGET", ret: ReturnCode.needMoreToken, outputInOrder: null};
        if(optional && inTokenInOrder[0] === null)
            return {status: "ARRAYGET", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var idx : number;
        if (optional) 
            idx = Token.FromLiteral(option).val.AsNumber();
        else 
            idx = inTokenInOrder[1].AsNumber();
        if(idx === undefined || idx === null) return {status: "Array::GET : index is not number", ret: ReturnCode.error, outputInOrder:null};
        var result : Token = inTokenInOrder[0].Get(idx);
        if(result === undefined || result === null) 
            return {status: "Array::GET : index is not valid at", ret: ReturnCode.error, outputInOrder: null};
        return {status: "Array::GET", ret: ReturnCode.ok, outputInOrder: [result, null, null]};
    };

    private static PUT(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var optional : boolean = (option !== undefined && option !== null && option !== "");
        if(!optional && (inTokenInOrder[0] === null || inTokenInOrder[1] === null || inTokenInOrder[2] === null))
            return {status: "ARRAYPUT", ret: ReturnCode.needMoreToken, outputInOrder: null};
        if(optional && inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return {status: "ARRAYPUT", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var idx : number;
        var toBeSet: Token = null;
        if (optional) {
            idx = Token.FromLiteral(option).val.AsNumber();
            toBeSet = inTokenInOrder[1];
        }
        else {
            idx = inTokenInOrder[1].AsNumber();
            toBeSet = inTokenInOrder[2];
        };
        var arry: Token[] = null;
        if(inTokenInOrder[0].ClassId() == "Array") 
            arry = (<ArrayToken>inTokenInOrder[0]).val;
        else
            arry = (<ArrayToken>inTokenInOrder[0]).val.val;
        if(idx === undefined || idx === null) return {status: "Array::PUT : index is not number", ret: ReturnCode.error, outputInOrder:null};
        if (idx<0)
            arry.unshift(toBeSet);
        else if (idx > arry.length)
            arry.push(toBeSet);
        else
            arry[idx] = toBeSet;
        return {status: "Array::PUT", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null]};
    };

    private static PICK(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var optional : boolean = (option !== undefined && option !== null && option !== "");
        if(!optional && (inTokenInOrder[0] === null || inTokenInOrder[1] === null || inTokenInOrder[2] === null))
            return {status: "ARRAYPICK", ret: ReturnCode.needMoreToken, outputInOrder: null};
        if(optional && inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return {status: "ARRAYPICK", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var idx : number;
        var toBeSet: Token = null;
        if (optional) {
            idx = Token.FromLiteral(option).val.AsNumber();
            toBeSet = inTokenInOrder[1];
        }
        else {
            idx = inTokenInOrder[1].AsNumber();
            toBeSet = inTokenInOrder[2];
        };
        var arry: Token[] = null;
        if(inTokenInOrder[0].ClassId() == "Array") 
            arry = (<ArrayToken>inTokenInOrder[0]).val;
        else
            arry = (<ArrayToken>inTokenInOrder[0]).val.val;
        if(idx === undefined || idx === null) return {status: "Array::PICK : index is not number", ret: ReturnCode.error, outputInOrder:null};
        if (idx<0 || idx >= arry.length)
            return {status: "Array::PICK : index is out of range", ret: ReturnCode.error, outputInOrder: null};
        else{
            var resarry: Token[] = arry.splice(idx,1);
            if(inTokenInOrder[0].ClassId() == "Array")
                (<ArrayToken>inTokenInOrder[0]).val = resarry
            else
                (<ArrayToken>inTokenInOrder[0]).val.val = resarry
        }
        return {status: "Array::PUT", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null]};
    };

    private static MEMBER(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return {status: "ARYMEMBER", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var result = NILToken.NewInstance(null);
        var target: ArrayToken = <ArrayToken>inTokenInOrder[0];
        for (var i = 0; i<target.val.length; i++) {
            if (inTokenInOrder[1].EQ( inTokenInOrder[0].Get(i))) {
                result = TToken.NewInstance(null);
                break;
            }
        }
        return {status: "Array::MEMBER", ret: ReturnCode.ok, outputInOrder: [result, null, null]};
    };

    private static LENGTH(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return {status: "ARYLENGTH", ret: ReturnCode.needMoreToken, outputInOrder: null};
        return {status: "Array::LENGTH", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance((<ArrayToken>inTokenInOrder[0]).val.length), null, null]};
    };

    private static EMPTY(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return {status: "ARYEMPTY", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var result: boolean = true;
        if( (<ArrayToken>inTokenInOrder[0]).val.val !== undefined)
            result = ((<ArrayToken>inTokenInOrder[0]).val.val.length === 0);
        else
            result = ((<ArrayToken>inTokenInOrder[0]).val.length === 0);
        return {status: "Array::LENGTH", ret: ReturnCode.ok, outputInOrder: [result?TToken.NewInstance(null):NILToken.NewInstance(null), null, null]};
    };

    private static REST(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return {status: "ARYPOP", ret: ReturnCode.needMoreToken, outputInOrder: null};
            var result: ArrayToken = null;
        if(inTokenInOrder[0].ClassId() !== "Array") {
            var rest: Token[] = (<ArrayToken>inTokenInOrder[0]).val.val;
            rest = rest.slice(1);
            result = <ArrayToken>inTokenInOrder[0];
            result.val.val = rest;
        } else {
            var rest: Token[] = (<ArrayToken>inTokenInOrder[0]).val;
            result = <ArrayToken>inTokenInOrder[0];
            rest = rest.slice(1);
            result.val = rest;
        }
        return {status: "Array::REST", ret: ReturnCode.ok, outputInOrder: [result, null, null]};
    };

    private static TDEQ(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return {status: "ARYTDEQ", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var result: Token = null;
        if(inTokenInOrder[0].ClassId() !== "Array") {
            var rest: Token[] = (<ArrayToken>inTokenInOrder[0]).val.val;
            var oldlength: number = rest.length;
            rest = rest.splice(oldlength-1, 1);
            var result: Token = inTokenInOrder[0].Clone();
            (<ArrayToken>result).val=ArrayToken.NewInstance(rest);
        } else {
            var rest: Token[] = (<ArrayToken>inTokenInOrder[0]).val;
            rest = rest.slice(1);
            result = ArrayToken.NewInstance(rest);
        }
        return {status: "Array::TDEQ", ret: ReturnCode.ok, outputInOrder: [result, null, null]};
    };

    // arrayには、forallかイテレータが必要。後者は新規のクラスかもしれない。
    // forallは、新規クラスの導入は必要ないが、外部仕様についての詰めた検討が必要
    // forall in0:array in1: callbackを持つオブジェクト, in2:proc名(option) -> out0: array,
    // callback (in0: callbackのオーナー, in1: [array,index,val])->out:NILなら続行。NIL以外ならコールバックの呼び出しは終了。
    // こうなると、GET/PUT/PUSH/MAPだけでよくないか?

    public static RegisterSelf() : void {
        Token.InstallClass("Array", ArrayToken.NewInstance, ArrayToken.FromLiteral, ArrayToken.JSONRcv, ArrayToken.JSONRpl);
        var initval: Token = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("T")]));
            ArrayToken.subrcoll["PUSH"]    = SUBRToken.NewInstance(ArrayToken.PUSH);
            ArrayToken.subrcoll["HENQ"]    = SUBRToken.NewInstance(ArrayToken.PUSH);
            ArrayToken.subrcoll["HDEQ"]    = SUBRToken.NewInstance(ArrayToken.REST);
            ArrayToken.subrcoll["TENQ"]    = SUBRToken.NewInstance(ArrayToken.TENQ);
            ArrayToken.subrcoll["TDEQ"]    = SUBRToken.NewInstance(ArrayToken.TDEQ);
            ArrayToken.subrcoll["HEAD"]    = SUBRToken.NewInstance(ArrayToken.HEAD);
        ArrayToken.subrcoll["DUP"]     = SUBRToken.NewInstance(ArrayToken.DUP);
        ArrayToken.subrcoll["GET"]     = SUBRToken.NewInstance(ArrayToken.GET);
        ArrayToken.subrcoll["PUT"]     = SUBRToken.NewInstance(ArrayToken.PUT);
        ArrayToken.subrcoll["PICK"]     = SUBRToken.NewInstance(ArrayToken.PICK);
        ArrayToken.subrcoll["MEMBER"]  = SUBRToken.NewInstance(ArrayToken.MEMBER);
        ArrayToken.subrcoll["LENGTH"]  = SUBRToken.NewInstance(ArrayToken.LENGTH);
        ArrayToken.subrcoll["EMPTY?"]  = SUBRToken.NewInstance(ArrayToken.EMPTY);
            ArrayToken.subrcoll["REST"]    = SUBRToken.NewInstance(ArrayToken.REST);
        _SUBRDepo["Array"]=ArrayToken.subrcoll;
        VPGLGlobalDataBase.Put("Array",initval, false);
    };    
};

class StringToken extends TToken {
    protected static subrcoll: SUBRToken[] = [];
    protected static classidstr: string = "String";

    protected classid: string;

    protected constructor() { super(); this.classid=StringToken.classidstr; this.val = null; };

    public static NewInstance(val: any) : Token {
        var tk: StringToken = new StringToken();
        if(val.classid === "String")
            tk.val = val.stringval;
        else
            tk.val = <string>val;
        return tk;
    };

    public static FromLiteral(literal: string) : {val: Token, rest: string} {
        var result : {val: Token, rest: string} = null;
        literal = literal.trim();
        if(literal.charAt(0) !== '"' && literal.charAt(0) !== "'") return null;
        var endp: number = 0;
        var brk: string = literal.charAt(0);
        for(endp=1; endp<literal.length; endp++)
            if(literal.charAt(endp) === '\\') {endp++; continue}
            else if(literal.charAt(endp) === brk) { break; }
            else continue;
        if (endp>=literal.length) return null;
        return {val: StringToken.NewInstance(literal.slice(1,endp)), rest: literal.slice(endp+1) };
    };

    public Clone(): Token {
        var val:string = ""+this.val;
        return StringToken.NewInstance(val);
    };

    public ToJSStruct(): any { return this.val; };

    protected static JSONRcv(key, value) : any { return StringToken.NewInstance(value.val); };
    protected static JSONRpl(key, value) : any { return {classid: "String", val: value.val}; };

    public AsString(): string {return this.val; };
    public EQ(dest: Token) : boolean { return this.val === dest.AsString(); };

    public Put(key:string, val:Token) {};
    public Get(key:string) {return null;};

    private static CONCAT(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var optional: boolean = (option !== undefined && option !== null && option !== '');
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return {status: "CONCAT on String", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        if (optional && inTokenInOrder[0] == null)
            return {status: "CONCAT on String", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        var str2 : string, str1 : string;
        str1 = inTokenInOrder[0].AsString();
        if (optional)
            str2 = Token.FromLiteral(option).val.AsString();
        else
            str2 = inTokenInOrder[1].AsString();
        if (str2 === undefined || str2 === null || str1 === undefined || str1 === null)
            return {status: "CONCAT invalid arg", ret: ReturnCode.error, outputInOrder: null};

        var val : string = str1+str2;
        return {status: "CONCAT on STRING", ret: ReturnCode.ok, outputInOrder: [StringToken.NewInstance(val), null, null]};
    };


    public static RegisterSelf() : void {
        Token.InstallClass("String", StringToken.NewInstance, StringToken.FromLiteral, StringToken.JSONRcv, StringToken.JSONRpl);
        var initval: Token = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("T")]));
        _SUBRDepo["String"]=StringToken.subrcoll;
        StringToken.subrcoll["CONCAT"] = SUBRToken.NewInstance(StringToken.CONCAT);
        VPGLGlobalDataBase.Put("String",initval, false);
    };    
};

class NumberToken extends TToken {
    protected static subrcoll: SUBRToken[] = [];
    protected static classidstr: string = 'Number';

    protected classid: string;

    protected constructor() { super(); this.classid=NumberToken.classidstr; this.val = null; };

    public static NewInstance(val: any): Token {
        var tk: NumberToken = new NumberToken();
        if(val.classid==="Number")
            tk.val = val.val;
        else
            tk.val = <number>val;
        return tk;
    };

    public static FromLiteral(literal: string) : {val: Token, rest: string} {
        var result: {val: Token, rest: string} = null;
        var rnum : number;
        var tokens : string[] = [literal,''];
        for (var i=0; i<literal.length; i++)
            if(" \t\n\\r\"'{[}]".indexOf(literal.charAt(i))!== -1) {
                tokens[0] = literal.slice(0,i);
                tokens[1] = literal.slice(i, literal.length);
                break;
            }
        try {
            rnum = Number.parseFloat(tokens[0]);
        } catch(e) { return null; };
        if (Number.isNaN(rnum)) return null;
        return {val: NumberToken.NewInstance(rnum), rest: tokens[1]};
    };

    public Clone():Token { return NumberToken.NewInstance(this.val); };
    public ToJSStruct(): any { return this.val; };

    public AsString(): string { return ""+this.val; };
    public Put(key:string, val:Token) {};
    public Get(key:string) {return null;};
    public EQ(v : Token): boolean {
            var dest : number = v.AsNumber();
            if (dest === undefined || dest === null)
                return false;
            if(Math.abs(this.val - dest)<1e-5)
                return true;
            else
                return false;
            };

    protected static JSONRcv(key, value): any {return NumberToken.NewInstance(value.val); };
    protected static JSONRpl(key, value): any {return {classid: "Number",val: value.val };};

    public AsNumber(): number {return this.val; };

    private static ADD1(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return {status: "NUMADD1", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var val : number = inTokenInOrder[0].AsNumber()+1;
        return {status: "ADD1 on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null]};
    };

    private static SUB1(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return {status: "NUMSUB1", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var val : number = inTokenInOrder[0].AsNumber()-1;
        return {status: "SUB1 on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null]};
    };

    private static ABS(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return {status: "NUMABS", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var val : number = Math.abs(inTokenInOrder[0].AsNumber());
        return {status: "ABS on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null]};
    };

    private static ROUND(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return {status: "NUMROUND", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var val : number = Math.round(inTokenInOrder[0].AsNumber());
        return {status: "ROUND on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null]};
    };

    private static SIN(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return {status: "NUMSIN", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var val : number = Math.sin(inTokenInOrder[0].AsNumber());
        return {status: "SINE on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null]};
    };

    private static COS(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return {status: "NUMCOS", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var val : number = Math.sin(inTokenInOrder[0].AsNumber()+Math.PI/2);
        return {status: "COSINE on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null]};
    };

    private static ADD(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var optional: boolean = (option !== undefined && option !== null && option !== '');
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return {status: "ADD on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        if (optional && inTokenInOrder[0] == null)
            return {status: "ADD on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        var add2 : number, add1 : number;
        add1 = inTokenInOrder[0].AsNumber();
        if (optional)
            add2 = Token.FromLiteral(option).val.AsNumber();
        else
            add2 = inTokenInOrder[1].AsNumber();
        if (add2 === undefined || add2 === null || add1 === undefined || add1 === null)
            return {status: "ADD invalid arg", ret: ReturnCode.error, outputInOrder: null};

        var val : number = add1+add2;
        return {status: "ADD on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null]};
    };

    private static SUB(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var optional: boolean = (option !== undefined && option !== null && option !== '');
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return {status: "SUB on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        if (optional && inTokenInOrder[0] == null)
            return {status: "SUB on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        var sub1 : number, sub2 : number;
        sub1 = inTokenInOrder[0].AsNumber();
        if (optional)
            sub2 = Token.FromLiteral(option).val.AsNumber();
        else
            sub2 = inTokenInOrder[1].AsNumber();
        if (sub2 === undefined || sub2 === null || sub1 === undefined || sub1 === null)
            return {status: "SUB invalid arg", ret: ReturnCode.error, outputInOrder: null};

        var val : number = sub1-sub2;
        return {status: "SUB on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null]};
    };

    
    private static MUL(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var optional: boolean = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return {status: "MUL on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        if (optional && inTokenInOrder[0] == null)
            return {status: "MUL on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        var mul2 : number, mul1 : number;
        mul1 = inTokenInOrder[0].AsNumber();
        if (optional)
            mul2 = Token.FromLiteral(option).val.AsNumber();
        else
            mul2 = inTokenInOrder[1].AsNumber();
        if (mul2 === undefined || mul2 === null || mul1 === undefined || mul1 === null)
            return {status: "MUL invalid arg", ret: ReturnCode.error, outputInOrder: null};

        var val : number = mul1*mul2;
        return {status: "MUL on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null]}; 
    };

    private static DIV(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var optional: boolean = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return {status: "DIV on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        if (optional && inTokenInOrder[0] == null)
            return {status: "DIV on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        var div2 : number, div1 : number;
        div1 = inTokenInOrder[0].AsNumber();
        if (optional)
            div2 = Token.FromLiteral(option).val.AsNumber();
        else
            div2 = inTokenInOrder[1].AsNumber();
        if (div2 === undefined || div2 === null || div1 === undefined || div1 === null)
            return {status: "DIV invalid arg", ret: ReturnCode.error, outputInOrder: null};

        var val : number = div1/div2;
        return {status: "DIV on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null]}; 
    };
    
    private static MOD(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var optional: boolean = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return {status: "MOD on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        if (optional && inTokenInOrder[0] == null)
            return {status: "MOD on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        var mod2 : number, mod1 : number;
        mod1 = inTokenInOrder[0].AsNumber();
        if (optional)
            mod2 = Token.FromLiteral(option).val.AsNumber();
        else
            mod2 = inTokenInOrder[1].AsNumber();
        if (mod1 === undefined || mod1 === null || mod2 === undefined || mod2 === null)
            return {status: "MUL invalid arg", ret: ReturnCode.error, outputInOrder: null};


        var val : number = mod1%mod2;
        return {status: "MOD on Number", ret: ReturnCode.ok, outputInOrder: [NumberToken.NewInstance(val), null, null]};
    };

    private static GT(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var optional = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return {status: "GT on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        if (optional && inTokenInOrder[0] === null)
            return {status: "GT on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        var comparer : number;
        if (optional)
            comparer = Token.FromLiteral(option).val.AsNumber();
        else
            comparer = inTokenInOrder[1].AsNumber();
        if (comparer === undefined || comparer === null)
            return {status: "Number:GT : comparer is not number", ret: ReturnCode.error, outputInOrder: null};
        var val : boolean = inTokenInOrder[0].AsNumber()>comparer;
        return {status: "GT on Number", ret: ReturnCode.ok, outputInOrder: [val?TToken.NewInstance(null):NILToken.NewInstance(null), null, null]};
    };  
    
    private static GE(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var optional = (option !== undefined && option !== null && option !== "");
        if (!optional && (inTokenInOrder[0] == null || inTokenInOrder[1] == null))
            return {status: "GE on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        if (optional && inTokenInOrder[0] === null)
            return {status: "GE on Number", ret: ReturnCode.needMoreToken, outputInOrder: [null, null, null]};
        var comparer : number;
        if (optional)
            comparer = Token.FromLiteral(option).val.AsNumber();
        else
            comparer = inTokenInOrder[1].AsNumber();
        if (comparer === undefined || comparer === null)
            return {status: "Number:GT : comparer is not number", ret: ReturnCode.error, outputInOrder: null};
        var val : boolean = inTokenInOrder[0].AsNumber()>=comparer;
        return {status: "GE on Number", ret: ReturnCode.ok, outputInOrder: [val?TToken.NewInstance(null):NILToken.NewInstance(null), null, null]};
    };   

    private static NUMPAUSE(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var waitval : number = inTokenInOrder[0].AsNumber();
        if(option !==null && option !== undefined) {
            var tmp : number = Math.floor(Number.parseFloat(option));
            if (tmp !== undefined)
                waitval = tmp;
            else
                return({status: "PAUSE - malformed option", ret: ReturnCode.error, outputInOrder: [null, null, null]});
        };
        var eid: number = _NewEventId();
        postMessage({cmd: "Pause", msec: waitval, eid: eid, exmode: mode}, null);
        cxt.status = Status.blocked;
        _suspendedContext[eid] = cxt;
        _suspendedRetVal[eid] = [inTokenInOrder[0], null, null, null];
        return {status: "PAUSE", ret: ReturnCode.blocking, outputInOrder:[NumberToken.NewInstance(eid), null, null]};
    };

    public static RegisterSelf() : void {
        Token.InstallClass("Number", NumberToken.NewInstance, NumberToken.FromLiteral, NumberToken.JSONRcv, NumberToken.JSONRpl);
        var initval: Token = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("T")]));
        NumberToken.subrcoll["N+1"] = SUBRToken.NewInstance(NumberToken.ADD1);
        NumberToken.subrcoll["N-1"] = SUBRToken.NewInstance(NumberToken.SUB1);
        NumberToken.subrcoll["ABS"]  = SUBRToken.NewInstance(NumberToken.ABS);
        NumberToken.subrcoll["ROUND"] = SUBRToken.NewInstance(NumberToken.ROUND);
        NumberToken.subrcoll["SIN"]  = SUBRToken.NewInstance(NumberToken.SIN);
        NumberToken.subrcoll["COS"]  = SUBRToken.NewInstance(NumberToken.COS);
        NumberToken.subrcoll["A+B"]  = SUBRToken.NewInstance(NumberToken.ADD);
        NumberToken.subrcoll["A-B"]  = SUBRToken.NewInstance(NumberToken.SUB);
        NumberToken.subrcoll["A*B"]  = SUBRToken.NewInstance(NumberToken.MUL);
        NumberToken.subrcoll["A/B"]  = SUBRToken.NewInstance(NumberToken.DIV);
        NumberToken.subrcoll["A%B"]  = SUBRToken.NewInstance(NumberToken.MOD);
        NumberToken.subrcoll["GT"]   = SUBRToken.NewInstance(NumberToken.GT);
        NumberToken.subrcoll["GE"]   = SUBRToken.NewInstance(NumberToken.GE);
        NumberToken.subrcoll["PAUSE"] = SUBRToken.NewInstance(NumberToken.NUMPAUSE);
        _SUBRDepo["Number"]=NumberToken.subrcoll;
        VPGLGlobalDataBase.Put("Number",initval,false);
    };    
};

class TimerToken extends TToken {
    protected static subrcoll: SUBRToken[];
    protected static classidstr: string = "Timer";

    protected classid: string;

    private static theTimer : TimerToken = new TimerToken();

    protected constructor() { super(); this.classid = TimerToken.classidstr; this.val = null;};
    public static NewInstance(val: any): Token {return TimerToken.theTimer;};

    public static FromLiteral(literal: string): {val: Token, rest: string} {
        var result: {val: string, rest:string} = Token.lex(literal);
        if(result.val === "Timer")
            return {val: TimerToken.theTimer, rest: result.rest};
        else
            return null;
    };

    public Clone():Token { return TimerToken.theTimer; };
    public ToJSStruct(): any { return {typeid: "Timer"}; };

    protected static JSONRcv(key, value): any {return TimerToken.theTimer; };
    protected static JSONRpl(key, value): string {return '{"typeid": "Timer"}'; };

    // SUBR Definitions
    
    private static SETINTERVAL(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return{status: "TIMER::TICK", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var interval : number = null;
        if (option !== null && option !== "")
            interval = Token.FromLiteral(option).val.AsNumber();
        else if (inTokenInOrder[1] === null)
            return {status: "TIMER::TICK", ret: ReturnCode.needMoreToken, outputInOrder: null};
        else
            interval = inTokenInOrder[1].AsNumber();
        if(interval === null)
            return{status: "TIMER::TICK : invalid interval type", ret: ReturnCode.error, outputInOrder: null};
        interval = Math.round(interval);
        TimerToken.theTimer.val = interval;
        return {status: "Timer::SETINTERVAL-TICK", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0],null,null]};
    }
    
    private static ATTACH(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return{status: "TIMER::ATTACH", ret: ReturnCode.needMoreToken, outputInOrder: null};
        if(inTokenInOrder[2] === null && option !== null && option !== '')
            inTokenInOrder[2] = Token.FromLiteral(option).val;
        if(inTokenInOrder[2] === null) 
            return{status: "TIMER::ATTACH", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var tmp: Token = inTokenInOrder[2].Get("msg");
        if(tmp === undefined || tmp === null)
            return {status: "3D::ATTACH - msg not found", ret: ReturnCode.error, outputInOrder: null};
        var msg : string = tmp.AsString();
        if(msg === undefined || msg === null)
            return {status: "3D::ATTACH - ivalid msg", ret: ReturnCode.error, outputInOrder: null};
        tmp = inTokenInOrder[2].Get("evt");
        if(tmp === undefined || tmp === null)
            return {status: "3D::ATTACH - evt not found", ret: ReturnCode.error, outputInOrder: null};
        var evt : string = tmp.AsString();
        if (evt === undefined || evt === null || evt !== 'OnTick')
            return {status: "3D::ATTACH - invalid evt evt='OnTick' only.", ret: ReturnCode.error, outputInOrder: null};
        _CBTable.push({scn: null, target: null, opname: msg, event: evt, obj: inTokenInOrder[1], exmode: mode})

        return {status: "Timer::ATTACH", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null]};
    }
    
    private static START(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(TimerToken.theTimer.val === undefined || TimerToken.theTimer.val === null)
            return {status: "Timer::START - interval is not specified", ret: ReturnCode.error, outputInOrder: null};
        postMessage({cmd: 'StartTimer', interval: TimerToken.theTimer.val},null)
        return {status: "Timer::START", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null]};
    }
    
    private static STOPTIMER(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        postMessage({cmd: 'StopTimer'},null);
        return {status: "Timer::STOP", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null,null]};
    }

    public static RegisterSelf() : void {
        Token.InstallClass("Timer", TimerToken.NewInstance, TimerToken.FromLiteral, TimerToken.JSONRcv, TimerToken.JSONRpl);
       var initval: Token = TimerToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("T")]));
        TimerToken.subrcoll["TICK"] = SUBRToken.NewInstance(TimerToken.SETINTERVAL);
        TimerToken.subrcoll["ATTACH"] = SUBRToken.NewInstance(TimerToken.ATTACH);
        TimerToken.subrcoll["START"] = SUBRToken.NewInstance(TimerToken.START);
        TimerToken.subrcoll["TMSTOP"] = SUBRToken.NewInstance(TimerToken.STOPTIMER);
        _SUBRDepo["Timer"]=TimerToken.subrcoll;
        VPGLGlobalDataBase.Put("Timer",initval,false); 
    };
}


class DictToken extends TToken {
    protected static subrcoll:SUBRToken[] = [];
    protected static classidstr: string = "Dictionary";

    protected classid: string;

    protected constructor() { super(); this.classid = DictToken.classidstr; this.val = null; };

    public static NewInstance(val: any) : Token {
        var tk: DictToken = new DictToken();
        tk.val = <Token[]>val;
        return tk;
    };

    public static NewInstance2(val: any) : Token {
        var tk: DictToken = new DictToken();
        var xx: Token[] = [];
        for(let key in val) {
            var elem: Token;
            if(val[key] === undefined || val[key] === null) continue;
            switch(typeof val[key]) {
                case "number":
                    elem = NumberToken.NewInstance(val[key]); break;
                case "string":
                    elem = StringToken.NewInstance(val[key]); break;
                case "boolean":
                    if (val[key])
                        elem = TToken.NewInstance(true);
                    else
                        elem = NILToken.NewInstance(false);
                    break;
                default:
                    continue;
            };
            xx[key] = elem;
        };
        tk.val = xx;
        return tk;
    };

    public static FromTokenArray(src: Token[]):Token {
        return DictToken.NewInstance(src);
    };

    public static ToTokenArray(val: any): {} {
        var xx: {} = {}
        for(let key in val) {
            var elem: Token;
            if(val[key] === undefined || val[key] === null) continue;
            switch(typeof val[key]) {
                case "number":
                    elem = NumberToken.NewInstance(val[key]); break;
                case "string":
                    elem = StringToken.NewInstance(val[key]); break;
                case "boolean":
                    if (val[key])
                        elem = TToken.NewInstance(true);
                    else
                        elem = NILToken.NewInstance(false);
                    break;
                default:
                    continue;
            };
            xx[key] = elem;
        };
        return xx;
    };

    public static FromLiteral(literal: string): {val: Token, rest: string} {
        var tmp : {val: Token, rest: string} = null;
        var tokenval: {} = {};
        literal = literal.trim();
        if(literal.charAt(0) !== '{') return null;
        literal = literal.slice(1);
        while(literal.length > 0 && literal.charAt(0) !== '}') {
            tmp = StringToken.FromLiteral(literal);
            if(tmp === null || tmp === undefined) return null;
            var elemkey: string = tmp.val.AsString(); literal = tmp.rest.trim();
            if( literal.charAt(0) !== ':') return null;
            literal = literal.slice(1).trim();
            tmp = Token.FromLiteral(literal);
            if(tmp === null || tmp === undefined) return null;
            var elemval: Token = tmp.val; literal = tmp.rest.trim();
            tokenval[elemkey] = elemval;
        };
        if (literal.length <= 0) return null;
        return {val: DictToken.NewInstance(tokenval), rest: literal.slice(1)};
    };

    public Clone(): Token { return DictToken.NewInstance(this.val); };

    public ToJSStruct(): any {
        var result = {};
        this.ForAll(function(key: string, val:Token):boolean{
            result[key]=val.ToJSStruct();
            return false;
        });
        return result;
    };

    protected static JSONRcv(key, value): any { return DictToken.NewInstance(value.val); };
    protected static JSONRpl(key, value): any { 
        return {classid : "Dictionary", val: value.val}; };

    public AsString(): string {
        var result: string = "{";
        for(let key in this.val) {
            result = result+' "'+key+'" : '+this.val[key].AsString()+' ';
        }
        return result.trim()+'}';
    };

    public Get(key: string): Token { return this.val[key]; };

    public Put(key: string, val: Token): void {
        if (val === null)
            delete this.val[key];
        else
            this.val[key] = val;
    };

    public ForAll(f: (key: string, val: Token)=>boolean):void {
        for(let kk in this.val) {
            if(f(kk, this.val[kk])) break;
        }
    };

    // SUBR Definitions
    
    public static GET(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if((option !== null && option !== "")&&(inTokenInOrder[0] === null)) 
            return {status: "Dict:Get", ret: ReturnCode.needMoreToken, outputInOrder: null};
        if((option === null || option === "")&&(inTokenInOrder[0] === null || inTokenInOrder[1] === null)) 
            return {status: "Dict:Get", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var key: string;
        if(option === null || option === "") 
            {key = inTokenInOrder[1].AsString()}
            else
            {key = Token.FromLiteral(option).val.AsString()};
        var dict: Token = inTokenInOrder[0];
        var val : Token = dict.Get(key);
        if (val === undefined || val === null) 
            return {status: 'Dict::GET value not found of  '+key, ret: ReturnCode.error, outputInOrder: null};
        return {status: "GET", ret: ReturnCode.ok, outputInOrder:[val, null, null, null]};
    };

    public static PICK(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if((option !== null && option !== "")&&(inTokenInOrder[0] === null)) 
            return {status: "Dict:PICK", ret: ReturnCode.needMoreToken, outputInOrder: null};
        if((option === null || option === "")&&(inTokenInOrder[0] === null || inTokenInOrder[1] === null)) 
            return {status: "Dict:PICK", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var key: string;
        if(option === null || option === "") 
            {key = inTokenInOrder[1].AsString()}
            else
            {key = Token.FromLiteral(option).val.AsString()};
        var dict: Token = inTokenInOrder[0];
        if ((<DictToken>dict).val[key] === undefined) 
            return {status: 'Dict::PICK value not found of  '+key, ret: ReturnCode.error, outputInOrder: null};
        delete (<DictToken>dict).val.key;
            return {status: "PICK", ret: ReturnCode.ok, outputInOrder:[inTokenInOrder[0], null, null, null]};
    };


    public static PUT(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if((option === null || option === "")&&(inTokenInOrder[0] == null || inTokenInOrder[1] === null || inTokenInOrder[2] === null))
            return {status : "PUT on Dict", ret: ReturnCode.needMoreToken, outputInOrder: null};
        if((option !== null && option !== "")&&(inTokenInOrder[0] === null || inTokenInOrder[1] === null))
            return {status : "PUT on Dict", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var dict: Token = inTokenInOrder[0];
        var key: string = null;
        var putval: Token = null;
        if(option !== null && option.length > 0) {
            key = Token.FromLiteral(option).val.AsString();
            putval = inTokenInOrder[1];
        } else {
            key = inTokenInOrder[1].AsString();
            putval = inTokenInOrder[2];
        }
        //Remove this entry when putval is VoidToken.
        if (putval.EQ(VoidToken.theVOID))
            putval = null;
        dict.Put(key, putval);
        return {status: "PUT", ret: ReturnCode.ok, outputInOrder:[dict, null, null, null]};
    };

    // この実装の辞書のコピーはディープコピーなので、やりすぎ、
    //　shallowコピーなら提示してもよいが
    public static DUPLICATEDICT(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string):{status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var org: Token = inTokenInOrder[0];
        var result: Token = <Token>JSON.parse(JSON.stringify(org, Token.JSONReplacer), Token.JSONReciver);
        return {status: "DUPLICATEDICT", ret: ReturnCode.ok, outputInOrder:[result, null, null, null]};
    };
    // ForAllかイテレータが必要。後者は、新規のクラスかもしれない

    public static RegisterSelf() : void {
        Token.InstallClass("Dictionary", DictToken.NewInstance, DictToken.FromLiteral, DictToken.JSONRcv, DictToken.JSONRpl);
       var initval: Token = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("T")]));
        DictToken.subrcoll["GET"] = SUBRToken.NewInstance(DictToken.GET);
        DictToken.subrcoll["PUT"] = SUBRToken.NewInstance(DictToken.PUT);
        DictToken.subrcoll["PICK"] = SUBRToken.NewInstance(DictToken.PICK);
        DictToken.subrcoll["DUP"] = SUBRToken.NewInstance(DictToken.DUPLICATEDICT);
        _SUBRDepo["Dictionary"]=DictToken.subrcoll;
        VPGLGlobalDataBase.Put("Dictionary",initval,false); 
    };
};

class AppToken extends DictToken {
    protected static subrcoll:SUBRToken[] = [];
    protected static classidstr: string = "App";

    protected classid: string;

    protected constructor() { super(); this.classid = AppToken.classidstr; this.val = {}; };

    public static NewInstance(val: any): Token {
        var tk: AppToken = new AppToken();
        tk.val = val;
        return tk;
    };

    public static FromLiteral(literal: string): {val: Token, rest:string} { return null; };

    public Clone() { return AppToken.NewInstance(this.val); };
    public ToJSStruct(): any {
        return {typeid: "App", val: this.val.ToJSStruct()};
    };

    protected static JSONRcv(key, value): any {return AppToken.NewInstance(value.val); };
    protected static JSONRpl(key, value): any {
        return {classid: "App", val: value.val}; };

    public static RegisterSelf(): void {
        Token.InstallClass("App", AppToken.NewInstance, AppToken.FromLiteral, AppToken.JSONRcv, AppToken.JSONRpl);
        var initval: Token = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("Dictionary")]));
        _SUBRDepo["App"]=AppToken.subrcoll;
        VPGLGlobalDataBase.Put("App",initval,false); 
    };
};

class ThreeDToken extends DictToken {
    protected static subrcoll:SUBRToken[] = [];
    protected static classidstr: string = "ThreeD";
    protected static the3D: ThreeDToken = new ThreeDToken();

    protected calssid: string;

    protected constructor() { super(); this.classid=ThreeDToken.classidstr; this.val = {}; };

    public static NewInstance(val: any): Token {return ThreeDToken.the3D; };

    public static FromLiteral(literal: string): {val: Token, rest: string} {
        var result: {val: string, rest:string} = Token.lex(literal);
        if(result.val === "ThreeD")
            return {val: ThreeDToken.the3D, rest: result.rest};
        else
            return null;
    };

    public Clone():Token { return ThreeDToken.the3D; };
    public ToJSStruct(): any { return {typeid: "3D"}; };

    protected static JSONRcv(key, value): any {return ThreeDToken.the3D; };
    protected static JSONRpl(key, value): string {return '{"typeid": "ThreeD"}'; };

    private static RESET(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        postMessage({cmd: 'Init3D'}, null);
        return {status: "3DINIT", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null, null]}
    };

    private static SCENE(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return{status: "3DSCENE", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var scenename : string = null;
        if (option !== null && option !== "")
            scenename = Token.FromLiteral(option).val.AsString();
        else if (inTokenInOrder[1] === null)
            return {status: "3DSCENE", ret: ReturnCode.needMoreToken, outputInOrder: null};
        else
            scenename = inTokenInOrder[1].AsString();
        if(scenename === null)
            return{status: "3DSCENE : invalid scene name type", ret: ReturnCode.error, outputInOrder: null};
        return {status: "3DSCENE", ret: ReturnCode.ok, outputInOrder: [Scene3DToken.NewInstance(scenename), null, null, null]};
    };

    private static GEO(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if((inTokenInOrder[1] === undefined || inTokenInOrder[1] === null) && option !== "") {
            inTokenInOrder[1] = Token.FromLiteral(option).val;
            if(inTokenInOrder[1] === null)
                return {status: "invalid option in 3DGETGEO : "+option, ret: ReturnCode.error, outputInOrder: null}; 
        }
        if(inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return{status: "3DGETGEO", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var tmp: Token = inTokenInOrder[1].Get("Scene");
        if(tmp === undefined || tmp === null)
            return {status: "3DGETGEO Scene not specified", ret: ReturnCode.error, outputInOrder: null};
        var scn: string = tmp.AsString();
        if(scn === undefined || scn === null || scn === "")
            return {status: "3DGETGEO invalid Scene value", ret: ReturnCode.error, outputInOrder: null};
        tmp = inTokenInOrder[1].Get("Geo");
        if(tmp === undefined || tmp === null)
            return {status: "3DGETGEO Geometry not specified", ret: ReturnCode.error, outputInOrder: null};
        var geo: string = tmp.AsString();
        if(geo === undefined || geo === null || geo === "")
            return {status: "3DGEGEO invalid Geometry value", ret: ReturnCode.error, outputInOrder: null};
        return {status: "3DGETGEO", ret: ReturnCode.ok, outputInOrder:[Geometry3DToken.NewInstance({sceneName: scn, geoName: geo}),null,null]};
    };

    private static SETSCENE(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return{status: "3DSETSCENE", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var scenename : string = null;
        if (option !== null && option !== "")
            scenename = Token.FromLiteral(option).val.AsString();
        else if (inTokenInOrder[1] === null)
            return {status: "3DSETSCENE", ret: ReturnCode.needMoreToken, outputInOrder: null};
        else
            scenename = inTokenInOrder[1].AsString();
        if(scenename === null)
            return{status: "3DSETSCENE : invalid scene name type", ret: ReturnCode.error, outputInOrder: null};
        postMessage({cmd: "3DSETSCENE", scn: scenename}, null);
        return {status: "3DSETSCENE", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null, null]};
    };

    // ATTACH   in0: 3DObject
    //          in1: object to be attached
    //          in2/option: {"scene": sceneName, "geo": geometryName "msg" : methodname "evt": eventname}
    // 
    //          out0: in0 - 3DObject
    //
    private static ATTACH(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return{status: "3DATTACH", ret: ReturnCode.needMoreToken, outputInOrder: null};
        if(inTokenInOrder[2] === null && option !== null && option !== '')
            inTokenInOrder[2] = Token.FromLiteral(option).val;
        if(inTokenInOrder[2] === null) 
            return{status: "3DATTACH", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var tmp: Token = inTokenInOrder[2].Get("Scene");
        if (tmp === undefined || tmp === null)
            return {status: "3D::ATTACH - Scene not found", ret: ReturnCode.error,outputInOrder: null};
        var scn: string = tmp.AsString();
        if (scn === undefined || scn === null)
            return {status: "3D::ATTACH - Invalid Secne", ret: ReturnCode.error, outputInOrder: null};
        tmp = inTokenInOrder[2].Get("Geo");
        if(tmp === undefined || tmp === null)
            return {status: "3D::ATTACH -Geo not found", ret: ReturnCode.error, outputInOrder:null};
        var geo: string = tmp.AsString();
        if(geo === undefined || geo === null)
            return {status: "3D::ATTACH - Invalid Geo", ret: ReturnCode.error, outputInOrder: null};
        tmp = inTokenInOrder[2].Get("msg");
        if(tmp === undefined || tmp === null)
            return {status: "3D::ATTACH - msg not found", ret: ReturnCode.error, outputInOrder: null};
        var msg : string = tmp.AsString();
        if(msg === undefined || msg === null)
            return {status: "3D::ATTACH - ivalid msg", ret: ReturnCode.error, outputInOrder: null};
        tmp = inTokenInOrder[2].Get("evt");
        if(tmp === undefined || tmp === null)
            return {status: "3D::ATTACH - evt not found", ret: ReturnCode.error, outputInOrder: null};
        var evt : string = tmp.AsString();
        if (evt === undefined || evt === null)
            return {status: "3D::ATTACH - invalid evt", ret: ReturnCode.error, outputInOrder: null};
        _CBTable.push({scn: scn, target: geo, opname: msg, event: evt, obj: inTokenInOrder[1], exmode: mode})

        return {status: "3D::ATTACH", ret: ReturnCode.ok, outputInOrder:[inTokenInOrder[0], null, null]};
    };

    private static UPDATE(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        postMessage({cmd: 'Update3D'}, null);
        return {status: "3DUPDATE", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null, null]};
    };

    private static TDGET(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "3DGET : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null]};
    };

    private static TDPUT(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "3DPUT : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null]};
    };

    private static TDDUPLICATE(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "3DDUP : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null]};
    };

    public static RegisterSelf() : void {
        Token.InstallClass("ThreeD", ThreeDToken.NewInstance, ThreeDToken.FromLiteral, ThreeDToken.JSONRcv, ThreeDToken.JSONRpl);
        var initval: Token = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("Dictionary")]));
        ThreeDToken.subrcoll["RESET"] = SUBRToken.NewInstance(ThreeDToken.RESET);
        ThreeDToken.subrcoll["SCENE"] = SUBRToken.NewInstance(ThreeDToken.SCENE);
        ThreeDToken.subrcoll["GEO"  ] = SUBRToken.NewInstance(ThreeDToken.GEO);
        ThreeDToken.subrcoll["SETSCN"] = SUBRToken.NewInstance(ThreeDToken.SETSCENE);
        ThreeDToken.subrcoll["UPDATE"] = SUBRToken.NewInstance(ThreeDToken.UPDATE);
        ThreeDToken.subrcoll["ATTACH"] = SUBRToken.NewInstance(ThreeDToken.ATTACH);
        ThreeDToken.subrcoll["GET"] = SUBRToken.NewInstance(ThreeDToken.TDGET);
        ThreeDToken.subrcoll["PUT"] = SUBRToken.NewInstance(ThreeDToken.TDPUT);
        ThreeDToken.subrcoll["DUP"] = SUBRToken.NewInstance(ThreeDToken.TDDUPLICATE);
        _SUBRDepo["ThreeD"]=ThreeDToken.subrcoll;
        VPGLGlobalDataBase.Put("ThreeD",initval,false);
    }
};

class Scene3DToken extends DictToken {
    protected static subrcoll:SUBRToken[] = [];
    protected static classidstr:string = "Scene3D";

    protected classid: string;

    private scenename: string;

    protected constructor() { super(); this.classid = Scene3DToken.classidstr; this.scenename = null; this.val = {}; };

    public static NewInstance(val: any) : Token {
        var tk : Scene3DToken = new Scene3DToken();
        tk.scenename = <string>val;
        return tk;
    };

    public static FromLiteral(literal: string) : {val: Token, rest: string} {return null;}; // < "Scene3D" { "scenename" "foo"}>

    public Clone():Token { return Scene3DToken.NewInstance(this.val); };
    public ToJSStruct(): any {return {typeid: "3DSCENE"}; };

    protected static JSONRcv(key, value): any { return Scene3DToken.NewInstance(value.val); };
    protected static JSONRpl(key, value): string { return '{"typeid": "Scene3D",val: '+JSON.stringify(value.val, Token.JSONReplacer)+'" }"';};

    private static GEO(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return{status: "3DSCENEGEO", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var geoname : string = null;
        if (option !== null && option !== "")
            geoname = Token.FromLiteral(option).val.AsString();
        else if (inTokenInOrder[1] === null)
            return {status: "3DSCENEGEO", ret: ReturnCode.needMoreToken, outputInOrder: null};
        else
            geoname = inTokenInOrder[1].AsString();
        if(geoname === null)
            return{status: "3DSCENEGEO : invalid scene name type", ret: ReturnCode.error, outputInOrder: null};
        var scenename: string = (<Scene3DToken>inTokenInOrder[0]).scenename;
        return {status: "3DSCENEGEO", ret: ReturnCode.ok, outputInOrder: [Geometry3DToken.NewInstance({sceneName: scenename, geoName: geoname}), null, null, null]};
    };

    private static SCNSETCAM(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === undefined || inTokenInOrder[0] === null)
            return {status: "3DSCNSETCAM", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var camname : string = null;
        if(option !== null && option !== "")
            camname = Token.FromLiteral(option).val.AsString();
        else if (inTokenInOrder[1] === undefined || inTokenInOrder[1] === null)
            return {status: "3DSCNSETCAM", ret: ReturnCode.needMoreToken, outputInOrder: null};
        else
            camname = inTokenInOrder[1].AsString();
        
        var scenename: string = (<Scene3DToken>inTokenInOrder[0]).scenename;
        if(camname === null)
            return {status: "3DSETCAM: malformed Camera", ret: ReturnCode.malformed, outputInOrder: null };
        
        postMessage({cmd: '3DSetCamera', scn: scenename, camname: camname}, null);
        return {status: "3DSETCAM", ret: ReturnCode.ok, outputInOrder: [inTokenInOrder[0], null, null, null]}
    };


    private static SCNGET(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "3DSCENEGET : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null]}
    };

    private static SCNPUT(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "3DSCENEPUT : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null]}
    };

    private static SCNDUPLICATE(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "3DSCENEDUP : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null]}
    };

    public static RegisterSelf(): void {
        Token.InstallClass("Scene3D", Scene3DToken.NewInstance, Scene3DToken.FromLiteral, Scene3DToken.JSONRcv, Scene3DToken.JSONRpl);
        var initval: Token = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("Dictionary")]));
        Scene3DToken.subrcoll["GEO"] = SUBRToken.NewInstance(Scene3DToken.GEO);
        Scene3DToken.subrcoll["CAM"] = SUBRToken.NewInstance(Scene3DToken.SCNSETCAM);
        Scene3DToken.subrcoll["GET"] = SUBRToken.NewInstance(Scene3DToken.SCNGET);
        Scene3DToken.subrcoll["PUT"] = SUBRToken.NewInstance(Scene3DToken.SCNPUT);
        Scene3DToken.subrcoll["DUP"] = SUBRToken.NewInstance(Scene3DToken.SCNDUPLICATE);
        _SUBRDepo["Scene3D"]=Scene3DToken.subrcoll;
        VPGLGlobalDataBase.Put("Scene3D",initval,false);
    }
};

class Geometry3DToken extends DictToken {
    protected static subrcoll: SUBRToken[] = [];
    protected static classidstr: string = "Geometry3D";

    protected classid: string;

    private sceneName: string;
    private geoName: string;

    protected constructor() { super(); this.classid = Geometry3DToken.classidstr; this.sceneName = null; this.geoName = null; this.val = {}; };

    public static NewInstance(val: any) : Token {
        var tk: Geometry3DToken = new Geometry3DToken();
        tk.sceneName = <string>val.sceneName;
        tk.geoName = <string>val.geoName;
        return tk;
    };

    public Clone(): Token { return Geometry3DToken.NewInstance(this.val); };

    public ToJSStruct(): any {return {typeid: "3DGEO"}; };

    private static GEOGET(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return {status: "3DGEOGET", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var eid : number = _NewEventId();
        cxt.status = Status.blocked;
        _suspendedContext[eid] = cxt;
        var me: Geometry3DToken = <Geometry3DToken>inTokenInOrder[0];
        postMessage({cmd: "GEO3DGET", scn: me.sceneName, geo: me.geoName, eid: eid, exmode: mode}, null);
        return {status: "GET on Geometry3D", ret: ReturnCode.blocking, outputInOrder:[NumberToken.NewInstance(eid), null, null]};
    };
    
    private static GEOPUT(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "3DGEOPUT : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null]}
    };

    private static GEODUPLICATE(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "3DGEODUP : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null]}
    };

    public static SET(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null)
            return {status: "GEO3DSET", ret: ReturnCode.needMoreToken, outputInOrder: null}
        var toBeSubmittedToken : Token = null;
        if (option !== null && option !== "")
                toBeSubmittedToken = Token.FromLiteral(option).val;
        else if (inTokenInOrder[1] === null)
            return {status: "3DGEOSET", ret: ReturnCode.needMoreToken, outputInOrder: null};
        else
            toBeSubmittedToken = inTokenInOrder[1];
        if(toBeSubmittedToken === undefined || toBeSubmittedToken === null)
            return{status: "3DGEOSET : invalid scene name type", ret: ReturnCode.error, outputInOrder: null};
    
        var toBeSubmitted = toBeSubmittedToken.ToJSStruct();
        if (toBeSubmitted === undefined || toBeSubmitted === null)
            return {status: "3DGEOSET : invalid setting value", ret: ReturnCode.error, outputInOrder: null};

        var eid: number = _NewEventId();
        cxt.status = Status.blocked;
        _suspendedContext[eid] = cxt;

        var me: Geometry3DToken = <Geometry3DToken>inTokenInOrder[0];
        postMessage({cmd: "GEO3DSET", scn: me.sceneName, geo: me.geoName, tobeset: toBeSubmitted, eid:eid, exmode: mode}, null);
        return {status: "SET on Geometry3D", ret: ReturnCode.blocking, outputInOrder: [NumberToken.NewInstance(eid), null, null]};
    };

    private static GEOLOOK(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return {status: "GEOLOOK", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var atx : number = inTokenInOrder[1].Get(0).AsNumber();
        var aty : number = inTokenInOrder[1].Get(1).AsNumber();
        var atz : number = inTokenInOrder[1].Get(2).AsNumber();
        if( atx === null || aty === null || atz === null)
            return {status: "GEOLOOK - INVALID ARG", ret:ReturnCode.error, outputInOrder: null};

        var eid: number = _NewEventId();
        cxt.status = Status.blocked;
        _suspendedContext[eid] = cxt;
    
        var me: Geometry3DToken = <Geometry3DToken>inTokenInOrder[0];
        postMessage({cmd: "GEO3DLOOK", scn: me.sceneName, geo:me.geoName, x: atx, y: aty, z: atz, eid:eid, exmode: mode}, null);
        return {status: "LOOK at GEO3D", ret: ReturnCode.blocking, outputInOrder: [NumberToken.NewInstance(eid), null, null]};
    };

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

    private static ATTACH(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        if(inTokenInOrder[0] === null || inTokenInOrder[1] === null)
            return{status: "GEO::ATTACH", ret: ReturnCode.needMoreToken, outputInOrder: null};
        var geo: Geometry3DToken = <Geometry3DToken>inTokenInOrder[0];
        if (inTokenInOrder[2] === null && option !== null && option !== '')
            inTokenInOrder[2] = Token.FromLiteral(option).val;
        if (inTokenInOrder[2] === undefined || inTokenInOrder[2] === null)
            return {status: "GEO::ATTACH", ret: ReturnCode.needMoreToken, outputInOrder: null};

        var tmp: Token = inTokenInOrder[2].Get("msg");
        if(tmp === undefined || tmp === null)
            return {status: "GEO::ATTACH - msg not found", ret:ReturnCode.error, outputInOrder: null};
        var msg: string = tmp.AsString();
        if(msg === undefined || msg === null)
            return {status: "GEO::ATTACH - invalid msg", ret: ReturnCode.error, outputInOrder: null};

        tmp = inTokenInOrder[2].Get("evt");
        if(tmp === undefined || tmp === null)
            return {status: "GEO::ATTACH - evt not found", ret: ReturnCode.error, outputInOrder: null};
        var evt: string = tmp.AsString();
        if(evt === undefined || evt === null)
            return {status: "GEO:ATTACH - invlid msg", ret: ReturnCode.error, outputInOrder: null};

        _CBTable.push({scn: geo.sceneName, target: geo.geoName, opname: msg, event: evt, obj: inTokenInOrder[1], exmode: mode})

        return {status: "3DGeo::ATTACH", ret: ReturnCode.ok, outputInOrder:[inTokenInOrder[0], null, null]};
    };
    
    public static RegisterSelf(): void {
        Token.InstallClass("Geometry3D", Geometry3DToken.NewInstance, Geometry3DToken.FromLiteral, Geometry3DToken.JSONRcv, Geometry3DToken.JSONRpl);
        var initval: Token = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("Dictionary")]));
        Geometry3DToken.subrcoll["SET"] = SUBRToken.NewInstance(Geometry3DToken.SET);
        Geometry3DToken.subrcoll["LOOK"] = SUBRToken.NewInstance(Geometry3DToken.GEOLOOK);
        Geometry3DToken.subrcoll["ATTACH"] = SUBRToken.NewInstance(Geometry3DToken.ATTACH);
        Geometry3DToken.subrcoll["GET"] = SUBRToken.NewInstance(Geometry3DToken.GEOGET);
        //Geometry3DToken.subrcoll["PUT"] = SUBRToken.NewInstance(Geometry3DToken.GEOPUT);
        //Geometry3DToken.subrcoll["DUP"] = SUBRToken.NewInstance(Geometry3DToken.GEODUPLICATE);
        _SUBRDepo["Geometry3D"]=Geometry3DToken.subrcoll;
        VPGLGlobalDataBase.Put("Geometry3D",initval,false);
    }
};

class GridToken extends DictToken {
    protected static subrcoll: SUBRToken[] = [];
    protected static classidstr: string = "Grid";

    protected classid: string;

    protected constructor() { super(); this.classid = GridToken.classidstr; this.val = null; this.val={}; };

    public static NewInstance(val: any) : Token {
        var tk: GridToken = new GridToken();
        if(val.val !== undefined)
            tk.val = <Token[]>(val.val);
        else 
            tk.val = val;
        return tk;
    };

    public static FromLiteral(literal: string): {val: Token, rest: string} {return null; };

    public Clone(): Token { return GridToken.NewInstance(this.val); };

    public ToJSStruct(): any { return {typeid: "Grid"}; };

    protected static JSONRcv(key, value): any { return GridToken.NewInstance(value.val); };
    protected static JSONRpl(key, value): any { return {classid: "Grid", val: value.val}; };

    public static MakeWaitingQueue(grid: Token, cxt: VPGLContext, inTokenInOrder: Token[]) 
    : {status: string, ret: ReturnCode, outputInOrder: Token[]}
    {
        var method : Token = grid;
        var incondStr: string = method.Get("indir").AsString();
        var gridSize: number = method.Get("size").AsNumber();
        var center: number = Math.floor(gridSize/2);
        var pos: {x: number, y: number}[] = [{x:center, y:0}, {x:0, y:center}, {x:gridSize-1, y: center}, {x: center, y: gridSize-1}];
        for (var i:number = 0; i<incondStr.length; i++) {
            var edge : DirectionW = "TLRB".indexOf(incondStr[i]);
            var edgePosition: string = "ABCDEFG".charAt(pos[edge].x)+"1234567".charAt(pos[edge].y);
            var tile: Token = method.Get(edgePosition);
            var childWqe : WaitingQeueuEntry = new WaitingQeueuEntry();
            var childContext: VPGLContext = new VPGLContext(childWqe, _NewEventId());
            var tmp: Token;
            childContext.classname = null;
            for (var ii: number = 0; ii<inTokenInOrder.length; ii++) {
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
            var counterInNumber: number = childContext.incond.indexOf("TLRB"[edge]);
            childContext.arrivedTokensInOrder[counterInNumber]=inTokenInOrder[i];
            childContext.status = Status.canbetry;
            childWqe.child = childContext;
            childWqe.parent = cxt;
            childContext.depthlevel = childWqe.parent.depthlevel+1;
            cxt.PutWaitingQueue(childWqe);
        };
        cxt.gridobj = grid;
        return {status: "Grid installs its new context", ret: ReturnCode.canDoMore, outputInOrder: null};
    };

    public static CanFire(inCond: string, ifAll: boolean, inTokenInOrder: Token[]) : boolean {
        var effectiveTokenCount: number = 0;
        if (inCond === null) return false;
        for(var i: number=0; i<inCond.length; i++)
            if(inTokenInOrder[i]!==null) effectiveTokenCount++;
        if (ifAll)
            return (effectiveTokenCount >= inCond.length);
        else
            return (effectiveTokenCount >= 1);
    };

    public EvalStep(mode: ExecOption, cxt: VPGLContext, opname: string, option: string, inTokenInOrder: Token[]) 
    : {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var tmp: Token;
        var gridop: string = this.Get("opname").AsString();
        if (gridop !== opname)
            // return this.superClasses[0].EvalStep(mode, self, cxt, opname, option, inTokenInOrder);
            return {status: "Grid:EvalStep() - SuperClass case is not implemented", ret: ReturnCode.notImplementedCase, outputInOrder: null};; 
        var incond: string = this.Get("indir").AsString(); 
        var ifall: boolean = this.Get("ifall").AsBool();
        if (!GridToken.CanFire(incond, ifall, inTokenInOrder))
            return {status: "Input1-3 not satisfied", ret: ReturnCode.needMoreToken, outputInOrder: null};
        if(cxt.gridobj === null) {
            return GridToken.MakeWaitingQueue(this, cxt, inTokenInOrder);
            };
        return {status: "Grid:EvalStep() - already Expanded", ret: ReturnCode.notImplementedCase, outputInOrder: null};
    };

    private static GRIDGET(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "GRIDGET : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null]}
    };

    private static GRIDPUT(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "GRIDPUT : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null]}
    };

    private static GRIDDUPLICATE(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "GRIDDUP : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null]}
    };

    public static RegisterSelf() : void {
        Token.InstallClass("Grid", GridToken.NewInstance, GridToken.FromLiteral, GridToken.JSONRcv, GridToken.JSONRpl);
        var initval: Token = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("Dictionary")]));
        GridToken.subrcoll["GET"] = SUBRToken.NewInstance(GridToken.GRIDGET);
        GridToken.subrcoll["PUT"] = SUBRToken.NewInstance(GridToken.GRIDPUT);
        GridToken.subrcoll["DUP"] = SUBRToken.NewInstance(GridToken.GRIDDUPLICATE);
        _SUBRDepo["Grid"]=GridToken.subrcoll;
        VPGLGlobalDataBase.Put("Grid",initval,false);    
    };
}; // GridClass

class SUBRToken extends TToken {
    protected static subrcoll: SUBRToken[] = [];
    protected static classidstr: string = "SUBR";

    protected classid: string;
    private proc: SubrProc;

    protected constructor() { super(); this.classid = SUBRToken.classidstr; this.proc = null; };
    public static NewInstance(val: any): Token {
        var tk : SUBRToken = new SUBRToken();
        tk.proc = <SubrProc>val;
        return tk;
    };

    public static FromLiteral(literal: string) : {val: Token, rest: string} { return null; };
    protected static JSONRcv(key, value): any { return null; };
    protected static JSONRpl(key, value): string { return null; };

    public Clone(): Token { return this; };
    public ToJSStruct(): any {return {typeid: "SUBR" }; };

    public Subr():SubrProc {return this.proc};

    public EvalStep(mode: ExecOption, cxt: VPGLContext, opname: string, option: string, inTokenInOrder: Token[]) 
    : {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return this.proc(mode, cxt, inTokenInOrder, option);
    };

    public static RegisterSelf() : void {
        Token.InstallClass("SUBR", SUBRToken.NewInstance, SUBRToken.FromLiteral, SUBRToken.JSONRcv, SUBRToken.JSONRpl);
        var initval: Token = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("T")]));
        _SUBRDepo["SUBR"]=SUBRToken.subrcoll;
        VPGLGlobalDataBase.Put("SUBR",initval, false);
    };    
};

class TileToken extends DictToken {
    protected static subrcoll: SUBRToken[] = [];
    protected static classidstr: string = "Tile";

    protected classid: string;

    protected constructor() { super(); this.classid = TileToken.classidstr; this.val = null; this.val={}; };

    public static NewInstance(val: any) : Token {
        var tk: TileToken = new TileToken();
        if(val.classid !== undefined)
            tk.val = <Token[]><unknown>val.val;
        else
            tk.val = val;
        return tk;
    };

    public static FromLiteral(literal: string): {val: Token, rest: string} {return null; };

    public Clone(){ return TileToken.NewInstance(this.val);};

    public ToJSStruct():any { return {typeid: "Tile"}; };

    protected static JSONRcv(key, value): any { return TileToken.NewInstance(value.val); };
    protected static JSONRpl(key, value): any { return {classid: "Tile", val: value.val };};

    public static EvalStep(mode: ExecOption, self: Token, cxt: VPGLContext, opname: string, option: string, inTokenInOrder: Token[]) 
    : {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var tmp: Token;
        var target: Token = inTokenInOrder[0];

        if(target !== null) {
            var exeTk: Token = target.Where(opname);
            if (exeTk === null || exeTk === undefined)
                if(cxt.parent.parent !== undefined && cxt.parent.parent !== null)
                    return {status: "NoSuchOp : "+opname+" for "+cxt.classname+" at: "+cxt.position+" of "+cxt.parent.parent.classname+"::"+cxt.parent.parent.opname, ret: ReturnCode.noSuchOp, outputInOrder: null };
                else
                    return {status: "NoSuchOp : "+opname, ret: ReturnCode.noSuchOp, outputInOrder: null};
            return exeTk.EvalStep(mode, cxt, opname, option, inTokenInOrder);
        };
        for(var i:number=0; i<inTokenInOrder.length; i++)
            if((target=inTokenInOrder[i])!==null) break;
        if (target!==null) { // try whether opname is ifall===false;
            var exeTk: Token = target.Where(opname);
            if (exeTk === undefined || exeTk === null) 
                return {status: "input0 is not arrived.", ret: ReturnCode.needMoreToken, outputInOrder: null};
            var result: {status: string, ret: ReturnCode, outputInOrder: Token[]} = 
                exeTk.EvalStep(mode, cxt, opname, option, inTokenInOrder);
            if (result.ret === ReturnCode.ok || result.ret === ReturnCode.canDoMore || result.ret === ReturnCode.stepStop)
                return result;
            else 
                return {status: "Need more tokens", ret: ReturnCode.needMoreToken, outputInOrder: null};
        } else
            return {status: "input0 is not arrived.", ret: ReturnCode.needMoreToken, outputInOrder: null};
    };

    private static TILEGET(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "TILEGET : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null]}
    };

    private static TILEPUT(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "TILEPUT : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null]}
    };

    private static TILEDUPLICATE(mode: ExecOption, cxt:VPGLContext, inTokenInOrder: Token[], option: string): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        return {status: "TILEDUP : NOT IMPLEMENTED NOW.", ret: ReturnCode.error, outputInOrder: [null, null, null]}
    };

    public static RegisterSelf() : void {
        Token.InstallClass("Tile", TileToken.NewInstance, TileToken.FromLiteral, TileToken.JSONRcv, TileToken.JSONRpl);
        var initval: Token = DictToken.NewInstance({});
        initval.Put(SuperClassesKey, ArrayToken.NewInstance([StringToken.NewInstance("Dictionary")]));
        TileToken.subrcoll["GET"] = SUBRToken.NewInstance(TileToken.TILEGET);
        TileToken.subrcoll["PUT"] = SUBRToken.NewInstance(TileToken.TILEPUT);
        TileToken.subrcoll["DUP"] = SUBRToken.NewInstance(TileToken.TILEDUPLICATE);
        _SUBRDepo["Tile"]=TileToken.subrcoll;
        VPGLGlobalDataBase.Put("Tile",initval, false);    
    };
}; // TileClass

class UserDefinedClassToken extends Token {
    protected static subrcoll:SUBRToken[] = [];
    protected static classidstr: string = "UserDefined";

    protected classid: string;
    public typeid: string;
    protected val: Token;

    public constructor(){ super(); this.classid=UserDefinedClassToken.classidstr, this.val=null};
    public static NewInstance(val:any): Token {
        var tk: UserDefinedClassToken = new UserDefinedClassToken();
        tk.typeid = val.typeid;
        tk.val = val.val;
        return tk;
    }

    protected static JSONRcv(key, value): any {return UserDefinedClassToken.NewInstance(value.val); };
    protected static JSONRpl(key, value): string {return '{"typeid": "'+value.typeid+'", "val" : '+JSON.stringify(value.val, Token.JSONReplacer)+'}'; };

    public static FromLiteral(literal: string) : {val: Token, rest: string} {
        var tmp : {val: Token, rest: string} = null;
        literal = literal.trim();
        if (literal.charAt(0) !== '<') return null;
        literal = literal.slice(1);
        if((tmp = StringToken.FromLiteral(literal)) === null || tmp === undefined) return null;
        var clsname: string = tmp.val.AsString();
        if (VPGLGlobalDataBase.Get(clsname) === undefined) return null;
        var val : Token = null;
        literal = tmp.rest.trim();
        if (literal.charAt(0) === '>')
            return {val: UserDefinedClassToken.NewInstance({typeid: clsname, val: null}), rest: literal.slice(1)};
        if((tmp = Token.FromLiteral(literal)) === null || tmp === undefined) return null;
        val = tmp.val; literal = tmp.rest.trim();
        if(literal.charAt(0) === '>')
            return {val: UserDefinedClassToken.NewInstance({typeid: clsname, val: val}), rest: literal.slice(1)};
        return null;
    };

    public Clone():Token {return UserDefinedClassToken.NewInstance({typeid: this.typeid, val: this.val.Clone()});};

    public ToJSStruct(): any {return {typeid: this.typeid, val: this.val.ToJSStruct()}; };

    protected SearchSC(cls: string, key: string):Token {
        var result: Token = null;
        if(cls === UserDefinedClassToken.classidstr) cls = this.typeid;
        var clsdef: Token = VPGLGlobalDataBase.Get(cls);
        if (clsdef === undefined || clsdef === null) return null;
        var sclist:Token = clsdef.Get(SuperClassesKey);
        var self: UserDefinedClassToken = this;
        sclist.ForAll(function(xkey: string, val: Token): boolean{
            var clsname: string = val.AsString();
            if (clsname === undefined || clsname === null) return false;
            var cld: Token = VPGLGlobalDataBase.Get(clsname);
            if (cld !== undefined && cld !== null){ 
                result = cld.Get(key);
                if (result !== undefined && result !== null) return true;
            }
            if (_SUBRDepo[clsname] !== undefined && _SUBRDepo[clsname] !== null){
                 result = _SUBRDepo[clsname][key];
                if (result !== undefined && result !== null) return true;
            }
            result =  self.SearchSC(clsname, key);
            if (result !== undefined && result !== null) return true;
            return false;
        });
        return result;
    };

    public Where(key:string): Token {
        var result: Token = this.Get(key);
        if(result!==undefined && result !== null) return result;
        var clsdef: Token = VPGLGlobalDataBase.Get(this.typeid);
        if(clsdef!==undefined && clsdef !== null) {
            result = clsdef.Get(key);
            if (result !== undefined && result !== null) return result;
        };
        return super.Where(key);
    };

    public AsString(): string {
        return '< '+this.typeid+' '+ ((this.val===null)?"":this.val.AsString()) +' >';
    };

    public static RegisterSelf() : void {
        Token.InstallClass("UserDefinedToken", UserDefinedClassToken.NewInstance, UserDefinedClassToken.FromLiteral, UserDefinedClassToken.JSONRcv, UserDefinedClassToken.JSONRpl);
    };
};

class WaitingQeueuEntry {
    public parent: VPGLContext = null;
    public child: VPGLContext = null;

    public GetStatus(): Status {return this.child.status;}

    private GetNextPosition(pos: string, dir: DirectionW): string {
        if (dir < 0) {
            postMessage({cmd: 'ERRROR', msg:"in-out mismatch Check:"+this.parent.opname+" : "+pos}, null);
            return null;
        };
        var offsets:{x:number, y:number}[/* DirectionW */] = [{x:0, y:-1}, {x:-1, y:0}, {x:1, y:0}, {x:0, y:1}];
        var nextX: string = "WABCDEFGX".charAt("ABCDEFG".indexOf(pos[0])+1+offsets[dir].x);
        var nextY: string = "Y1234567Z".charAt("1234567".indexOf(pos[1])+1+offsets[dir].y);
        return nextX+nextY;
    };

    private IsOutOfBounds(pos: string, gSize: number): DirectionW {
        var x: number = "WABCDEFGX".indexOf(pos[0])-1;
        var y: number = "Y1234567Z".indexOf(pos[1])-1;
        if(x<0) return DirectionW.left;
        if(x>=gSize) return DirectionW.right;
        if(y<0) return DirectionW.top;
        if(y>=gSize) return DirectionW.bottom;
        return DirectionW.void;
    };

    private DeliverOut(outputs: Token[]): void {
        var somethingDelivered: boolean = false;
        if(outputs === null || outputs === undefined) return;
        for(var i:number=0; i<outputs.length; i++) {
            if(outputs[i] === null) continue;
            var tmp: Token;
            var dir: DirectionW = "TLRB".indexOf(this.child.outdir[i]);
            var obDir: DirectionW;
            var nextPosition:string = this.GetNextPosition(this.child.position,dir);
            if (nextPosition === null) return;
            if (this.parent === null) return;
            if ((obDir = this.IsOutOfBounds(nextPosition, this.parent.gridobj.Get("size").AsNumber()))
                     === DirectionW.void) { // in bounds case
                var newContext: VPGLContext = this.parent.GetContext(nextPosition);
                if (newContext === null) {
                    newContext = new VPGLContext(this, _NewEventId());
                    var wqe: WaitingQeueuEntry = new WaitingQeueuEntry();
                    wqe.child = newContext;
                    wqe.parent = this.parent;
                    newContext.parent = wqe;
                    newContext.depthlevel = wqe.parent.depthlevel+1;
                    this.parent.PutWaitingQueue(wqe);
                    };

                newContext.position = nextPosition;
   
                tmp = this.parent.gridobj;
                newContext.targetTile = tmp.Get(nextPosition);
                if(newContext.targetTile === undefined || newContext === null) {
                    postMessage({cmd: "ERROR", message: "No Tile at "+ nextPosition +" of "+tmp.Get("opname").AsString()+" in "+ this.parent.classname}, null);
                    return;
                }
                if (newContext.classname === null) {
                    newContext.classname = outputs[i].ClassId();
                };
                newContext.opname = newContext.targetTile.Get("opname").AsString();
                newContext.option = newContext.targetTile.Get("option").AsString();
                newContext.incond = newContext.targetTile.Get("indir").AsString();
                newContext.outdir = newContext.targetTile.Get("outdir").AsString();
                newContext.status = Status.canbetry;

                var dstInput: number = newContext.incond.indexOf("BRLT".charAt(dir));
                newContext.arrivedTokensInOrder[dstInput] = outputs[i];
                if (this.child.activeChild === null && this.child.waitingQueue.length <=0 ){
                    var wqe: WaitingQeueuEntry = this;
                    while(wqe !== undefined && wqe !== null && wqe.child !== null && wqe.child.activeChild === null && wqe.child.waitingQueue.length <=0 ) {
                        _DeleteFromActiveContext(wqe.child);
                        if(wqe.parent !== undefined && wqe.parent !== null) {
                            wqe.parent.activeChild = null;
                            wqe = wqe.parent.parent;
                        } else
                            break;
                    };
                }
            } else { // getting out from this Grid with DirectionW:obDir
                var contextToReturn: WaitingQeueuEntry = this.parent.parent;
                var position: string = this.GetNextPosition(this.parent.position, obDir);
                tmp = this.parent.gridobj;
                var godir : string = tmp.Get("outdir").AsString();
                //var ifall : boolean = (tmp2 = tmp.Attributes().Search("IFALL")).AsBool(tmp2).val;
                this.parent.toBeEmittedInOrder[godir.indexOf("TLRB"[obDir])] = outputs[i];
                //if (!ifall || (this.parent.activeChild == null && this.parent.waitingQueue.length === 0))
                this.parent.parent.DeliverOut(this.parent.toBeEmittedInOrder);
                for(var k: number=0; k<4; k++) this.parent.toBeEmittedInOrder[k]=null;
            };
            somethingDelivered = true;
        };
        // The case on the child context emits no token.
        if(!somethingDelivered) {
            var wqe: WaitingQeueuEntry = this;
            while(wqe !== undefined &&wqe !== null && wqe.child !== null && wqe.child.activeChild === null && wqe.child.waitingQueue.length<=0) {
                _DeleteFromActiveContext(wqe.child);
                if(wqe.parent !== undefined && wqe.parent !== null) { 
                    wqe.parent.activeChild = null;
                    wqe = wqe.parent.parent;
                } else
                    break;
            }
        };
    };

    public ExecOne(mode: ExecOption): {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var childContext : VPGLContext = this.child;
        if (childContext !== null) {
            if (this.GetStatus() === Status.resumeFromWaiting) {
                this.DeliverOut(childContext.toBeEmittedInOrder);
                return {status: "Resuming from Waiting", ret: ReturnCode.ok, outputInOrder: [null, null, null]};
            };
            var result: {status: string, ret: ReturnCode, outputInOrder: Token[]} = childContext.OneStep(mode);

            if (result.ret === ReturnCode.ok || result.ret === ReturnCode.stepStop) {
                this.DeliverOut(result.outputInOrder);
                result.status = "Deiver outputs";
                return result;
            };
            return result;
        } else
            return {status: "WQE:ExecOne() - no child", ret: ReturnCode.malformed, outputInOrder: null};
    };

}; // class WaitingQueueEntry

class VPGLContext {
    public identifier : number = -1;
    public depthlevel : number = -1;
    public parent: WaitingQeueuEntry = null;
    public activeChild : WaitingQeueuEntry = null;
    public waitingQueue: WaitingQeueuEntry[] = null;
    public arrivedTokensInOrder: Token[] = [null, null, null, null];
    public toBeEmittedInOrder: Token[] = [null, null, null];
    public gridobj: Token = null;
    public targetTile: Token = null;
    public position: string = null;
    public incond: string = null;
    public outdir: string = null;
    public opname: string = null;
    public classname: string = null;
    public option: string = null;
    public status: Status;

    private ConvertToOrder2(inputsInDirection: Token[], incondstr: string): Token[] {
        if(inputsInDirection === null) return null;
        if (incondstr !== null) {
          var resultInOrder: Token[] = [null, null, null, null];
          for (var i: number = 0; i<incondstr.length; i++) {
            resultInOrder[i] = inputsInDirection["TRLB".indexOf(incondstr.charAt(i))];
            };
            return resultInOrder; 
        };
        return null;
    }

    public constructor(parent: WaitingQeueuEntry, identifier: number) {
        this.identifier = identifier;
        this.parent = parent;
        this.waitingQueue = [];
        _activeContexts.push(this);
    };

    public PutWaitingQueue(wqe: WaitingQeueuEntry): void {
        this.waitingQueue = [wqe].concat(this.waitingQueue);
    };

    public GetContext(pos: string): VPGLContext {
        for (var i: number = 0; i<this.waitingQueue.length; i++)
            if(this.waitingQueue[i].child.position === pos)
                return this.waitingQueue[i].child;
        return null;
    };

    public Install(target: Token, opname: string, option: string, inputsInDirection: Token[]): void {
        var inputsInOrder: Token[] = this.ConvertToOrder2(inputsInDirection, "TLRB");
        this.arrivedTokensInOrder = inputsInOrder;

        this.position = null;
        this.opname = opname;
        this.classname = target.ClassId();
        this.option = option;
        this.status = Status.canbetry;
        var methodDefinition: Token = null;
        if( target.ClassId() === 'UserDefined')
            methodDefinition = VPGLGlobalDataBase.Get((<UserDefinedClassToken>target).typeid).Get(opname);
        else
            methodDefinition = VPGLGlobalDataBase.Get(target.ClassId()).Get(opname);
        if (methodDefinition === undefined || methodDefinition === null) {
            postMessage({cmd: "ERROR", msg: "Nosuch CallBack Proc : "+ opname}, null)
            return; // error
        };
        GridToken.MakeWaitingQueue(methodDefinition, this, inputsInDirection);
    };

    private CanFire():boolean {
        var ifall: boolean = true;
        if (this.opname === "FLOW")
            ifall=false;
        return GridToken.CanFire(this.incond, ifall, this.arrivedTokensInOrder);
    }

    public TraceSearch(): WaitingQeueuEntry {
        var result : WaitingQeueuEntry = null;
        if (this.activeChild !== null) {
            result = this.activeChild.child.TraceSearch();
            if (result !== null) 
                return result;
        };

        if (this.waitingQueue !== null && this.waitingQueue.length > 0) {
            for(var i:number =0; i<this.waitingQueue.length; i++) {
                var wqe: WaitingQeueuEntry = this.waitingQueue[i];
                var wqeStatus : Status = wqe.GetStatus();
                    if (wqeStatus === Status.canbetry || wqeStatus === Status.resumeFromWaiting) {
                        if(wqe.child.CanFire())
                            return wqe;
                    };
                };
            };
        return null;
    };

    private TraceSearch2(className: string, methodName: string, posstr: string) : WaitingQeueuEntry {
        var opname: string = null;
        var tmp, tmp2, tmp3, tmp4: Token;
        if ((tmp = VPGLGlobalDataBase.Get(className)) !== undefined && tmp !== null
            && (tmp2 = tmp.Get(methodName)) !== undefined && tmp2 !== null 
            && (tmp3 = tmp2.Get(posstr)) !== undefined && tmp3 !== null
            && (tmp4 = tmp3.Get("opname")) !== undefined && tmp4 !== null)
            opname = tmp4.AsString();
        if (opname !== null)
            return this.TraceSearch3(opname, posstr);
        else
            return null
    };
    private TraceSearch3(opname: string, posstr: string): WaitingQeueuEntry {
        var result : WaitingQeueuEntry = null;
        if (this.activeChild !== null) {
            result = this.activeChild.child.TraceSearch3(opname, posstr);
            if (result !== null) 
                return result;
        };
        
        if (this.waitingQueue !== null && this.waitingQueue.length > 0) {
            for(var i:number =0; i<this.waitingQueue.length; i++) {
                var wqe: WaitingQeueuEntry = this.waitingQueue[i];
                if (wqe.child.opname === opname && wqe.child.position === posstr)
                        return wqe;
            };
        };
        return null;
    }

    private FindOne() : WaitingQeueuEntry {
        var result : WaitingQeueuEntry = null;
        if (this.activeChild !== null) {
            result = this.activeChild.child.FindOne();
            if (result !== null) 
                return result;
        };
        
        if (this.waitingQueue !== null && this.waitingQueue.length > 0) {
            for(var i:number =0; i<this.waitingQueue.length; i++) {
                var wqe: WaitingQeueuEntry = this.waitingQueue[i];
                var wqeStatus : Status = wqe.GetStatus();
                    if (wqeStatus === Status.canbetry || wqeStatus === Status.resumeFromWaiting) {
                        this.waitingQueue.splice(i, 1);
                        return wqe;
                    };
                };
            };
        return null;
    };

    private GetBlocked() : WaitingQeueuEntry {
        var result : WaitingQeueuEntry =null;
        if( this.activeChild !== null) {
            result = this.activeChild.child.GetBlocked();
            if (result !== null) return result;
        };

        if (this.waitingQueue !== null && this.waitingQueue.length>0) {
            for (var i: number =0; i<this.waitingQueue.length; i++) {
                var wqe: WaitingQeueuEntry = this.waitingQueue[i];
                if (wqe.GetStatus() === Status.blocked)
                    return wqe;
            }
        };
        return null;
    }

    public OneStep(mode: ExecOption) : {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var wqe: WaitingQeueuEntry;
        var result: {status: string, ret: ReturnCode, outputInOrder: Token[]};
        if (this.status === Status.resumeFromWaiting)
            return this.parent.parent.OneStep(mode);
        if (this.gridobj === null)
            return TileToken.EvalStep(mode, this.targetTile, this, this.opname, this.option, this.arrivedTokensInOrder);
        if ((wqe = this.FindOne()) !== null) {
            if (_wkdebugging) {
                var bptk: Token = null;
                var bp: number = -1;
                if (wqe.child.targetTile !== undefined && wqe.child.targetTile !== null && (bptk = wqe.child.targetTile.Get(BreakPointKey)) !== undefined && bptk !== null
                    && (bp=bptk.AsNumber()) !== undefined && bp !== null
                    && bp !== BreakPointState.off && bp !== BreakPointState.absent) {
                        if (bp === BreakPointState.hit) {
                                wqe.child.targetTile.Put(BreakPointKey, NumberToken.NewInstance(BreakPointState.on));
                        } else {
                            if(GridToken.CanFire(wqe.child.incond,(wqe.child.opname!=="FLOW"),wqe.child.arrivedTokensInOrder)) {
                            wqe.parent.PutWaitingQueue(wqe);
                            wqe.child.targetTile.Put(BreakPointKey, NumberToken.NewInstance(BreakPointState.hit));
                            var clsname : string = wqe.parent.classname;
                            if(clsname === 'UserDefined') clsname = (<UserDefinedClassToken>wqe.parent.arrivedTokensInOrder[0]).typeid;
                            _ForceUiRedraw(clsname, wqe.parent.opname, wqe.child);
                            return {status : "Stop with Break", ret: ReturnCode.breakStop, outputInOrder: null};
                            }
                        }
                    }
            }
            result = wqe.ExecOne(mode);
            if (result.ret === ReturnCode.error || result.ret === ReturnCode.noSuchOp) {
                var opname: string = (wqe.parent !== null)?wqe.parent.opname:"---";
                result.status += "At: "+wqe.child.position+ " of "+wqe.child.classname+"::"+opname; 
            };
            if (result.ret === ReturnCode.blocking) {
                if(_wkdebugging) {
                    var bptk: Token = wqe.child.targetTile.Get(BreakPointKey);
                    var bp: number = BreakPointState.absent;
                    if(bptk !== undefined && bptk !== null)
                        bp = bptk.AsNumber();
                    var bpst: BreakPointState = (bp!==null)?bp:BreakPointState.off;
                    if(bpst===BreakPointState.on)
                       wqe.child.targetTile.Put(BreakPointKey, NumberToken.NewInstance(BreakPointState.hit));
                }
                if(wqe.child.status !== Status.resumeFromWaiting) 
                    wqe.parent.PutWaitingQueue(wqe);
            } else if (result.ret === ReturnCode.needMoreToken) {
                wqe.child.status = Status.waiting;
                wqe.parent.PutWaitingQueue(wqe);
                result = {status: "need more token in this context, put back", ret: ReturnCode.ok, outputInOrder: [null, null, null, null]};
            } else if (result.ret === ReturnCode.canDoMore) {
                wqe.child.status = Status.canbetry;
                wqe.parent.activeChild = wqe;
            } else if (result.ret === ReturnCode.exhausted) {
                wqe.parent.activeChild = null;
            };
            return result;
        };
        if(this.GetBlocked() !== null)
            return {status : "Has blocked items", ret: ReturnCode.blocking, outputInOrder: null};
        if (this.waitingQueue.length <= 0 && this.activeChild === null)
            return { status: "Completed", ret: ReturnCode.exhausted, outputInOrder: null};
        else {
            var remaind : WaitingQeueuEntry = this.FindOne();
            return { status: "No Entry to be executable. But some tokens remain.", ret: ReturnCode.somethingRemain, outputInOrder: null};
        }
    };

    public Go(mode: ExecOption) : {status: string, ret: ReturnCode, outputInOrder: Token[]} {
        var stopContext: VPGLContext = null;
        var result: {status: string, ret: ReturnCode, outputInOrder: Token[]} 
            = {status: "", ret: ReturnCode.ok, outputInOrder: null};
        while(result.ret === ReturnCode.canDoMore || result.ret === ReturnCode.ok || result.ret === ReturnCode.needMoreToken) {
            var tmpwqe: WaitingQeueuEntry = null;
            if(mode === ExecOption.stepIn && result.ret === ReturnCode.canDoMore)
                break;
            if(mode === ExecOption.stepOver && result.ret === ReturnCode.canDoMore)
            stopContext = (stopContext===null)?
                ((tmpwqe = this.TraceSearch().parent.parent)===undefined || tmpwqe == null)?null:tmpwqe.parent
                :stopContext;
        if(mode === ExecOption.stepOut) {
                var tmpwqe = this.TraceSearch();
                stopContext = (stopContext===null)?
                    (tmpwqe === null || tmpwqe.parent.parent ===undefined)?null:tmpwqe.parent
                    :stopContext;
            }
            var outsave: Token[] = result.outputInOrder; 
            result = this.OneStep(mode);
            if (result.ret === ReturnCode.exhausted){
                result.outputInOrder = outsave;
                break;
            };
            if(result.ret === ReturnCode.somethingRemain){
                break;
            }
            _execcount++;
            if (_warningcount > 0 && _execcount > _warningcount) {
                _execcount = 0;
                if (!window.confirm("Execlimt:"+_warningcount+" is exceeded. continue?")) break;
            };
            if(_wkdebugging && result.ret === ReturnCode.breakStop)
                break;
            if(_wkdebugging && mode === ExecOption.stepIn && (result.ret === ReturnCode.stepStop || result.ret === ReturnCode.ok)) {
                break;
            };
            if (_wkdebugging && mode === ExecOption.stepOver 
                && (result.ret === ReturnCode.stepStop || result.ret === ReturnCode.ok)) {
                var htg: WaitingQeueuEntry = this.TraceSearch();
                var tmp: boolean;
                if (htg!==null && htg.parent!==null)
                    tmp = (stopContext===null?true:(htg.parent.depthlevel <= stopContext.depthlevel));
                else
                    tmp = true;
                if (tmp)
                    break;
                else
                    result.ret = ReturnCode.ok;
            };
            if(_wkdebugging && mode === ExecOption.continue && result.ret === ReturnCode.stepStop)
                result.ret = ReturnCode.ok;
            if(_wkdebugging && mode === ExecOption.stepOut && result.ret === ReturnCode.stepStop) {
                var htg: WaitingQeueuEntry = this.TraceSearch();
                var tmp: boolean = (stopContext===null?true:(htg.parent.depthlevel <= stopContext.depthlevel))
                if(tmp)
                    break;
                else
                    result.ret = ReturnCode.ok;
            };
        };
        if(result.ret === ReturnCode.blocking)
            _continueMode = mode;
//        else if(result.ret !== ReturnCode.ok && result.ret !== ReturnCode.breakStop 
//                && result.ret !== ReturnCode.stepStop && result.ret !== ReturnCode.canDoMore)
//            gui.Alert("VPGL Executor", "End with\n"+result.status, null,'jqconsole-warning');
        return result;
    };

    public TraceInfo(className: string, methodName: string, tx: number, ty:number)
        : {toDoNext: boolean, setBP : boolean, topToken: string, leftToken: string,
            rightToken: string, bottomToken: string}
    {
        var result: {toDoNext: boolean, setBP : boolean, topToken: string, leftToken: string,
            rightToken: string, bottomToken: string} = {toDoNext: false, setBP:false, topToken: "", leftToken: "", rightToken: "", bottomToken: ""};
        var posstr : string = "ABCDEFG".charAt(tx)+"1234567".charAt(ty);
        var tg: WaitingQeueuEntry = this.TraceSearch2(className, methodName,posstr);
        if( tg===null || tg.child === null ) {
            var bp: boolean = false;
            var tmp, tmp2, tmp3, tmp4: Token;
            var tmp5: number = BreakPointState.off;
            if((tmp = VPGLGlobalDataBase.Get(className)) !== undefined && tmp !== null) {
                if((tmp2 = tmp.Get(methodName)) !== undefined && tmp2 !== null) {
                    if((tmp3 = tmp2.Get(posstr)) !== undefined && tmp3 !== null) {
                        if((tmp4 = tmp3.Get(BreakPointKey)) !== undefined && tmp4 !== null) {
                            if((tmp5 = tmp4.AsNumber()) === undefined || tmp5 === null)
                            tmp5 = BreakPointState.off;
                        };
                    };
                };
            };
            if( tmp5 !== BreakPointState.off)
                bp = true;
            return {toDoNext: false, setBP: bp, topToken:null, leftToken:null, rightToken:null, bottomToken:null};
        };
        var matchClass: boolean = (tg.parent.classname === "UserDefined")?
            ((<UserDefinedClassToken>tg.parent.arrivedTokensInOrder[0]).typeid === className)
            : tg.parent.classname === className;
        if(matchClass && tg.parent.opname === methodName
           && tg.child.position === posstr) {
            result.toDoNext = (tg.child.CanFire() || tg.child.status === Status.resumeFromWaiting);
            var tmp8 : Token = tg.child.targetTile.Get(BreakPointKey);
            if (tmp8 === undefined || tmp === null) 
                result.setBP = false;
            else {
                result.setBP = true;
            }
            var dirTokens: Token[] = [null, null, null, null];
            for (var i=0; i < tg.child.incond.length; i++) {
                dirTokens["TLRB".indexOf(tg.child.incond.charAt(i))] = tg.child.arrivedTokensInOrder[i];
            }
            result.topToken = dirTokens[DirectionW.top]===null?"":dirTokens[DirectionW.top].ToLiteral();
            result.leftToken = dirTokens[DirectionW.left]===null?"":dirTokens[DirectionW.left].ToLiteral();
            result.rightToken = dirTokens[DirectionW.right]===null?"":dirTokens[DirectionW.right].ToLiteral();
            result.bottomToken = dirTokens[DirectionW.bottom]===null?"":dirTokens[DirectionW.bottom].ToLiteral();
            return result;
        } else { 
            result.toDoNext = false;
            var i: number;
            var tgx: WaitingQeueuEntry = null;
            for (i=0; i<tg.parent.waitingQueue.length; i++)
                if(tg.parent.waitingQueue[i].child.position === posstr){
                    tgx = tg.parent.waitingQueue[i];
                    break;
                }
            if (tgx===null) {
                var classtoken : Token = VPGLGlobalDataBase.Get(className);
                var methodtoken: Token = (classtoken!==null)?classtoken.Get(methodName):null;
                var tiletoken: Token = (methodtoken!==null)?methodtoken.Get(posstr):null;
                var bpstate : number = (tiletoken!==null)?(tiletoken.Get(BreakPointKey).AsNumber()):null;
                var bp: boolean = (bpstate !== null && bpstate !== BreakPointState.off);
                return {toDoNext: false, setBP: bp, topToken: null, leftToken: null, rightToken: null, bottomToken: null};
            }
            var tmp9: Token = tgx.child.targetTile.Get(BreakPointKey);
            if (tmp9 === undefined || tmp9 === null)
                result.setBP = false;
            else {
                result.setBP = true;
            };
            var dirTokens: Token[] = [null, null, null, null];
            for (var i=0; i < tgx.child.incond.length; i++) {
                dirTokens["TLRB".indexOf(tgx.child.incond.charAt(i))] = tgx.child.arrivedTokensInOrder[i];
            }
            result.topToken = dirTokens[DirectionW.top]===null?"":dirTokens[DirectionW.top].ToLiteral();
            result.leftToken = dirTokens[DirectionW.left]===null?"":dirTokens[DirectionW.left].ToLiteral();
            result.rightToken = dirTokens[DirectionW.right]===null?"":dirTokens[DirectionW.right].ToLiteral();
            result.bottomToken = dirTokens[DirectionW.bottom]===null?"":dirTokens[DirectionW.bottom].ToLiteral();
            return result;
        }
    };

    public StepIn(): void  {
        var rcode : ReturnCode = this.Go(ExecOption.stepIn).ret;
        var topcontext: VPGLContext = this;
        while(topcontext.parent !== undefined && topcontext.parent !== null 
                && topcontext.parent.parent!==undefined && topcontext.parent.parent !== null){
            topcontext = topcontext.parent.parent;
        };
        var tg: WaitingQeueuEntry = topcontext.TraceSearch();

        if ( tg!== null) {
            if(tg.parent.classname === 'UserDefined')
                _ForceUiRedraw((<UserDefinedClassToken>tg.parent.arrivedTokensInOrder[0]).typeid, tg.parent.opname, tg.parent);
            else
                _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
        }
        else if(rcode === ReturnCode.blocking)
            return;
        else {
            _ForceUiRedraw("App", "Mainline");
        }; 
    };

    public StepOver(): void {
        var rcode : ReturnCode = this.Go(ExecOption.stepOver).ret;
        var topcontext: VPGLContext = this;
        while(topcontext.parent !== undefined && topcontext.parent !== null 
                && topcontext.parent.parent!==undefined && topcontext.parent.parent !== null){
            topcontext = topcontext.parent.parent;
        };
        var tg: WaitingQeueuEntry = topcontext.TraceSearch();
        if ( tg!== null)
            if(tg.parent.classname === 'UserDefined')
                _ForceUiRedraw((<UserDefinedClassToken>tg.parent.arrivedTokensInOrder[0]).typeid, tg.parent.opname, tg.parent);
            else
                _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
        else if(rcode === ReturnCode.blocking)
            return;
        else {
            _ForceUiRedraw("App", "Mainline");
        }; 
    };

    public StepOut(): void {
        var rcode : ReturnCode = this.Go(ExecOption.stepOut).ret;
        var topcontext: VPGLContext = this;
        while(topcontext.parent !== undefined && topcontext.parent !== null 
                && topcontext.parent.parent!==undefined && topcontext.parent.parent !== null){
            topcontext = topcontext.parent.parent;
        };
        var tg: WaitingQeueuEntry = topcontext.TraceSearch();
        if ( tg!== null)
            if(tg.parent.classname === 'UserDefined')
                _ForceUiRedraw((<UserDefinedClassToken>tg.parent.arrivedTokensInOrder[0]).typeid, tg.parent.opname, tg.parent);
            else
                _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
        else if(rcode === ReturnCode.blocking)
            return;
        else {
            _ForceUiRedraw("App", "Mainline");
        }; 
    };

    public Continue(): void {
        var rcode : ReturnCode = this.Go(ExecOption.continue).ret;
        var topcontext: VPGLContext = this;
        while(topcontext.parent !== undefined && topcontext.parent !== null 
                && topcontext.parent.parent!==undefined && topcontext.parent.parent !== null){
            topcontext = topcontext.parent.parent;
        };
        var tg: WaitingQeueuEntry = topcontext.TraceSearch();
        if(rcode === ReturnCode.blocking) {
            return;
        }
        else if ( tg!== null) {
            var clsname: string = tg.parent.classname;
            if(clsname === 'UserDefined')
                clsname = (<UserDefinedClassToken>(tg.parent.arrivedTokensInOrder[0])).typeid;
            _ForceUiRedraw(clsname, tg.parent.opname, tg.parent);
        }
        else {
            _ForceUiRedraw("App", "Mainline");
        }; 
    };
}; // class VPGLContext

var count : number = 0;
var _execcount : number = 0;
var _warningcount : number = 0;
var _continueMode : ExecOption = ExecOption.continue;
var gDB : VPGLGlobalDataBase = new VPGLGlobalDataBase();

function _ListUpMethods(): any[] {
    var result = [];
    var tmp = {};
    VPGLGlobalDataBase.constlist.ForAll(function(cls: string, val:Token):boolean {
        var subrs = _SUBRDepo[cls];
        for(let mtd in subrs) {
            tmp[mtd] = true;
        };
        val.ForAll(function(mtd: string, def: Token): boolean {
            if(mtd === SuperClassesKey) return false;
            tmp[mtd] = true;
            return false;
        });
        return false;
    });
    for(let mtd in tmp) {
        result.push(mtd);
    }
    result.sort();
    return result;
};

function _ForceUiRedraw(className: string, methodName: string, cxt: VPGLContext = null) {
    if(className === "UserDefined")
        if(cxt === null) return;
        else className = (<UserDefinedClassToken>cxt.arrivedTokensInOrder[0]).typeid;
    var classes: string[] = VPGLGlobalDataBase.Classes();
    var methods: string[] = VPGLGlobalDataBase.Members(className);
    if(methods === undefined || methods === null) return;
    if (methodName === "") methodName = methods[0];
    var tgt: {target: Token, clsname: string} = VPGLGlobalDataBase.Get(className).DeepFindMethod(className, methodName);
    var target : Token = tgt.target;
    className = tgt.clsname;

    if(target === undefined) target = null;
    var traceinfo = {};
    if( _wkdebugging && cxt !== null && target !== undefined && target !== null) {
        for(var i=0; i<7; i++)
            for(var j=0; j<7; j++) {
                var posstr = "ABCDEFG".charAt(j)+"1234567".charAt(i);
                if (target.Get(posstr)==undefined) continue;
                var tinfo: {toDoNext: boolean, setBP : boolean, topToken: string, leftToken: string,
                    rightToken: string, bottomToken: string} = cxt.TraceInfo(className, methodName, j, i);
                if (tinfo !== undefined && tinfo !== null)
                    traceinfo[posstr] = tinfo;
            }
    }
    var cxtid = (cxt!==null)?cxt.identifier:-1;
    postMessage({cmd: "DrawUI", currentClass: className,
    currentMethod: methodName, classes: classes, methods: methods,
    allmethods: _ListUpMethods(),
    grid: target, traceinfo: traceinfo, cxtid: cxtid}, null);
};

function _ResetSystem(cmd): void{
    _enable3D = cmd.d3;
    _wkdebugging = false;
    gDB.Initialize();
    _eventid=0;
    _suspendedContext = {};
    _suspendedRetVal = {};
    _activeContexts = [];
    _CBTable = [];
    _ForceUiRedraw("App", "Mainline")
};

var _breakcount : number = 1000;
var _topcxtid: number = -1;
var _activeContexts : VPGLContext[] = [];
var _suspendedContext : {[index : number]: VPGLContext} = {};
var _suspendedRetVal : {[inex : number]: [any, any, any, any]} = {};
var _topWqe : WaitingQeueuEntry = null;
var _wkdebugging : boolean = false;
var _enable3D: boolean = true;
var _CBTable : {scn: string, target: string, event: string, obj: Token, opname: string, exmode: ExecOption}[] = [];

function _DeleteFromActiveContext(tbd: VPGLContext) {
    var id = tbd.identifier;
    if(id < 0) return;
    for(var i=0; i<_activeContexts.length; i++) {
        if (_activeContexts[i].identifier !== id) continue;
        _activeContexts.splice(i,1)
        break;
    }
};

function _FindContextFromActiveContexts(cxtid: number):VPGLContext {
    for(var i=0; i<_activeContexts.length; i++) {
        if(_activeContexts[i].identifier !== cxtid) continue;
        return _activeContexts[i];
    }
    return null;
};

function _StartExec() : void {
    postMessage({cmd: 'CancelMove'}, null);
    _execcount = 0;
    _warningcount = 0;
    _topWqe = new WaitingQeueuEntry();
    var app : Token = Token.NewInstance('App', []);
    _activeContexts = [];
    _CBTable = [];
    var _topContext = new VPGLContext(null, (_topcxtid = _NewEventId()));
    _topContext.depthlevel = 0;
    _topContext.Install(app, "Mainline", null, [app, null, null, null]);
    _topContext.parent = _topWqe;
    _topWqe.child = _topContext;
    _topWqe.parent = null;
    _execcount = 0;
    if(!_wkdebugging){
        var result: {status: string, ret: ReturnCode, outputInOrder: Token[]}
            = _topContext.Go(ExecOption.normal);
        if(result.ret === ReturnCode.exhausted)            return;
        else if(result.ret === ReturnCode.canDoMore)
            postMessage({cmd: "CanDoMore"}, null)
        else if(result.ret === ReturnCode.executionHALT)
            postMessage({cmd: 'Terminated', msg: " "+result.status},null);
        else if(result.ret === ReturnCode.error || result.ret === ReturnCode.noSuchOp || result.ret === ReturnCode.somethingRemain)
            postMessage({cmd: 'ERROR', msg:"ERROR - "+result.status}, null);
    } else {
        _ForceUiRedraw("App", "Mainline", _topContext);
    };
};

function _StepIn(cmd): void {
    if (cmd.cxtid <= 0)
        _FindContextFromActiveContexts(_topcxtid).StepIn();
    else {
        var cxt  = _FindContextFromActiveContexts(cmd.cxtid);
        if(cxt !== undefined && cxt !== null)
            cxt.StepIn();
    }
};

function _StepOver(cmd): void {
    if (cmd.cxtid <= 0)
        _FindContextFromActiveContexts(_topcxtid).StepOver();
    else {
        var cxt  = _FindContextFromActiveContexts(cmd.cxtid);
        if(cxt !== undefined && cxt !== null)
            cxt.StepOver();
    }
};

function _StepOut(cmd): void {
    if (cmd.cxtid <= 0)
        _FindContextFromActiveContexts(_topcxtid).StepOut();
    else {
        var cxt  = _FindContextFromActiveContexts(cmd.cxtid);
        if(cxt !== undefined && cxt !== null)
            cxt.StepOut();
    }
};

function _StepContinue(cmd): void {
    if (cmd.cxtid <= 0)
        _FindContextFromActiveContexts(_topcxtid).Continue();
    else {
        var cxt  = _FindContextFromActiveContexts(cmd.cxtid);
        if(cxt !== undefined && cxt !== null)   
            cxt.Continue();
    }
};

function _ClearBP(cmd): void {
    VPGLGlobalDataBase.ClearAllBreakPoints();
}

function _ToggleBP(cmd) {
    _WKToggleBreakPoint(cmd.class, cmd.method, cmd.pos, cmd.cxtid);
};

function _WKToggleBreakPoint(cls: string, mtd: string, posstr: string, cxtid: number) : void {
        var tile: Token = VPGLGlobalDataBase.Get(cls).Get(mtd).Get(posstr);
        var bp: Token = tile.Get(BreakPointKey);
        if(bp === undefined || bp === null) {
            tile.Put(BreakPointKey, NumberToken.NewInstance(BreakPointState.on));
            VPGLGlobalDataBase.RegisterBreakPoint(cls, mtd, posstr);
        } else {
            tile.Put(BreakPointKey, null);
            VPGLGlobalDataBase.UnregisterBreakPoint(cls, mtd, posstr);
        }
        var cxt : VPGLContext = _FindContextFromActiveContexts((cxtid>0)?cxtid:_topcxtid);
        if (cxt !== undefined && cxt !== null)
            _ForceUiRedraw(cls, mtd, cxt);
        else
            _ForceUiRedraw(cls, mtd);
};

function _ContinueExec(cmd): void {
    var result: {status: string, ret: ReturnCode, outputInOrder: Token[]} = {status: "", ret: ReturnCode.error, outputInOrder: null};
    if (cmd.eid === undefined)
        return;
    else if (_suspendedContext[cmd.eid] !== undefined && _suspendedContext[cmd.eid] !== null) {
        var cxtToBeExecuted: VPGLContext = _suspendedContext[cmd.eid];
        // find the root context of this suspended context. It should Go() on this root.
        while(cxtToBeExecuted.parent !== undefined && cxtToBeExecuted.parent !== null
            && cxtToBeExecuted.parent.parent !== undefined && cxtToBeExecuted.parent.parent !== null)
                cxtToBeExecuted = cxtToBeExecuted.parent.parent;
      delete _suspendedContext[cmd.eid];
      result = cxtToBeExecuted.Go(cmd.exmode);
    }
    else 
      result = {status: "Context Not Found in Continue", ret: ReturnCode.error, outputInOrder: null};
    if (result.ret === ReturnCode.error)
        postMessage({cmd: 'ERROR', msg: result.status}, null);
    if(result.ret === ReturnCode.exhausted || result.ret === ReturnCode.breakStop)
        return;
    else if(result.ret === ReturnCode.canDoMore)
        postMessage({cmd: "CanDoMore"}, null)
    else if(result.ret === ReturnCode.executionHALT)
        postMessage({cmd: 'Terminated', msg: " "+result.status},null);
    else if(result.ret !== ReturnCode.ok && result.ret !== ReturnCode.blocking)
        postMessage({cmd: "ERROR", msg: "code:"+result.ret+" "+result.status}, null)
    //_topWqe.child.Go(ExecOption.normal); // _topWqe.child is the top context.
};

function _UpdateTile(operand): void {
    var grid: Token = VPGLGlobalDataBase.Get(operand['class']).Get(operand['method']);
    if (operand.val === null)
        grid.Put(operand['pos'], null);
    else {
        var val = <DictToken>DictToken.NewInstance({});
        val.Put("opname", StringToken.NewInstance(operand.val.val.opname.val));
        val.Put("option", StringToken.NewInstance(operand.val.val.option.val));
        val.Put("indir", StringToken.NewInstance(operand.val.val.indir.val));
        val.Put("outdir", StringToken.NewInstance(operand.val.val.outdir.val));
        grid.Put(operand['pos'], Token.NewInstance(operand.val.classid, val));
    };
    _ForceUiRedraw(operand['class'], operand['method']);
};

function _NewMethodHandler(operand): void {
    var contents:{} = DictToken.ToTokenArray(operand.val);
    VPGLGlobalDataBase.Get(operand['class']).Put(operand['method'], GridToken.NewInstance(contents));
    var defs : Token = VPGLGlobalDataBase.Get(operand['class']);
    VPGLGlobalDataBase.Put(operand['class'], defs, true);
    _ForceUiRedraw(operand['class'], operand['method']);
};

function _NewClassHandler(operand): void {
    var supers: Token[] = []; 
    for(var i=0; i<operand.supers.length; i++) {
        supers.push(StringToken.NewInstance(operand.supers[i]));
    }
    var initval: Token = DictToken.NewInstance({});
    initval.Put(SuperClassesKey, ArrayToken.NewInstance(supers));
    VPGLGlobalDataBase.Put(operand.class, initval, true);
    _ForceUiRedraw(operand.class,"");
};

function _UpdateMethodHandler(operand) : void {
    var clsTk: Token = VPGLGlobalDataBase.Get(operand.class);
    var mtdTk: Token = clsTk.Get(operand.method);
    if(operand.val.indir !== undefined) mtdTk.Put("indir", StringToken.NewInstance(operand.val.indir));
    if(operand.val.outdir !== undefined) mtdTk.Put("outdir", StringToken.NewInstance(operand.val.outdir));
    if(operand.val.ifall !== undefined) mtdTk.Put("ifall", operand.val.ifall?TToken.NewInstance(null):NILToken.NewInstance(null));
    if(operand.val.remark !== undefined) mtdTk.Put("remark", StringToken.NewInstance(operand.val.remark));
    _ForceUiRedraw(operand.class, operand.method)
};

function _UpdateHandler(operand): void {
    switch (operand.opr) {
        case 'NewMethod': _NewMethodHandler(operand); break;
        case 'NewClass': _NewClassHandler(operand); break;
        case 'UpdateMethod': _UpdateMethodHandler(operand); break;
        default:
            postMessage({cmd: 'ERROR', msg: 'No Such Grid Operation: '+operand.opr}, null);
            break;
    };
};

function _StopDebug(): void {
    _wkdebugging = false;
    VPGLGlobalDataBase.BPHitToOn();
};

function _StartDebug(): void {
    _wkdebugging = true;
}

function _AllVMHandler():void {
    postMessage({cmd: 'VMContents', val: VPGLGlobalDataBase.SourceOut()}, null);
};

function _LoadVMHandler(cmd) {
    VPGLGlobalDataBase.SourceIn(cmd.val, cmd.overwrite);
    _ForceUiRedraw("App", "Mainline")
};

function _UserInputHandler(operand): void {
    var cxt : VPGLContext = _suspendedContext[operand.eid];
    var got = Token.FromLiteral(operand.val);
    if (got === null)
        postMessage({cmd: 'ERROR', msg: "INPUT IS MALFOMED"}, null);
    cxt.toBeEmittedInOrder[0] = got.val;
    cxt.status = Status.resumeFromWaiting;
    postMessage({cmd: 'CanBreak', eid: operand.eid, exmode: operand.exmode}, null);
};

function _DragHandler(operand) :void {
    //operand.target;
    //operand.z;
    //operand.x;
   // operand.y;
   var cbobject : Token = null;
   for(var i=0; i<_CBTable.length; i++) {
       var entry = _CBTable[i];
       if (entry.scn === operand.scn && entry.target === operand.target && entry.event === "OnDrag") {
           cbobject = entry.obj;
           var topWqe : WaitingQeueuEntry = new WaitingQeueuEntry();
           var cbContext : VPGLContext = new VPGLContext(null, _NewEventId());
           var tmp : {status: string, ret: ReturnCode, outputInOrder: Token[]};
           var tgopname: string = entry.opname;
           if (tgopname === undefined || tgopname === "") continue;
           cbContext.depthlevel = 0;
           var arg1: Token = DictToken.NewInstance({target: StringToken.NewInstance(operand.target), spec: DictToken.NewInstance2(operand.spec), x: NumberToken.NewInstance(operand.x), y:NumberToken.NewInstance(operand.y), z: NumberToken.NewInstance(operand.z)});
           cbContext.Install(cbobject, tgopname, null,  [cbobject, arg1, null, null]);
           cbContext.parent = topWqe;
           cbContext.position = "A2";
           cbContext.outdir = "B";
           topWqe.child = cbContext;
           topWqe.parent = null;
           
           tmp = cbContext.Go(entry.exmode);
           if(tmp.ret === ReturnCode.executionHALT)
               postMessage({cmd: 'Terminated', msg: tmp.status}, null);
           if(tmp.ret === ReturnCode.error || tmp.ret === ReturnCode.noSuchOp)
               postMessage({cmd: 'ERROR', msg: tmp.status}, null);
           if(tmp.ret === ReturnCode.breakStop) {
               var tg: WaitingQeueuEntry = cbContext.TraceSearch();
               if ( tg!== null)
                   _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
           };
       };
   }
};

function _1TouchHandler(operand) :void {
    //operand.target;
    //operand.z;
    //operand.x;
   // operand.y;
   var cbobject : Token = null;
   for(var i=0; i<_CBTable.length; i++) {
       var entry = _CBTable[i];
       if (entry.scn === operand.scn && entry.target === operand.target && entry.event === "On1Touch") {
           cbobject = entry.obj;
           var topWqe : WaitingQeueuEntry = new WaitingQeueuEntry();
           var cbContext : VPGLContext = new VPGLContext(null, _NewEventId());
           var tmp : {status: string, ret: ReturnCode, outputInOrder: Token[]};
           var tgopname: string = entry.opname;
           if (tgopname === undefined || tgopname === "") continue;
           cbContext.depthlevel = 0;
           var arg1: Token = DictToken.NewInstance({target: StringToken.NewInstance(operand.target), spec: DictToken.NewInstance2(operand.spec), x: NumberToken.NewInstance(operand.x), y:NumberToken.NewInstance(operand.y), z: NumberToken.NewInstance(operand.z)});
           cbContext.Install(cbobject, tgopname, null,  [cbobject, arg1, null, null]);
           cbContext.parent = topWqe;
           cbContext.position = "A2";
           cbContext.outdir = "B";
           topWqe.child = cbContext;
           topWqe.parent = null;
           
           tmp = cbContext.Go(entry.exmode);
           if(tmp.ret === ReturnCode.executionHALT)
               postMessage({cmd: 'Terminated', msg: tmp.status}, null);
           if(tmp.ret === ReturnCode.error || tmp.ret === ReturnCode.noSuchOp)
               postMessage({cmd: 'ERROR', msg: tmp.status}, null);
           if(tmp.ret === ReturnCode.breakStop) {
               var tg: WaitingQeueuEntry = cbContext.TraceSearch();
               if ( tg!== null)
                   _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
           };
       };
   }
};

function _2TouchHandler(operand) :void {
    //operand.target;
    //operand.z;
    //operand.x;
   // operand.y;
   var cbobject : Token = null;
   for(var i=0; i<_CBTable.length; i++) {
       var entry = _CBTable[i];
       if (entry.scn === operand.scn && entry.target === operand.target && entry.event === "On2Touch") {
           cbobject = entry.obj;
           var topWqe : WaitingQeueuEntry = new WaitingQeueuEntry();
           var cbContext : VPGLContext = new VPGLContext(null, _NewEventId());
           var tmp : {status: string, ret: ReturnCode, outputInOrder: Token[]};
           var tgopname: string = entry.opname;
           if (tgopname === undefined || tgopname === "") continue;
           cbContext.depthlevel = 0;
           var arg1: Token = DictToken.NewInstance({target: StringToken.NewInstance(operand.target), spec: DictToken.NewInstance2(operand.spec), x: NumberToken.NewInstance(operand.x), y:NumberToken.NewInstance(operand.y), z: NumberToken.NewInstance(operand.z)});
           cbContext.Install(cbobject, tgopname, null,  [cbobject, arg1, null, null]);
           cbContext.parent = topWqe;
           cbContext.position = "A2";
           cbContext.outdir = "B";
           topWqe.child = cbContext;
           topWqe.parent = null;
           
           tmp = cbContext.Go(entry.exmode);
           if(tmp.ret === ReturnCode.executionHALT)
               postMessage({cmd: 'Terminated', msg: tmp.status}, null);
           if(tmp.ret === ReturnCode.error || tmp.ret === ReturnCode.noSuchOp)
               postMessage({cmd: 'ERROR', msg: tmp.status}, null);
           if(tmp.ret === ReturnCode.breakStop) {
               var tg: WaitingQeueuEntry = cbContext.TraceSearch();
               if ( tg!== null)
                   _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
           };
       };
   }
};

function _ClickHandler(operand) : void {
    var cbobject : Token = null;
    for(var i=0; i<_CBTable.length; i++) {
        var entry = _CBTable[i];
        if (entry.scn === operand.scn && entry.target === operand.target && entry.event === "OnClick") {
            cbobject = entry.obj;
            var topWqe : WaitingQeueuEntry = new WaitingQeueuEntry();
            var cbContext : VPGLContext = new VPGLContext(null, _NewEventId());
            var tmp : {status: string, ret: ReturnCode, outputInOrder: Token[]};
            //if (operand.spec === undefined || operand.spec === null) continue;
            //var tgopname: string = operand.spec["OnClick"];
            var tgopname : string = entry.opname;
            if (tgopname === undefined || tgopname === "") continue;
            cbContext.depthlevel = 0;
            var clickParam: Token = DictToken.NewInstance({target: StringToken.NewInstance(operand.target), spec: DictToken.NewInstance2(operand.spec) });
            cbContext.Install(cbobject, tgopname, null,  [cbobject, clickParam, null, null]);
            cbContext.parent = topWqe;
            cbContext.position = "A2";
            cbContext.outdir = "B";
            topWqe.child = cbContext;
            topWqe.parent = null;
            
            tmp = cbContext.Go(entry.exmode);
            if(tmp.ret === ReturnCode.executionHALT)
                postMessage({cmd: 'Terminated', msg: tmp.status}, null);
            if(tmp.ret === ReturnCode.breakStop) {
                var tg: WaitingQeueuEntry = cbContext.TraceSearch();
                if ( tg!== null)
                    _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
        
                false;
            };
            if(tmp.ret === ReturnCode.error || tmp.ret === ReturnCode.noSuchOp) {
                postMessage({cmd: 'ERROR', msg: tmp.status}, null);
                break;
            }
        };
    }
};

function _ChangeValHandler(operand): void {
    var cbobject : Token = null;
    for(var i=0; i<_CBTable.length; i++) {
        var entry = _CBTable[i];
        if (entry.scn === operand.scn && entry.target === operand.target && entry.event === "OnChange") {
            cbobject = entry.obj;
            var topWqe : WaitingQeueuEntry = new WaitingQeueuEntry();
            var cbContext : VPGLContext = new VPGLContext(null, _NewEventId());
            var tmp : {status: string, ret: ReturnCode, outputInOrder: Token[]};
            //if (operand.spec === undefined || operand.spec === null) continue;
            //var tgopname: string = operand.spec["OnChange"];
            var tgopname: string = entry.opname
            if (tgopname === undefined || tgopname === null || tgopname === "") continue;
            cbContext.depthlevel = 0;
            var vallit : string = ""+operand.val;
            var cvParam: Token = DictToken.NewInstance({target: StringToken.NewInstance(operand.target), spec: DictToken.NewInstance2(operand.spec), val: Token.FromLiteral(vallit).val});
            cbContext.Install(cbobject, tgopname, null,  [cbobject, cvParam, null, null]);
            cbContext.parent = topWqe;
            cbContext.position = "A2";
            cbContext.outdir = "B";
            topWqe.child = cbContext;
            topWqe.parent = null;
            
            tmp = cbContext.Go(entry.exmode);
            if(tmp.ret === ReturnCode.executionHALT)
                postMessage({cmd: 'Terminated', msg: tmp.status}, null);
            if(tmp.ret === ReturnCode.error || tmp.ret === ReturnCode.noSuchOp || tmp.ret === ReturnCode.somethingRemain)
                postMessage({cmd: 'ERROR', msg: tmp.status}, null);
            if(tmp.ret === ReturnCode.breakStop) {
                var tg: WaitingQeueuEntry = cbContext.TraceSearch();
                if ( tg!== null)
                    _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
        
                false;
            };
        };
    }
};

function _TimerRunOutHandler(operand) {
    var cbobject : Token = null;
    for(var i=0; i<_CBTable.length; i++) {
        var entry = _CBTable[i];
        //var operator : Token = entry.obj.Where(operand.opname);
        if (entry.event === "OnTick") {
            cbobject = entry.obj;
            var topWqe : WaitingQeueuEntry = new WaitingQeueuEntry();
            var cbContext : VPGLContext = new VPGLContext(null, _NewEventId());
            var tmp : {status: string, ret: ReturnCode, outputInOrder: Token[]};
            var tgopname = entry.opname;
            if(tgopname === undefined || tgopname === null) continue;
            cbContext.depthlevel = 0;
            var tickParam: Token = DictToken.NewInstance({count: NumberToken.NewInstance(operand.count)});
            cbContext.Install(cbobject, tgopname, null,  [cbobject, tickParam, null, null]);
            cbContext.parent = topWqe;
            cbContext.position = "A2";
            cbContext.outdir = "B";
            topWqe.child = cbContext;
            topWqe.parent = null;
            
            tmp = cbContext.Go(entry.exmode);
            if(tmp.ret === ReturnCode.executionHALT)
                postMessage({cmd: 'Terminated', msg: tmp.status}, null);
            if(tmp.ret === ReturnCode.error || tmp.ret === ReturnCode.noSuchOp)
                postMessage({cmd: 'ERROR', msg: tmp.status}, null);
            if(tmp.ret === ReturnCode.breakStop) {
                var tg: WaitingQeueuEntry = cbContext.TraceSearch();
                if ( tg!== null) 
                    _ForceUiRedraw(tg.parent.classname, tg.parent.opname, tg.parent);
                false;
            };
        };
    }
    postMessage({cmd: "TimerResponseComplete"}, null);
}

function _CollisionReportHandler(operand): void {
    var cxt : VPGLContext = _suspendedContext[operand.eid];
    if(cxt === undefined || cxt === null) return;
    var target = operand.target;
    var got: ArrayToken = <ArrayToken>ArrayToken.NewInstance([]);
    //ArrayClass.Push(got, TokenX.NewInstance('String', operand.obj, null));
    for (var i=0; i<target.length; i++) {
        var collentry = {obj: StringToken.NewInstance(target[i].obj), src: DictToken.NewInstance2(target.src),
            dx: NumberToken.NewInstance(target[i].dx), dy: NumberToken.NewInstance(target[i].dy), dz: NumberToken.NewInstance(target[i].dz)};
//       var collentry = {obj: StringToken.NewInstance(target[i].obj), src: DictToken.NewInstance2(target.src),
//             theta: NumberToken.NewInstance(target[i].theta), psy: NumberToken.NewInstance(target[i].psy)};
        got.Push(DictToken.NewInstance(collentry));
    };
    if (got === null)
        postMessage({cmd: 'ERROR', msg: "COLLISION REPORT IS MALFOMED"}, null);
    cxt.toBeEmittedInOrder[0] = got;
    cxt.status = Status.resumeFromWaiting;
    postMessage({cmd: 'CanBreak', eid: operand.eid, exmode: operand.exmode}, null);
};

function _ObjReportHandler(operand): void {
    var cxt : VPGLContext = _suspendedContext[operand.eid];
    if(cxt === undefined || cxt === null) return;
    var target = operand.target;
    var got: ArrayToken = <ArrayToken>ArrayToken.NewInstance([]);
    for (var i=0; i<target.length; i++) {
        var collentry:Token = DictToken.NewInstance2(target[i]);
        got.Push(collentry);
    };
    if(got === null)
        postMessage({cmd: 'ERROR', msg: "Object REPORT IS MALFORMED"}, null);
    cxt.toBeEmittedInOrder[0] = got;
    cxt.status = Status.resumeFromWaiting;
    postMessage({cmd: 'CanBreak', eid: operand.eid, exmode: operand.exmode}, null);
};

function _GetReportHandler(operand): void {
    var cxt: VPGLContext = _suspendedContext[operand.eid];
    if(cxt === undefined || cxt === null) return;
    var got: Token = DictToken.NewInstance2(operand.obj);
    if(got === null)
        postMessage({cmd: 'ERROR', msg: "Get REPORT IS MALFORMED"}, null);
    cxt.toBeEmittedInOrder[0] = got;
    cxt.status = Status.resumeFromWaiting;
    postMessage({cmd: "CanBreak", eid: operand.eid, exmode: operand.exmode}, null);
};

function _GridClearHandler(operand) : void {
    var cname : string = operand.class;
    var mname : string = operand.method;
    var cdef : Token = VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null){
        postMessage({cmd: 'ERROR', msg: "Grid Clear: no such class - "+cname},null);
        return;
    };
    var mdef : GridToken = <GridToken>cdef.Get(mname);
    if (mdef === undefined || mdef === null){
        postMessage({ cmd: 'ERROR', msg: "Grid Clear: no such method - "+cname+"::"+mname}, null);
        return;
    };

    mdef.ForAll(function(key:string, val: Token):boolean{
        switch(key) {
            case 'size':
            case 'opname':
            case 'indir':
            case 'outdir':
            case 'ifall':
                break;
            default:
                mdef.Put(key, null);
                break;
        }; // switch
        return false;
    });
    _ForceUiRedraw(cname, mname); 
};

function _GridDeleteHandler(operand) : void {
    var cname : string = operand.class;
    var mname : string = operand.method;
    var cdef : DictToken = <DictToken>VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null) {
        postMessage({cmd: 'ERROR', msg: "Grid Delete : no such class - "+cname},null);
        return;
    }
    cdef.Put(mname, null);
    var newmname : string = null;
    cdef.ForAll(function(key: string, val: Token):boolean {
        newmname=key;
        return true;
    });
    if (newmname === null) {
        cname = 'App'; newmname = 'Mainline';
    }
    _ForceUiRedraw(cname, newmname);
};

function _GridRenameHandler(operand) : void {
    var cname : string = operand.class;
    var mname : string = operand.method;
    var cdef : DictToken = <DictToken>VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null) {
        postMessage({cmd: 'ERROR', msg: "Grid Rename : no such class - "+cname},null);
        return;
    }
    var mdef : Token = cdef.Get(mname);

    cdef.Put(mname, null);
    var newmname : string = operand.newname;
    mdef.Put("opname", StringToken.NewInstance(newmname));
    cdef.Put(newmname, mdef);
    _ForceUiRedraw(cname, newmname);
};

function _GridCopyHandler(operand) : void {
    var cname : string = operand.class;
    var mname : string = operand.method;
    var newmname : string = operand.newname;
    var cdef : DictToken = <DictToken>VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null) {
        postMessage({cmd: 'ERROR', msg: "Grid Copy : no such class - "+cname},null);
        return;
    }
    var mdef : DictToken = <DictToken>cdef.Get(mname);
    var deepcopied:Token = <Token>JSON.parse(JSON.stringify(mdef, Token.JSONReplacer), Token.JSONReciver);
    <DictToken><unknown>deepcopied.Put("opname", StringToken.NewInstance(newmname));

    cdef.Put(newmname, deepcopied);
    _ForceUiRedraw(cname, newmname);
};

function _GridExpandHandler(operand) {
    var cname : string = operand.class;
    var mname : string = operand.method;
    var cdef : Token = VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null){
        postMessage({cmd: 'ERROR', msg: "Grid Expand: no such class - "+cname},null);
        return;
    };
    var mdef : Token = cdef.Get(mname);
    if (mdef === undefined || mdef === null){
        postMessage({ cmd: 'ERROR', msg: "Grid Expand: no such method - "+cname+"::"+mname}, null);
        return;
    };

    var sz:number = mdef.Get('size').AsNumber();
    if(sz >= 7) {
        postMessage({cmd: 'ERROR', msg: "Grid Expand : Grid is the max size."}, null);
        return;
    };
    mdef.Put('size', NumberToken.NewInstance(sz+2));
    _ForceUiRedraw(cname, mname);
};

function _FromKeyPos(pos: string) : {x: number, y: number} {
    if (pos.length !== 2) return null;
    if (pos.match("[A-G][1-7]") === null) return null;
    return {x: "ABCDEFG".indexOf(pos.charAt(0)), y: "1234567".indexOf(pos.charAt(1))};
};

function _TrimGrid(grid: Token, newsize: number): void {
    var g: GridToken = <GridToken>grid;
    g.ForAll(function(key: string, val: Token):boolean{
        var pos: {x: number, y: number} = _FromKeyPos(key);
        if(pos === null) return false;
        if (pos.x >= newsize || pos.y >= newsize)
            grid.Put(key, null);
        return false;
    });
};

function _GridShrinkHandler(operand) : void {
    var cname : string = operand.class;
    var mname : string = operand.method;
    var cdef : Token = VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null){
        postMessage({cmd: 'ERROR', msg: "Grid Shrink : no such class - "+cname},null);
        return;
    };
    var mdef : Token = cdef.Get(mname);
    if (mdef === undefined || mdef === null){
        postMessage({ cmd: 'ERROR', msg: "Grid Shrink: no such method - "+cname+"::"+mname}, null);
        return;
    };

    var sz: number = mdef.Get('size').AsNumber();
    if(sz <= 3) {
        postMessage({cmd: 'ERROR', msg: "Grid Shrink : Grid is the minimum size."}, null);
        return;
    };
    mdef.Put('size', NumberToken.NewInstance(sz-2));
    _TrimGrid(mdef, sz-2);
    _ForceUiRedraw(cname, mname);
};

function _ToKeyPos(x: number, y: number): string {
    if (x<0 || x>6 || y<0 || y>6) return null;
    return ("ABCDEFG".charAt(x)+"1234567".charAt(y));
};


function _GridShiftHandler(operand): void {
    var cname : string = operand.class;
    var mname : string = operand.method;
    var x: number = operand.x;
    var y: number = operand.y;
    var cdef : Token = VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null){
        postMessage({cmd: 'ERROR', msg: "Grid Shift : no such class - "+cname},null);
        return;
    };
    var mdef : GridToken = <GridToken>cdef.Get(mname);
    if (mdef === undefined || mdef === null){
        postMessage({ cmd: 'ERROR', msg: "Grid Shift: no such method - "+cname+"::"+mname}, null);
        return;
    };

    var newmdef: GridToken = <GridToken>GridToken.NewInstance({});
    mdef.ForAll(function(key: string, val: Token):boolean{
        var pos: {x: number, y: number} = _FromKeyPos(key);
        if (pos === null)  {
            newmdef.Put(key, mdef.Get(key));
            return false;
        }
        var newpos : string = _ToKeyPos(pos.x+x, pos.y+y);
        if(newpos === null) return false;
        newmdef.Put(newpos, mdef.Get(key));
        return false;
    });
    _TrimGrid(newmdef, mdef.Get('size').AsNumber());
    cdef.Put(mname, newmdef);
    _ForceUiRedraw(cname, mname);
};

function _TileMoveHandler(operand): void {
    var cname : string = operand.class;
    var mname : string = operand.method;
    var moves : {fromx: number, fromy: number, tox: number, toy: number}[] = operand.moves;
    var x: number = operand.x;
    var y: number = operand.y;
    var cdef : Token = VPGLGlobalDataBase.Get(cname);
    if (cdef === undefined || cdef === null){
        postMessage({cmd: 'ERROR', msg: "TileMove : no such class - "+cname},null);
        return;
    };
    var mdef : Token = cdef.Get(mname);
    if (mdef === undefined || mdef === null){
        postMessage({ cmd: 'ERROR', msg: "TileMove: no such method - "+cname+"::"+mname}, null);
        return;
    };
    var move: {fromx: number, fromy:number, tox:number, toy: number};
    while(moves.length > 0) {
        move = moves.pop();
        var from: string = _ToKeyPos(move.fromx, move.fromy);
        var to: string = _ToKeyPos(move.tox, move.toy);
        var tile : Token = mdef.Get(from);
        mdef.Put(from, null);
        mdef.Put(to,tile);
    };
    _ForceUiRedraw(cname, mname);
};

function _ResumeHandler(operand): void {
    var cxt : VPGLContext = _suspendedContext[operand.eid];
    //var out0 = NumberClass.NewNumber(operand.msec);
    cxt.toBeEmittedInOrder[0] = _suspendedRetVal[operand.eid][0];
    cxt.status = Status.resumeFromWaiting;
    //delete _suspendedContext[operand.eid];
    //delete _suspendedRetVal[operand.eid];
    postMessage({cmd: 'CanBreak', eid: operand.eid, exmode: operand.exmode}, null);
}

function _StopHandler(operand): void {
    _eventid=0;
    _suspendedContext = {};
    _suspendedRetVal = {};
    _activeContexts = [];
    _CBTable = [];
}

console.log("Worker: VPGLWorker is ready.");
self.addEventListener("message", function(e) {
//    try {
        switch (e.data.cmd) {
            case 'ResetSystem': _ResetSystem(e.data); break;
            case 'StartDebug': _StartDebug(); break;
            case 'StopDebug': _StopDebug(); break;
            case 'Run': _StartExec(); break;
            case 'StepIn': _StepIn(e.data); break;
            case 'StepOver': _StepOver(e.data); break;
            case 'StepOut': _StepOut(e.data); break;
            case 'DebugContinue': _StepContinue(e.data); break;
            case 'ClearBreakPoints': _ClearBP(e.data); break;
            case 'ToggleBP': _ToggleBP(e.data); break;
            case 'Continue': _ContinueExec(e.data); break;
            case 'UiUpdate': _ForceUiRedraw(e.data.curClass, e.data.curMethod); break;
            case 'UpdateTile': _UpdateTile(e.data); break;
            case 'Update': _UpdateHandler(e.data); break;
            case 'AllVM' : _AllVMHandler(); break;
            case 'LoadVM' : _LoadVMHandler(e.data); break;
            case 'UserInput' : _UserInputHandler(e.data); break;
            case 'Resume': _ResumeHandler(e.data); break;
            case 'TimerRunOut': _TimerRunOutHandler(e.data); break;
            case 'Drag': _DragHandler(e.data); break;
            case 'SingleTouch': _1TouchHandler(e.data); break;
            case 'DoubleTouch': _2TouchHandler(e.data); break;
            case 'Click': _ClickHandler(e.data); break;
            case 'ChangeVal': _ChangeValHandler(e.data); break;
            case 'CollisionReport': _CollisionReportHandler(e.data); break;
            case 'ObjReport': _ObjReportHandler(e.data); break;
            case 'GetReport': _GetReportHandler(e.data); break;
            case 'GridClear' : _GridClearHandler(e.data); break;
            case 'GridDelete' : _GridDeleteHandler(e.data); break;
            case 'GridRename' : _GridRenameHandler(e.data); break;
            case 'GridCopy': _GridCopyHandler(e.data); break;
            case 'GridExpand' : _GridExpandHandler(e.data); break;
            case 'GridShrink' : _GridShrinkHandler(e.data); break;
            case 'GridShift': _GridShiftHandler(e.data); break;
            case 'TileMove': _TileMoveHandler(e.data); break;
            case 'Break': 
                _StopHandler(e.data);
                postMessage({cmd: "Terminated", msg: ">>> Aborted."}, null);
                break;
        default:
            postMessage({cmd: "ERROR", msg: "Nosuch CMD: "+e.data.cmd}, null)
            break;
        }
 //   } catch(error) {
 //       postMessage({cmd: 'ERROR', msg: error}, null);
 //   };
}, false);

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