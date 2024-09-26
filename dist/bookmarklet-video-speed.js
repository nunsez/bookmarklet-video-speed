(()=>{var H=Object.defineProperty;var E=n=>{throw TypeError(n)};var $=(n,t,e)=>t in n?H(n,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[t]=e;var o=(n,t,e)=>$(n,typeof t!="symbol"?t+"":t,e),A=(n,t,e)=>t.has(n)||E("Cannot "+e);var b=(n,t,e)=>t.has(n)?E("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(n):t.set(n,e);var a=(n,t,e)=>(A(n,t,"access private method"),e);var l="nunsez-video-bookmarklet";var m="".concat(l,"-state"),g="".concat(l,"-memory"),i="".concat(l,"-controller"),T="".concat(l,"-tickmarks"),v="".concat(l,"-stylesheet"),B="#".concat(i," * {box-sizing: border-box;color: #111;line-height:initial}")+"#".concat(i,", #").concat(i," .range, #").concat(i," .controls {margin: 0;padding: 4px;}")+"#".concat(i,", #").concat(i," .btn {border: 1px solid #444;border-radius: 4px;background-color: #eee;}")+"#".concat(i," {position: fixed;left: 8px;top: 8px;width: 150px;font: 15px monospace;box-shadow: 1px 1px 4px #444;user-select: none;z-index: 999999999;}")+"#".concat(i," .controls {display: flex;justify-content: space-between;align-items: center;}")+"#".concat(i," .btn {width: 20px;height: 20px;margin: 0;padding: 0;}")+"#".concat(i," .value {pointer-events: none;}")+"#".concat(i,' .value::after {content: "%";margin-left: 2px;}')+"#".concat(i," .range {width: 100%;}")+"#".concat(i," .range ~ * {display: none;}");function k(n){if(n.head.querySelector("#".concat(v)))return;let t=n.createElement("style");t.setAttribute("id",v),t.textContent=B,n.head.append(t)}var h=class n{constructor(t){o(this,"document");o(this,"speed");o(this,"videos",[]);o(this,"controller");o(this,"searchTimeoutId");o(this,"observer");this.document=t,this.speed=n.getSpeed(),this.observer=new MutationObserver(e=>this.refresh(e)),this.controller=new p(this)}static getSpeed(){let t=Number.parseInt(localStorage.getItem(g)||"");return Number.isNaN(t)?100:t}static getVideos(t){let e=[];return t.querySelectorAll("video, iframe").forEach(r=>{var d;if(r instanceof HTMLVideoElement)e.push(r);else if(r instanceof HTMLIFrameElement){let c=(d=n.getIDoc(r))==null?void 0:d.querySelector("video");c&&e.push(c)}}),e}static getIDoc(t){var e;try{return((e=t.contentWindow)==null?void 0:e.document)||t.contentDocument}catch(r){return console.log("iframe document is not reachable: "+t.src),null}}initialize(){this.observer.observe(document.body,{childList:!0}),this.controller.appendTo(document.body)}refresh(t){clearTimeout(this.searchTimeoutId),this.searchTimeoutId=setTimeout(()=>{this.videos=n.getVideos(this.document.body),this.setSpeed(this.speed)},500)}terminate(){clearTimeout(this.searchTimeoutId),this.observer.disconnect(),this.controller.el.remove(),this.videos.forEach(t=>t.playbackRate=100/100)}setSpeed(t){if(Number.isNaN(t))return;t===5?this.speed>5?this.speed=0:this.speed=10:t>300?this.speed=300:t<0?this.speed=0:this.speed=t;let e=this.speed.toString();this.controller.value.textContent=e,this.controller.range.value=e,this.videos.forEach(r=>r.playbackRate=this.speed/100),localStorage.setItem(g,e)}},s,L,S,M,f,x,y,D,I,u=class u{constructor(t){b(this,s);o(this,"el");o(this,"subBtn",document.createElement("button"));o(this,"value",document.createElement("div"));o(this,"addBtn",document.createElement("button"));o(this,"range",document.createElement("input"));this.el=document.createElement("div"),this.el[m]=t}appendTo(t){var e;return(e=t.querySelector(i))==null||e.remove(),a(this,s,S).call(this),a(this,s,L).call(this),t.append(this.el),this}get state(){return this.el[m]}};s=new WeakSet,L=function(){this.range.addEventListener("input",()=>{let t=Number.parseFloat(this.range.value);this.state.setSpeed(t)}),this.subBtn.addEventListener("click",()=>this.state.setSpeed(this.state.speed-5)),this.addBtn.addEventListener("click",()=>this.state.setSpeed(this.state.speed+5))},S=function(){this.el.setAttribute("id",i),this.el.append(a(this,s,M).call(this),a(this,s,D).call(this),a(this,s,I).call(this,u.tickMarks))},M=function(){let t=document.createElement("div");return t.classList.add("controls"),t.append(a(this,s,f).call(this),a(this,s,x).call(this),a(this,s,y).call(this)),t},f=function(){return this.subBtn=document.createElement("button"),this.subBtn.textContent="-",this.subBtn.classList.add("btn","sub"),this.subBtn},x=function(){return this.value=document.createElement("div"),this.value.textContent=this.state.speed.toString(),this.value},y=function(){return this.addBtn=document.createElement("button"),this.addBtn.textContent="+",this.addBtn.classList.add("btn","add"),this.addBtn},D=function(){return this.range=document.createElement("input"),this.range.classList.add("range"),this.range.setAttribute("type","range"),this.range.setAttribute("min","10"),this.range.setAttribute("max","300"),this.range.setAttribute("step","10"),this.range.setAttribute("list",T),this.range.value=this.state.speed.toString(),this.range},I=function(t){let e=document.createElement("datalist");e.setAttribute("id",T);let r=t.map(d=>{let c=document.createElement("option");return c.value=d.toString(),c});return e.append(...r),e},o(u,"tickMarks",[10,50,100,150,200,250,300]);var p=u;function R(n){let t=n.document,e=t.querySelector("#".concat(i));if(e){let d=e[m];d==null||d.terminate(),e.remove();return}k(t),new h(t).initialize()}R(window);})();
/**
 * @file A script to control the speed of html5 video playback in the browser.
 * @author Alexander Mandrikov <mad.nunsez@gmail.com>
 * @version 2.1.2
 * @license AGPLv3
 * @see {@link https://github.com/nunsez/bookmarklet-video-speed GitHub} for further information.
 */
