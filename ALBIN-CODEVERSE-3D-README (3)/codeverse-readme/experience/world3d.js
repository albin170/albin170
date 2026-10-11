/**
 * CODEVERSE // Reactor 3D
 * Native WebGL 1.0. No CDN, frameworks, models, tracking, or dependencies.
 * Real perspective projection, illuminated meshes, rotating toroidal orbits,
 * icosahedral crystal, satellite cores and a depth-tested 3D particle cloud.
 */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const VERT = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    uniform mat4 uMVP;
    uniform mat4 uModel;
    varying vec3 vNormal;
    varying vec3 vLocal;
    void main() {
      vNormal = normalize((uModel * vec4(aNormal,0.0)).xyz);
      vLocal = aPosition;
      gl_Position = uMVP * vec4(aPosition,1.0);
    }`;
  const FRAG = `
    precision mediump float;
    varying vec3 vNormal;
    varying vec3 vLocal;
    uniform vec3 uColor;
    uniform float uAlpha;
    uniform float uClock;
    uniform float uCrystal;
    void main() {
      vec3 n = normalize(vNormal);
      vec3 lightDir = normalize(vec3(-0.42,0.68,0.91));
      float diffuse = max(dot(n,lightDir),0.0);
      float fresnel = pow(1.0 - abs(dot(n,vec3(0.,0.,1.))),2.1);
      float internal = 0.5 + 0.5*sin(vLocal.x*6.0 + vLocal.y*10.0 + uClock*2.8);
      float lum = mix(0.26+diffuse*0.78+fresnel*1.4, 0.48+diffuse*0.55+fresnel*1.7+internal*0.12, uCrystal);
      vec3 color = uColor*lum + vec3(0.55,0.95,1.0)*pow(diffuse,9.0)*0.45;
      gl_FragColor = vec4(color, uAlpha);
    }`;
  const STAR_VERT = `
    attribute vec3 aPosition;
    attribute float aSeed;
    uniform mat4 uMVP;
    uniform float uClock;
    uniform float uPixelRatio;
    varying float vAlpha;
    void main(){
      vec3 p = aPosition;
      p.y += sin(uClock*0.63 + aSeed*16.0)*0.095;
      gl_Position = uMVP*vec4(p,1.0);
      gl_PointSize = clamp((1.2 + aSeed*3.2)*uPixelRatio*6.5/gl_Position.w,1.0,8.0);
      vAlpha = 0.26 + 0.68*abs(sin(uClock*1.2+aSeed*31.));
    }`;
  const STAR_FRAG = `
    precision mediump float;
    varying float vAlpha;
    uniform vec3 uColor;
    void main(){
      float r=length(gl_PointCoord-vec2(0.5));
      float a=smoothstep(0.5,0.0,r);
      gl_FragColor=vec4(uColor, a*a*vAlpha);
    }`;

  function matIdentity() { return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]); }
  function mul(a,b) {
    const o = new Float32Array(16);
    for(let c=0;c<4;c++) for(let r=0;r<4;r++)
      o[c*4+r] = a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];
    return o;
  }
  function rotateX(a) { const c=Math.cos(a), s=Math.sin(a);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]); }
  function rotateY(a) { const c=Math.cos(a), s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]); }
  function rotateZ(a) { const c=Math.cos(a), s=Math.sin(a);return new Float32Array([c,s,0,0,-s,c,0,0,0,1,0,0,0,0,1]); }
  function scale(s) {return new Float32Array([s,0,0,0,0,s,0,0,0,0,s,0,0,0,0,1]);}
  function trans(x,y,z) {let m=matIdentity();m[12]=x;m[13]=y;m[14]=z;return m;}
  function perspective(fov,aspect,near,far) {const f=1/Math.tan(fov/2),q=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*q,-1,0,0,2*far*near*q,0]);}
  function compose(...matrices) {return matrices.reduce((acc,m)=>mul(acc,m),matIdentity());}
  function sphere(radius=1,rings=32,sides=64) {
    const p=[],n=[],idx=[];
    for(let i=0;i<=rings;i++){
      const v=i*Math.PI/rings;
      for(let j=0;j<=sides;j++) {
        const u=j*TAU/sides;
        const x=Math.sin(v)*Math.cos(u),y=Math.cos(v),z=Math.sin(v)*Math.sin(u);
        p.push(x*radius,y*radius,z*radius);n.push(x,y,z);
      }
    }
    for(let i=0;i<rings;i++)for(let j=0;j<sides;j++) {
      const a=i*(sides+1)+j,b=a+sides+1;
      idx.push(a,a+1,b,b,a+1,b+1);
    }
    return {p,n,idx};
  }
  function torus(radius=1.7,tube=.025,segments=144,sides=8) {
    const p=[],n=[],idx=[];
    for(let i=0;i<=segments;i++) {
      let u=TAU*i/segments;
      for(let j=0;j<=sides;j++){
        let v=TAU*j/sides, nr=Math.cos(v), x=Math.cos(u), y=Math.sin(u);
        p.push((radius+tube*nr)*x,(radius+tube*nr)*y,tube*Math.sin(v));
        n.push(nr*x,nr*y,Math.sin(v));
      }
    }
    for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){
      let a=i*(sides+1)+j,b=a+sides+1;
      idx.push(a,b,a+1,b,b+1,a+1);
    }
    return {p,n,idx};
  }
  function icosahedron(radius=1) {
    const t=(1+Math.sqrt(5))/2;
    const vs=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]];
    const faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
    const p=[],n=[],idx=[];
    faces.forEach(face=>{
      const raw=face.map(k=>{const v=vs[k],l=Math.hypot(...v);return v.map(c=>c*radius/l);});
      const a=raw[0],b=raw[1],c=raw[2];
      const u=b.map((v,i)=>v-a[i]),v=c.map((w,i)=>w-a[i]);
      const normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
      const length=Math.hypot(...normal);const nn=normal.map(q=>q/length);
      const off=p.length/3;
      raw.forEach(v=>{p.push(...v);n.push(...nn);});idx.push(off,off+1,off+2);
    });
    return {p,n,idx};
  }
  function shader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){let err=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(err);}return s;}
  function program(gl,vs,fs){const p=gl.createProgram();gl.attachShader(p,shader(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(p));return p;}
  function buffer(gl,arr,type=gl.ARRAY_BUFFER){const b=gl.createBuffer();gl.bindBuffer(type,b);gl.bufferData(type,arr,gl.STATIC_DRAW);return b;}
  function mkMesh(gl,geom){return {pos:buffer(gl,new Float32Array(geom.p)),norm:buffer(gl,new Float32Array(geom.n)),ids:buffer(gl,new Uint16Array(geom.idx),gl.ELEMENT_ARRAY_BUFFER),length:geom.idx.length};}
  function clamp(x,min,max){return Math.min(max,Math.max(min,x));}
  const colors=[[0.27,0.95,1.0],[1.0,0.36,0.14],[0.62,0.32,1.0]];

  function mount(canvas){
    if(!canvas)return null;
    const gl = canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,preserveDrawingBuffer:false});
    if(!gl)return null;
    let meshProgram, starProgram, orb, ringA,ringB,ringC, crystal, smallOrb, starBuf, starCount;
    try{
      meshProgram=program(gl,VERT,FRAG);starProgram=program(gl,STAR_VERT,STAR_FRAG);
      orb=mkMesh(gl,sphere(1.18,30,50));
      ringA=mkMesh(gl,torus(1.65,.023));ringB=mkMesh(gl,torus(1.94,.016));ringC=mkMesh(gl,torus(1.48,.022));
      crystal=mkMesh(gl,icosahedron(.80));smallOrb=mkMesh(gl,sphere(.115,12,20));
      let seed=1337;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
      const particles=[];
      for(let i=0;i<470;i++){
        const a=rng()*TAU,b=Math.acos(rng()*2-1),r=1.9+Math.pow(rng(),.6)*2.7;
        particles.push(r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a),rng());
      }
      starCount=particles.length/4;starBuf=buffer(gl,new Float32Array(particles));
    }catch(e){console.warn('3D reactor initialization failed:',e);return null;}
    const meshAttr={pos:gl.getAttribLocation(meshProgram,'aPosition'),norm:gl.getAttribLocation(meshProgram,'aNormal')};
    const meshUn={mvp:gl.getUniformLocation(meshProgram,'uMVP'),model:gl.getUniformLocation(meshProgram,'uModel'),color:gl.getUniformLocation(meshProgram,'uColor'),alpha:gl.getUniformLocation(meshProgram,'uAlpha'),clock:gl.getUniformLocation(meshProgram,'uClock'),crystal:gl.getUniformLocation(meshProgram,'uCrystal')};
    const starAttr={pos:gl.getAttribLocation(starProgram,'aPosition'),seed:gl.getAttribLocation(starProgram,'aSeed')};
    const starUn={mvp:gl.getUniformLocation(starProgram,'uMVP'),clock:gl.getUniformLocation(starProgram,'uClock'),ratio:gl.getUniformLocation(starProgram,'uPixelRatio'),color:gl.getUniformLocation(starProgram,'uColor')};
    const state={enabled:true,visible:true,theme:0,pointerX:0,pointerY:0,burstUntil:0,clock:0,frame:0,rendered:0,failed:false};
    canvas.parentElement.classList.add('webgl-active');
    const observer=new IntersectionObserver(entries=>{state.visible=entries[0]?.isIntersecting??true;},{rootMargin:'180px'});
    observer.observe(canvas);
    let ratio=1,last=0, proj=matIdentity(),view=trans(0,0,-7.6);
    const resize=()=>{
      const rect=canvas.getBoundingClientRect();
      if(rect.width===0||rect.height===0)return;
      ratio=Math.min(window.devicePixelRatio||1,window.innerWidth<650?1.05:1.6);
      const w=Math.round(rect.width*ratio),h=Math.round(rect.height*ratio);
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
      proj=perspective(43*Math.PI/180,w/h,.1,40);
    };
    window.addEventListener('resize',resize,{passive:true});resize();
    gl.clearColor(0,0,0,0);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    const color=(c,s=1)=>c.map(x=>Math.min(1,x*s));
    function drawMesh(mesh,model,c,alpha,faceted=0){
      gl.useProgram(meshProgram);
      gl.uniformMatrix4fv(meshUn.mvp,false,mul(mul(proj,view),model));
      gl.uniformMatrix4fv(meshUn.model,false,model);
      gl.uniform3fv(meshUn.color,new Float32Array(c));
      gl.uniform1f(meshUn.alpha,alpha);gl.uniform1f(meshUn.clock,state.clock);gl.uniform1f(meshUn.crystal,faceted);
      gl.bindBuffer(gl.ARRAY_BUFFER,mesh.pos);gl.enableVertexAttribArray(meshAttr.pos);gl.vertexAttribPointer(meshAttr.pos,3,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ARRAY_BUFFER,mesh.norm);gl.enableVertexAttribArray(meshAttr.norm);gl.vertexAttribPointer(meshAttr.norm,3,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.ids);gl.drawElements(gl.TRIANGLES,mesh.length,gl.UNSIGNED_SHORT,0);
    }
    function drawStars(root,accent){
      gl.useProgram(starProgram);
      gl.uniformMatrix4fv(starUn.mvp,false,mul(mul(proj,view),root));
      gl.uniform1f(starUn.clock,state.clock);gl.uniform1f(starUn.ratio,ratio);
      gl.uniform3fv(starUn.color,new Float32Array(color(accent,.9)));
      gl.bindBuffer(gl.ARRAY_BUFFER,starBuf);gl.enableVertexAttribArray(starAttr.pos);gl.vertexAttribPointer(starAttr.pos,3,gl.FLOAT,false,16,0);
      gl.enableVertexAttribArray(starAttr.seed);gl.vertexAttribPointer(starAttr.seed,1,gl.FLOAT,false,16,12);
      gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.drawArrays(gl.POINTS,0,starCount);
      gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    }
    function frame(now){
      state.frame=requestAnimationFrame(frame);
      if(!state.visible||document.hidden||state.failed){last=now;return;}
      if(now-last<16)return;
      let dt=Math.min((now-last)/1000||.016,.05);last=now;
      if(state.enabled)state.clock+=dt*(now<state.burstUntil?5.2:1);
      if(canvas.width===0)return;
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      let t=state.clock;
      const accent=colors[state.theme];
      const leanY=state.pointerX*.24,leanX=state.pointerY*.14;
      const root=compose(rotateY(t*.11+leanY),rotateX(-.19+leanX));
      const pulse=1+.045*Math.sin(t*2.8);
      drawStars(compose(root,rotateZ(t*.034)),accent);
      // Four moving objects really exist in 3D space and occlude one another.
      gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
      drawMesh(crystal,compose(root,rotateZ(t*.47),rotateX(t*.36),scale(.85+.03*Math.sin(t*2))),color(accent,1.0),.95,1);
      gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      drawMesh(orb,compose(root,rotateY(t*.33),rotateX(t*.17),scale(pulse)),color(accent,.20),.22,0);
      gl.disable(gl.CULL_FACE);
      drawMesh(ringA,compose(root,rotateX(1.04),rotateY(t*.25),rotateZ(t*.45)),color(accent,1.05),.78);
      drawMesh(ringB,compose(root,rotateY(1.1),rotateX(t*-.27),rotateZ(t*-.26)),[.63,.36,1],.55);
      drawMesh(ringC,compose(root,rotateX(-.4),rotateY(.8),rotateZ(t*.64)),[.96,.42,.18],.45);
      for(let i=0;i<5;i++){
        const a=t*(i%2?-0.56:0.68)+i*TAU/5;
        const model=compose(root,trans(Math.cos(a)*1.78,Math.sin(a*1.6)*.92,Math.sin(a)*1.35),scale(.65+.18*Math.sin(t*3+i)));
        drawMesh(smallOrb,model,i%2?[.74,.39,1]:color(accent,1.5),.95);
      }
      gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      state.rendered++;
    }
    state.frame=requestAnimationFrame(frame);
    return {
      setPointer(x,y){state.pointerX=clamp(x,-1,1);state.pointerY=clamp(y,-1,1);},
      setMotion(yes){state.enabled=Boolean(yes);},
      setTheme(index){state.theme=clamp(Number(index)||0,0,2);},
      burst(){state.burstUntil=performance.now()+2000;},
      getStatus(){return {webgl:true,active:state.enabled,frames:state.rendered};},
      destroy(){cancelAnimationFrame(state.frame);observer.disconnect();window.removeEventListener('resize',resize);}
    };
  }
  window.Codeverse3D={mount};
})();
